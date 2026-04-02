# n8n-nodes-fiwano

n8n community node for **[Fiwano](https://fiwano.com)** — a unified messaging API for **WhatsApp, Instagram DM, and Facebook Messenger**.

## What is Fiwano?

Fiwano is a verified Meta Tech Provider that abstracts the complexity of WhatsApp Cloud API, Instagram Messaging API, and Facebook Messenger API into a single, consistent REST API. Connect your Meta-verified business accounts once via simple Facebook auth — no Meta developer portal, no app setup, no individual channel verification required.

Key benefits:
- **One API for three channels** — identical request format across WhatsApp, Instagram DM, and Facebook Messenger
- **Real-time webhooks** — incoming messages and delivery statuses delivered to your endpoint, HMAC-signed
- **WhatsApp template management** — create, manage, and send approved templates directly from the API
- **Auto token refresh** — Meta access tokens are refreshed automatically before expiry
- **Secure by default** — tokens encrypted at rest, no message content stored on Fiwano's side

Built for AI assistants, CRMs, helpdesks, and any product that needs conversational messaging at business scale.

**[7-day free trial](https://fiwano.com/auth/login) — no credit card required.**  
**$12/mo** per channel slot (1 WhatsApp + 1 Instagram + 1 Facebook Messenger, unlimited messages).

## Nodes

| Node | Type | Description |
|------|------|-------------|
| **Fiwano** | Action | Send messages, manage channels, WhatsApp templates, redirect URIs |
| **Fiwano Trigger** | Webhook Trigger | Receive incoming messages and delivery status webhooks |

### Action node — operations

| Resource | Operations |
|----------|-----------|
| Message | Send Text, Send Template (WhatsApp) |
| Channel | Get All, Get, Generate OAuth URL, Exchange OAuth Code, Update Webhook, Delete |
| Template | Get All, Get, Create, Update, Delete (WhatsApp only) |
| Redirect URI | Get All, Add, Delete |

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

## Installation

### n8n GUI (community nodes)

1. **Settings → Community Nodes**
2. Enter `n8n-nodes-fiwano`
3. **Install**

### Self-hosted Docker

See [https://github.com/RomanBabakin/n8n-nodes-fiwano](https://github.com/RomanBabakin/n8n-nodes-fiwano) for a Docker setup that builds this package into a custom n8n image — no local `npm install` needed.

## Authentication

1. [Sign up at fiwano.com](https://fiwano.com/auth/login) and create an API key in **API Keys**
2. In n8n, create a **Fiwano API** credential and paste the key (starts with `mip_live_`)

## Setting up the Trigger node

1. Add a **Fiwano Trigger** node and copy the **Webhook URL** from it
2. In the Fiwano portal (or via a **Channel → Update Webhook** node), set that URL on your channel
3. Copy the `webhook_secret` from the channel into the Trigger node

## Sending WhatsApp template messages

Outside the 24-hour window, WhatsApp requires pre-approved templates. Use **Message → Send Template** and provide variables as a JSON object:

```json
{
  "body": ["Pablo", "ORD-123", "25%"],
  "header": ["Summer Sale"],
  "buttons": [{ "index": 0, "value": "promo25" }]
}
```

Named variables: `{ "body": { "customer_name": "Pablo" } }`. Leave the **Variables** field empty if the template has no placeholders.

## Links

- [fiwano.com](https://fiwano.com) — product page & free trial
- [API Documentation](https://fiwano.com/documentation)
- [Portal](https://fiwano.com/auth/login)

## License

MIT — © Roman Babakin / [rmnbb.cloud](https://rmnbb.cloud)
