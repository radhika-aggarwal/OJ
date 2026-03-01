import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const aiCodeReview = async (code) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a senior software engineer and coding interviewer.

Analyze the following code submission.

Your response MUST follow this structure:

1. Summary:
- Briefly explain what the code is doing.

2. Time Complexity:
- State the time complexity clearly (e.g., O(n), O(n log n))
- Explain WHY step-by-step.

3. Space Complexity:
- State the space complexity clearly
- Explain WHY.

4. Issues / Improvements:
- Point out inefficiencies, edge cases, or bad practices.

5. Optimized Approach:
- Suggest a better approach if possible.
- Explain how it improves time/space complexity.

6. Optimized Code:
- Provide improved code if a better solution exists.

7. Edge Cases:
- Mention important edge cases the code should handle.

Keep explanation clear, structured, and beginner-friendly.

Code: ${code}`,
  });

  return response.text;
};

export default aiCodeReview;
