import { constants } from '@/config/constants';
import { questionContentSuggestion } from '@/config/gemini';
import { ApiError } from '@/utils/ApiError';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: constants.gemini.key });

const AIService = {
  getContentSuggestion: async (questionTitle: string) => {
    const problem = `The title of the problem/question is: ${questionTitle}`;

    try {
      const response = await ai.models.generateContent({
        ...questionContentSuggestion.params,
        contents: questionContentSuggestion.prompt_prefix + problem,
      });

      const parsed = JSON.parse(response.text!);
      return parsed.output;
    } catch (err) {
      throw new ApiError(500, 'question.generate-suggestion-failed');
    }
  },
};

export default AIService;
