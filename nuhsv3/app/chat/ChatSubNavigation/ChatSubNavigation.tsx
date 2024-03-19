"use client";
import ChatSearch from "./ChatSearch";
import ChatTopDivider from "../ChatTopDivder";
import ChatConversation from "./ChatConversation";
import { conversationType } from "chat/page";
import { useState } from "react";

const ChatSubNavigation = ({
  allConversations,
  currentConversation,
  setCurrentConversation,
}: {
  allConversations: conversationType;
  currentConversation: string;
  setCurrentConversation: any;
}) => {
  return (
    <div className="w-80 min-w-80 max-w-80 bg-nuhs-grey py-8">
      <ChatSearch />
      <ChatTopDivider />
      {Object.entries(allConversations).map(([, conversation]) => (
        <ChatConversation
          setCurrentConversation={setCurrentConversation}
          conversation={conversation}
          key={conversation.user_id}
          isLookingAtThisConversation={
            currentConversation === conversation.user_id
          }
        />
      ))}
    </div>
  );
};

export default ChatSubNavigation;
