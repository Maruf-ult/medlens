"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideOn = ["/chat", "/app"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;
  return <Footer />;
}