import { Avatar } from "@/shared/components";
import dayjs from "dayjs";

const ChatMessage = ({
  message,
}: {
  message: {
    text: string;
    timestamp: number;
    isItMyself: boolean;
  };
}) => {
  const display24HourTime = (time: number) => {
    return dayjs.unix(time).format("HH:mm");
  };
  return (
    <div
      className={`${message.isItMyself ? "justify-end pl-20" : "pr-20"} flex gap-6`}
    >
      <div
        className={`${message.isItMyself && "order-last"} flex flex-col gap-1`}
      >
        <Avatar circleShape size={32} />
        <p className="font-Roboto-Regular text-xs">
          {display24HourTime(message.timestamp)}
        </p>
      </div>
      <div className="relative">
        <div
          style={{
            top: 10,
            width: 10,
            transform: "rotate(45deg)",
            backgroundColor: message.isItMyself ? "#0084FF" : "white",
            height: 10,
          }}
          className={`absolute text-[transparent] ${message.isItMyself ? "right-[-4px]" : "left-[-4px]"}`}
        />
        <p
          className={`rounded ${message.isItMyself ? "bg-[#0084FF] text-white" : "bg-white text-nuhs-grey"} p-3 text-sm`}
        >
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
