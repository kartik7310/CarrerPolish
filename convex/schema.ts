import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// @snippet start schema
export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    credits:v.number(),
    subscribeId:v.optional(v.string())
  }),
});