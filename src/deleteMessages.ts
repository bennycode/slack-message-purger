import { ConversationsHistoryResponse, WebClient } from "@slack/web-api";

export async function deleteMessages(
  web: WebClient,
  channelId: string,
  messages: NonNullable<ConversationsHistoryResponse["messages"]>,
  messageType: string = "message",
): Promise<void> {
  for (const message of messages) {
    if (!message.ts) continue;

    try {
      await web.chat.delete({
        channel: channelId,
        ts: message.ts,
      });
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `    ✅ [${timestamp}] Deleted ${messageType}: ${message.ts}`,
      );
    } catch (deleteError) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(
        `    ❌ [${timestamp}] Failed to delete ${messageType} ${message.ts}:`,
        deleteError,
      );
    }
  }
}
