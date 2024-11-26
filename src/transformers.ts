import { pipeline, PipelineType, Text2TextGenerationPipeline } from '@xenova/transformers';

export class SuggestionPipeline {
    static task: PipelineType = 'text2text-generation';
    static model = 'Xenova/LaMini-Flan-T5-783M';
    static instance: Text2TextGenerationPipeline | null = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model) as Text2TextGenerationPipeline;
        }

        return this.instance;
    }
}

// export const suggestionPipeline = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
// export const suggestionPipeline = () => new SuggestionPipeline(); 
