import React, { useEffect } from "react";
import { useRouter } from "next/router";

const RankingsSmash4: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/rankings");
  }, [router]);
  return null;
};
export default RankingsSmash4;
