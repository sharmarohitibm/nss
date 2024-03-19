import COPYWRITING from "@/shared/copywriting.json";
import { Card, Kebab } from "@/shared/components";

const ProspectProgressBar = () => {
  return (
    <div>
      <div className="relative h-[6px] w-full rounded bg-[#E5E9F2]">
        <div className="absolute z-10 h-[6px] w-[20%] rounded bg-[#2567CB]"></div>
      </div>
      <div className="flex text-sm">
        <div className="flex grow">
          <p className="font-bold">Next: </p>
          <div>Send Enrolment Form</div>
        </div>
        <p>Speech Therapist</p>
      </div>
    </div>
  );
};

export default ProspectProgressBar;
