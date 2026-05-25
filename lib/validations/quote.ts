import { z } from "zod";

const quoteTheme = z.enum(["dark", "beige", "cinematic", "minimal"]);
const quoteAlignment = z.enum(["left", "center", "right"]);
const quoteCategory = z.enum([
  "music",
  "love",
  "life",
  "wisdom",
  "poetry",
]);

export const createQuoteSchema = z.object({
  text: z.string().min(1).max(2000),
  author: z.string().max(120).optional().default(""),
  category: quoteCategory,
  theme: quoteTheme,
  alignment: quoteAlignment,
  backgroundImage: z.string().max(2048).optional().nullable(),
  draftId: z.string().optional(),
});

export const updateDraftSchema = z.object({
  text: z.string().max(2000).optional(),
  author: z.string().max(120).optional(),
  category: quoteCategory.optional(),
  theme: quoteTheme.optional(),
  alignment: quoteAlignment.optional(),
  backgroundImage: z.string().max(2048).optional().nullable(),
});

export const createDraftSchema = z.object({
  text: z.string().max(2000).optional().default(""),
  author: z.string().max(120).optional().default(""),
  category: quoteCategory.optional().default("life"),
  theme: quoteTheme.optional().default("dark"),
  alignment: quoteAlignment.optional().default("center"),
  backgroundImage: z.string().max(2048).optional().nullable(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type CreateDraftInput = z.infer<typeof createDraftSchema>;
