import { LEMONFOX_AI } from '../../globals';
export const LemonfoxAIChatCompleteStreamChunkTransform = (responseChunk) => {
    let chunk = responseChunk.trim();
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return `data: ${chunk}\n\n`;
    }
    const parsedChunk = JSON.parse(chunk);
    return (`data: ${JSON.stringify({
        id: parsedChunk.id,
        object: parsedChunk.object,
        created: parsedChunk.created,
        model: parsedChunk.model,
        provider: LEMONFOX_AI,
        choices: [
            {
                index: parsedChunk.choices[0].index,
                delta: parsedChunk.choices[0].delta,
                finish_reason: parsedChunk.choices[0].finish_reason,
            },
        ],
    })}` + '\n\n');
};
