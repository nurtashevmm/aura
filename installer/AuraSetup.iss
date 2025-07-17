[Setup]
AppName=Aura Play
AppVersion=1.0
DefaultDirName={pf}\AuraPlay
DefaultGroupName=Aura Play
OutputBaseFilename=AuraSetup
WizardImageFile=assets\wizard.bmp
WizardSmallImageFile=assets\wizard_small.bmp

[Files]
Source: "..\target\release\aura-agent.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\target\release\aura-control.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "assets\icon.ico"; DestDir: "{app}\assets"; Flags: ignoreversion
Source: "assets\wizard.bmp"; DestDir: "{tmp}"; Flags: dontcopy
Source: "assets\wizard_small.bmp"; DestDir: "{tmp}"; Flags: dontcopy

[Languages]
Name: "ru"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
ru.WelcomeTitle=Установка Aura Play
ru.SelectComponents=Выбор компонентов
ru.InstallSuccess=Установка завершена успешно
ru.TailscaleConfig=Настройка Tailscale
ru.EnterKey=Введите ваш ключ Tailscale:
ru.CheckingRequirements=Проверка системы
ru.InstallingComponents=Установка компонентов
ru.ConfiguringSystem=Настройка системы
ru.Finalizing=Завершение установки
ru.InstallComplete=Готово!
ru.ErrorTitle=Ошибка
ru.SuccessTitle=Успешно

[Run]
Filename: "{app}\aura-agent.exe"; Parameters: "--install"; Flags: runhidden
Filename: "{app}\aura-control.exe"; Parameters: "--autostart"; Flags: runhidden

[Icons]
Name: "{group}\Aura Control"; Filename: "{app}\aura-control.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.ico"
Name: "{group}\Aura Agent"; Filename: "{app}\aura-agent.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.ico"
Name: "{group}\View Logs"; Filename: "{app}\logs"; WorkingDir: "{app}"
Name: "{group}\Uninstall Aura Play"; Filename: "{uninstallexe}"
Name: "{commondesktop}\Aura Control"; Filename: "{app}\aura-control.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.ico"
Name: "{commondesktop}\Aura Agent"; Filename: "{app}\aura-agent.exe"; WorkingDir: "{app}"; IconFilename: "{app}\assets\icon.ico"

[Code]
var
  TailscalePage: TInputQueryWizardPage;
  TailscaleKey: String;
  BackupDir: String;
  LanguagePage: TInputOptionWizardPage;

procedure InitializeWizard();
begin
  // Check Windows version before showing wizard
  if not CheckWindowsVersion() then
    Abort();
  
  // Create language selection page
  LanguagePage := CreateInputOptionPage(wpWelcome,
    'Select Language', 'Choose your preferred language',
    'Please select the installation language:', True, False);
  
  LanguagePage.Add('Русский');
  
  // Default to system language or Russian
  case ActiveLanguage of
    'ru': LanguagePage.SelectedValueIndex := 0;
  else
    LanguagePage.SelectedValueIndex := 0;
  end;
  
  TailscalePage := CreateInputQueryPage(wpWelcome,
    'Tailscale Configuration', 'Enter your Tailscale key',
    'Please enter your Tailscale authentication key below:');
  TailscalePage.Add('Key:', False);
  
  WizardForm.FinishedHeadingLabel.Caption := 'Aura Play Installed Successfully';
  WizardForm.FinishedLabel.Caption := 
    'Aura Play has been installed on your system.'#13#10#13#10 +
    'You can now:'#13#10 +
    '- Launch Aura Control from desktop shortcut'#13#10 +
    '- Check system status in notification area'#13#10 +
    '- View logs in: ' + ExpandConstant('{app}\logs');
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  
  if CurPageID = LanguagePage.ID then
  begin
    case LanguagePage.SelectedValueIndex of
      0: ActiveLanguage := 'ru';
    end;
  end
  
  if CurPageID = TailscalePage.ID then
    TailscaleKey := TailscalePage.Values[0];
end;

