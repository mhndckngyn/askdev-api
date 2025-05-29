import { Type } from '@google/genai';
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

export const answerToxicityGrading = {
  prompt_prefix: `
Đánh giá mức độ độc hại của một bình luận liên quan đến một câu hỏi/vấn đề/bài viết liên quan đến lập trình, dựa trên nội dung của bình luận và tiêu đề của bài viết. Chấm điểm mức độ độc hại trên thang điểm từ 1 đến 10, trong đó:

  1-2: Bình luận lịch sự, tôn trọng và mang tính xây dựng, không có ngôn từ tiêu cực.
  3-4: Có chút phê bình nhưng mang tính xây dựng; có thể có sự thất vọng nhẹ nhưng không có ngôn ngữ xúc phạm.
  5-6: Thể hiện sự khó chịu rõ rệt hoặc thiếu kiên nhẫn, có thể có lời nhận xét tiêu cực nhẹ, nhưng không có ngôn từ lạm dụng.
  7-8: Bình luận mang tính gây hấn, có chứa xúc phạm, mỉa mai hoặc giọng điệu bác bỏ, có thể gây tổn thương hoặc xúc phạm người khác.
  9-10: Cực kỳ độc hại, có lời lẽ xúc phạm rõ ràng, ngôn từ thù ghét, đe dọa hoặc quấy rối.

Trước khi đưa ra điểm số, hãy phân tích cẩn thận ngôn ngữ, giọng điệu, mục đích và mức độ liên quan của bình luận đối với tiêu đề bài viết.
Định dạng đầu ra

Cung cấp một đối tượng JSON với cấu trúc sau:

{
  "toxicity_score": [số nguyên từ 1 đến 10],
  "justification": "Giải thích ngắn gọn lý do tại sao điểm số này được đưa ra dựa trên nội dung bình luận và tiêu đề bài viết."
}

Ví dụ

Tiêu đề bài viết: "Làm sao để sửa lỗi NullPointerException trong Java?"
Bình luận: "Nếu bạn học Java đàng hoàng thì đã không mắc những lỗi cơ bản như vậy."

Đầu ra mẫu:

{
  "toxicity_score": 7,
  "justification": "Bình luận mang giọng điệu trịch thượng và ám chỉ sự kém cỏi, điều này gây cảm giác công kích và coi thường."
}

Ghi chú:
Phần giải thích lý do (justification) được viết bằng tiếng Việt.
`,
  params: {
    model: constants.gemini.model,
    config: {
      responseMimeType: 'application/json',
    },
  },
};

export const commentToxicityGrading = {
  prompt_prefix: `
Đánh giá mức độ độc hại của một bình luận đối với một câu trả lời, dựa trên nội dung bình luận và câu trả lời gốc. Chấm điểm mức độ độc hại trên thang điểm từ 1 đến 10, trong đó:

    1-2: Phản hồi lịch sự, tôn trọng và mang tính xây dựng, không có ngôn từ tiêu cực.
    3-4: Có chút phê bình hoặc phản bác nhẹ nhưng vẫn mang tính xây dựng; có thể có sự thất vọng nhẹ nhưng không dùng ngôn từ xúc phạm.
    5-6: Thể hiện sự khó chịu rõ rệt hoặc thiếu kiên nhẫn, có thể có lời nhận xét tiêu cực nhẹ hoặc châm biếm, nhưng không có lời lẽ lạm dụng.
    7-8: Phản hồi mang tính gây hấn, có chứa xúc phạm, mỉa mai hoặc giọng điệu bác bỏ, có thể gây tổn thương hoặc xúc phạm người khác.
    9-10: Phản hồi cực kỳ độc hại, có lời lẽ xúc phạm rõ ràng, ngôn từ thù ghét, đe dọa hoặc quấy rối.

Trước khi đưa ra điểm số, hãy phân tích cẩn thận ngôn ngữ, giọng điệu, mục đích và mức độ phù hợp của bình luận với câu trả lời gốc.
Định dạng đầu ra

Cung cấp một đối tượng JSON với cấu trúc sau:

{
  "toxicity_score": [số nguyên từ 1 đến 10],
  "justification": "Giải thích ngắn gọn lý do tại sao điểm số này được đưa ra dựa trên nội dung phản hồi và bình luận gốc."
}

Ví dụ

Câu trả lời gốc: "Tôi nghĩ bạn nên thử dùng JSON.stringify trước khi gửi dữ liệu."
Bình luận: "Bạn sai rồi, đừng phát biểu lung tung nếu không biết chắc."

Đầu ra mẫu:

{
  "toxicity_score": 7,
  "justification": "Bình luận mang tính bác bỏ thô lỗ, kèm theo mệnh lệnh và đả kích cá nhân."
}

Ghi chú:
Phần giải thích lý do (justification) được viết bằng tiếng Việt.
`,
  params: {
    model: constants.gemini.model,
    config: {
      responseMimeType: 'application/json',
    },
  },
};
