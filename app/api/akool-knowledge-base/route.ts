import { KnowledgeBaseItem } from "@/types/Types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {

    const { questions } = await request.json();

    // const result = await axios.get('https://openapi.akool.com/api/open/v4/knowledge/list', {
    //     headers: {
    //         Authorization: `Bearer ${process.env.AKOOL_API_TOKEN}`
    //     }
    // });

    // // console.log("Full result.data.data:", result.data.data);
    // console.log("Looking for:", 'Interview Agent Prod');
    // console.log("Available names:", result.data.data.map((item: KnowledgeBaseItem) => item.name));

    // console.log("Interview data is: ", questions)

    // const ifExist = result.data.data.find((item: KnowledgeBaseItem) => item.name.trim() === 'Interview Agent Prod')

    // console.log(ifExist);

    // if(!ifExist){
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

        // console.log("Knowledge Base Item Created: ", response.data);
        return NextResponse.json(response.data);
    }

    // return NextResponse.json(result.data);
// }