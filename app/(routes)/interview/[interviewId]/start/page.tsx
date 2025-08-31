'use client'
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { InterviewData, MessageType } from '@/types/Types';
import axios from 'axios';
import { GenericAgoraSDK } from 'akool-streaming-avatar-sdk';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneCall, PhoneOff, User } from 'lucide-react';

const CONTAINER_ID = 'video-container';
const AVATAR_ID = 'dvp_Alinna_realisticbg_20241224';
const VOICE_ID = '6889b610662160e2caad5d8e'


const StartInterview = () => {

    const { interviewId } = useParams(); // can be string | string[] | undefined. But Convex query expects Id<"InterviewSessionTable">
    const convex = useConvex();

    const [interviewData, setInterviewData] = useState<InterviewData>();

    const videoContainerRef = React.useRef<HTMLDivElement | null>(null);

    const [agoraSdk, setAgoraSdk] = useState<GenericAgoraSDK | null>(null);

    const [micOn, setMicOn] = useState(false);

    const [kbId, setKbId] = useState<string | null>(null);

    const [join, setJoin] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [messages, setMessages] = useState<MessageType[]>([]);

    const updateFeedback = useMutation(api.Interview.UpdateFeedback);

    const router = useRouter();

    const getInterviewQuestions = async () => {
        if(!interviewId || Array.isArray(interviewId)){
            toast.error("Invalid interview ID");
            throw new Error("Invalid interview ID");
        }
        const result = await convex.query(api.Interview.GetInterviewQuestions, { interviewRecordId: interviewId as Id<"InterviewSessionTable"> });

        result.resumeUrl ? setInterviewData({
            ...result,
            type: "resume",
            resumeUrl: result.resumeUrl
        }) : setInterviewData({
            ...result,
            type: "manual"
        })
    }

    // const GetKnowledgeBase = async () => { // no need as we have our own prompt now
    //     const result = await axios.post('/api/akool-knowledge-base', {
    //         questions: interviewData?.interviewQuestions
    //     });
    //     setKbId(result.data?.data?._id);
    // }

    useEffect(() => {
        getInterviewQuestions();
    }, [interviewId])

    // useEffect(() => {
    //     if (interviewData) {
    //         GetKnowledgeBase();
    //     }
    // }, [interviewData])

    // Agora
    useEffect(() => {
        const SDK = new GenericAgoraSDK({ mode: "rtc", codec: "vp8" });

        // Register event handlers
        SDK.on({
            onStreamMessage: (uid, message) => {
                console.log("Received message from", uid, ":", message);
                if(message.pld && 'text' in message.pld && message.pld.text?.length>0){
                    setMessages((prev: MessageType[]) => [...prev, message.pld as MessageType])
                }
        },
            onException: (error) => {
                console.error("An exception occurred:", error);
        },
            onMessageReceived: (message) => {
                console.log("New message:", message);
        },
            onMessageUpdated: (message) => {
                console.log("Message updated:", message);
        },
            onNetworkStatsUpdated: (stats) => {
                console.log("Network stats:", stats);
        },
            onTokenWillExpire: () => {
                console.log("Token will expire in 30s");
        },
            onTokenDidExpire: () => {
                console.log("Token expired");
        },
            onUserPublished: async (user, mediaType) => {
                if (mediaType === 'video') {
                    await SDK.getClient().subscribe(user, mediaType);
                    user?.videoTrack?.play(videoContainerRef.current || '')
                } else if (mediaType === 'audio') {
                    await SDK.getClient().subscribe(user, mediaType);
                    user?.audioTrack?.play();
                }
            }
        });

        setAgoraSdk(SDK);

        return () => {
            SDK.leaveChat();
            SDK.leaveChannel();
            SDK.closeStreaming();
        }

    },[])

    const StartConversation = async() => {
        if(!agoraSdk) return ;

        setLoading(true);

        // create akool session
        const result = await axios.post('/api/akool-session', {
            avatar_id: AVATAR_ID,
            voice_id: VOICE_ID,
            // knowledge_id: kbId
        })
        const credentials = result?.data?.data?.credentials;

        if(!credentials){
            throw new Error("No credentials returned from Akool");
        }

        await agoraSdk?.joinChannel({
            agora_app_id: credentials.agora_app_id,
            agora_channel: credentials.agora_channel,
            agora_token: credentials.agora_token,
            agora_uid: credentials.agora_uid
        })

        await agoraSdk.joinChat({
            vid: "en-US-Wavenet-A",
            lang: "en",
            mode: 2 // 1 for repeat mode, 2 for dialog mode
        });

        const prompt = `
            ## Identity & Role
            You are Alinna, an AI Technical Interviewer for HireWise, a leading hiring and collaboration platform. Your primary purpose is to conduct comprehensive technical interviews while providing a positive, encouraging experience for candidates.

            ## Voice & Persona
            - **Professional yet warm**: Maintain a friendly, approachable demeanor while staying professional
            - **Encouraging and supportive**: Use phrases like "That's interesting, tell me more" or "Great, let's dive deeper into that"
            - **Active listener**: Acknowledge responses with "That's a solid approach" or "I like how you thought through that"
            - **Structured but conversational**: Keep the interview flowing naturally while covering all necessary areas

            ## Interview Flow & Structure

            ### Opening (Already handled in first message)
            First message: "Hello! Welcome to your technical interview with HireWise. I'm Alinna, your AI interviewer, and I'm excited to learn more about you today. How has your day been going so far?"

            After their response: "Excellent! I'm looking forward to our conversation. Today we'll go through some structured interview questions to better understand your background and expertise. Are you ready to begin?"

            ### Question Strategy
            1. **Ask questions ONLY from the provided interview questions list**: ${interviewData?.interviewQuestions.map(q => q.question).join(", ")}
            2. **One question at a time** - wait for complete response before proceeding
            3. **Follow the exact order** of questions provided in interviewData
            4. **Listen actively** to their response and provide encouraging feedback
            5. **Transition smoothly** between questions with bridging phrases

            ## Response Guidelines

            ### After Each Answer:
            - **Acknowledge their response**: "Thank you for that detailed answer" or "That's really helpful to understand"
            - **Provide brief encouraging feedback**: "Great experience!" or "That shows strong problem-solving skills"
            - **Transition to next question**: "Let's move on to the next question..." or "Now I'd like to ask about..."
            - **Ask the next question from interviewData list** in sequence

            ### Question Delivery:
            - **One question at a time** - wait for complete response before proceeding
            - **Maintain conversational flow** - don't just read questions mechanically
            - **Adapt based on their answers** - if they mention something relevant to upcoming questions, acknowledge it
            - **Show genuine interest** in their responses

            ### Active Listening Techniques:
            - Reference previous answers: "Earlier you mentioned X, how does that relate to..."
            - Build on their responses: "That's a great point about Y, it reminds me to ask..."
            - Validate their expertise: "It's clear you have strong experience in..."

            ## Technical Assessment Approach
            - **Match their level**: Adjust technical depth based on their demonstrated expertise
            - **Encourage elaboration**: "Can you walk me through your thought process on that?"
            - **Explore real examples**: "Can you give me a specific example of when you..."
            - **Test problem-solving**: Ask how they would approach challenges in their domain

            ## Conversation Management
            - **Stay focused**: Keep responses relevant to the current question
            - **Manage pacing**: Allow adequate time for thoughtful responses
            - **Maintain structure**: Don't skip questions unless they've been naturally covered
            - **Show progress**: Occasionally indicate where you are in the process

            ## Closing Approach
            After all interviewData questions are completed: "Thank you for those thoughtful responses throughout our interview. You've provided great insights into your background and experience. Do you have any questions about the role or HireWise before we wrap up?"

            Final message: "Thank you so much for your time today. I've enjoyed learning about your experience and skills. Our team will review your responses and be in touch about next steps. Have a wonderful rest of your day!"

            ## Key Behavioral Rules
            1. **Ask ONLY questions from the interviewData list** - no additional questions beyond what's provided
            2. **Never ask multiple questions at once** - always wait for response
            3. **Follow the exact sequence** of questions from interviewData
            4. **Maintain encouraging tone** throughout the entire interview
            5. **Keep responses brief and supportive** - focus on moving through the question list
            6. **Acknowledge answers positively** before moving to the next question

            ## Primary Objective
            Your main goal is to systematically work through the provided interview questions while creating a positive, professional experience. Stay focused on the structured question list rather than conducting open-ended exploration or cultural assessment.
        `

        await agoraSdk?.sendMessage(prompt);

        await agoraSdk.toggleMic();
        setMicOn(true);
        setJoin(true);
        setLoading(false);
    }

    const toggleMic = async () => {
        if(!agoraSdk) return ;
        await agoraSdk?.toggleMic();
        setMicOn(agoraSdk?.isMicEnabled());
    }

    const GenerateFeedback = async () => {
        toast.warning('Generating feedback...')
        try {
            const result = await axios.post('/api/interview-feedback', {
                messages: JSON.stringify(messages) //tested with dummy data
            });
            toast.success('Feedback generated. Check console for details.')

            // Save the feedback and then navigate
            const response = await updateFeedback({
                feedback: result.data,
                recordId: interviewId as Id<"InterviewSessionTable">
            })

            toast.success('Interview completed successfully!')

            router.replace('/dashboard');

        } catch (error) {
            console.error("Error generating feedback:", error);
            toast.error('Failed to generate feedback');
        }
    }


    const LeaveConversation = async () => {
        if(!agoraSdk) return ;
        await agoraSdk.leaveChat();
        await agoraSdk.leaveChannel();
        await agoraSdk.closeStreaming();
        setJoin(false);
        setMicOn(false);

        await GenerateFeedback();
    }


    return (
        <div className='flex flex-col lg:flex-row w-full min-h-screen bg-background'>
            {/* Test  */}
            {/* <Button onClick={GenerateFeedback}>Test Feedback</Button> */}

                
            {/* Video Section */}
            <div className='flex flex-col p-4 sm:p-6 lg:w-2/3 items-center'>
                <h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground'>Interview Session</h1>
                
                {/* Video Container */}
                <div 
                ref={videoContainerRef} 
                id={CONTAINER_ID} 
                className='w-full max-w-2xl aspect-video bg-card border border-border rounded-xl overflow-hidden flex items-center justify-center shadow-sm'
                >
                    {
                        !join && (
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <User size={48} />
                                <p className="text-sm font-medium">Ready to connect</p>
                            </div>
                        )
                    }
                </div>

                {/* Controls */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 justify-center">
                    {
                        !join ? (
                            <Button
                                onClick={StartConversation}
                                disabled={loading}
                                size="lg"
                                className='flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50'
                            >
                                <PhoneCall size={20}/>
                                {loading ? 'Connecting...' : 'Start Interview'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={toggleMic}
                                    size="lg"
                                    variant={micOn ? 'default' : 'secondary'}
                                    className='flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all duration-200'
                                >
                                    {
                                        micOn ? (
                                            <>
                                                <Mic size={20}/> Mute
                                            </>
                                        ) : (
                                            <>
                                                <MicOff size={20}/> Unmute
                                            </>
                                        )
                                    }
                                </Button>
                                <Button
                                    onClick={LeaveConversation}
                                    size="lg"
                                    variant="destructive"
                                    className='flex items-center cursor-pointer gap-2 shadow-md hover:shadow-lg transition-all duration-200'
                                >
                                    <PhoneOff size={20}/> End Interview
                                </Button>
                            </>
                        )
                    }
                </div>
            </div>

            {/* Conversation Section */}
            <div className='flex flex-col p-4 sm:p-6 lg:w-1/3 min-h-0'>
                <h2 className='text-lg font-semibold mb-4 text-foreground'>
                Conversation
                </h2>
                
                {/* Fixed height scrollable container */}
                <div className='flex-1 min-h-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col'>
                <div className='flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-12rem)]'>
                    {
                        messages?.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-sm text-muted-foreground text-center">
                                    No messages yet. Start the interview to begin the conversation!
                                </p>
                            </div>
                        ) : (
                            messages?.map((msg, index) => (
                                <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-[85%] text-sm ${
                                        msg.from === 'user' 
                                            ? 'bg-primary text-primary-foreground ml-auto' 
                                            : 'bg-secondary text-secondary-foreground mr-auto'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )
                    }
                </div>
                </div>
            </div>
        </div>
    )
}

export default StartInterview
