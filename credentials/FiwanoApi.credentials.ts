import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FiwanoApi implements ICredentialType {
	name = 'fiwanoApi';
	displayName = 'Fiwano API';
	documentationUrl = 'https://fiwano.com/documentation';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'mip_live_...',
			hint: 'Your Fiwano API key starting with mip_live_',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://fiwano.com',
			url: '/api/v1/channels',
			method: 'GET',
		},
	};
}
