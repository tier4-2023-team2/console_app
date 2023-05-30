"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import Link from "next/link";

import { get_locale } from "~/app/locale";

export default function Sidebar() {
  const locale = get_locale();
  const [clustered_data, set_clustered_data] = useState([]);
  const get_thresholds = async () => {
    const res_cluster_list = await axios.get('https://decotech-cppoc-public.s3.ap-northeast-1.amazonaws.com/thresholds.json');
    const cluster = res_cluster_list.data[5];
    const response = await axios.get(`https://decotech-cppoc-public.s3.ap-northeast-1.amazonaws.com/${cluster.file_name}`);

    const cluster_no_list = [...new Set(response.data.map((ele) => {
      return ele.cluster_no;
    }))];

    let list = [];
    for (var i of cluster_no_list) {
      const tmp = response.data.filter((ele) => {
        return (ele.cluster_no === i);
      })
      const data = tmp.sort((a, b) => {
        const day_a = dayjs(a.date);
        const day_b = dayjs(b.date);
        const diff = day_a.diff(day_b);
        if (diff > 0) {
          return 1;
        } else if (diff < 0) {
          return -1;
        }
        return 0;
      })
      list.push({
        cluster_no: i,
        children: data
      })
    }
    set_clustered_data(list)
  }
  useEffect(() => {
    get_thresholds();
  }, []);
  return (<>
    <div className={`relative flex h-full xl:w-96 flex-col border-r border-gray-200 bg-gray-100`}>
      <div className="flex-shrink-0">
        <div className="flex h-16 flex-col justify-center bg-white px-6">
          <div className="flex items-baseline space-x-3">
            <h2 className="text-lg font-medium text-gray-900">Inbox</h2>
            <p className="text-sm font-medium text-gray-500">{clustered_data.length} Cluster</p>
          </div>
        </div>
        <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm font-medium text-gray-500">
          Sorted by date
        </div>
      </div>
      <nav aria-label="Message list" className="min-h-0 flex-1 overflow-y-auto">
        <ul role="list" className="divide-y divide-gray-200 border-b border-gray-200">
          {clustered_data.map((cluster, idx) => {
            return (
              <li
                key={`cluster_${idx}`}
                className="relative bg-white py-5 px-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 hover:bg-gray-50"
              >
                <div className="flex justify-between space-x-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/${locale}/article/${idx}`} className="block focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="truncate text-sm font-medium text-gray-900">
                        {`cluster title[${idx}]`}
                      </p>
                      <p className="truncate text-sm text-gray-500">

                        {`cluster no :${cluster.children[0].cluster_no}`}
                      </p>
                    </Link>
                  </div>
                  {/* <time
                      dateTime={"message.datetime"}
                      className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500"
                    >
                      {"message.date"}
                    </time> */}
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {`cluster size :${cluster.children.length}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  </>);
}