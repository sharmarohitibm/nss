import { Calender } from "../components";
import Kebab from "../shared/components/Kebab";
import Card from "../shared/components/Card";
import ProspectsWidget from "./components/widgets/ProspectsWidget";

export default function Dashboard() {
  return (
    <div className="flex grow">
      <div className="flex grow flex-col px-10 py-8">
        <div className="flex pb-8">
          <p className="grow text-4xl">Dashboard</p>
          <div>filter here</div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-8">
          <Card classes="col-span-2">asd</Card>
          <ProspectsWidget />
          <Card classes="">asd3</Card>
        </div>
      </div>
      <div className="w-3/12 min-w-80 bg-white p-8 shadow-[0_0_5px_0_rgba(0,0,0,0.1)]">
        <Calender />
        <Kebab />
      </div>
    </div>
  );
}
