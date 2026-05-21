# Telegram Name Show Time

通过 Telegram 用户 API 定时修改自己的显示姓名，在名字后面显示时间、天气和温度，例如：

```text
JohnMuyno 14:11 🌦️ 25°C
```

## 功能

- 使用 Telegram API 修改当前账号的 `first_name`
- 使用 Open-Meteo 免费接口获取实时天气和温度
- 支持自定义基础姓名、经纬度、时区和更新间隔
- 登录 Session 会保存到本地，后续启动不需要重复输入验证码

## 准备 Telegram API 信息

1. 打开 <https://my.telegram.org/apps>
2. 登录你的 Telegram 账号
3. 创建一个 App
4. 复制 `api_id` 和 `api_hash`

## 安装

```bash
npm install
```

## 配置

复制 `.env.example` 为 `.env`，然后修改里面的值：

```bash
cp .env.example .env
```

Windows PowerShell 可以用：

```powershell
Copy-Item .env.example .env
```

主要配置：

- `TELEGRAM_API_ID`: Telegram 的 `api_id`
- `TELEGRAM_API_HASH`: Telegram 的 `api_hash`
- `BASE_NAME`: 你的基础姓名，例如 `JohnMuyno`
- `LATITUDE` / `LONGITUDE`: 天气位置经纬度
- `TIME_ZONE`: 时区，例如 `Asia/Shanghai`
- `UPDATE_INTERVAL_SECONDS`: 更新间隔，建议不要低于 `60`

## 运行

```bash
npm start
```

首次运行会要求输入手机号、验证码，若账号开启了两步验证，还会要求输入密码。登录成功后 Session 会保存到 `.telegram-session`。

## 注意事项

- Telegram 对频繁修改资料可能会限流，建议更新间隔保持 `60` 秒或更长。
- 这个项目使用的是用户 API，不是 Bot API，所以需要你的 Telegram `api_id` / `api_hash`。
- 如果要重新登录，停止程序后删除 `.telegram-session` 再运行。
