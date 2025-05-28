import { GenerateContentParameters, Type } from '@google/genai';
import { constants } from './constants';

export const questionContentSuggestion = {
  prompt_prefix: `
You will be provided with a coding problem description similar to one found on StackOverflow. Analyze the given problem and recommend specific information, descriptions, or details that the author should include to make the problem clearer and easier for the community to understand and provide effective solutions.

Your recommendations should focus on areas such as clarifying the problem statement, providing relevant code snippets, specifying error messages, detailing expected versus actual behavior, including environment or setup details, and any other pertinent context that would help others assist.

# Steps

1. Read the provided coding problem carefully.
2. Identify ambiguities, missing context, or vague descriptions.
3. Highlight key information that is currently absent but necessary for understanding and solving the problem.
4. Suggest concrete details or improvements the author can add to their question.

# Output Format

Provide a clear, bulleted list of recommended information or details to include. Each bullet should specifically describe what the author should add or clarify to improve the question's comprehensibility and answerability.

Limit to 6 bullet points.

# Examples

Input: "I'm getting an error in my JavaScript code when trying to update the DOM. How can I fix it?"

Output:
- Include the exact error message received.
- Provide the snippet of JavaScript code where the DOM update takes place.
- Describe what you expect the code to do and what actually happens.
- Specify the browser and environment in which the error occurs.

# Notes

1. Focus on actionable recommendations that directly improve the quality and clarity of the coding question, enabling community members to provide precise solutions.
2. The input will be provided in the Vietnamese language, and the output is expected to be in Vietnamese.
`,
  params: {
    model: constants.gemini.model,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          output: {
            type: Type.STRING,
          },
        },
      },
    },
  },
};
