import { WebClient } from "@slack/web-api";
import { getConversationMessages } from "./getConversationMessages.ts";
import { getUserRepliesFromThreads } from "./getUserRepliesFromThreads.ts";
import { deleteMessages } from "./deleteMessages.ts";

export async function deleteMessagesFromConversation(
  web: WebClient,
  conversation: { id: string; name: string },
  userId: string
): Promise<void> {
  console.log(`\n📂 Checking conversation: ${conversation.name}`);

  try {
    const allMessages = await getConversationMessages(web, conversation.id);

    if (allMessages.length === 0) {
      console.log(`  No messages found in ${conversation.name}`);
      return;
    }

    console.log(
      `  📊 Total messages in ${conversation.name}: ${allMessages.length}`
    );

    // Filter messages from the current user
    const myMessages = allMessages.filter((message) => message.user === userId);

    // Get threaded messages and fetch user's replies
    const threadedMessages = allMessages.filter(
      (message) => message.reply_count && message.reply_count > 0
    );
    const myReplies = await getUserRepliesFromThreads(
      web,
      conversation.id,
      threadedMessages,
      userId
    );

    const totalMyMessages = myMessages.length + myReplies.length;

    if (totalMyMessages > 0) {
      console.log(
        `  💬 Found messages from you: ${myMessages.length} top-level + ${myReplies.length} replies = ${totalMyMessages} total`
      );

      // Delete top-level messages and replies
      await deleteMessages(web, conversation.id, myMessages, "message");
      await deleteMessages(web, conversation.id, myReplies, "reply");

      console.log(`  🗑️ Deletion process completed for ${conversation.name}`);
    } else {
      console.log(`  No messages from you in ${conversation.name}`);
    }
  } catch (error) {
    console.log(
      `  ❌ Error fetching messages from ${conversation.name}:`,
      error
    );
  }
}
