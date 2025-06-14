const cacheExpiry = 15 * 60; // 15 minutes
export async function getAccessTokenFromEntraId(tenantId, clientId, clientSecret, scope = 'https://openai.azure.com/.default', check, options, env) {
    const result = {
        token: '',
        error: null,
    };
    const cacheKey = `azure-plugin-entra-token-${check}-${tenantId}-${clientId}-${clientSecret}`;
    const cachedToken = await options?.getFromCacheByKey?.(env, cacheKey);
    if (cachedToken) {
        return { token: cachedToken, error: null };
    }
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
            result.error = errorMessage;
            return result;
        }
        const data = await response.json();
        result.token = data.access_token;
        await options?.putInCacheWithValue?.(env, cacheKey, result.token, cacheExpiry);
    }
    catch (error) {
        result.error = error.message;
    }
    return result;
}
export async function getAzureManagedIdentityToken(resource, check, clientId, options, env) {
    const result = {
        token: '',
        error: null,
    };
    const cacheKey = `azure-plugin-managed-identity-token-${check}-${resource}-${clientId}`;
    const cachedToken = await options?.getFromCacheByKey?.(env, cacheKey);
    if (cachedToken) {
        return { token: cachedToken, error: null };
    }
    try {
        const response = await fetch(`http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=${encodeURIComponent(resource)}${clientId ? `&client_id=${encodeURIComponent(clientId)}` : ''}`, {
            method: 'GET',
            headers: {
                Metadata: 'true',
            },
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            result.error = errorMessage;
            return result;
        }
        const data = await response.json();
        result.token = data.access_token;
        await options?.putInCacheWithValue?.(env, cacheKey, result.token, cacheExpiry);
        return result;
    }
    catch (error) {
        result.error = error.message;
    }
    return result;
}
export const getAccessToken = async (credentials, check, options, env) => {
    if (credentials.apiKey) {
        return { token: credentials.apiKey, error: null };
    }
    const scope = 'https://cognitiveservices.azure.com/.default';
    const { clientId, clientSecret, tenantId, azureAuthMode } = credentials ?? {};
    let tokenResult = {
        token: '',
        error: null,
    };
    // client id is only set for managed identity
    if (azureAuthMode === 'managed') {
        tokenResult = await getAzureManagedIdentityToken(credentials?.resourceName ?? '', check, clientId, options, env);
    }
    if (azureAuthMode === 'entra') {
        tokenResult = await getAccessTokenFromEntraId(tenantId ?? '', clientId ?? '', clientSecret ?? '', scope, check, options, env);
    }
    return tokenResult;
};
