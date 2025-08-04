import {
  type ConversationsListResponse,
  WebClient
} from "@slack/web-api";

export async function getAllConversations(web: WebClient, types: string) {
  const allConversations: ConversationsListResponse["channels"] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const conversations = await web.conversations.list({
      types,
      limit: 200,
      cursor: cursor,
    });

    if (conversations.channels && conversations.channels.length > 0) {
      allConversations.push(...conversations.channels);
    }

    hasMore = !!conversations.response_metadata?.next_cursor;
    cursor = conversations.response_metadata?.next_cursor;
  }

  const conversationInfos = allConversations
    .filter((conv) => conv.id)
    .map((conv) => ({
      id: conv.id!,
      name: conv.name || `DM-${conv.id}`,
    }));

  return conversationInfos.sort((a, b) => a.name.localeCompare(b.name));
}
