import COPYWRITING from "@/shared/copywriting.json";
import { Card, Kebab } from "@/shared/components";
import ProspectProgressBar from "./ProspectProgressBar";

const ProspectProfile = () => {
  return (
    <div className="py-7">
      <div className="flex items-center">
        <div className="flex grow">
          <p>avatar here</p>
          <p>name here</p>
        </div>
        <Kebab />
      </div>
      <ProspectProgressBar />
    </div>
  );
};

export default ProspectProfile;
