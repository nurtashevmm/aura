<#
ПОЛНЫЙ ТЕСТ AURASETUP.EXE
Версия: 1.0

Тестирует:
1. Основные компоненты (Tailscale, Sunshine)
2. Системные настройки
3. Службы Windows
4. Файловую структуру
#>

# Конфигурация
$testDir = "$env:TEMP\AuraTest"
$logFile = "$testDir\test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Инициализация
if (-not (Test-Path $testDir)) { New-Item -Path $testDir -ItemType Directory | Out-Null }
"Начало тестирования: $(Get-Date)" | Out-File $logFile

# 1. Тест сетевых компонентов
function Test-Network {
    try {
        # Tailscale
        $tsAdapter = Get-NetAdapter | Where-Object { $_.Name -like "Tailscale*" }
        if (-not $tsAdapter) { throw "Адаптер Tailscale не найден" }
        if ($tsAdapter.Status -ne "Up") { throw "Tailscale не подключен" }
        
        # Firewall rules
        $fwRule = Get-NetFirewallRule -DisplayName "Aura Play*" -ErrorAction Stop
        if (-not $fwRule) { throw "Правила брандмауэра не найдены" }
        
        Add-Content $logFile "[УСПЕХ] Сеть: Все компоненты работают"
        return $true
    } catch {
        Add-Content $logFile "[ОШИБКА] Сеть: $_"
        return $false
    }
}

# 2. Тест служб
function Test-Services {
    $services = @('AuraAgent', 'Sunshine')
    $results = @()
    
    foreach ($service in $services) {
        try {
            $svc = Get-Service -Name $service -ErrorAction Stop
            if ($svc.Status -ne "Running") { throw "Служба $service не запущена" }
            $results += "$service:OK"
        } catch {
            $results += "$service:ОШИБКА ($_)"
        }
    }
    
    if ($results -contains '*ОШИБКА*') {
        Add-Content $logFile "[ОШИБКА] Службы: $($results -join ', ')"
        return $false
    } else {
        Add-Content $logFile "[УСПЕХ] Службы: $($results -join ', ')"
        return $true
    }
}

# 3. Тест системных настроек
function Test-SystemSettings {
    try {
        # Проверка системных переменных
        $envVars = @('AURA_HOME', 'JAVA_HOME')
        foreach ($var in $envVars) {
            if (-not (Get-ChildItem Env:$var -ErrorAction Stop)) { throw "Переменная окружения $var не найдена" }
        }
        
        Add-Content $logFile "[УСПЕХ] Системные настройки: Все переменные окружения найдены"
        return $true
    } catch {
        Add-Content $logFile "[ОШИБКА] Системные настройки: $_"
        return $false
    }
}

# 4. Тест файловой структуры
function Test-FileStructure {
    try {
        # Проверка каталогов
        $dirs = @('C:\Aura', 'C:\Aura\logs', 'C:\Aura\config')
        foreach ($dir in $dirs) {
            if (-not (Test-Path $dir -ErrorAction Stop)) { throw "Каталог $dir не найден" }
        }
        
        Add-Content $logFile "[УСПЕХ] Файловая структура: Все каталоги найдены"
        return $true
    } catch {
        Add-Content $logFile "[ОШИБКА] Файловая структура: $_"
        return $false
    }
}

# Запуск всех тестов
$testResults = @{
    Network = Test-Network
    Services = Test-Services
    SystemSettings = Test-SystemSettings
    FileStructure = Test-FileStructure
}

# Генерация отчета
"
Итоговый отчет:" | Out-File $logFile -Append
$testResults.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "УСПЕШНО" } else { "ОШИБКА" }
    "- $($_.Key): $status" | Out-File $logFile -Append
}

# Результат
if ($testResults.Values -contains $false) {
    Write-Host "ТЕСТ ПРОВАЛЕН - см. $logFile" -ForegroundColor Red
    exit 1
} else {
    Write-Host "Все тесты пройдены успешно" -ForegroundColor Green
    exit 0
}
