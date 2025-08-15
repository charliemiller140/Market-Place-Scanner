import { AnalysisResult } from '../types';

// In a real app, this would be an environment variable.
const API_URL = process.env.API_URL || 'YOUR_API_GATEWAY_URL_HERE'; 

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); // Just the data part
        reader.onerror = reject;
    });
};

const getFallbackMockReport = (): Promise<AnalysisResult> => {
    console.warn("API Gateway URL is not configured. Falling back to mock data.");
    const MOCK_REPORT: AnalysisResult = {
      overallScore: 78,
      summary: "This is a basic analysis. It checks for common issues like resolution and aspect ratio. Upgrade to Pro to get a full AI-powered report with feedback on lighting, composition, and more!",
      report: [
        { criteria: "Resolution Check", score: 8, explanation: "Image dimensions are suitable for most marketplaces." },
        { criteria: "Aspect Ratio", score: 9, explanation: "Standard aspect ratio detected." },
        { criteria: "File Format", score: 10, explanation: "Image is in a web-friendly format (e.g., JPEG/PNG)." },
        { criteria: "Lighting", score: 0, explanation: "Upgrade to Pro for AI-powered lighting analysis." },
        { criteria: "Composition", score: 0, explanation: "Upgrade to Pro for AI-powered composition analysis." },
      ],
      isMock: true,
    };
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_REPORT), 500));
};

export const generateMockReport = async (file: File): Promise<AnalysisResult> => {
    if (API_URL === 'YOUR_API_GATEWAY_URL_HERE') {
        return getFallbackMockReport();
    }

    try {
        const base64Image = await fileToBase64(file);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const result: AnalysisResult = await response.json();
        // The backend should set isMock, but we ensure it's set here for consistency.
        return { ...result, isMock: true };

    } catch (error) {
        console.error('Basic analysis API call failed:', error);
        throw new Error('Failed to get basic analysis. Please check your connection and try again.');
    }
};
