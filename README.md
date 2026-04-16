# Autonomous Help Desk 🚀

## Professional AI-Powered IT Help Desk Demo

Pure HTML/JS SPA - no server needed.

## Quick Start
```
cd autonomous-helpdesk
start index.html
```
or **double-click `index.html`** to open in browser.

## Features
- **Sidebar Nav:** Click IAM, Triage, Lifecycle, Knowledge, Governance.
- **IAM:** Enter username, click Reset Password/MFA/Provision.
- **Triage Chatbot** 🔥: **NEW** Describe issue (e.g. "password reset urgent") → AI classifies domain (IAM/Network/etc.) + assigns specialist employee + auto-resolves if possible.
- **Lifecycle:** Provision software → inventory updates; New equipment adds items.
- **Knowledge:** Query "jamf" → response; Unknown → gap detect.
- **Governance:** View SLA table, Run QA.

**Example:** Type "my laptop screen is broken" → Classified HARDWARE → Assigned Mike Johnson.

Data persists (localStorage). Check **F12 Console** for agent logs.

## Tech
Vanilla JS agents (perception-reasoning-action), Font Awesome icons, Inter font, corporate UI.

Fully functional - reload anytime.

