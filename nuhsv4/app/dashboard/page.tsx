"use client";

import { Calender } from "../components";
import Kebab from "../shared/components/Kebab";
import Card from "../shared/components/Card";
import ProspectsWidget from "./components/widgets/ProspectsWidget";
import { axiosInstance } from "@/shared/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [faqs, setFaqs] = useState<any>([]);
  const [topics, setTopics] = useState<any>([]);

  const getAllStats = () => {
    getGeneralStats();
    getFaqs();
    getTopics();
  };

  const getGeneralStats = async () => {
    try {
      const response = await axiosInstance.get("/stats");
      const res = response.data;
      setGeneralStats(res);
    } catch (err) {
      console.log("error in statistics page", err);
    }
  };

  const getFaqs = async () => {
    try {
      const response = await axiosInstance.get("/faqs");
      const res = response.data;
      setFaqs(res);
    } catch (err) {
      console.log("error in statistics page", err);
    }
  };

  const getTopics = async () => {
    try {
      const response = await axiosInstance.get("/categories");
      const res = response.data;
      setTopics(res);
    } catch (err) {
      console.log("error in statistics page", err);
    }
  };

  useEffect(() => {
    getAllStats();
  }, []);

  return (
    <div className="flex grow">
      <div className="flex grow flex-col overflow-hidden px-10 py-8">
        <div className="flex pb-8">
          <p className="grow text-4xl">Statistics</p>
        </div>
        {/* <div className="grid grid-cols-2 grid-rows-2 gap-8"> */}
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-8 pb-20">
          <Card classes="col-span-2">
            <p className="pb-4 text-xl font-bold">General Statistics</p>
            {generalStats ? (
              <ol className="flex flex-col gap-6">
                <li>
                  <span className="font-bold">Total users:</span>{" "}
                  {generalStats?.total_users}
                </li>
                <li>
                  <span className="font-bold">Total messages:</span>{" "}
                  {generalStats?.total_messages}
                </li>
                <li>
                  <span className="font-bold">
                    Messages received since the last 7 days:{" "}
                  </span>
                  {generalStats?.new_messages_last_7_days}
                </li>
                <li>
                  <span className="font-bold">
                    Active users since the last 7 days:{" "}
                  </span>
                  {generalStats?.active_users_last_7_days}
                </li>
                <li>
                  <span className="font-bold">Average messages per user: </span>
                  {generalStats?.average_messages_per_user}
                </li>
              </ol>
            ) : (
              "Loading..."
            )}
          </Card>
          {/* <ProspectsWidget /> */}
          <Card classes="overflow-scroll">
            <p className="pb-4 text-xl font-bold">Top FAQs</p>
            <div className="flex flex-col gap-6">
              {faqs && faqs.length > 0
                ? faqs.map((faq) => (
                    <div>
                      <p>
                        <span className="font-bold">Question:</span> {faq.faq}
                      </p>
                      <p>
                        <span className="font-bold">Answer:</span> {faq.answer}
                      </p>
                    </div>
                  ))
                : "Loading..."}
            </div>
          </Card>
          <Card classes="overflow-scroll">
            <p className="pb-4 text-xl font-bold">Top Categories</p>
            <div className="flex flex-col gap-6">
              {topics && topics.length > 0
                ? topics.map((topic) => (
                    <div>
                      <p>
                        <span className="font-bold">Category:</span>{" "}
                        {topic.category}
                      </p>
                      <p>
                        <span className="font-bold">Count:</span>{" "}
                        {topic.question_count}
                      </p>
                    </div>
                  ))
                : "Loading..."}
            </div>
          </Card>
        </div>
      </div>
      {/* <div className="w-3/12 min-w-80 bg-white p-8 shadow-[0_0_5px_0_rgba(0,0,0,0.1)]">
        <Calender />
        <Kebab />
      </div> */}
    </div>
  );
}
