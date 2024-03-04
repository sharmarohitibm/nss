import { Divider } from "@mui/material";

const ChatTopDivider = ({ color = "#495367" }: { color?: string }) => (
  <Divider
    orientation="horizontal"
    style={{ background: color, marginTop: "2rem", marginBottom: "1.25rem" }}
  />
);

export default ChatTopDivider;
