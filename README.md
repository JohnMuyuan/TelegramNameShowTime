# Telegram Name Show Time

Periodically update your Telegram display name through the user API, appending the time, weather, and temperature. Example:

```text
Example 14:11 🌦️ 25°C
```

## Features

- Update the current account's `first_name` through the Telegram API.
- Fetch current weather and temperature from the free Open-Meteo API.
- Configure the base name, coordinates, time zone, and update interval.
- Save the login session locally so subsequent starts do not require a new verification code.

## Obtain Telegram API credentials

1. Open <https://my.telegram.org/apps>.
2. Sign in to your Telegram account.
3. Create an application.
4. Copy its `api_id` and `api_hash`.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and edit the values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

- `TELEGRAM_API_ID`: your Telegram `api_id`.
- `TELEGRAM_API_HASH`: your Telegram `api_hash`.
- `BASE_NAME`: your base display name, for example `Example`.
- `LATITUDE` / `LONGITUDE`: weather coordinates. The sample uses the Royal Observatory in Greenwich, a public landmark.
- `TIME_ZONE`: an IANA time zone, for example `UTC`. Set this to your preferred display time zone.
- `UPDATE_INTERVAL_SECONDS`: update interval; at least `60` seconds is recommended.

## Run

```bash
npm start
```

The first run asks for your phone number and verification code, and your password if two-step verification is enabled. The session is saved in `.telegram-session` after successful login.

## Notes

- Telegram may rate-limit frequent profile changes; use an interval of `60` seconds or longer.
- This project uses the user API rather than the Bot API, so it needs your Telegram `api_id` and `api_hash`.
- To sign in again, stop the application, remove `.telegram-session`, and restart it.
