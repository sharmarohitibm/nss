"use client";
import { ChartColumn, Help, Chat } from "@carbon/icons-react";
import Link from "next/link";
import { Avatar } from ".";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-20 min-w-20 max-w-20 flex-col items-center justify-center bg-white py-8 shadow-[0_0_5px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center">
        <Avatar size={40} circleShape />
      </div>
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        {/* <Link
          className={`relative flex w-full items-center justify-center rounded-r-md p-5 text-[#B8C5D3] hover:w-[6.5rem] hover:text-[#FFFFFF] ${pathname?.startsWith("/dashboard") ? "!w-[6.5rem] !bg-[#434e62] text-[#FFFFFF]" : "navigation-button"}`}
          href="/dashboard"
        >
          <ChartColumn size={24} />
        </Link> */}
        <Link
          className={`relative flex h-16 w-full items-center justify-center rounded-r-md text-[#B8C5D3] hover:w-[6.5rem] hover:text-[#FFFFFF] ${pathname?.startsWith("/chat") ? "!w-[6.5rem] !bg-[#434e62] text-[#FFFFFF]" : "navigation-button"}`}
          href="/chat"
        >
          <Chat size={24} />
        </Link>
        {/* out of scope */}
        <div className="flex h-16 w-full cursor-not-allowed items-center justify-center">
          <Help size={24} color="#dcdfe3" />
        </div>
        <div className="flex h-16 w-full cursor-not-allowed items-center justify-center">
          <Help size={24} color="#dcdfe3" />
        </div>
        <div className="flex h-16 w-full cursor-not-allowed items-center justify-center">
          <Help size={24} color="#dcdfe3" />
        </div>
        <div className="flex h-16 w-full cursor-not-allowed items-center justify-center">
          <Help size={24} color="#dcdfe3" />
        </div>
        {/* out of scope */}
      </div>
      {/* <div className="flex items-center">
        <button className="h-10 w-10 rounded-full bg-nuhs-blue text-white">
          +
        </button>
      </div> */}
    </div>
  );
};

export default Navigation;
