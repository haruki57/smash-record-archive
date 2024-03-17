import React, { useEffect } from "react";
import Layout from "@/components/layout";
import { useRouter } from "next/router";

const Contact: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, []);
  return null;
};

export default Contact;
