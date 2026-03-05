---
name: cubox
description: Save web URLs into Cubox when the user asks to bookmark, collect, archive, or store links. Use this skill when messages include one or more URLs and the intent is to persist them in Cubox.
user-invocable: true
---

# Cubox

Save URLs to Cubox bookmark service.

## Prerequisites

Before using this skill, ensure:
1. Cubox plugin is installed in OpenClaw
2. `CUBOX_API_URL` environment variable is set, OR `apiUrl` is configured in plugin config
3. User has Cubox Premium account (API requires premium)

## How to get Cubox API URL

1. Open Cubox app or web client
2. Go to Settings → Extensions → API
3. Enable API and copy the endpoint URL
4. Format: `https://cubox.pro/c/api/save/<token>`

## Action rules

- Extract all valid URLs from user message.
- Call `cubox_save_url` tool once per URL.
- Process at most 10 URLs per message. If more than 10, ask for confirmation.
- Execute calls sequentially with 100-300ms gap between each call.
- Pass optional parameters only when explicitly provided:
  - `title`: when user specifies a custom title
  - `tags`: when user provides tags
  - `folder`: when user specifies destination folder
  - `description`: when user provides description
- Keep original URL unchanged, do not append tracking parameters.

## Confirmation rules

- If user intent is clear (e.g., "收藏这个链接", "save this"), execute directly.
- If user sends URL without clear save intent, ask one short confirmation before saving.

## Response format

Return one line per URL with success or failure:
- Success: `✅ Saved: <url>`
- Failure: `❌ Failed: <url> - <error reason>`

## Error handling

If tool returns error:
1. Check if `CUBOX_API_URL` is configured
2. Check if API token is valid (401 = invalid token)
3. Check if daily limit exceeded (Cubox premium: 500 calls/day)
4. Report error to user with actionable suggestion