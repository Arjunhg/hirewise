import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// Don't require anymore as we are generating prompt by ourself. 
export async function POST(request: NextRequest) {

        const { questions } = await request.json();

        const response = await axios.post('https://openapi.akool.com/api/open/v4/knowledge/create', 
            {
                name: 'Interview Agent' + Date.now(),
                prologue: 'Tell me about yourself',
                prompt: `You are a friendly job interviewer. Ask the user one interview question at a time. Wait for their spoken response before asking the next question. Start with: "Tell mw about youself". Then ask following question one by one. Speak in professional and encouraging tone

                questions: ${JSON.stringify(questions)}

                `,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AKOOL_API_TOKEN}`
                }
            }
        );

        return NextResponse.json(response.data);
    }
