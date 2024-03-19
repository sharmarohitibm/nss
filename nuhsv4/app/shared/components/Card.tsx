import { ReactNode } from "react";

const Card = ({
  classes,
  children,
}: {
  classes?: string;
  children: ReactNode;
}) => {
  return <div className={`bg-white p-7 ${classes}`}>{children}</div>;
};

export default Card;
