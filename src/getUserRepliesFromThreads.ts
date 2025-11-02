import {
  ConversationsHistoryResponse,
  ConversationsRepliesResponse,
  WebClient,
} from "@slack/web-api";

export async function getUserRepliesFromThreads(
  web: WebClient,
  channelId: string,
  threadedMessages: NonNullable<ConversationsHistoryResponse["messages"]>,
  userId: string,
): Promise<NonNullable<ConversationsRepliesResponse["messages"]>> {
  const myReplies: NonNullable<ConversationsRepliesResponse["messages"]> = [];

  if (threadedMessages.length === 0) {
    return myReplies;
  }

  console.log(
    `  🧵 Found ${threadedMessages.length} threaded messages, checking for your replies...`,
  );

  for (const threadMessage of threadedMessages) {
    if (!threadMessage.ts) continue;

    try {
      const replies = await web.conversations.replies({
        channel: channelId,
        ts: threadMessage.ts,
      });

      if (replies.messages && replies.messages.length > 1) {
        const threadReplies = replies.messages
          .slice(1)
          .filter((reply) => reply.user === userId);
        myReplies.push(...threadReplies);
      }
    } catch (replyError) {
      console.log(
        `    ❌ Error fetching replies for thread ${threadMessage.ts}:`,
        replyError,
      );
    }
  }

  return myReplies;
}
