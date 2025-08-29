import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const SaveInterviewQuestions = mutation({
    args: {
        interviewQuestions: v.array(v.object({
            question: v.string(),
            answer: v.string()
        })),
        resumeUrl: v.string(),
        uid: v.id('UserTable')
    },

    handler: async(ctx, args) => {
        const result = await ctx.db.insert('InterviewSessionTable', {
            interviewQuestions: args.interviewQuestions,
            resumeUrl: args.resumeUrl,
            userId: args.uid,
            status: 'draft'
        })
        return result;
    }

})