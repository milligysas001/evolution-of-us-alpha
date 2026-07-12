"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorAliasPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return <main className="app"><div className="panel pad">กำลังพากลับหน้าเริ่มเกม...</div></main>;
}
