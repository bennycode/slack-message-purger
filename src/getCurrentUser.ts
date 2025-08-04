import { type WebClient } from "@slack/web-api";

export async function getCurrentUser(web: WebClient) {
  const authResult = await web.auth.test();
  const userId = authResult.user_id;
  const userName = authResult.user;

  if (!userId || !userName) {
    throw new Error("Failed to get user information");
  }

  console.log(`Looking for messages from user: ${userName} (ID: ${userId})\n`);
  return { id: userId, name: userName };
}
