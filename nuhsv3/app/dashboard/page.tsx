"use client";

import { Calender } from "../components";
import Kebab from "../shared/components/Kebab";
import Card from "../shared/components/Card";
import ProspectsWidget from "./components/widgets/ProspectsWidget";
import { axiosInstance } from "@/shared/api";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [generalStats, setGeneralStats] = useState(null);
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
      <div className="flex grow flex-col px-10 py-8">
        <div className="flex pb-8">
          <p className="grow text-4xl">Statistics</p>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-8">
          <Card classes="col-span-2">
            {generalStats ? (
              <ol>
                <li>Total users: {}</li>
                <li>Total messages: {}</li>
                <li>Messages received since the last 7 days: {}</li>
                <li>Active users since the last 7 days: {}</li>
                <li>Average messages per user: {}</li>
              </ol>
            ) : (
              "Loading..."
            )}
          </Card>
          {/* <ProspectsWidget /> */}
          <Card classes="">
            <div>
              {faqs && faqs.length > 0
                ? faqs.map((faq) => (
                    <div>
                      <p>Question: {faq.faq}</p>
                      <p>Answer: {faq.answer}</p>
                    </div>
                  ))
                : "Loading..."}
            </div>
          </Card>
          <Card classes="">
            <div>
              {topics && topics.length > 0
                ? topics.map((topic) => (
                    <div>
                      <p>Category: {topic.category}</p>
                      <p>Count: {topic.question_count}</p>
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
