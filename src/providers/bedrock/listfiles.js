import { GatewayError } from '../../errors/GatewayError';
export const BedrockListFilesResponseTransform = () => {
    throw new GatewayError(`listFiles is not supported by Bedrock`);
};
