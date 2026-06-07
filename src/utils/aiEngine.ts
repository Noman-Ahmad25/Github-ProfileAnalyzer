import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI( {apiKey: process.env.GEMINI_API_KEY} )

export const generateAIProfileAnalysis = async (
    username: string,
    bio: string | null,
    reposCount: number,
    followers: number,
    stars: number,
    languagesMap: Record<string, number> | null
) => {
    try {
        const languagesList = languagesMap ? Object.keys(languagesMap).join(', ') : 'None';

        const prompt = `
            You are an expert technical interviewer and senior engineering executive. 
            Analyze the following public GitHub developer metrics for the user "${username}":
            - Bio: "${bio || 'No bio provided'}"
            - Total Public Repositories: ${reposCount}
            - Total Community Stars: ${stars}
            - Total Followers: ${followers}
            - Programming Languages Used: [${languagesList}]

            Based on this data, perform a professional audit. 
            Provide your response strictly in the following JSON schema format:
            {
                "primaryRole": "Short professional title (e.g. Cloud-Native Backend Specialist, Frontend UI Architect)",
                "codingHabit": "A short summary of behavior (e.g. Prolific Experimenter, Clean Documenter, Utility Scripter)",
                "ecosystemDiversity": A number between 0 and 100 indicating language breadth,
                "insights": ["Bullet point 1 detailing their technical strengths", "Bullet point 2 offering highly actionable resume/career feedback"]
            }  
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',

                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        primaryRole: {type: Type.STRING },
                        codingHabit: {type: Type.STRING },
                        ecosystemDiversity: { type: Type.INTEGER },
                        insights: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["primaryRole", "codingHabit", "ecosystemDiversity", "insights"]
                }
            }
        });
        if(!response.text) throw new Error("Empty response from Gemini engine.");
        return JSON.parse(response.text)
    }
    catch (error: any){
        console.error(`[AI Engine Failure]: ${error.message}`);

        return {
            primaryRole: "Software Developer",
            codingHabit: "General Builder",
            ecosystemDiversity: 50,
            insights: ["Standard profile sync completed successfully without active AI metrics."]
        }
    }
}