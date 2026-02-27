# TinyClaw Mobile Setup Guide

TinyClaw can be fully operated from a smartphone using the **TinyOffice** web dashboard and messaging channels (Discord, Telegram, WhatsApp).

## Overview

| Feature | How to Access |
|---------|--------------|
| **Chat with agents** | Telegram / Discord / WhatsApp app on your phone |
| **Manage agents & teams** | TinyOffice web dashboard (PWA) |
| **Approve new users** | TinyOffice → Pairing page |
| **Monitor system** | TinyOffice → Dashboard |
| **Manage tasks** | TinyOffice → Tasks (Kanban board) |
| **View logs** | TinyOffice → Logs |
| **Configure settings** | TinyOffice → Settings |

## Initial Setup

### 1. Deploy TinyClaw on a Server

TinyClaw requires a server (VPS, cloud instance, or always-on home machine) to run the daemon. You can set this up from your phone using:

- **GitHub Codespaces** — Open the repository on github.com from your phone browser, click "Code" → "Codespaces" → "Create codespace", then run the install commands in the terminal.
- **Cloud provider mobile apps** — AWS, Google Cloud, and DigitalOcean have mobile apps for managing servers. Create a server and SSH into it using a mobile terminal app.
- **Mobile SSH apps** — [Termius](https://termius.com/) (iOS/Android), [JuiceSSH](https://juicessh.com/) (Android), or the built-in terminal in GitHub Codespaces.

```bash
# One-line install on the server
curl -fsSL https://raw.githubusercontent.com/TinyAGI/tinyclaw/main/scripts/remote-install.sh | bash

# Start TinyClaw
tinyclaw start
```

### 2. Install TinyOffice as a PWA

TinyOffice supports **Progressive Web App (PWA)** installation, so it works like a native app on your phone:

1. Start TinyOffice on your server:
   ```bash
   cd tinyoffice && npm install && npm run build && npm run start
   ```
2. Open `http://your-server-ip:3000` in your phone browser
3. **iOS Safari**: Tap the share button → "Add to Home Screen"
4. **Android Chrome**: Tap the three-dot menu → "Add to Home Screen" or look for the install banner

The app will appear on your home screen with the TinyClaw icon, running in standalone mode without browser chrome.

### 3. Configure Messaging Channels

From TinyOffice Settings page or via SSH:

- **Telegram**: Create a bot via [@BotFather](https://t.me/BotFather) on your phone, copy the token
- **Discord**: Create a bot at [discord.com/developers](https://discord.com/developers), add the token
- **WhatsApp**: Scan the QR code shown during setup with your WhatsApp app

### 4. Pair Your Phone

When you first message a TinyClaw agent from a new account:

1. You'll receive a **pairing code** (e.g., `AB12`)
2. Open TinyOffice → **Pairing** page on your phone
3. Enter the code and tap **Approve**

## Daily Usage (Phone Only)

### Chatting with Agents
Just send messages to your TinyClaw bot on Telegram, Discord, or WhatsApp — exactly like texting a friend.

### Managing Agents
Open TinyOffice on your phone:
- **Dashboard** — See agent/team counts, queue status, live events
- **Agents** — Create, edit, or delete agents
- **Teams** — Manage agent teams and leaders
- **Tasks** — Drag-and-drop Kanban board for task management
- **Pairing** — Approve or revoke access for messaging users

### Monitoring
- **Dashboard** — Real-time overview with SSE live event feed
- **Logs** — Tail the queue processor logs
- **Office** — Visual representation of agent activity

## Tips for Mobile Usage

- **Pin TinyOffice to your home screen** for quick access
- **Use Telegram** for the best mobile bot experience (inline keyboards, file support)
- **The sidebar collapses** on mobile — tap the hamburger menu (☰) to navigate
- **All forms are touch-optimized** with 44px minimum touch targets
- **Dark mode** is always on, reducing battery drain on OLED screens

## Network Access

TinyOffice needs to reach the API server (default port 3777). If your server is remote:

- Use a reverse proxy (nginx, Caddy) with HTTPS
- Or use a tunnel service (Cloudflare Tunnel, ngrok) to expose ports securely
- Set `NEXT_PUBLIC_API_URL` in TinyOffice to point to your server's public URL

## Architecture for Mobile

```
Your Phone
  ├─ Telegram/Discord/WhatsApp → Bot messages → TinyClaw Server
  └─ TinyOffice PWA → REST API / SSE → TinyClaw Server (port 3777)

TinyClaw Server (VPS)
  ├─ Queue Processor (agent orchestration)
  ├─ Channel Clients (Telegram/Discord/WhatsApp bots)
  ├─ API Server (port 3777)
  └─ TinyOffice (port 3000, Next.js)
```
