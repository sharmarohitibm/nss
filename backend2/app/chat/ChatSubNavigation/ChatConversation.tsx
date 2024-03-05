import { Avatar, Kebab } from "@/shared/components";
import { conversationType, individualConversationType } from "chat/page";
import dayjs from "dayjs";

const ChatConversation = ({
  conversation,
  isLookingAtThisConversation,
  setCurrentConversation,
}: {
  conversation: individualConversationType;
  isLookingAtThisConversation: boolean;
  setCurrentConversation: any;
}) => {
  const displayTimeStamp = (time: number) => {
    if (time < 1) {
      return "Just now";
    }
    if (time < 60) {
      const roundedNearestMinutes = Math.floor(time);
      return `${roundedNearestMinutes} min${roundedNearestMinutes === 1 ? "" : "s"}`;
    }
    if (time < 36000) {
      const nearestHour = Math.floor(time / 60);
      return `${nearestHour} hour${nearestHour === 1 ? "" : "s"}`;
    }
  };

  return (
    <div
      onClick={() => setCurrentConversation(conversation.user_id)}
      className={`flex cursor-pointer items-center gap-4 px-7 py-3 hover:bg-nuhs-hovergrey ${isLookingAtThisConversation && "bg-[#3A465B]"}`}
    >
      <Avatar
        size={60}
        circleShape
        showOnlineStatus
        containerClasses="min-w-[60px]"
      />
      <div className="flex w-full flex-col gap-1 overflow-hidden pt-2">
        <div className="flex flex-nowrap gap-4">
          <p className="grow font-Roboto-Regular text-sm text-nuhs-lightcolor">
            {conversation.name}
          </p>
          <Kebab classes="text-nuhs-lightgrey" />
        </div>
        <div className="flex flex-nowrap gap-4 text-xs">
          <p className="ellipsis-second-line grow text-[#ffffff] opacity-50">
            {conversation.messages[0].text}
          </p>
          <p className="whitespace-nowrap text-nowrap text-nuhs-lightgrey">
            {displayTimeStamp(conversation.lastSent)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
