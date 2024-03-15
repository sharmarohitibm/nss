"use client";
import { axiosInstance } from "@/shared/api";
import { SendAlt } from "@carbon/icons-react";
import { Button, Input, TextField, TextareaAutosize } from "@mui/material";
import { conversationType } from "chat/page";
import { useState } from "react";

const ChatMessageInput = ({
  currentConversation,
  setAllConversations,
  allConversations,
  pollApiId,
  pollForMessages,
}: {
  currentConversation: string;
  setAllConversations: any;
  allConversations: conversationType;
  pollApiId: any;
  pollForMessages;
}) => {
  const [messageInput, setMessageInput] = useState<any>("");

  const onSubmitSendMessage = async () => {
    try {
      const response = await axiosInstance.post("/send_message", {
        chat_id: `${currentConversation}`,
        text: messageInput,
        message_thread_id: "",
      });
      const res = response.data;
      clearTimeout(pollApiId.current);
      pollForMessages();
    } catch (err) {
      console.log("error in sending message in chat page", err);
    }
  };

  const submitIfEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmitSendMessage();
      setMessageInput("");
    }
    return;
  };

  return (
    <form className="flex items-center gap-2 bg-white px-6 py-2">
      <Input
        disabled={!currentConversation}
        disableUnderline
        onKeyDown={submitIfEnter}
        onChange={(e) => setMessageInput(e.target.value)}
        value={messageInput}
        maxRows={4}
        placeholder="Type your message"
        className="h-full grow border-0 text-sm"
        multiline
      />
      {currentConversation && (
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#0058FF]">
          <SendAlt size={16} color="white" type="submit" />
        </div>
      )}
    </form>
  );
};

export default ChatMessageInput;
