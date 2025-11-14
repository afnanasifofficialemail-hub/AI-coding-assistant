import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const createConversation = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("conversations", {
      userId,
      title: args.title,
    });
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Admin-only function to get all conversations
export const getAllConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get current user to check if they're admin
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if user is admin (replace with your actual email)
    const adminEmails = ["claraartist607@gmail.com"];
    if (!adminEmails.includes(currentUser.email || "")) {
      throw new Error("Access denied: Admin privileges required");
    }

    return await ctx.db
      .query("conversations")
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: args.role,
      timestamp: Date.now(),
    });
  },
});

export const generateAIResponse = action({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Add user message
    await ctx.runMutation(api.ai.addMessage, {
      conversationId: args.conversationId,
      content: args.userMessage,
      role: "user",
    });

    // Get conversation history
    const messages: Array<{
      _id: Id<"messages">;
      conversationId: Id<"conversations">;
      content: string;
      role: "user" | "assistant";
      timestamp: number;
    }> = await ctx.runQuery(api.ai.getMessages, {
      conversationId: args.conversationId,
    });

    // Prepare messages for OpenAI
    const openaiMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system" as const,
        content: `You are an expert coding assistant specializing in HTML, CSS, and JavaScript. You help users with:
- Writing clean, semantic HTML code
- Creating responsive CSS layouts and styling
- JavaScript programming and DOM manipulation
- Debugging code issues
- Best practices and modern web development techniques
- Code explanations and tutorials

Always provide clear, well-commented code examples. When showing code, use proper formatting and explain what each part does. Be helpful, accurate, and encouraging.`,
      },
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      const aiResponse: string = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      // Add AI response
      await ctx.runMutation(api.ai.addMessage, {
        conversationId: args.conversationId,
        content: aiResponse,
        role: "assistant",
      });

      return aiResponse;
    } catch (error) {
      console.error("OpenAI API error:", error);
      const errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again.";
      
      await ctx.runMutation(api.ai.addMessage, {
        conversationId: args.conversationId,
        content: errorMessage,
        role: "assistant",
      });

      return errorMessage;
    }
  },
});
