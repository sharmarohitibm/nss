"use client";
import ChatNavigation from "./ChatNavigation/ChatNavigation";
import ChatSubNavigation from "./ChatSubNavigation/ChatSubNavigation";
import ChatRightDrawer from "./ChatRightDrawer/ChatRightDrawer";
import ChatContent from "./ChatContent/ChatContent";
import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "@/shared/api";
import mockAllMessages from "./ChatContent/mockAllMessage.json";
import Dashboard from "dashboard/page";

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
  const [page, setPage] = useState("chat");
  const [allConversations, setAllConversations] = useState<conversationType>(
    {},
  );
  const [currentConversation, setCurrentConversation] = useState<any>(null);

  const pollAPIId = useRef<any>(null);

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
      const response = await axiosInstance.get("/new_merge_messages");
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
      if (pollAPIId.current) clearTimeout(pollAPIId.current);
      const newId = setTimeout(() => {
        pollForMessages();
      }, 5000);

      pollAPIId.current = newId;
      return;
    } catch (err) {
      console.log("error in chat page", err);
      setTimeout(() => {
        pollForMessages();
      }, 5000);
    }
  };

  useEffect(() => {
    getAllMessages();
  }, []);

  return (
    <div className="flex grow">
      {/* px-10 py-8 */}
      <ChatNavigation page={page} setPage={setPage} />
      {page === "statistics" ? (
        <Dashboard />
      ) : (
        <>
          <ChatSubNavigation
            allConversations={allConversations}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation}
          />
          <ChatContent
            pollForMessages={pollForMessages}
            pollApiId={pollAPIId.current}
            allConversations={allConversations}
            currentConversation={currentConversation}
            setAllConversations={setAllConversations}
          />
          <ChatRightDrawer currentConversation={currentConversation} />
        </>
      )}
    </div>
  );
}
