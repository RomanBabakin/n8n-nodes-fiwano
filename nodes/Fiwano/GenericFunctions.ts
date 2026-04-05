import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://fiwano.com/api/v1';

/**
 * Make an authenticated request to the Fiwano API.
 *
 * Called as `fiwanoApiRequest.call(this, ...)` from within an IExecuteFunctions context.
 */
export async function fiwanoApiRequest(
	this: IExecuteFunctions,
	method: string,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
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
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'fiwanoApi',
			options,
		) as IDataObject;
	} catch (error) {
		const err = error as Error;
		throw new NodeApiError(this.getNode(), { message: err.message || 'API request failed' });
	}
}
