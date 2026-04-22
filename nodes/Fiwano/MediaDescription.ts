import { INodeProperties } from 'n8n-workflow';

export const mediaOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['media'] } },
	options: [
		{
			name: 'Download',
			value: 'download',
			action: 'Download a received media file',
			description: 'Download a media file received via webhook. Files expire after 60 minutes.',
		},
	],
	default: 'download',
};

export const mediaFields: INodeProperties[] = [
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. {{ $json.data.media.media_id }}',
		description: 'The media_id from an incoming webhook payload (data.media.media_id). Files expire after 60 minutes.',
		displayOptions: {
			show: { resource: ['media'], operation: ['download'] },
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property to write the downloaded file into',
		displayOptions: {
			show: { resource: ['media'], operation: ['download'] },
		},
	},
];
