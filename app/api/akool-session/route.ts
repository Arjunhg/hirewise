import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const { avatar_id, voice_id } = await request.json();

    const result = await axios.post('https://openapi.akool.com/api/open/v4/liveAvatar/session/create', 
        {
            avatar_id: avatar_id,
            // knowledge_id: kb_id,
            voice_id: voice_id
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.AKOOL_API_TOKEN}`
            }
        }
    )

    return NextResponse.json(result.data);
}