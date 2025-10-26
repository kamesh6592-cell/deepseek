export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req){
    try {
        console.log("AI API Route called");
        const {userId} = getAuth(req)
        console.log("User ID:", userId);

        // Extract chatId and prompt from the request body
        const { chatId, prompt } = await req.json();
        console.log("Chat ID:", chatId, "Prompt:", prompt);

        if(!userId){
            console.log("User not authenticated");
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
              });
        }

        // Initialize OpenAI client with OpenRouter API key and base URL
        if (!process.env.OPENROUTER_API_KEY) {
            console.log("OpenRouter API key missing");
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
                "X-Title": "DeepSeek AI Chat"
            }
        });

        // Find the chat document in the database based on userId and chatId
        console.log("Connecting to database...");
        await connectDB()
        console.log("Database connected, finding chat...");
        const data = await Chat.findOne({userId, _id: chatId})
        console.log("Chat found:", data ? "Yes" : "No");

        if (!data) {
            console.log("Chat not found");
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

        // Call the OpenRouter API to get a chat completion with DeepSeek model
        // Include conversation history for better context
        const conversationMessages = data.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        console.log("Calling OpenRouter API...");
        const completion = await openai.chat.completions.create({
            messages: conversationMessages,
            model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
            temperature: 0.7,
            max_tokens: 2000,
        });

        console.log("OpenRouter API response received");
        const message = completion.choices[0].message;
        message.timestamp = Date.now()
        data.messages.push(message);
        await data.save();
        console.log("Chat saved to database");

        return NextResponse.json({success: true, data: message})
    } catch (error) {
        console.error("Error in AI API route:", error);
        return NextResponse.json({ success: false, error: error.message });
    }
}