import { Notification, Star } from "@carbon/icons-react";
import ChatTopDivider from "../ChatTopDivder";
import { Avatar, Kebab } from "@/shared/components";
import { Divider } from "@mui/material";
import { axiosInstance } from "@/shared/api";
import { useEffect, useState } from "react";

const ChatRightDrawer = ({
  currentConversation,
}: {
  currentConversation: string;
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get(
        `/get_user_info/${currentConversation}`,
      );
      // should not need to parse this
      const res = JSON.parse(response.data);
      setUserInfo(res);
    } catch (err) {
      console.log("error in chat page", err);
    }
  };

  useEffect(() => {
    if (currentConversation) getUserInfo();
  }, [currentConversation]);

  return (
    userInfo && (
      <div className="w-64 min-w-64 max-w-64  py-8">
        <div className="flex h-10 px-5">
          <div className="grow">
            {/* <div className="flex h-10 w-10  items-center justify-center border">
              <Notification size={20} className="text-nuhs-lightgrey" />
            </div> */}
          </div>
        </div>
        <ChatTopDivider color="#DFDFDF" />
        <div className="px-5">
          <div className="flex items-center pb-7">
            {/* <div className="grow">
              <Star size={20} />
            </div>
            <Kebab /> */}
          </div>
          <div className="flex items-center justify-center pb-4">
            <Avatar size={168} />
          </div>
          <div className="flex flex-col items-center">
            <p>{userInfo?.first_name}</p>
            {/* <p className="font-Roboto-Regular text-[0.6rem]">JarJarBinks City</p> */}
          </div>
          <Divider className="mb-3 mt-5" />
          <div className="flex flex-col">
            <div className="flex items-center">
              <p className="grow text-sm text-nuhs-grey">Nickname: </p>
              <p className="font-Roboto-Regular text-xs">
                {userInfo?.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatRightDrawer;
