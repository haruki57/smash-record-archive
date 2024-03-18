import React from "react";
import Layout from "@/components/layout";

const About: React.FC = () => {
  return (
    <Layout>
      <div className="m-10">
        <p>
          Smash Record Archive is a website that collects records of offline
          Smash Bros tournaments in Japan prior to the COVID-19 pandemic.
        </p>
        <p>
          This website is currently no longer being updated. For the up-to-date
          results, please see below:
        </p>
        <ul className="m-4">
          <li className="mt-1">
            <a
              href="https://www.ssbwiki.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              SmashWiki
            </a>
          </li>
          <li className="mt-1">
            <a
              href="https://liquipedia.net/smash/Main_Page"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              Liquipedia
            </a>
          </li>
          <li className="mt-1">
            <a
              href="https://smashdata.gg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400"
            >
              SmashData.GG
            </a>
          </li>
        </ul>
      </div>
    </Layout>
  );
};

export default About;
