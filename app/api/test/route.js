import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
    try {
        console.log("Test API called");
        
        // Check environment variables
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({
                success: false,
                message: "OpenRouter API key is missing",
            });
        }

        // Test OpenRouter API
        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, just testing!" }],
            model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
            max_tokens: 50,
        });

        return NextResponse.json({
            success: true,
            message: "OpenRouter API is working",
            response: completion.choices[0].message.content
        });

    } catch (error) {
        console.error("Test API error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
}