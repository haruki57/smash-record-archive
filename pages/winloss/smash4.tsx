import React, { useEffect } from "react";
import { useRouter } from "next/router";

const Winloss: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, []);
  return null;
};

export default Winloss;
