"use client";
import { useEffect, useState } from "react";
import { useSelectedLayoutSegment } from 'next/navigation';
import Appbar from "~/components/appbar";
import NarrowSideBar from "~/components/narrowsidebar";


export default function Template({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  useEffect(() => {
    if (segment === null) {
    }
    return () => {
    }
  }, []);
  return <>
    <Appbar />
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Narrow sidebar*/}
      <NarrowSideBar />
      <main className="h-full min-w-0 flex-1 border-t border-gray-200 xl:flex w-full">
        {children}
      </main>
    </div>
  </>;
}