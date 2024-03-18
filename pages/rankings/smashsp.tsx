import React, { useEffect } from "react";
import { useRouter } from "next/router";

const RankingsSmashsp: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/rankings");
  }, [router]);
  return null;
};
export default RankingsSmashsp;
