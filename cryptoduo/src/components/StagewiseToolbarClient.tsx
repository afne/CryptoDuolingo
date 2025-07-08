"use client";
import dynamic from "next/dynamic";
import ReactPlugin from "@stagewise-plugins/react";

const StagewiseToolbar = dynamic(
  () => import("@stagewise/toolbar-next").then(mod => mod.StagewiseToolbar),
  { ssr: false }
);

export default function StagewiseToolbarClient() {
  if (process.env.NODE_ENV !== "development") return null;
  return <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />;
} 