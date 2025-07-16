import React from 'react';

export default function InstructionsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Инструкция для мерчанта: как подготовить ПК/консоль к аренде</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Что потребуется?</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>ПК с Windows 10/11 или игровая консоль (PS4/PS5)</li>
          <li>Стабильный интернет (желательно проводной)</li>
          <li>Возможность установить ПО Sunshine и Tailscale</li>
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Установка и настройка Sunshine</h2>
        <ol className="list-decimal ml-6 text-gray-700">
          <li>Скачайте Sunshine: <a href="https://sunshineapp.dev/download/" target="_blank" rel="noopener" className="text-blue-600 underline">sunshineapp.dev/download</a></li>
          <li>Установите и запустите Sunshine на ПК.</li>
          <li>Настройте список игр и убедитесь, что Sunshine работает (откройте http://localhost:47990 в браузере).</li>
          <li>Перейдите в настройки и создайте PIN-код для подключения (запомните его!).</li>
        </ol>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Установка и настройка Tailscale</h2>
        <ol className="list-decimal ml-6 text-gray-700">
          <li>Скачайте Tailscale: <a href="https://tailscale.com/download" target="_blank" rel="noopener" className="text-blue-600 underline">tailscale.com/download</a></li>
          <li>Установите и войдите через Google/Telegram/Apple ID.</li>
          <li>После запуска Tailscale ваш ПК получит приватный IP-адрес вида <b>100.x.x.x</b> &mdash; он нужен для подключения.</li>
        </ol>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Что отправить для модерации?</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li><b>ID вашей машины</b> из личного кабинета</li>
          <li><b>Скриншот из HWiNFO/CPU-Z/GPU-Z</b> с характеристиками</li>
          <li><b>Ваш Tailscale IP</b> (например, 100.101.102.103)</li>
          <li><b>PIN-код Sunshine</b></li>
        </ul>
        <div className="mt-2 text-sm text-gray-600">Эти данные нужны, чтобы игрок мог подключиться через Moonlight или Chiaki.</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Важные советы</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Рекомендуем установить ПО для &quot;заморозки&quot; системы (Reboot Restore Rx, Deep Freeze) для защиты от изменений.</li>
          <li>Регулярно проверяйте список установленных игр и их обновления.</li>
          <li>Следите за стабильностью интернета и температурой ПК.</li>
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Для PlayStation (PS4/PS5)</h2>
        <ol className="list-decimal ml-6 text-gray-700">
          <li>Вместо Sunshine используйте Chiaki (<a href="https://github.com/thestr4ng3r/chiaki" target="_blank" rel="noopener" className="text-blue-600 underline">github.com/thestr4ng3r/chiaki</a>).</li>
          <li>Следуйте инструкции по настройке Chiaki для удалённого доступа.</li>
        </ol>
      </div>
      <div className="text-center text-sm text-gray-500">Если возникли вопросы — пишите в поддержку через Telegram-бота!</div>
    </div>
  );
}