function IsTailscaleInstalled(): Boolean;
begin
  Result := FileExists(ExpandConstant('{pf}\Tailscale\tailscale.exe'));
end;

function IsSunshineInstalled(): Boolean;
begin
  Result := RegKeyExists(HKLM, 'SOFTWARE\Sunshine');
end;

function IsDotNetInstalled(Version: string): Boolean;
var
  Key: string;
begin
  Result := False;
  Key := 'SOFTWARE\Microsoft\NET Framework Setup\NDP\' + Version;
  if RegKeyExists(HKLM, Key) or RegKeyExists(HKCU, Key) then
    Result := True;
end;

function IsVCRedistInstalled(): Boolean;
begin
  Result := RegKeyExists(HKLM, 'SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64');
end;

function IsDirectXInstalled(): Boolean;
var
  Version: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\DirectX', 'Version', Version) then
    Result := (Version >= $00090000); // DX9 or later
end;

function ConfigureFirewall(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows Firewall rules');
  
  // Allow Aura Agent
  if not Exec('netsh', 'advfirewall firewall add rule name="Aura Agent" dir=in action=allow program="' + ExpandConstant('{app}\aura-agent.exe') + '" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add firewall rule for Aura Agent');
  
  // Allow Sunshine
  if not Exec('netsh', 'advfirewall firewall add rule name="Sunshine" dir=in action=allow program="' + ExpandConstant('{app}\sunshine\sunshine.exe') + '" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add firewall rule for Sunshine');
  
  // Allow Tailscale
  if not Exec('netsh', 'advfirewall firewall add rule name="Tailscale" dir=in action=allow program="' + ExpandConstant('{pf}\Tailscale\tailscale.exe') + '" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add firewall rule for Tailscale');
end;

procedure ActivateTailscale();
var
  ResultCode: Integer;
begin
  if TailscaleKey <> '' then
  begin
    Exec(ExpandConstant('{pf}\Tailscale\tailscale.exe'), 
      'up --auth-key=' + TailscaleKey, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;

procedure CollectAndSendLogs();
var
  LogPath, LogContent: String;
begin
  LogPath := ExpandConstant('{app}\install.log');
  SaveStringToFile(LogPath, 'Installation completed at ' + GetDateTimeString('yyyy/mm/dd hh:nn:ss', '-', ':') + #13#10, True);
  
  if Exec(ExpandConstant('{app}\aura-agent.exe'), '--diagnostics >> "' + LogPath + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    SendLogToServer(LogPath);
end;

procedure SendLogToServer(LogPath: String);
var
  ResultCode: Integer;
  LogContent: AnsiString;
begin
  if LoadStringFromFile(LogPath, LogContent) then
  begin
    Exec('curl', 
      '-X POST -H "Content-Type: text/plain" --data-binary "@' + LogPath + '" ' +
      'https://logs.auraplay.io/upload', 
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;

function CheckInstallationSuccess(): Boolean;
begin
  Result := True;
  
  if not FileExists(ExpandConstant('{app}\aura-agent.exe')) then
    Result := False;
    
  Exec(ExpandConstant('{app}\aura-agent.exe'), '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if ResultCode <> 0 then
    Result := False;
end;

function CheckInstallationSuccess(): Boolean;
begin
  Result := True;
  LogInstallationStep('Verifying installation');
  
  // Check if main files exist
  if not FileExists(ExpandConstant('{app}\aura-agent.exe')) or
     not FileExists(ExpandConstant('{app}\aura-control.exe')) then
  begin
    Result := False;
    LogInstallationStep('ERROR: Critical files missing after installation');
  end;
  
  // Check if services are running
  if not Exec('sc', 'query AuraAgent', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    Result := False;
    LogInstallationStep('WARNING: Aura Agent service not running');
  end;
end;

function ValidateConfiguration(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
begin
  Result := True;
  LogInstallationStep('Validating configuration');
  
  // Validate Tailscale connection
  if Exec('powershell', '-Command "(Get-NetAdapter | Where-Object {$_.Name -like ''Tailscale*''}).Status"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
  begin
    if Pos('Up', Output) = 0 then
    begin
      MsgBox('Tailscale adapter is not connected. Please check your Tailscale key.', mbError, MB_OK);
      Result := False;
    end;
  end;
  
  // Validate Sunshine service
  if not Exec('sc', 'query Sunshine', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('Sunshine service not found. Streaming will not work.', mbError, MB_OK);
    Result := False;
  end;
  
  // Validate config file
  if not FileExists(ExpandConstant('{app}\config.toml')) then
  begin
    MsgBox('Configuration file missing. Please reinstall.', mbError, MB_OK);
    Result := False;
  end;
  
  if not Result then
    LogInstallationStep('ERROR: Configuration validation failed');
end;

procedure CreateDefaultConfig();
var
  ConfigPath: String;
begin
  ConfigPath := ExpandConstant('{app}\config.toml');
  if not FileExists(ConfigPath) then
    SaveStringToFile(ConfigPath,
      '[general]'#13#10 +
      'log_level = "info"'#13#10 +
      'p2p_port = 4001'#13#10 +
      'rest_port = 8080'#13#10, False);
end;

function HasDedicatedGPU(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
begin
  Result := False;
  if Exec('cmd', '/c wmic path win32_VideoController get name > gpu.txt', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if LoadStringFromFile('gpu.txt', Output) then
      Result := (Pos('Intel', Output) = 0) or (Pos('NVIDIA', Output) > 0) or (Pos('AMD', Output) > 0);
    DeleteFile('gpu.txt');
  end;
end;

function CheckSystemRequirements(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
  HasGPU: Boolean;
  RAMinGB: Integer;
begin
  Result := True;
  LogInstallationStep('Checking system requirements');
  
  // Check GPU
  if Exec('powershell', '-Command "(Get-WmiObject Win32_VideoController).Name -ne $null"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
    HasGPU := (Pos('True', Output) > 0)
  else
    HasGPU := True; // Assume GPU exists if check fails
  
  // Check RAM (minimum 8GB)
  if Exec('powershell', '-Command "[math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB)"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
    RAMinGB := StrToIntDef(Output, 0)
  else
    RAMinGB := 8; // Assume sufficient RAM if check fails
  
  // Show warnings if requirements not met
  if not HasGPU then
    LogInstallationStep('WARNING: No dedicated GPU detected - Sunshine streaming may not work properly');
  
  if RAMinGB < 8 then
    LogInstallationStep('WARNING: Only ' + IntToStr(RAMinGB) + 'GB RAM detected - 8GB or more recommended');
  
  // Check DirectX version
  if Exec('dxdiag', '/t ' + ExpandConstant('{tmp}\dxdiag.txt'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if LoadStringFromFile(ExpandConstant('{tmp}\dxdiag.txt'), Output) then
    begin
      if Pos('DirectX 12', Output) = 0 then
        LogInstallationStep('WARNING: DirectX 12 not detected - some features may not work');
    end;
  end;
end;

function CheckInstallationSuccess(): Boolean;
begin
  Result := True;
  
  if not FileExists(ExpandConstant('{app}\aura-agent.exe')) then
    Result := False;
    
  Exec(ExpandConstant('{app}\aura-agent.exe'), '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if ResultCode <> 0 then
    Result := False;
end;

function CheckInstallationSuccess(): Boolean;
begin
  Result := True;
  LogInstallationStep('Verifying installation');
  
  // Check if main files exist
  if not FileExists(ExpandConstant('{app}\aura-agent.exe')) or
     not FileExists(ExpandConstant('{app}\aura-control.exe')) then
  begin
    Result := False;
    LogInstallationStep('ERROR: Critical files missing after installation');
  end;
  
  // Check if services are running
  if not Exec('sc', 'query AuraAgent', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    Result := False;
    LogInstallationStep('WARNING: Aura Agent service not running');
  end;
end;

procedure CreateDefaultConfig();
var
  ConfigPath: String;
begin
  ConfigPath := ExpandConstant('{app}\config.toml');
  if not FileExists(ConfigPath) then
    SaveStringToFile(ConfigPath,
      '[general]'#13#10 +
      'log_level = "info"'#13#10 +
      'p2p_port = 4001'#13#10 +
      'rest_port = 8080'#13#10, False);
end;

function HasDedicatedGPU(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
begin
  Result := False;
  if Exec('cmd', '/c wmic path win32_VideoController get name > gpu.txt', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if LoadStringFromFile('gpu.txt', Output) then
      Result := (Pos('Intel', Output) = 0) or (Pos('NVIDIA', Output) > 0) or (Pos('AMD', Output) > 0);
    DeleteFile('gpu.txt');
  end;
end;

function CheckWindowsVersion(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
begin
  Result := True;
  LogInstallationStep('Checking Windows version');
  
  // Check if Windows 10 1809 or later
  if Exec('powershell', '-Command "(Get-CimInstance Win32_OperatingSystem).Version"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
  begin
    if (CompareStr(Output, '10.0.17763') < 0) then // Earlier than Win10 1809
    begin
      MsgBox(
        'Windows version ' + Output + ' is not supported.' + #13#10 +
        'Please update to Windows 10 version 1809 or later.',
        mbError, MB_OK);
      Result := False;
    end;
  end
  else
    LogInstallationStep('WARNING: Failed to check Windows version');
  
  // Check for pending updates
  if Result and Exec('powershell', '-Command "(New-Object -ComObject Microsoft.Update.Session).CreateUpdateSearcher().Search(''IsInstalled=0'').Updates.Count"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
  begin
    if (StrToIntDef(Output, 0) > 0) then
    begin
      if MsgBox(
        'There are pending Windows updates. Recommended to install them first.' + #13#10 +
        'Would you like to open Windows Update now?',
        mbConfirmation, MB_YESNO) = IDYES then
      begin
        Exec('ms-settings:windowsupdate', '', '', SW_SHOW, ewNoWait, ResultCode);
        Result := False;
      end;
    end;
  end
  else
    LogInstallationStep('WARNING: Failed to check for Windows updates');
end;

function CheckAndInstallWindowsUpdates(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Checking for Windows updates');
  
  // Check for pending updates
  if Exec('powershell', '-Command "$Session = New-Object -ComObject Microsoft.Update.Session; $Searcher = $Session.CreateUpdateSearcher(); $Result = $Searcher.Search(''IsInstalled=0''); Write-Output $Result.Updates.Count"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0) then
  begin
    if ResultCode > 0 then // Updates available
    begin
      if MsgBox('There are pending Windows updates. Install now for best compatibility?', mbConfirmation, MB_YESNO) = IDYES then
      begin
        LogInstallationStep('Installing Windows updates');
        if not Exec('powershell', '-Command "Start-Process -FilePath ''usoclient'' -ArgumentList ''StartScan'' -Wait"', '', SW_SHOW, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
          MsgBox('Warning: Failed to install Windows updates', mbInformation, MB_OK);
      end;
    end;
  end;
end;

function ConfigurePowerSettings(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows power settings');
  
  // Set high performance power plan
  if not Exec('powercfg', '/setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to set high performance power plan');
  
  // Disable sleep
  if not Exec('powercfg', '/change standby-timeout-ac 0', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to disable sleep mode');
  
  // Disable USB selective suspend
  if not Exec('powercfg', '/setusbsettingindex 0', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to disable USB selective suspend');
end;

function ConfigureGraphicsSettings(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring graphics settings');
  
  // Enable GPU performance mode
  if not Exec('powershell', '-Command "Set-ItemProperty -Path ''HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\WUDF'' -Name ''EnableFrameRateMonitoring'' -Value 1"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to enable GPU performance mode');
  
  // Disable fullscreen optimizations
  if not Exec('powershell', '-Command "Set-ItemProperty -Path ''HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers'' -Name ''HwSchMode'' -Value 2"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to disable fullscreen optimizations');
end;

function ConfigureNetworkSettings(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring network settings');
  
  // Set network profile to Private
  if not Exec('powershell', '-Command "Set-NetConnectionProfile -NetworkCategory Private"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to set network profile to Private');
  
  // Disable IPv6
  if not Exec('netsh', 'interface ipv6 set global state=disabled', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to disable IPv6');
  
  // Optimize TCP for low latency
  if not Exec('netsh', 'int tcp set global autotuninglevel=restricted', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to optimize TCP settings');
end;

function ConfigureAudioSettings(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring audio settings');
  
  // Set audio quality to DVD
  if not Exec('powershell', '-Command "$path = ''HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Audio''; if (!(Test-Path $path)) { New-Item -Path $path -Force }; New-ItemProperty -Path $path -Name ''DefaultSampleRate'' -Value 48000 -PropertyType DWord -Force; New-ItemProperty -Path $path -Name ''DefaultSampleFormat'' -Value 24 -PropertyType DWord -Force"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to configure audio quality settings', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to configure audio quality settings');
  end;
  
  // Disable audio enhancements
  if not Exec('powershell', '-Command "$path = ''HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Audio''; if (!(Test-Path $path)) { New-Item -Path $path -Force }; New-ItemProperty -Path $path -Name ''DisableAudioEnhancements'' -Value 1 -PropertyType DWord -Force"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to disable audio enhancements', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to disable audio enhancements');
  end;
end;

function ConfigureGameModeSettings(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring game mode settings');
  
  // Enable Game Mode
  if not Exec('powershell', '-Command "$path = ''HKLM:\SOFTWARE\Microsoft\GameBar''; if (!(Test-Path $path)) { New-Item -Path $path -Force }; New-ItemProperty -Path $path -Name ''AutoGameModeEnabled'' -Value 1 -PropertyType DWord -Force"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to configure game mode settings', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to configure game mode settings');
  end;
  
  // Optimize for background recording
  if not Exec('powershell', '-Command "$path = ''HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR''; if (!(Test-Path $path)) { New-Item -Path $path -Force }; New-ItemProperty -Path $path -Name ''GameDVR_Enabled'' -Value 1 -PropertyType DWord -Force"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to optimize for background recording', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to optimize for background recording');
  end;
end;

function ConfigureGameMode(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows Game Mode settings');
  
  // Enable Game Mode
  if not Exec('powershell', '-Command "Set-ItemProperty -Path ""HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"" -Name ""AllowGameDVR"" -Value 1"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to enable Game DVR');
  
  // Set Game Mode performance
  if not Exec('powershell', '-Command "Set-ItemProperty -Path ""HKLM:\SOFTWARE\Microsoft\GameBar"" -Name ""AutoGameModeEnabled"" -Value 1"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to enable Auto Game Mode');
  
  // Optimize for background recording
  if not Exec('powershell', '-Command "Set-ItemProperty -Path ""HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR"" -Name ""BackgroundRecording"" -Value 1"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to configure background recording');
end;

function ConfigureDefenderExclusions(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows Defender exclusions');
  
  // Add folder exclusion
  if not Exec('powershell', '-Command "Add-MpPreference -ExclusionPath ""' + ExpandConstant('{app}') + '"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add folder exclusion to Windows Defender');
  
  // Add process exclusions
  if not Exec('powershell', '-Command "Add-MpPreference -ExclusionProcess ""' + ExpandConstant('{app}\aura-agent.exe') + '"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add process exclusion for Aura Agent');
  
  if not Exec('powershell', '-Command "Add-MpPreference -ExclusionProcess ""' + ExpandConstant('{app}\sunshine\sunshine.exe') + '"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to add process exclusion for Sunshine');
end;

function ConfigureWindowsServices(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows services');
  
  // Enable UPnP service
  if not Exec('sc', 'config upnphost start= auto', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to configure UPnP service');
  
  // Enable RPC service
  if not Exec('sc', 'config RpcSs start= auto', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to configure RPC service');
  
  // Start services if not running
  if not Exec('powershell', '-Command "Get-Service -Name upnphost, RpcSs | Where-Object { $_.Status -ne ''Running'' } | Start-Service"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to start required services');
end;

function ConfigureFirewallRules(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows Firewall rules');
  
  // Allow inbound connections for Aura Agent
  if not Exec('netsh', 'advfirewall firewall add rule name="Aura Agent" dir=in action=allow program="{app}\aura-agent.exe" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to add firewall rule for Aura Agent', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to add firewall rule for Aura Agent');
  end;
  
  // Allow outbound connections for Aura Agent
  if not Exec('netsh', 'advfirewall firewall add rule name="Aura Agent" dir=out action=allow program="{app}\aura-agent.exe" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to add firewall rule for Aura Agent', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to add firewall rule for Aura Agent');
  end;
  
  // Allow inbound connections for Sunshine
  if not Exec('netsh', 'advfirewall firewall add rule name="Sunshine" dir=in action=allow program="{app}\sunshine\sunshine.exe" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to add firewall rule for Sunshine', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to add firewall rule for Sunshine');
  end;
  
  // Allow outbound connections for Sunshine
  if not Exec('netsh', 'advfirewall firewall add rule name="Sunshine" dir=out action=allow program="{app}\sunshine\sunshine.exe" enable=yes', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('Warning: Failed to add firewall rule for Sunshine', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to add firewall rule for Sunshine');
  end;
end;

function ConfigureEventLog(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Configuring Windows Event Log');
  
  // Create event source
  if not Exec('powershell', '-Command "New-EventLog -LogName ''Application'' -Source ''AuraPlay'' -ErrorAction SilentlyContinue"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    LogInstallationStep('WARNING: Failed to create event log source');
  
  // Increase log size to 50MB
  if not Exec('powershell', '-Command "Limit-EventLog -LogName ''Application'' -MaximumSize 50MB -ErrorAction SilentlyContinue"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    LogInstallationStep('WARNING: Failed to configure event log size');
end;

function CreateScheduledTask(): Boolean;
var
  ResultCode: Integer;
  TaskXml: String;
begin
  Result := True;
  LogInstallationStep('Creating scheduled task for Aura Agent');
  
  TaskXml := '<?xml version="1.0" encoding="UTF-16"?>' +
    '<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">' +
    '<RegistrationInfo><Description>Aura Play Merchant Agent</Description></RegistrationInfo>' +
    '<Triggers><LogonTrigger><Enabled>true</Enabled></LogonTrigger></Triggers>' +
    '<Principals><Principal id="Author">' +
    '<UserId>S-1-5-18</UserId><RunLevel>HighestAvailable</RunLevel></Principal></Principals>' +
    '<Settings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>' +
    '<DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>' +
    '<StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>' +
    '<AllowHardTerminate>true</AllowHardTerminate><StartWhenAvailable>true</StartWhenAvailable>' +
    '<AllowStartOnDemand>true</AllowStartOnDemand></Settings>' +
    '<Actions Context="Author"><Exec>' +
    '<Command>' + ExpandConstant('{app}\aura-agent.exe') + '</Command>' +
    '</Exec></Actions></Task>';
  
  // Save XML to temp file
  SaveStringToFile(ExpandConstant('{tmp}\AuraAgentTask.xml'), TaskXml, False);
  
  if not Exec('schtasks', '/Create /TN "Aura Agent" /XML "' + ExpandConstant('{tmp}\AuraAgentTask.xml') + '" /F', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to create scheduled task');
end;

procedure BackupFiles();
begin
  BackupDir := ExpandConstant('{tmp}\aura_backup_' + GetDateTimeString('yyyymmdd_hhnnss', '-', '-'));
  ForceDirectories(BackupDir);
  
  // Backup config files
  if FileExists(ExpandConstant('{app}\config.toml')) then
    FileCopy(ExpandConstant('{app}\config.toml'), BackupDir + '\config.toml', False);
  
  // Backup registry settings
  RegSaveKey(HKEY_LOCAL_MACHINE, 'SOFTWARE\AuraPlay', BackupDir + '\aura_registry.hiv');
end;

procedure RollbackInstallation();
var
  ResultCode: Integer;
begin
  LogInstallationStep('Starting rollback procedure');
  
  // Stop services
  Exec('net', 'stop AuraAgent', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  
  // Remove files
  DeleteFile(ExpandConstant('{app}\aura-agent.exe'));
  DeleteFile(ExpandConstant('{app}\config.toml'));
  
  // Restore registry
  if FileExists(BackupDir + '\aura_registry.hiv') then
    Exec('reg', 'restore HKLM\SOFTWARE\AuraPlay ' + BackupDir + '\aura_registry.hiv', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  
  // Restore config
  if FileExists(BackupDir + '\config.toml') then
    FileCopy(BackupDir + '\config.toml', ExpandConstant('{app}\config.toml'), False);
  
  // Restore system settings
  Exec('powershell', '-Command "Set-NetConnectionProfile -InterfaceIndex (Get-NetConnectionProfile).InterfaceIndex -NetworkCategory Public"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('powershell', '-Command "Set-ItemProperty -Path ''HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters'' -Name ''DisabledComponents'' -Value 0"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('powershell', '-Command "Remove-MpPreference -ExclusionPath ''{app}''"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  
  LogInstallationStep('Rollback completed');
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
    BackupFiles()
  else if CurStep = ssFailed then
    RollbackInstallation();
end;

procedure InitializeLogFile();
begin
  SaveStringToFile(ExpandConstant('{app}\install.log'),
    'Aura Play Installation Log' + #13#10 +
    '=======================' + #13#10 +
    'Start Time: ' + GetDateTimeString('yyyy/mm/dd hh:nn:ss', '-', ':') + #13#10 +
    'System Info: ' + GetWindowsVersionString() + #13#10 +
    'RAM: ' + IntToStr(GetTotalPhysicalMemory div (1024 * 1024)) + 'MB' + #13#10 +
    'Disk Space: ' + IntToStr(DiskFreeSpace(ExtractFileDrive(ExpandConstant('{app}))) div (1024 * 1024 * 1024)) + 'GB free' + #13#10#13#10,
    False);
end;

procedure LogInstallationStep(Step: string);
begin
  SaveStringToFile(ExpandConstant('{app}\install.log'),
    '[' + GetDateTimeString('hh:nn:ss', '-', ':') + '] ' + Step + #13#10,
    True);
end;

procedure CreateShortcuts();
begin
  try
    // Create desktop shortcut for Aura Agent
    CreateShortcut(
      ExpandConstant('{userdesktop}\Aura Agent.lnk'),
      'Launch Aura Agent',
      ExpandConstant('{app}\aura-agent.exe'),
      '',
      '',
      ExpandConstant('{app}\icon.ico'),
      0,
      SW_SHOWNORMAL);
    
    // Create start menu shortcuts
    CreateDirectory(ExpandConstant('{commonprograms}\Aura'));
    
    CreateShortcut(
      ExpandConstant('{commonprograms}\Aura\Aura Agent.lnk'),
      'Launch Aura Agent',
      ExpandConstant('{app}\aura-agent.exe'),
      '',
      '',
      ExpandConstant('{app}\icon.ico'),
      0,
      SW_SHOWNORMAL);
    
    CreateShortcut(
      ExpandConstant('{commonprograms}\Aura\Aura Control.lnk'),
      'Launch Aura Control Panel',
      ExpandConstant('{app}\aura-control.exe'),
      '',
      '',
      ExpandConstant('{app}\icon.ico'),
      0,
      SW_SHOWNORMAL);
    
    LogInstallationStep('Created desktop and start menu shortcuts');
  except
    MsgBox('Warning: Failed to create shortcuts', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to create shortcuts');
  end;
end;

procedure SetupLogsFolder();
begin
  try
    // Create logs directory
    CreateDir(ExpandConstant('{userdocs}\Aura\Logs'));
    
    // Create shortcut to logs folder
    CreateShortcut(
      ExpandConstant('{userdesktop}\Aura Logs.lnk'),
      'Open Aura Logs Folder',
      'explorer.exe',
      ExpandConstant('"{userdocs}\Aura\Logs"'),
      '',
      '',
      0,
      SW_SHOWNORMAL);
    
    LogInstallationStep('Created logs folder and shortcut');
  except
    MsgBox('Warning: Failed to create logs folder or shortcut', mbInformation, MB_OK);
    LogInstallationStep('WARNING: Failed to create logs folder or shortcut');
  end;
end;

function CollectDiagnostics(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  LogInstallationStep('Collecting system diagnostics');
  
  // Collect system info
  if not Exec('powershell', '-Command "systeminfo > ""{userdocs}\Aura\Logs\systeminfo.txt"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to collect system info');
  
  // Collect network config
  if not Exec('powershell', '-Command "ipconfig /all > ""{userdocs}\Aura\Logs\network.txt"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to collect network config');
  
  // Collect installed software list
  if not Exec('powershell', '-Command "Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | Format-Table -AutoSize > ""{userdocs}\Aura\Logs\software.txt"""', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    LogInstallationStep('WARNING: Failed to collect software list');
end;

procedure ShowFinalMessage();
begin
  MsgBox(ExpandConstant('{cm:InstallSuccess}'), mbInformation, MB_OK);
end;

procedure ShowRollbackMessage();
begin
  MsgBox(ExpandConstant('{cm:RollbackWarning}'), mbError, MB_OK);
end;

function InitializeSetup(): Boolean;
begin
  // Set default language based on system
  case ActiveLanguage of
    'ru': begin
      // Russian specific initialization
    end;
  end;
end;

function RunDiagnostics(): Boolean;
var
  ResultCode: Integer;
  Output: AnsiString;
  DiagnosticsFile: String;
begin
  Result := True;
  DiagnosticsFile := ExpandConstant('{app}\diagnostics.log');
  
  LogInstallationStep('Running post-install diagnostics');
  
  // Check service status
  if not Exec('sc', 'query AuraAgent', '', SW_HIDE, ewWaitUntilTerminated, ResultCode, Output) then
  begin
    SaveStringToFile(DiagnosticsFile, 'ERROR: Failed to check Aura Agent service status' + #13#10, True);
    Result := False;
  end
  else if ResultCode <> 0 then
  begin
    SaveStringToFile(DiagnosticsFile, 'ERROR: Aura Agent service not running' + #13#10, True);
    Result := False;
  end;
  
  // Check network connectivity
  if not Exec('ping', '-n 4 8.8.8.8', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    SaveStringToFile(DiagnosticsFile, 'WARNING: Failed to check network connectivity' + #13#10, True);
  
  // Check GPU acceleration
  if Exec('dxdiag', '/t ' + ExpandConstant('{tmp}\dxdiag.txt'), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if LoadStringFromFile(ExpandConstant('{tmp}\dxdiag.txt'), Output) then
    begin
      if Pos('D3D11', Output) = 0 then
        SaveStringToFile(DiagnosticsFile, 'WARNING: Direct3D 11 acceleration not detected' + #13#10, True);
    end;
  end;
  
  // Check disk space
  if DiskFreeSpace(ExpandConstant('{app}')) div (1024*1024) < 500 then
    SaveStringToFile(DiagnosticsFile, 'WARNING: Low disk space (<500MB free)' + #13#10, True);
  
  if not Result then
    MsgBox('Diagnostics detected issues. See ' + DiagnosticsFile + ' for details.', mbInformation, MB_OK);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // ... existing steps ...
    if ValidateConfiguration() then
      ShowFinalMessage();
    RunDiagnostics();
    // ... existing steps ...
  end;
end;
