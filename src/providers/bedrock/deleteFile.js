import { GatewayError } from '../../errors/GatewayError';
export const BedrockDeleteFileResponseTransform = () => {
    throw new GatewayError(`deleteFile is not supported by Bedrock`);
};
