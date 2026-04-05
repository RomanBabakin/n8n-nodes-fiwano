import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['contact'] } },
	options: [
		{
			name: 'Get Profile',
			value: 'getProfile',
			action: 'Get sender profile',
			description: 'Fetch sender profile from Meta (Instagram & Facebook only)',
		},
	],
	default: 'getProfile',
};

export const contactFields: INodeProperties[] = [
	// ── Channel ID ───────────────────────────────────────────────────
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Instagram or Facebook channel ID',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getProfile'] },
		},
	},

	// ── User ID ──────────────────────────────────────────────────────
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 6543217890123456',
		description: 'IGSID (Instagram) or PSID (Facebook) — available as data.from in webhook payloads',
		hint: 'Use {{ $json.data.from }} from a Fiwano Trigger node',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getProfile'] },
		},
	},

	// ── Notice ───────────────────────────────────────────────────────
	{
		displayName: 'WhatsApp is not supported — sender name is always in the webhook payload (data.from_name). Profile results are cached 5 min on Fiwano\'s side.',
		name: 'profileNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: { resource: ['contact'], operation: ['getProfile'] },
		},
	},
];
