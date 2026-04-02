import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

const BASE_URL = 'https://fiwano.com/api/v1';

async function apiRequest(
	ef: IExecuteFunctions,
	method: string,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
	const options: IHttpRequestOptions = {
		method: method as IHttpRequestOptions['method'],
		url: `${BASE_URL}${path}`,
		headers: { 'Content-Type': 'application/json' },
	};
	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}
	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}
	try {
		return await ef.helpers.httpRequestWithAuthentication('fiwanoApi', options);
	} catch (error) {
		throw new NodeApiError(ef.getNode(), error as Error);
	}
}

export class Fiwano implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fiwano',
		name: 'fiwano',
		icon: 'file:fiwano.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Fiwano messaging platform API (WhatsApp, Instagram, Facebook Messenger)',
		defaults: {
			name: 'Fiwano',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'fiwanoApi',
				required: true,
			},
		],
		properties: [
			// ─────────────────────────── RESOURCE ───────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Channel', value: 'channel' },
					{ name: 'Message', value: 'message' },
					{ name: 'Template', value: 'template' },
					{ name: 'Redirect URI', value: 'redirect' },
				],
				default: 'message',
			},

			// ─────────────────────────── CHANNEL OPERATIONS ───────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['channel'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Get all channels',
						description: 'Retrieve a list of all connected channels',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a channel',
						description: 'Retrieve details of a specific channel',
					},
					{
						name: 'Generate OAuth URL',
						value: 'setupUrl',
						action: 'Generate channel OAuth setup URL',
						description: 'Generate an OAuth URL to connect a new channel',
					},
					{
						name: 'Exchange OAuth Code',
						value: 'exchangeCode',
						action: 'Exchange OAuth code for channel',
						description: 'Exchange an OAuth code received after authorization',
					},
					{
						name: 'Update Webhook',
						value: 'update',
						action: 'Update channel webhook settings',
						description: 'Update the webhook URL and secret for a channel',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a channel',
						description: 'Deactivate and remove a channel',
					},
				],
				default: 'getAll',
			},

			// ─────────────────────────── MESSAGE OPERATIONS ───────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send Text',
						value: 'send',
						action: 'Send a text message',
						description: 'Send a plain text message via a channel',
					},
					{
						name: 'Send Template',
						value: 'sendTemplate',
						action: 'Send a WhatsApp template message',
						description: 'Send an approved WhatsApp template (WhatsApp only)',
					},
				],
				default: 'send',
			},

			// ─────────────────────────── TEMPLATE OPERATIONS ───────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['template'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Get all templates',
						description: 'List all WhatsApp templates for a channel',
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a template',
						description: 'Get details of a specific template',
					},
					{
						name: 'Create',
						value: 'create',
						action: 'Create a template',
						description: 'Create a new WhatsApp message template',
					},
					{
						name: 'Update',
						value: 'update',
						action: 'Update a template',
						description: 'Update an existing WhatsApp template',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a template',
						description: 'Delete a WhatsApp template',
					},
				],
				default: 'getAll',
			},

			// ─────────────────────────── REDIRECT URI OPERATIONS ───────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['redirect'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Get all redirect URIs',
						description: 'List all allowed OAuth redirect URIs',
					},
					{
						name: 'Add',
						value: 'add',
						action: 'Add a redirect URI',
						description: 'Add a new allowed OAuth redirect URI',
					},
					{
						name: 'Delete',
						value: 'delete',
						action: 'Delete a redirect URI',
						description: 'Remove an allowed redirect URI',
					},
				],
				default: 'getAll',
			},

			// ─────────────────────────── SHARED: Channel ID ───────────────────────────
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique identifier of the channel',
				displayOptions: {
					show: {
						resource: ['channel'],
						operation: ['get', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique identifier of the channel to send the message through',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'sendTemplate'],
					},
				},
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique identifier of the WhatsApp channel',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['getAll', 'get', 'create', 'update', 'delete'],
					},
				},
			},

			// ─────────────────────────── CHANNEL: setupUrl fields ───────────────────────────
			{
				displayName: 'Channel Type',
				name: 'channelType',
				type: 'options',
				options: [
					{ name: 'WhatsApp', value: 'whatsapp' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'Facebook Messenger', value: 'facebook' },
				],
				default: 'whatsapp',
				required: true,
				description: 'The type of channel to connect',
				displayOptions: {
					show: { resource: ['channel'], operation: ['setupUrl'] },
				},
			},
			{
				displayName: 'Redirect URI',
				name: 'redirectUri',
				type: 'string',
				default: '',
				required: true,
				description: 'The OAuth redirect URI (must be registered in allowed redirect URIs)',
				displayOptions: {
					show: { resource: ['channel'], operation: ['setupUrl'] },
				},
			},

			// ─────────────────────────── CHANNEL: exchangeCode fields ───────────────────────────
			{
				displayName: 'OAuth Code',
				name: 'code',
				type: 'string',
				default: '',
				required: true,
				description: 'The OAuth authorization code received after user authorization',
				displayOptions: {
					show: { resource: ['channel'], operation: ['exchangeCode'] },
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['channel'], operation: ['exchangeCode'] },
				},
				options: [
					{
						displayName: 'Webhook URL',
						name: 'webhook_url',
						type: 'string',
						default: '',
						description: 'URL where Fiwano will deliver webhook events for this channel',
					},
					{
						displayName: 'Webhook Secret',
						name: 'webhook_secret',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'Secret used to sign webhook payloads (for HMAC-SHA256 verification)',
					},
				],
			},

			// ─────────────────────────── CHANNEL: update fields ───────────────────────────
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: { resource: ['channel'], operation: ['update'] },
				},
				options: [
					{
						displayName: 'Webhook URL',
						name: 'webhook_url',
						type: 'string',
						default: '',
						description: 'New webhook URL for this channel',
					},
					{
						displayName: 'Webhook Secret',
						name: 'webhook_secret',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						description: 'New webhook secret for HMAC-SHA256 signature verification',
					},
				],
			},

			// ─────────────────────────── MESSAGE: send fields ───────────────────────────
			{
				displayName: 'Recipient',
				name: 'recipient',
				type: 'string',
				default: '',
				required: true,
				placeholder: '+1234567890',
				description: 'Phone number or user ID of the recipient (format depends on channel type)',
				displayOptions: {
					show: { resource: ['message'], operation: ['send', 'sendTemplate'] },
				},
			},
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

			// ─────────────────────────── MESSAGE: sendTemplate fields ───────────────────────────
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				required: true,
				description: 'The name of the approved WhatsApp template to use',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: 'en',
				required: true,
				placeholder: 'en',
				description: 'Language code for the template (e.g. en, ru, en_US)',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
			},
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'json',
				default: '',
				description: 'Variables keyed by component. Positional: {"body":["Pablo","ORD-123"],"header":["Sale"],"buttons":[{"index":0,"value":"promo25"}]}. Named: {"body":{"customer_name":"Pablo"}}. Leave empty if template has no variables.',
				displayOptions: {
					show: { resource: ['message'], operation: ['sendTemplate'] },
				},
				typeOptions: { rows: 4 },
			},

			// ─────────────────────────── TEMPLATE: get/update/delete ───────────────────────────
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique identifier of the template',
				displayOptions: {
					show: { resource: ['template'], operation: ['get', 'update', 'delete'] },
				},
			},

			// ─────────────────────────── TEMPLATE: getAll filters ───────────────────────────
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: { resource: ['template'], operation: ['getAll'] },
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Approved', value: 'APPROVED' },
							{ name: 'Pending', value: 'PENDING' },
							{ name: 'Rejected', value: 'REJECTED' },
						],
						default: '',
						description: 'Filter templates by approval status',
					},
					{
						displayName: 'Sync from Meta',
						name: 'sync',
						type: 'boolean',
						default: false,
						description: 'Whether to sync templates from Meta before returning (fetches latest state)',
					},
				],
			},

			// ─────────────────────────── TEMPLATE: create/update body ───────────────────────────
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				required: true,
				description: 'The name for this template (lowercase, underscores allowed)',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: 'en_US',
				required: true,
				description: 'Language code for this template (e.g. en_US, ru)',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'Marketing', value: 'MARKETING' },
					{ name: 'Utility', value: 'UTILITY' },
					{ name: 'Authentication', value: 'AUTHENTICATION' },
				],
				default: 'UTILITY',
				required: true,
				description: 'Template category as required by Meta',
				displayOptions: {
					show: { resource: ['template'], operation: ['create'] },
				},
			},
			{
				displayName: 'Components (JSON)',
				name: 'components',
				type: 'json',
				default: '[]',
				required: true,
				description: 'Template components array as JSON. Example: [{"type":"BODY","text":"Hello {{1}}!"}]',
				displayOptions: {
					show: { resource: ['template'], operation: ['create', 'update'] },
				},
			},

			// ─────────────────────────── TEMPLATE: delete options ───────────────────────────
			{
				displayName: 'Delete All Languages',
				name: 'allLanguages',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the template in all languages (not just the specified template ID)',
				displayOptions: {
					show: { resource: ['template'], operation: ['delete'] },
				},
			},

			// ─────────────────────────── REDIRECT: fields ───────────────────────────
			{
				displayName: 'Redirect ID',
				name: 'redirectId',
				type: 'string',
				default: '',
				required: true,
				description: 'The unique identifier of the redirect URI entry',
				displayOptions: {
					show: { resource: ['redirect'], operation: ['delete'] },
				},
			},
			{
				displayName: 'URI Pattern',
				name: 'uriPattern',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://yourapp.com/callback',
				description: 'The redirect URI to allow for OAuth flows',
				displayOptions: {
					show: { resource: ['redirect'], operation: ['add'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			let responseData: IDataObject | IDataObject[];

			try {
				// ── CHANNEL ──────────────────────────────────────────────────
				if (resource === 'channel') {
					if (operation === 'getAll') {
						responseData = await apiRequest(this, 'GET', '/channels');
					} else if (operation === 'get') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await apiRequest(this, 'GET', `/channels/${channelId}`);
					} else if (operation === 'setupUrl') {
						const channelType = this.getNodeParameter('channelType', i) as string;
						const redirectUri = this.getNodeParameter('redirectUri', i) as string;
						responseData = await apiRequest(this, 'POST', '/channels/setup-url', {
							channel_type: channelType,
							redirect_uri: redirectUri,
						});
					} else if (operation === 'exchangeCode') {
					const code = this.getNodeParameter('code', i) as string;
					const extra = this.getNodeParameter('additionalFields', i) as IDataObject;
					const body: IDataObject = { code };
					if (extra.webhook_url) body.webhook_url = extra.webhook_url;
					if (extra.webhook_secret) body.webhook_secret = extra.webhook_secret;
					responseData = await apiRequest(this, 'POST', '/channels/exchange-code', body);
					} else if (operation === 'update') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						const fields = this.getNodeParameter('updateFields', i) as IDataObject;
						responseData = await apiRequest(this, 'PATCH', `/channels/${channelId}`, fields);
					} else if (operation === 'delete') {
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await apiRequest(this, 'DELETE', `/channels/${channelId}`);
					} else {
						throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
					}

				// ── MESSAGE ──────────────────────────────────────────────────
				} else if (resource === 'message') {
					const channelId = this.getNodeParameter('channelId', i) as string;
					const recipient = this.getNodeParameter('recipient', i) as string;

					if (operation === 'send') {
						const text = this.getNodeParameter('text', i) as string;
						responseData = await apiRequest(this, 'POST', '/messages/send', {
							channel_id: channelId,
							recipient,
							text,
						});
					} else if (operation === 'sendTemplate') {
						const templateName = this.getNodeParameter('templateName', i) as string;
						const language = this.getNodeParameter('language', i) as string;
					const variablesRaw = this.getNodeParameter('variables', i) as string;
					const body: IDataObject = {
						channel_id: channelId,
						recipient,
						template_name: templateName,
						language,
					};
					if (variablesRaw && variablesRaw.trim() !== '') {
						try {
							body.variables = typeof variablesRaw === 'string'
								? JSON.parse(variablesRaw)
								: variablesRaw;
						} catch {
							throw new NodeOperationError(
								this.getNode(),
								'Variables must be a valid JSON object',
								{ itemIndex: i },
							);
						}
						}
						responseData = await apiRequest(this, 'POST', '/messages/send-template', body);
					} else {
						throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
					}

				// ── TEMPLATE ──────────────────────────────────────────────────
				} else if (resource === 'template') {
					const channelId = this.getNodeParameter('channelId', i) as string;

					if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};
						if (filters.status) qs.status = filters.status;
						if (filters.sync) qs.sync = 'true';
						responseData = await apiRequest(
							this,
							'GET',
							`/channels/${channelId}/templates`,
							undefined,
							qs,
						);
					} else if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						responseData = await apiRequest(
							this,
							'GET',
							`/channels/${channelId}/templates/${templateId}`,
						);
					} else if (operation === 'create') {
						const templateName = this.getNodeParameter('templateName', i) as string;
						const language = this.getNodeParameter('language', i) as string;
						const category = this.getNodeParameter('category', i) as string;
						const componentsRaw = this.getNodeParameter('components', i) as string;
						let components: unknown;
						try {
							components = typeof componentsRaw === 'string'
								? JSON.parse(componentsRaw)
								: componentsRaw;
						} catch {
							throw new NodeOperationError(
								this.getNode(),
								'Components must be a valid JSON array',
								{ itemIndex: i },
							);
						}
						responseData = await apiRequest(
							this,
							'POST',
							`/channels/${channelId}/templates`,
							{ name: templateName, language, category, components },
						);
					} else if (operation === 'update') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						const componentsRaw = this.getNodeParameter('components', i) as string;
						let components: unknown;
						try {
							components = typeof componentsRaw === 'string'
								? JSON.parse(componentsRaw)
								: componentsRaw;
						} catch {
							throw new NodeOperationError(
								this.getNode(),
								'Components must be a valid JSON array',
								{ itemIndex: i },
							);
						}
						responseData = await apiRequest(
							this,
							'PUT',
							`/channels/${channelId}/templates/${templateId}`,
							{ components },
						);
					} else if (operation === 'delete') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						const allLanguages = this.getNodeParameter('allLanguages', i) as boolean;
						const qs: IDataObject = {};
						if (allLanguages) qs.all_languages = 'true';
						responseData = await apiRequest(
							this,
							'DELETE',
							`/channels/${channelId}/templates/${templateId}`,
							undefined,
							qs,
						);
					} else {
						throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
					}

				// ── REDIRECT URI ──────────────────────────────────────────────────
				} else if (resource === 'redirect') {
					if (operation === 'getAll') {
						responseData = await apiRequest(this, 'GET', '/redirects');
					} else if (operation === 'add') {
						const uriPattern = this.getNodeParameter('uriPattern', i) as string;
						responseData = await apiRequest(this, 'POST', '/redirects', {
							uri_pattern: uriPattern,
						});
					} else if (operation === 'delete') {
						const redirectId = this.getNodeParameter('redirectId', i) as string;
						responseData = await apiRequest(this, 'DELETE', `/redirects/${redirectId}`);
					} else {
						throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
				}

				// Normalize response into n8n items
				const items = Array.isArray(responseData) ? responseData : [responseData];
				returnData.push(
					...items.map((item) => ({
						json: item ?? {},
						pairedItem: { item: i },
					})),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
