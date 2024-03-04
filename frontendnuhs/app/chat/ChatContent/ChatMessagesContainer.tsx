import { Chat } from "@carbon/icons-react";
import ChatMessage from "./ChatMessage";

const ChatMessagesContainer = ({
  messages,
}: {
  messages: {
    text: string;
    timestamp: number;
    isItMyself: boolean;
  }[];
}) => {
  return (
    <div className="flex grow flex-col-reverse overflow-scroll">
      <div className="flex flex-col-reverse gap-7 overflow-scroll px-7 py-3">
        {messages.map((message, idx) => (
          <ChatMessage
            key={`${message.timestamp}${message.text}${idx}`}
            message={message}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessagesContainer;
