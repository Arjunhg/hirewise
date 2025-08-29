import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable:defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string()
    }),

    InterviewSessionTable:defineTable({
        interviewQuestions: v.array(v.object({
            question: v.string(),
            answer: v.string()
        })),
        resumeUrl: v.string(),
        userId: v.id('UserTable'),
        status: v.string()
    })
})