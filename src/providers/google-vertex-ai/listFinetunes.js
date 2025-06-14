import { GOOGLE_VERTEX_AI } from '../../globals';
import { GoogleToOpenAIFinetune } from './utils';
export const GoogleFinetuneListResponseTransform = (input, status) => {
    if (status !== 200) {
        return { ...input, provider: GOOGLE_VERTEX_AI };
    }
    const records = input.tuningJobs ??
        [];
    const objects = records.map(GoogleToOpenAIFinetune);
    return {
        data: objects,
        object: 'list',
        first_id: objects.at(0)?.id,
        last_id: objects.at(-1)?.id,
        has_more: !!input
            ?.nextPageToken,
    };
};
