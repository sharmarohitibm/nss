import { Search } from "@carbon/icons-react";
import { Input, InputAdornment } from "@mui/material";
import ChatTopDivider from "../ChatTopDivder";

const ChatSearch = () => {
  return (
    <div className="px-7 hover:cursor-not-allowed">
      <Input
        disabled
        startAdornment={
          <InputAdornment position="start">
            {/* nuhs-lightgrey */}
            <Search color="#8190B0" size={24} />
          </InputAdornment>
        }
        placeholder="Search"
        className="p h-10 w-full rounded bg-nuhs-darkergrey px-2 font-Roboto-Light text-sm text-nuhs-lightgrey"
      />
    </div>
  );
};

export default ChatSearch;
