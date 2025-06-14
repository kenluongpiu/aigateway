import { SAMBANOVA } from '../../globals';
export const SambaNovaChatCompleteStreamChunkTransform = (responseChunk) => {
    let chunk = responseChunk.trim();
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return `data: ${chunk}\n\n`;
    }
    const parsedChunk = JSON.parse(chunk);
    if (parsedChunk.usage) {
        return `data: ${JSON.stringify({
            id: parsedChunk.id,
            object: parsedChunk.object,
            created: parsedChunk.created,
            model: parsedChunk.model,
            provider: SAMBANOVA,
            choices: [
                {
                    index: 0,
                    delta: {},
                    logprobs: null,
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: parsedChunk.usage.prompt_tokens || 0,
                completion_tokens: parsedChunk.usage.completion_tokens || 0,
                total_tokens: parsedChunk.usage.total_tokens || 0,
            },
        })}\n\n`;
    }
    return `data: ${JSON.stringify({
        id: parsedChunk.id,
        object: parsedChunk.object,
        created: parsedChunk.created,
        model: parsedChunk.model,
        provider: SAMBANOVA,
        choices: [
            {
                index: parsedChunk.choices[0].index || 0,
                delta: {
                    role: 'assistant',
                    content: parsedChunk.choices[0].delta.content,
                },
                logprobs: parsedChunk.choices[0].logprobs,
                finish_reason: parsedChunk.choices[0].finish_reason || null,
            },
        ],
    })}\n\n`;
};
