import { Phone, Star, Video } from "@carbon/icons-react";
import ChatTopDivider from "../ChatTopDivder";
import ChatMessagesContainer from "./ChatMessagesContainer";
import ChatMessageInput from "./ChatMessageInput";
import { conversationType } from "chat/page";

const ChatContent = ({
  allConversations,
  currentConversation,
  setAllConversations,
}: {
  allConversations: conversationType;
  currentConversation: string;
  setAllConversations: any;
}) => {
  return (
    <div className="flex h-full grow flex-col overflow-hidden bg-[#F0F0F0] pt-8">
      <div className="flex items-center px-7">
        <div className="grow text-sm">
          {/* <span className="font-Roboto-Regular">Luke Skywalker</span>
          <span> is typing... </span> */}
        </div>
        <div className="flex h-10 gap-4">
          {/* <div className="flex h-10 w-10 items-center justify-center border">
            <Star size={20} className="text-nuhs-lightgrey" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center border">
            <Phone size={20} className="text-nuhs-lightgrey" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center border">
            <Video size={20} className="text-nuhs-lightgrey" />
          </div> */}
        </div>
      </div>
      <ChatTopDivider color="#DFDFDF" />
      <ChatMessagesContainer
        messages={
          currentConversation
            ? allConversations[currentConversation].messages
            : []
        }
      />

      <ChatMessageInput
        allConversations={allConversations}
        currentConversation={currentConversation}
        setAllConversations={setAllConversations}
      />
    </div>
  );
};

export default ChatContent;
