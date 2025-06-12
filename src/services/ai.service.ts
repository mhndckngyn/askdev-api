import { constants } from '@/config/constants';
import {
  answerToxicityGrading,
  commentToxicityGrading,
  questionContentSuggestion,
  tagDescriptionGeneration,
} from '@/config/gemini';
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
  getAnswerToxicityGrading: async (questionTitle: string, answer: string) => {
    const problem = `
Dưới đây là dữ liệu cần xử lý:
Tiêu đề câu hỏi: ${questionTitle}
Bình luận: ${answer}
`;
    try {
      const response = await ai.models.generateContent({
        ...answerToxicityGrading.params,
        contents: answerToxicityGrading.prompt_prefix + problem,
      });

      const parsed = JSON.parse(response.text!);
      return {
        toxicity_score: parsed.toxicity_score,
        justification: parsed.justification,
      };
    } catch (err) {
      throw new ApiError(500, 'answer.grade-toxicity-failed');
    }
  },
  getCommentToxicityGrading: async (answer: string, comment: string) => {
    const problem = `
Dưới đây là dữ liệu cần xử lý:
Bình luận gốc: ${answer}
Phản hồi: ${comment}
`;
    try {
      const response = await ai.models.generateContent({
        ...commentToxicityGrading.params,
        contents: commentToxicityGrading.prompt_prefix + problem,
      });

      const parsed = JSON.parse(response.text!);
      return {
        toxicity_score: parsed.toxicity_score,
        justification: parsed.justification,
      };
    } catch (err) {
      throw new ApiError(500, 'comment.grade-toxicity-failed');
    }
  },

  generateTagDescription: async (tagName: string) => {
    const problem = '\nĐây là thẻ chủ đề cần tạo mô tả: ' + tagName;

    try {
      const response = await ai.models.generateContent({
        ...tagDescriptionGeneration.params,
        contents: tagDescriptionGeneration.prompt_prefix + problem
      });

      const parsed = JSON.parse(response.text!);
      return {
        descriptionVi: parsed.descriptionVi,
        descriptionEn: parsed.descriptionEn
      }
    } catch (err) {
      throw new ApiError(500, 'tag.generate-description-failed');
    }
  },
};

export default AIService;
