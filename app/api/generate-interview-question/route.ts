import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_URL_PUBLIC_KEY || "",
    privateKey : process.env.IMAGEKIT_URL_PRIVATE_KEY || "",
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT || ""
});

export async function POST(request: NextRequest){

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobTitle = formData.get('jobTitle');
    const jobDescription = formData.get('jobDescription');
    

    try {

        if(file){
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const { userId } = getAuth(request);
            if(!userId){
                return NextResponse.json({error: 'Unauthorized'}, {status: 401});
            }
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: `upload-${Date.now()}.pdf`,
                useUniqueFileName: true
            })

            // call n8n webhook
            const result = await axios.post(process.env.N8N_URL_ENDPOINT || '', {
                resumeUrl: uploadResponse.url
            })

            return NextResponse.json({
                interviewQuestions: result.data?.message?.content?.interview_questions || [],
                resumeUrl: uploadResponse?.url
            }, { status: 200 })

        } else {
            const result = await axios.post(process.env.N8N_URL_ENDPOINT || '', {
                resumeUrl: null,
                jobTitle: jobTitle,
                jobDescription: jobDescription
            })
            // console.log("n8n result: ",result.data?.message?.content?.questions || []);
            // console.log("n8n result :" , result.data);

            return NextResponse.json({
                interviewQuestions: result.data?.message?.content?.questions || [],
                resumeUrl: null
            }, { status: 200 })
        }

        
    } catch (error) {
        console.log("Upload failed:", error);
        return new Response(JSON.stringify({ error: 'Failed to upload PDF' }), { status: 500 });
    }
}