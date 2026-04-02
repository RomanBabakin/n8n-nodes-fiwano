import { createHmac, timingSafeEqual } from 'crypto';
import {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

export class FiwanoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fiwano Trigger',
		name: 'fiwanoTrigger',
		icon: 'file:fiwano.svg',
		group: ['trigger'],
		version: 1,
		description:
			'Receive webhook events from Fiwano (incoming messages, delivery status, etc.)',
		defaults: {
			name: 'Fiwano Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Webhook Secret',
				name: 'webhookSecret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'The webhook secret you configured on your Fiwano channel. Used to verify HMAC-SHA256 signatures. Leave empty to skip signature verification (not recommended for production).',
				hint: 'Must match the webhook_secret set on your Fiwano channel',
			},
			{
				displayName: 'Event Types',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Message Delivered',
						value: 'message.delivered',
						description: 'Triggered when a sent message is delivered to the recipient',
					},
					{
						name: 'Message Failed',
						value: 'message.failed',
						description: 'Triggered when a message fails to send',
					},
					{
						name: 'Message Read',
						value: 'message.read',
						description: 'Triggered when a recipient reads a message',
					},
					{
						name: 'Message Received',
						value: 'message.received',
						description: 'Triggered when the channel receives an incoming message',
					},
					{
						name: 'Message Sent',
						value: 'message.sent',
						description: 'Triggered when a message is successfully sent',
					},
				],
				default: ['message.received'],
				description:
					'Select which event types to process. Leave empty to process all event types.',
			},
			{
				displayName: 'Setup Instructions',
				name: 'setupNotice',
				type: 'notice',
				default: '',
				displayOptions: {},
				description:
					'Copy the webhook URL above and enter it as the webhook_url when calling the "Exchange OAuth Code" or "Update Webhook" operation on your Fiwano channel. Set the same secret in both places.',
			},
		],
	};

	// Fiwano does not have a webhook management API — webhooks are configured
	// per-channel when connecting or updating a channel. These methods are
	// no-ops: the user sets up the webhook URL manually in their Fiwano channel.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		const webhookSecret = this.getNodeParameter('webhookSecret', '') as string;
		const allowedEvents = this.getNodeParameter('events', []) as string[];

		// ── Signature verification ────────────────────────────────────────────
		if (webhookSecret) {
			const signatureHeader = req.headers['x-webhook-signature'] as string | undefined;

			if (!signatureHeader) {
				res.status(401).send('Missing X-Webhook-Signature header');
				return { noWebhookResponse: true };
			}

			// rawBody is populated by n8n before calling the webhook handler
			const rawBody: Buffer = (req as unknown as { rawBody: Buffer }).rawBody;
			if (!rawBody) {
				res.status(400).send('Unable to read raw request body for signature verification');
				return { noWebhookResponse: true };
			}

			const expectedSig = 'sha256=' + createHmac('sha256', webhookSecret)
				.update(rawBody)
				.digest('hex');

			// Timing-safe comparison to prevent timing attacks
			let signaturesMatch = false;
			try {
				signaturesMatch = timingSafeEqual(
					Buffer.from(signatureHeader),
					Buffer.from(expectedSig),
				);
			} catch {
				// Buffer.from lengths differ → mismatch
				signaturesMatch = false;
			}

			if (!signaturesMatch) {
				res.status(401).send('Invalid webhook signature');
				return { noWebhookResponse: true };
			}
		}

		// ── Parse body ────────────────────────────────────────────────────────
		const body = this.getBodyData() as IDataObject;

		// ── Event type filtering ──────────────────────────────────────────────
		if (allowedEvents.length > 0) {
			const eventType = body.event as string | undefined;
			if (eventType && !allowedEvents.includes(eventType)) {
				// Event filtered — acknowledge receipt but don't trigger workflow
				res.status(200).send({ received: true, filtered: true });
				return { noWebhookResponse: true };
			}
		}

		// ── Return event to workflow ──────────────────────────────────────────
		return {
			workflowData: [[{ json: body }]],
		};
	}
}
