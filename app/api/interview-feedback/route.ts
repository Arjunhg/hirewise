import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        const { messages } = await request.json();

        // Convert messages array to JSON string to match what n8n expects
        const result = await axios.post('https://codersnake.app.n8n.cloud/webhook/38a13183-51d2-44c0-9e3b-9aad76569cb2', {
            message: messages  // Note: "message" not "messages", and stringified
        })

        
        // Return the complete feedback object
        const feedback = result.data?.message?.content;

        return NextResponse.json(feedback);
    } catch (error) {
        console.error("Error in feedback API:", error);
        return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
    }
}