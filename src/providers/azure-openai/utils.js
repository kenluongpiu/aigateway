import { AZURE_OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from '../openai/utils';
export async function getAccessTokenFromEntraId(tenantId, clientId, clientSecret, scope = 'https://cognitiveservices.azure.com/.default') {
    try {
        const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope,
            grant_type: 'client_credentials',
        });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            console.log({ message: `Error from Entra ${errorMessage}` });
            return undefined;
        }
        const data = await response.json();
        return data.access_token;
    }
    catch (error) {
        console.log(error);
    }
}
export async function getAzureManagedIdentityToken(resource, clientId) {
    try {
        const response = await fetch(`http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=${encodeURIComponent(resource)}${clientId ? `&client_id=${encodeURIComponent(clientId)}` : ''}`, {
            method: 'GET',
            headers: {
                Metadata: 'true',
            },
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            console.log({ message: `Error from Managed ${errorMessage}` });
            return undefined;
        }
        const data = await response.json();
        return data.access_token;
    }
    catch (error) {
        console.log({ error });
    }
}
export const AzureOpenAIFinetuneResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, AZURE_OPEN_AI);
    }
    const _response = { ...response };
    if (['created', 'pending'].includes(_response.status)) {
        _response.status = 'queued';
    }
    return _response;
};
