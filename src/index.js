import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const WEATHER_CODES = new Map([
  [0, '☀️'],
  [1, '🌤️'],
  [2, '⛅'],
  [3, '☁️'],
  [45, '🌫️'],
  [48, '🌫️'],
  [51, '🌦️'],
  [53, '🌦️'],
  [55, '🌧️'],
  [56, '🌧️'],
  [57, '🌧️'],
  [61, '🌦️'],
  [63, '🌧️'],
  [65, '🌧️'],
  [66, '🌧️'],
  [67, '🌧️'],
  [71, '🌨️'],
  [73, '🌨️'],
  [75, '❄️'],
  [77, '🌨️'],
  [80, '🌦️'],
  [81, '🌧️'],
  [82, '⛈️'],
  [85, '🌨️'],
  [86, '❄️'],
  [95, '⛈️'],
  [96, '⛈️'],
  [99, '⛈️']
]);

const BOLD_DIGITS = ['𝟎', '𝟏', '𝟐', '𝟑', '𝟒', '𝟓', '𝟔', '𝟕', '𝟖', '𝟗'];

const config = readConfig();
const sessionPath = path.resolve(rootDir, config.sessionFile);
let lastName = '';

const client = new TelegramClient(
  new StringSession(readSession(sessionPath)),
  config.apiId,
  config.apiHash,
  { connectionRetries: 5 }
);

await client.start({
  phoneNumber: () => input.text('请输入 Telegram 手机号（含国家区号，例如 +8613...）：'),
  password: () => input.password('请输入两步验证密码：'),
  phoneCode: () => input.text('请输入 Telegram 验证码：'),
  onError: (error) => console.error('Telegram 登录错误：', error.message)
});

writeSession(sessionPath, client.session.save());
console.log('Telegram 登录成功，开始更新姓名。按 Ctrl+C 停止。');

await updateName();
setInterval(updateName, config.updateIntervalSeconds * 1000);

async function updateName() {
  try {
    const weather = await getWeather(config.latitude, config.longitude, config.timeZone);
    const time = toBoldDigits(formatTime(config.timeZone));
    const temperature = toBoldDigits(String(weather.temperature));
    const nextName = `${config.baseName} ${time} ${weather.icon} ${temperature}°𝐂`;

    if (nextName === lastName) {
      return;
    }

    await client.invoke(
      new Api.account.UpdateProfile({
        firstName: nextName
      })
    );

    lastName = nextName;
    console.log(`[${new Date().toISOString()}] 已更新姓名：${nextName}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 更新失败：${error.message}`);
  }
}

async function getWeather(latitude, longitude, timeZone) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('timezone', timeZone);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`天气接口返回 ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('天气接口返回数据异常');
  }

  const code = Number(current.weather_code);
  return {
    icon: WEATHER_CODES.get(code) ?? '🌡️',
    temperature: Math.round(current.temperature_2m)
  };
}

function formatTime(timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone
  }).format(new Date());
}

function toBoldDigits(value) {
  return value.replace(/\d/g, (digit) => BOLD_DIGITS[Number(digit)]);
}

function readConfig() {
  const required = ['TELEGRAM_API_ID', 'TELEGRAM_API_HASH'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少环境变量：${missing.join(', ')}。请先复制 .env.example 为 .env 并填写。`);
  }

  const apiId = Number(process.env.TELEGRAM_API_ID);
  if (!Number.isInteger(apiId)) {
    throw new Error('TELEGRAM_API_ID 必须是数字');
  }

  return {
    apiId,
    apiHash: process.env.TELEGRAM_API_HASH,
    baseName: process.env.BASE_NAME || 'JohnMuyno',
    latitude: readNumber('LATITUDE', 31.2304),
    longitude: readNumber('LONGITUDE', 121.4737),
    timeZone: process.env.TIME_ZONE || 'Asia/Shanghai',
    updateIntervalSeconds: Math.max(readNumber('UPDATE_INTERVAL_SECONDS', 60), 30),
    sessionFile: process.env.SESSION_FILE || '.telegram-session'
  };
}

function readNumber(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${key} 必须是数字`);
  }

  return number;
}

function readSession(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }

  return fs.readFileSync(filePath, 'utf8').trim();
}

function writeSession(filePath, session) {
  fs.writeFileSync(filePath, session, 'utf8');
}
