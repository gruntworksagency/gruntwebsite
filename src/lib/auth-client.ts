import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4321",
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
