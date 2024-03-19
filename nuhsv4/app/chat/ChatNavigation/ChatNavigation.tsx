import { Divider } from "@mui/material";
import ChatTopDivider from "../ChatTopDivder";
import { UserFollow } from "@carbon/icons-react";

const ChatNavigation = ({ page, setPage }) => (
  <div className="w-52 min-w-52 max-w-52 bg-nuhs-darkgrey py-8">
    <div className="flex items-center pl-7 pr-4">
      <p className="h-10 grow font-Roboto-Regular text-2xl text-white">Inbox</p>
      {/* <div className="flex h-10 w-10 items-center justify-center rounded bg-nuhs-darkergrey text-nuhs-lightgrey">
        <UserFollow />
      </div> */}
    </div>
    <ChatTopDivider />
    <div className="flex flex-col pl-5 text-sm text-nuhs-lightgrey ">
      <div
        onClick={() => setPage("chat")}
        className={`flex items-center rounded-l hover:cursor-pointer hover:bg-nuhs-hovergrey ${page === "chat" ? "bg-nuhs-hovergrey" : ""} py-3 pl-2 pr-7`}
      >
        <p className="grow">All Messages</p>
        {/* number of total messages here */}
        <p className="font-Roboto-Regular text-xs text-white"></p>
      </div>
      <div
        onClick={() => setPage("statistics")}
        className={`flex items-center rounded-l hover:cursor-pointer hover:bg-nuhs-hovergrey ${page === "statistics" ? "bg-nuhs-hovergrey" : ""} py-3 pl-2 pr-7`}
      >
        <p className="grow">Statistics</p>
        <p className="font-Roboto-Regular text-xs text-white"></p>
      </div>
      {/* <div className="flex items-center rounded-l py-3 pl-2 pr-7 hover:cursor-pointer hover:bg-nuhs-hovergrey">
        <p className="grow hover:bg-nuhs-hovergrey">Important</p>
        <p className="font-Roboto-Regular text-xs text-white"></p>
      </div>
      <div className="flex items-center rounded-l py-3 pl-2 pr-7 hover:cursor-pointer hover:bg-nuhs-hovergrey">
        <p className="grow hover:bg-nuhs-hovergrey">Drafts</p>
        <p className="font-Roboto-Regular text-xs text-white"></p>
      </div> */}
      <Divider className="" orientation="horizontal" />
    </div>
  </div>
);

export default ChatNavigation;
