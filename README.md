# Slack Message Purger

> [!WARNING]  
> This script will permanently delete ALL your sent messages and replies in a specified Slack workspace. This action cannot be undone. Use with extreme caution!

## What This Script Does

This Deno-based script helps you bulk delete all messages you've sent in a Slack workspace. It will:

1. Find all conversations you have access to (public channels, private channels, group messages, and direct messages)
2. Identify all messages and thread replies authored by you
3. Delete your messages and replies across all conversation types
4. Provide detailed console output showing the deletion progress

**Types of messages deleted:**

- Top-level messages in channels and DMs
- Thread replies you've posted
- Messages in public channels, private channels, group messages, and direct messages

## Prerequisites

- [Deno](https://deno.land/) installed on your system
- A Slack workspace where you have permission to create apps
- Admin or appropriate user permissions to delete your own messages

## Setup and Usage

### 1. Create a Slack App

1. Go to [Slack Apps](https://api.slack.com/apps/) and click **Create An App**
2. Choose **From scratch**
3. Name your app (e.g., "Message Purger") and select your workspace
4. Configure OAuth Permissions

### 2. Configure OAuth Permissions

1. In your app settings, navigate to **Features** > **OAuth & Permissions**
2. Scroll down to **User Token Scopes** and add the following scopes:
   - `channels:history` - View messages in public channels
   - `channels:read` - View basic information about public channels
   - `chat:write` - Send and modify messages
   - `groups:history` - View messages in private channels
   - `groups:read` - View basic information about private channels
   - `im:history` - View messages in direct messages
   - `im:read` - View basic information about direct messages
   - `mpim:history` - View messages in group direct messages
   - `mpim:read` - View basic information about group direct messages

### 3. Install App

1. Go to **Settings** and **Install App**
2. Once installed, you will see your **User OAuth Token** (starting with "xoxp-")

### 4. Configure the Script

1. Open `main.ts` in your editor
2. Replace the placeholder token:
   ```typescript
   const USER_TOKEN = "xoxp-your-actual-token-here";
   ```

### 5. Customize Message Types (Optional)

You can modify which types of conversations to process by changing the `MESSAGE_TYPES_TO_DELETE` constant.
