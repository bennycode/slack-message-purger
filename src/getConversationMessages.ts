import { type ConversationsHistoryResponse, WebClient } from "@slack/web-api";

export async function getConversationMessages(
  web: WebClient,
  channelId: string
): Promise<NonNullable<ConversationsHistoryResponse["messages"]>> {
  const allMessages: NonNullable<ConversationsHistoryResponse["messages"]> = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const history = await web.conversations.history({
      channel: channelId,
      limit: 200,
      cursor: cursor,
    });

    if (history.messages && history.messages.length > 0) {
      allMessages.push(...history.messages);
    }

    hasMore = !!history.has_more;
    cursor = history.response_metadata?.next_cursor;
  }

  return allMessages;
}
