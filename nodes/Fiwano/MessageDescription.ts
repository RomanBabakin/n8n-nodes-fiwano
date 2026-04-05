import { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['message'] } },
	options: [
		{
			name: 'Send Template',
			value: 'sendTemplate',
			action: 'Send a WhatsApp template message',
			description: 'Send an approved WhatsApp template (required outside the 24h window)',
		},
		{
			name: 'Send Text',
			value: 'send',
			action: 'Send a text message',
			description: 'Send a plain text message through any channel type',
		},
	],
	default: 'send',
};

export const messageFields: INodeProperties[] = [
	// ── Channel ID ───────────────────────────────────────────────────
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		default: '',
		required: true,
		description: 'The channel to send the message through',
		displayOptions: {
			show: { resource: ['message'] },
		},
	},

	// ── Recipient ────────────────────────────────────────────────────
	{
		displayName: 'Recipient',
		name: 'recipient',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 1234567890',
		description: 'Phone number without + (WhatsApp), IGSID (Instagram), or PSID (Facebook). Use {{ $json.data.from }} from a Fiwano Trigger to reply.',
		displayOptions: {
			show: { resource: ['message'] },
		},
	},

	// ── Send Text: Message Text ──────────────────────────────────────
	{
		displayName: 'Message Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'The text content of the message',
		displayOptions: {
			show: { resource: ['message'], operation: ['send'] },
		},
	},

	// ── Send Template: Template Name ─────────────────────────────────
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. order_confirmation',
		description: 'Name of the approved WhatsApp template to send',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendTemplate'] },
		},
	},

	// ── Send Template: Language ──────────────────────────────────────
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'en_US',
		required: true,
		placeholder: 'e.g. en_US',
		description: 'Language code matching the approved template version',
		displayOptions: {
			show: { resource: ['message'], operation: ['sendTemplate'] },
		},
	},

	// ── Send Template: Variables ─────────────────────────────────────
	{
		displayName: 'Variables',
		name: 'variables',
		type: 'json',
		default: '',
		description: 'Template variables as JSON. Positional: {"body":["val1","val2"]}. Named: {"body":{"name":"Pablo"}}. Omit if no variables.',
		typeOptions: { rows: 4 },
		displayOptions: {
			show: { resource: ['message'], operation: ['sendTemplate'] },
		},
	},
];
