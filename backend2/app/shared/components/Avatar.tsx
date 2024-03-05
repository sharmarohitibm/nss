import Image from "next/image";

const Avatar = ({
  showOnlineStatus = false,
  size = 24,
  containerClasses,
  circleShape = false,
}: {
  showOnlineStatus?: boolean;
  size?: number;
  containerClasses?: string;
  circleShape?: boolean;
}) => {
  return (
    <div className={`relative ${containerClasses}`}>
      {showOnlineStatus && (
        <div className="bg-nuhs-greenstatus absolute h-[14px] w-[14px] rounded-full"></div>
      )}
      <Image
        className={circleShape ? "rounded-full" : "rounded"}
        src="https://www.w3schools.com/howto/img_avatar.png"
        alt="avatar"
        width={size}
        height={size}
      />
    </div>
  );
};

export default Avatar;
