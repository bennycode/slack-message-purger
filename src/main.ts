import { WebClient } from "@slack/web-api";
import { deleteMessagesFromConversation } from "./deleteMessagesFromConversation.ts";
import { getAllConversations } from "./getAllConversations.ts";
import { getCurrentUser } from "./getCurrentUser.ts";

const MESSAGE_TYPES_TO_DELETE = "public_channel,private_channel,mpim,im";
const USER_TOKEN = "xoxp-...";
const web = new WebClient(USER_TOKEN);

async function purgeMySlackMessages(): Promise<void> {
  try {
    const user = await getCurrentUser(web);
    const conversations = await getAllConversations(
      web,
      MESSAGE_TYPES_TO_DELETE
    );

    if (conversations.length === 0) {
      console.log("No conversations found");
      return;
    }

    console.log(`Found ${conversations.length} conversations\n`);

    for (const conversation of conversations) {
      await deleteMessagesFromConversation(web, conversation, user.id);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

purgeMySlackMessages();
