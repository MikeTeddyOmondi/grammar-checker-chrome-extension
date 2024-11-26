import { pipeline } from '@xenova/transformers';

export const suggestionPipeline = await pipeline('text2text-generation', 'Xenova/transformers');
