import React, { useEffect } from "react";
import { useRouter } from "next/router";

const Winloss: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
};

export default Winloss;
