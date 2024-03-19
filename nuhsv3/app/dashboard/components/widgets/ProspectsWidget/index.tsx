import { ReactNode } from "react";
import Card from "@/shared/components/Card";
import COPYWRITING from "@/shared/copywriting.json";
import ProspectProfile from "./ProspectProfile";

const ProspectsWidget = () => {
  return (
    <Card classes="">
      <div className="flex items-center">
        <p className="grow text-xl">{COPYWRITING.dashboard.prospect_title}</p>
        <p className="text-sm">date dropdown here</p>
      </div>
      {[1].map((_, idx) => {
        return <ProspectProfile key={idx} />;
      })}
    </Card>
  );
};

export default ProspectsWidget;
