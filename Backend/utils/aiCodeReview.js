import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const aiCodeReview = async (code) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review the following code and provide a detailed analysis of the code. ${code}`,
  });

  console.log(response.text);
  return response.text;
};

export default aiCodeReview;
