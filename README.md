# Minecraft Bot Project

This is an open-source project for creating and managing Minecraft bots using Mineflayer. It includes features like automatic login/registration, random chat messages, an uptime command, automatic entry/exit cycling for bots, and anti-AFK functionality.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer Information
- **Developer**: mgv
- **X (Twitter)**: @mgv15 (User ID: 1379675201616347259)
- **GitHub**: https://github.com/hub-mgv

## Features
- **Auto Authentication**: Automatically registers or logs in bots on servers that require it.
- **Random Chat**: Sends random messages at set intervals.
- **Runtime Command**: Responds to '!Runtime' command with the bot's uptime (with cooldown).
- **Automatic Entry/Exit**: Cycles bots in and out to simulate activity, with random delays between 4-5 hours.
- **Anti-AFK**: Prevents bots from being kicked for inactivity.

## Hosting Recommendation
We recommend using [wispbyte.com](https://wispbyte.com) for hosting your bots. It's a free hosting service that supports 24/7 uptime for Minecraft servers and bots, with no hidden fees. This ensures your bots stay online continuously without interruptions.

## Warning and Disclaimer
This bot is intended for **educational purposes only**. Do not use it for any malicious activities, such as griefing, spamming, or violating server rules. You are solely responsible for how you use this code and any consequences that arise from it, including but not limited to bans from servers or hosting providers. The developer (mgv) is not liable for any misuse or damages. Using bots on servers without permission may result in bans, and this is a clear warning.

## Installation and Setup
1. Clone the repository: `git clone https://github.com/hub-mgv/minecraft-bot-project.git`
2. Install dependencies: `npm install mineflayer @rhld16/mineflayer-antiafk prismarine-auth`
3. Configure your settings in `config/Settings.json` (example provided in the code).
4. Run the project: `ts-node index.ts` (assuming you have TypeScript set up).

## Configuration
Edit `config/Settings.json` to set your server details, bot names, and other options.

## Contributing
Contributions are welcome! Please fork the repository and submit pull requests.

## Contact
For questions or issues, reach out via GitHub or X.