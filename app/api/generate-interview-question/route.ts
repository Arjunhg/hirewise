import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";


var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_URL_PUBLIC_KEY || "",
    privateKey : process.env.IMAGEKIT_URL_PRIVATE_KEY || "",
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(request: NextRequest){



    const formData = await request.formData();
    const file = formData.get('file');

    if(!file || typeof file !== 'object'){
        return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `upload-${Date.now()}.pdf`,
            useUniqueFileName: true
        })

        // call n8n webhook
        const result = await axios.post('https://codersnake.app.n8n.cloud/webhook/generate-interview-question', {
            resumeUrl: uploadResponse.url
        })
        // console.log("n8n result: ",result.data): message.content.interviewQuestions[] -> Now that we have result from n8n, save it in convex by creating new table
        // return NextResponse.json({url: uploadResponse.url}, {status: 200});
        
        return NextResponse.json({
            interviewQuestions: result.data?.message?.content?.interview_questions || [],
            resumeUrl: uploadResponse?.url
        }, { status: 200 })
    } catch (error) {
        console.log("Upload failed:", error);
        return new Response(JSON.stringify({ error: 'Failed to upload PDF' }), { status: 500 });
    }
}