import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Get current user profile
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      _creationTime: user._creationTime,
      isAnonymous: user.isAnonymous || false,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

// Get all users (admin function)
export const getAllUsers = query({
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

    // Check if user is admin (you can set your email here)
    const adminEmails = ["claraartist607@gmail.com"]; // Replace with your actual email
    if (!adminEmails.includes(currentUser.email || "")) {
      throw new Error("Access denied: Admin privileges required");
    }

    const users = await ctx.db.query("users").collect();
    
    return users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      _creationTime: user._creationTime,
      isAnonymous: user.isAnonymous || false,
    }));
  },
});

// Delete user account
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Delete user's conversations and messages
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const conversation of conversations) {
      // Delete all messages in this conversation
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the conversation
      await ctx.db.delete(conversation._id);
    }

    // Delete the user
    await ctx.db.delete(userId);
    
    return { success: true };
  },
});
