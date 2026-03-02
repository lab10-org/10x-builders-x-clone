import express from "express";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { getHealthStatus } from "./health";
import { getBearerToken } from "./features/social/auth";
import { createSupabaseSocialRepository } from "./features/social/repository";
import { createSocialRouter } from "./features/social/routes";

export const app = express();
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const authClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

app.use(
  cors({
    origin: frontendUrl,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json(getHealthStatus());
});

app.use(
  "/v1",
  createSocialRouter({
    repository: createSupabaseSocialRepository(),
    resolveUser: async (request) => {
      const token = getBearerToken(request);
      if (!token) {
        return null;
      }

      if (!authClient) {
        console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
        return null;
      }

      const { data, error } = await authClient.auth.getUser(token);
      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        accessToken: token,
      };
    },
  }),
);
