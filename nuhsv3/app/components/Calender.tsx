import dayjs from "dayjs";
import COPYWRITING from "@/shared/copywriting.json";

const Calender = () => {
  const startOfMonth = dayjs().startOf("month");
  const endOfMonth = dayjs().endOf("month");

  const getAllDates = () => {
    const value: { type: string; value: number }[][] = [[]];
    const noOfDaysInPrevMonth = startOfMonth.get("day") - 1;
    const endOfDateInPrevMonth = dayjs()
      .subtract(1, "month")
      .endOf("month")
      .get("date");

    let currentDay = -1;

    const addNewWeekIfEndOfWeek = () => {
      if (currentDay < 6) {
        currentDay += 1;
      } else {
        currentDay = 0;
        value.push([]);
      }
    };

    // add days for prev month
    for (let i = noOfDaysInPrevMonth; i >= 0; i--) {
      addNewWeekIfEndOfWeek();
      value[value.length - 1].push({
        type: "prev",
        value: endOfDateInPrevMonth - i,
      });
    }

    // add days for current month
    for (let i = 1; i <= endOfMonth.get("date"); i++) {
      // TODO: input interactive for current month here
      addNewWeekIfEndOfWeek();
      value[value.length - 1].push({ type: "current", value: i });
    }

    // add days for next month
    const noOfDaysInNextMonth = 6 - endOfMonth.get("day");
    for (let i = 1; i <= noOfDaysInNextMonth; i++) {
      addNewWeekIfEndOfWeek();
      value[value.length - 1].push({ type: "next", value: i });
    }
    return value;
  };

  const generateRows = (dates: { type: string; value: number }[]) => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => (
          <div
            key={date.value}
            className={`mb-2 flex justify-center bg-[#E5E9F2] ${date.type === "current" ? "text-[#748AA1]" : "text-[#B8C5D3]"}`}
          >
            {date.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex pb-8">
        <p className="grow text-xl">{COPYWRITING.dashboard.calender_title}</p>
        <p>date here</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="mb-2 flex justify-center">
            {day}
          </div>
        ))}
      </div>
      {getAllDates().map((dates) => generateRows(dates))}
    </div>
  );
};

export default Calender;
