# n8n-nodes-fiwano

n8n community node for **[Fiwano](https://fiwano.com)** — a unified messaging API for **WhatsApp, Instagram DM, and Facebook Messenger**.

## What is Fiwano?

Fiwano is a verified Meta Tech Provider that abstracts the complexity of WhatsApp Cloud API, Instagram Messaging API, and Facebook Messenger API into a single, consistent REST API. Connect your Meta-verified business accounts once via simple Facebook auth — no Meta developer portal, no app setup, no individual channel verification required.

Key benefits:
- **Official Meta APIs only** — built on WhatsApp Cloud API, Instagram Messaging API and Facebook Messenger API. No browser automation, no unofficial client simulation, no account ban risk. Production-safe at any scale.
- **One API for three channels** — identical request format across WhatsApp, Instagram DM, and Facebook Messenger
- **Real-time webhooks** — incoming messages and delivery statuses delivered to your endpoint, HMAC-signed
- **WhatsApp template management** — create, manage, and send approved templates directly from the API
- **Auto token refresh** — Meta access tokens are refreshed automatically before expiry
- **Secure by default** — tokens encrypted at rest, no message content stored on Fiwano's side

Built for AI assistants, CRMs, helpdesks, and any product that needs conversational messaging at business scale.

**[7-day free trial](https://fiwano.com/auth/login) — no credit card required.**

## License Tiers

One license covers a slot bundle: **1 WhatsApp + 1 Instagram + 1 Facebook Messenger** channel, with unlimited messages.

| Tier | Monthly | Capabilities |
|------|---------|-------------|
| Messaging | $12 | Text messages in/out, templates (WhatsApp), delivery statuses |
| Media | $19 | Everything in Messaging + inbound media and files, outbound files via URL |

New accounts start with a **7-day free trial on the Media tier** (full functionality).

## Nodes

| Node | Type | Description |
|------|------|-------------|
| **Fiwano** | Action | Send messages, manage channels, WhatsApp templates, contact profile enrichment, redirect URIs |
| **Fiwano Trigger** | Webhook Trigger | Receive incoming messages and delivery status webhooks |

### Action node — operations

| Resource | Operations |
|----------|-----------|
| Message | Send Text, Send Media, Send Template (WhatsApp) |
| Channel | Get Many, Get, Generate OAuth URL, Exchange OAuth Code, Update Webhook, Delete |
| Media | Download (saves received file as binary data) |
| Contact | Get Profile (Instagram, Facebook — enriches sender with name, profile picture, follower count) |
| Template | Get Many, Get, Create, Update, Delete (WhatsApp only) |
| Redirect URI | Get Many, Add, Delete |

### Trigger node — events

The trigger starts your workflow for any of these events:

| Event | Channels |
|-------|---------|
| `message.received` | WhatsApp, Instagram, Facebook |
| `message.delivered` | WhatsApp, Instagram, Facebook |
| `message.read` | WhatsApp, Instagram, Facebook |
| `message.sent` | WhatsApp |
| `message.failed` | WhatsApp |

Filter by event type in node settings. HMAC-SHA256 signature verification is built in.

## Example Workflows

Ready-to-import workflows are in the [`workflows/`](./workflows/) directory:

| File | Description |
|------|-------------|
| `fiwano-complete-demo.json` | 9-section demo covering every operation: Echo Bot with profile enrichment (live trigger), channel management, template CRUD, text & template messaging, redirect URI management |

Import via n8n UI: **Workflows → (menu) → Import → select file**, or via CLI:
```bash
n8n import:workflow --input=workflows/fiwano-complete-demo.json
```

---

## Installation

### n8n GUI (community nodes)

1. **Settings → Community Nodes**
2. Enter `n8n-nodes-fiwano`
3. **Install**

### Self-hosted without npm access (manual)


```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm install n8n-nodes-fiwano
# Restart n8n
```

### Self-hosted Docker

Build this package into a custom n8n image — no local `npm install` needed. See the [Docker setup guide](https://github.com/RomanBabakin/n8n-nodes-fiwano#self-hosted-docker).

---

## Credentials

1. [Sign up at fiwano.com](https://fiwano.com/auth/login) and create an API key in **API Keys**
2. In n8n: **Credentials → Add → Fiwano API** → paste the key (starts with `mip_live_`)

All Fiwano action nodes use this credential. The trigger node does not need credentials (it only verifies the webhook signature you configure per-channel).

---

## Connecting a Channel

Channels are connected via Facebook OAuth. You do this once per channel (WhatsApp number / Instagram account / Facebook page).

1. Add a **Fiwano** node → Resource: **Channel** → Operation: **Generate OAuth URL**
   - Select channel type, provide your redirect URI (must be registered via **Redirect URI → Add**)
   - Run the node → copy the `oauth_url` from the output
2. Open that URL in a browser and authorize the page(s)
3. Add another **Fiwano** node → **Channel → Exchange OAuth Code**
   - Paste the `code` from the redirect URL query parameter
   - Optionally set `webhook_url` and `webhook_secret` in Additional Fields
4. The response contains `channel_id` — save it for all subsequent nodes

Alternatively, manage everything from the [Fiwano portal](https://fiwano.com) UI.

---

## Setting Up the Trigger (Webhooks)

The **Fiwano Trigger** node starts a workflow when a message arrives on your channel.

1. Create a workflow, add **Fiwano Trigger**, choose event types (default: `message.received`)
2. **Save and activate** the workflow — n8n assigns a permanent webhook URL
3. Copy the webhook URL from the node header (format: `https://your-n8n.example.com/webhook/<uuid>`)
4. In the **Fiwano** node → **Channel → Update Webhook**, set:
   - `channel_id` — your channel
   - `webhook_url` — the URL from step 3
   - Leave `webhook_secret` empty to auto-generate one, or provide your own
5. The response includes `webhook_secret` — copy it into the **Webhook Secret** field in the Trigger node
6. Re-save the workflow

> **n8n must be publicly accessible.** Fiwano delivers webhooks over the internet. Local `localhost` won't work — use a reverse proxy, ngrok, or n8n Cloud.

### Webhook Payload Structure

Every event from Fiwano follows the same top-level shape:

```json
{
  "event": "message.received",
  "channel_id": "a1b2c3d4e5f67890",
  "channel_type": "whatsapp",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": { ... }
}
```

Key fields available in expressions after the trigger:

| Expression | Value |
|---|---|
| `{{ $json.channel_id }}` | Channel that received the message |
| `{{ $json.channel_type }}` | `whatsapp` / `instagram` / `facebook` |
| `{{ $json.data.from }}` | Sender ID — use as `recipient` when replying |
| `{{ $json.data.from_name }}` | Sender name (WhatsApp only; `null` on Instagram/Facebook) |
| `{{ $json.data.text }}` | Message text (for `type: text` messages) |
| `{{ $json.data.type }}` | `text`, `image`, `audio`, `video`, `document`, `sticker`, or `unsupported` |
| `{{ $json.data.media.media_id }}` | ID to download file via `GET /api/v1/media/{media_id}` (Media license) |
| `{{ $json.data.media.kind }}` | Media kind: `image`, `audio`, `voice`, `video`, `document`, `sticker` |
| `{{ $json.data.media.download_url }}` | Pre-built download URL (Media license only) |
| `{{ $json.data.media.mime_type }}` | MIME type of the received file |
| `{{ $json.data.media.expires_at }}` | ISO 8601 expiry timestamp (temp storage) |
| `{{ $json.data.caption }}` | Caption text attached to the media (WhatsApp) |
| `{{ $json.data.upgrade_required }}` | `"media"` if channel lacks Media license for this message |

---

## Sending Messages

### Text message

```
Resource: Message → Operation: Send Text
Channel ID: <channel_id>
Recipient: {{ $('Fiwano Trigger').item.json.data.from }}
Text: Hello!
```

### WhatsApp template

Outside the 24-hour conversation window, WhatsApp requires pre-approved templates.

```
Resource: Message → Operation: Send Template
Channel ID: <wa_channel_id>
Recipient: <phone_without_plus>
Template Name: order_confirmation
Language: en_US
Variables: {"body": ["John", "ORD-456"]}
```

Variable format:
- **Positional** (numbered `{{1}}`, `{{2}}`): `{"body": ["val1", "val2"], "header": ["val"], "buttons": [{"index": 0, "value": "abc"}]}`
- **Named** (custom keys): `{"body": {"customer_name": "John"}}`
- Leave empty if the template has no variables

### Media message (image, audio, video, document)

Send a media file via a public HTTPS URL. **Requires a Media license** on the channel's billing plan.

```
Resource: Message → Operation: Send Media
Channel ID: <channel_id>
Recipient: {{ $('Fiwano Trigger').item.json.data.from }}
Media Type: image
Media URL: https://example.com/photo.jpg
Additional Fields → Caption: Check this out!
```

Supported types per channel:

| Media Type | WhatsApp | Instagram | Facebook |
|------------|----------|-----------|----------|
| image | ✓ | ✓ | ✓ |
| audio | ✓ | ✓ | ✓ |
| video | ✓ | ✓ | ✓ |
| document | ✓ | — | ✓ (as file) |

> Channels without a Media license return HTTP 402. Upgrade at [fiwano.com/billing](https://fiwano.com/billing).

---

## Enriching Sender Profile (Instagram & Facebook)

Instagram and Facebook webhooks do not include the sender's name. Use **Contact → Get Profile** immediately after a Fiwano Trigger to fetch it:

- **Instagram:** returns `username`, `name`, `profile_pic`, `follower_count`, `is_verified_user`
- **Facebook:** returns `first_name`, `last_name`, `profile_pic`
- Results are cached 5 minutes on Fiwano's side
- Not applicable for WhatsApp (name is always present in `data.from_name`)

---

## Common Patterns

**Reply to same channel and sender:**
```
channel_id: {{ $json.channel_id }}
recipient:  {{ $json.data.from }}
```

**Only process text messages:**
`IF → $json.data.type === 'text'`

**Get sender name on Instagram/Facebook:**
Add **Contact → Get Profile** (Channel ID: `$json.channel_id`, User ID: `$json.data.from`) immediately after the trigger.

**Filter by channel type:**
`IF → $json.channel_type === 'whatsapp'`

---

## Links

- [fiwano.com](https://fiwano.com) — product page & free trial
- [API Documentation](https://fiwano.com/documentation)
- [Portal](https://fiwano.com/auth/login)

## License

MIT — © Roman Babakin / [rmnbb.com](https://rmnbb.com)
