export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";


// Initialize OpenAI client with OpenRouter API key and base URL
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
});

export async function POST(req){
    try {
        const {userId} = getAuth(req)

        // Extract chatId and prompt from the request body
        const { chatId, prompt } = await req.json();

        if(!userId){
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
              });
        }

        // Find the chat document in the database based on userId and chatId
        await connectDB()
        const data = await Chat.findOne({userId, _id: chatId})

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

        const completion = await openai.chat.completions.create({
            messages: conversationMessages,
            model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
            temperature: 0.7,
            max_tokens: 2000,
        });

        const message = completion.choices[0].message;
        message.timestamp = Date.now()
        data.messages.push(message);
        data.save();

        return NextResponse.json({success: true, data: message})
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}