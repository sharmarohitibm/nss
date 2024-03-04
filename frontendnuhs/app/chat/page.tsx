"use client";
import ChatNavigation from "./ChatNavigation/ChatNavigation";
import ChatSubNavigation from "./ChatSubNavigation/ChatSubNavigation";
import ChatRightDrawer from "./ChatRightDrawer/ChatRightDrawer";
import ChatContent from "./ChatContent/ChatContent";
import { useEffect, useState } from "react";
import { axiosInstance } from "@/shared/api";
import mockAllMessages from "./ChatContent/mockAllMessage.json";

export type conversationType = {
  [key: string]: individualConversationType;
};

export type individualConversationType = {
  messages: {
    text: string;
    timestamp: number;
    isItMyself: boolean;
  }[];
  name: string | null;
  lastSent: number;
  user_id: string;
};

export default function ChatPage() {
  const [allConversations, setAllConversations] = useState<conversationType>(
    {},
  );
  const [currentConversation, setCurrentConversation] = useState<any>(null);

  const getAllMessages = async () => {
    try {
      const response = await axiosInstance.get("/merge_messages");
      const res = response.data;
      if (res && res.length > 0) {
        const newConversations = allConversations;
        res.forEach((incomingMessage: any) => {
          if (incomingMessage.direction === "INCOMING") {
            if (!newConversations[incomingMessage.user_id]) {
              newConversations[incomingMessage.user_id] = {
                user_id: incomingMessage.user_id,
                messages: [],
                name: incomingMessage.first_name,
                lastSent: Math.floor(
                  (Date.now() / 1000 - incomingMessage.timestamp) / 60,
                ),
              };
            }
            if (!newConversations[incomingMessage.user_id].name)
              newConversations[incomingMessage.user_id].name =
                incomingMessage.first_name;
            if (
              newConversations[incomingMessage.user_id].lastSent >
              Math.floor((Date.now() / 1000 - incomingMessage.timestamp) / 60)
            ) {
              newConversations[incomingMessage.user_id].lastSent = Math.floor(
                (Date.now() / 1000 - incomingMessage.timestamp) / 60,
              );
            }

            newConversations[incomingMessage.user_id].messages.unshift({
              text: incomingMessage.text,
              timestamp: incomingMessage.timestamp,
              isItMyself: incomingMessage.is_bot,
            });
          } else {
            if (!newConversations[incomingMessage.chat_id]) {
              newConversations[incomingMessage.chat_id] = {
                user_id: incomingMessage.chat_id,
                messages: [],
                name: null,
                lastSent: Math.floor(
                  (Date.now() / 1000 - incomingMessage.timestamp) / 60,
                ),
              };
            }
            if (
              newConversations[incomingMessage.chat_id].lastSent >
              Math.floor((Date.now() / 1000 - incomingMessage.timestamp) / 60)
            ) {
              newConversations[incomingMessage.chat_id].lastSent = Math.floor(
                (Date.now() / 1000 - incomingMessage.timestamp) / 60,
              );
            }
            newConversations[incomingMessage.chat_id].messages.unshift({
              text: incomingMessage.text,
              timestamp: incomingMessage.timestamp,
              isItMyself: incomingMessage.is_bot,
            });
          }
        });

        setAllConversations({ ...newConversations });
      }
      pollForMessages();
      return;
    } catch (err) {
      console.log("error in chat page", err);
    }
  };

  const pollForMessages = async () => {
    try {
      const response = await axiosInstance.get("/get_updates");
      const res = response.data;
      if (res && res.length > 0) {
        const newConversations = allConversations;
        res.forEach((incomingMessage: any) => {
          if (!newConversations[incomingMessage.user_id]) {
            newConversations[incomingMessage.user_id] = {
              user_id: incomingMessage.user_id,
              messages: [],
              name: incomingMessage.first_name,
              lastSent: Math.floor(
                (Date.now() / 1000 - incomingMessage.message_date) / 60,
              ),
            };
          }

          newConversations[incomingMessage.user_id].messages.unshift({
            text: incomingMessage.text,
            timestamp: incomingMessage.message_date,
            isItMyself: false,
          });
        });

        setAllConversations({ ...newConversations });
      }
      setTimeout(() => {
        pollForMessages();
      }, 10000);
      return;
    } catch (err) {
      console.log("error in chat page", err);
      setTimeout(() => {
        pollForMessages();
      }, 10000);
    }
  };

  useEffect(() => {
    console.log("twice");
    getAllMessages();
  }, []);

  return (
    <div className="flex grow">
      {/* px-10 py-8 */}
      <ChatNavigation />
      <ChatSubNavigation
        allConversations={allConversations}
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
      />
      <ChatContent
        allConversations={allConversations}
        currentConversation={currentConversation}
        setAllConversations={setAllConversations}
      />
      <ChatRightDrawer currentConversation={currentConversation} />
    </div>
  );
}
