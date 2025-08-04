import {
  type ConversationsHistoryResponse,
  type ConversationsListResponse,
  ConversationsRepliesResponse,
  WebClient,
} from "@slack/web-api";

const MESSAGE_TYPES_TO_DELETE = "public_channel,private_channel,mpim,im";
const USER_TOKEN = "xoxp-...";
const web = new WebClient(USER_TOKEN);

async function purgeMySlackMessages() {
  try {
    // Get current user info
    const authResult = await web.auth.test();
    const myUserId = authResult.user_id;
    console.log(
      `Looking for messages from user: ${authResult.user} (ID: ${myUserId})\n`
    );

    // Get all conversations (channels, groups, DMs) with pagination
    const allConversations: ConversationsListResponse["channels"] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const conversations = await web.conversations.list({
        types: MESSAGE_TYPES_TO_DELETE,
        limit: 200, // Maximum allowed per request
        cursor: cursor,
      });

      if (conversations.channels && conversations.channels.length > 0) {
        allConversations.push(...conversations.channels);
      }

      // Check if there are more conversations
      hasMore = !!conversations.response_metadata?.next_cursor;
      cursor = conversations.response_metadata?.next_cursor;
    }

    if (allConversations.length === 0) {
      console.log("No conversations found");
      return;
    }

    console.log(`Found ${allConversations.length} conversations\n`);

    // Sort conversations alphabetically by name
    const sortedConversations = allConversations.sort((a, b) => {
      const nameA = a.name || `DM-${a.id}`;
      const nameB = b.name || `DM-${b.id}`;
      return nameA.localeCompare(nameB);
    });

    // Loop through each conversation
    for (const conversation of sortedConversations) {
      if (!conversation.id) {
        continue;
      }
      const conversationName = conversation.name || `DM-${conversation.id}`;
      console.log(`\n📂 Checking conversation: ${conversationName}`);

      try {
        // Get conversation history with pagination
        const allMessages: ConversationsHistoryResponse["messages"] = [];
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const history = await web.conversations.history({
            channel: conversation.id,
            limit: 200, // Maximum allowed per request
            cursor: cursor,
          });

          if (history.messages && history.messages.length > 0) {
            allMessages.push(...history.messages);
          }

          // Check if there are more messages
          hasMore = !!history.has_more;
          cursor = history.response_metadata?.next_cursor;
        }

        if (allMessages.length === 0) {
          console.log(`  No messages found in ${conversationName}`);
          continue;
        }

        console.log(
          `  📊 Total messages in ${conversationName}: ${allMessages.length}`
        );

        // Filter messages from the current user
        const myMessages = allMessages.filter(
          (message) => message.user === myUserId
        );

        // Also collect replies from threads
        const threadedMessages = allMessages.filter(
          (message) => message.reply_count && message.reply_count > 0
        );
        const myReplies: ConversationsRepliesResponse["messages"] = [];

        if (threadedMessages.length > 0) {
          console.log(
            `  🧵 Found ${threadedMessages.length} threaded messages, checking for your replies...`
          );

          for (const threadMessage of threadedMessages) {
            if (!threadMessage.ts) {
              continue;
            }
            try {
              const replies = await web.conversations.replies({
                channel: conversation.id,
                ts: threadMessage.ts,
              });

              if (replies.messages && replies.messages.length > 1) {
                // First message is the parent
                const threadReplies = replies.messages
                  .slice(1)
                  .filter((reply) => reply.user === myUserId);
                myReplies.push(...threadReplies);
              }
            } catch (replyError) {
              console.log(
                `    ❌ Error fetching replies for thread ${threadMessage.ts}:`,
                replyError
              );
            }
          }
        }

        const totalMyMessages = myMessages.length + myReplies.length;

        if (totalMyMessages > 0) {
          console.log(
            `  💬 Found messages from you: ${myMessages.length} top-level + ${myReplies.length} replies = ${totalMyMessages} total`
          );

          // Delete top-level messages
          for (const message of myMessages) {
            if (!message.ts) {
              continue;
            }
            try {
              await web.chat.delete({
                channel: conversation.id,
                ts: message.ts,
              });
              const timestamp = new Date().toLocaleTimeString();
              console.log(
                `    ✅ [${timestamp}] Deleted message: ${message.ts}`
              );
            } catch (deleteError) {
              const timestamp = new Date().toLocaleTimeString();
              console.log(
                `    ❌ [${timestamp}] Failed to delete message ${message.ts}:`,
                deleteError
              );
            }
          }

          // Delete replies
          for (const reply of myReplies) {
            if (!reply.ts) {
              continue;
            }
            try {
              await web.chat.delete({
                channel: conversation.id,
                ts: reply.ts,
              });
              const timestamp = new Date().toLocaleTimeString();
              console.log(`    ✅ [${timestamp}] Deleted reply: ${reply.ts}`);
            } catch (deleteError) {
              const timestamp = new Date().toLocaleTimeString();
              console.log(
                `    ❌ [${timestamp}] Failed to delete reply ${reply.ts}:`,
                deleteError
              );
            }
          }

          console.log(
            `  🗑️ Deletion process completed for ${conversationName}`
          );
        } else {
          console.log(`  No messages from you in ${conversationName}`);
        }
      } catch (error) {
        console.log(
          `  ❌ Error fetching messages from ${conversationName}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

purgeMySlackMessages();
