// Public, client-safe values (the website ships the same ones to every
// browser). Env vars still win when set, but these defaults mean a bundle
// built without a .env — e.g. an EAS Update — still points at production
// instead of crashing on startup.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://db.forcoach.io";

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg2MTM5MzQ0LCJleHAiOjIxMDE0OTkzNDR9.BjLCT_s6L3n8Wy7W_lkXoa3QgP-1yG4kZKDO8myidJA";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.forcoach.io";
