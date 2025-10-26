import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
    try {
        console.log("Test API called");
        
        // Check environment variables
        const apiKey = process.env.OPENROUTER_API_KEY;
        console.log("API Key exists:", !!apiKey);
        console.log("API Key starts with:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
        
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                message: "OpenRouter API key is missing",
            });
        }

        // Test with a direct fetch first to see the exact error
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://deepseek-07.vercel.app',
                'X-Title': 'DeepSeek AI Chat'
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
                messages: [{ role: "user", content: "Hello, just testing!" }],
                max_tokens: 50
            })
        });

        const responseText = await response.text();
        console.log("Raw response:", responseText);
        console.log("Response status:", response.status);

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                status: response.status,
                error: responseText
            });
        }

        const result = JSON.parse(responseText);
        return NextResponse.json({
            success: true,
            message: "OpenRouter API is working",
            response: result.choices[0].message.content
        });

    } catch (error) {
        console.error("Test API error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}