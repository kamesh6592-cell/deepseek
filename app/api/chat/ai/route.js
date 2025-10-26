export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req){
    try {
        const {userId} = getAuth(req)

        // Extract chatId and prompt from the request body
        const { chatId, prompt, deepThink, search } = await req.json();

        if(!userId){
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
              });
        }

        // Initialize OpenAI client with OpenRouter API key and base URL
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({
                success: false,
                message: "OpenRouter API key is not configured",
            });
        }

        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://deepseek-07.vercel.app",
                "X-Title": "Nexachat AI Chat"
            }
        });

        // Find the chat document in the database based on userId and chatId
        await connectDB()
        const data = await Chat.findOne({userId, _id: chatId})

        if (!data) {
            return NextResponse.json({
                success: false,
                message: "Chat not found",
            });
        }

        // Create a user message object
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now()
        };

        data.messages.push(userPrompt);

        // Modify prompt based on active features
        let enhancedPrompt = prompt;
        if (deepThink) {
            enhancedPrompt = `Think deeply and analyze this step by step: ${prompt}`;
        }
        if (search) {
            enhancedPrompt = `Please search for and provide comprehensive information about: ${prompt}`;
        }

        // Call the OpenRouter API to get a chat completion with DeepSeek model
        // Include conversation history for better context
        const conversationMessages = data.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const completion = await openai.chat.completions.create({
            messages: conversationMessages,
            model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
            temperature: 0.7,
            max_tokens: 2000,
        });

        const message = completion.choices[0].message;
        message.timestamp = Date.now()
        data.messages.push(message);
        
        // Update chat name based on first user message if it's still "New Chat"
        if (data.name === "New Chat" && data.messages.length >= 2) {
            const firstUserMessage = data.messages.find(msg => msg.role === "user");
            if (firstUserMessage) {
                data.name = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
            }
        }
        
        await data.save();

        return NextResponse.json({success: true, data: message, chatName: data.name})
    } catch (error) {
        console.error("Error in AI API route:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}