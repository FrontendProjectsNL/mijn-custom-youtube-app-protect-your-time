import React, { useState, useEffect } from "react";
import axios from "axios";
import cheerio from "cheerio";
import download from "downloadjs";

const WebScraper: React.FC = () => {
  const [audioLinks, setAudioLinks] = useState<string[]>([]);

//   const targetURL: string = "https://howjsay.com/a?page=2";
const targetURL = "http://localhost:3001/api/fetchData";

useEffect(() => {
    const fetchAudioLinks = async () => {
      try {
        const response = await axios.get(targetURL);
        const html = response.data;
        const $ = cheerio.load(html);
  
        const audioLinksArray: string[] = [];
        $("audio").each((_index, element) => {
          const audioLink = $(element).attr("src");
          if (audioLink) {
            audioLinksArray.push(audioLink);
          }
        });
  
        setAudioLinks(audioLinksArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchAudioLinks();
  }, []);

  useEffect(() => {
    if (audioLinks.length > 0) {
      handleDownloadAll();
    }
  }, [audioLinks]);
  

  const handleDownload = (audioLink: string) => {
    const fileName: string = audioLink.split("/").pop() || "audio.mp3";
    axios({
      url: audioLink,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const blob = new Blob([response.data], { type: "audio/mpeg" });
        download(blob, fileName);
      })
      .catch((error) => {
        console.error("Error downloading audio:", error);
      });
  };
  

  const handleDownloadAll = () => {
    console.log("Downloading all audios:", audioLinks);

    audioLinks.forEach((audioLink) => {
      handleDownload(audioLink);
    });
  };

  return (
    <div>
      <h1>Extracted Audio Links:</h1>
      <ul>
        {audioLinks.map((audioLink, index) => (
          <li key={index}>
            <audio controls>
              <source src={audioLink} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button onClick={() => handleDownload(audioLink)}>Download</button>
          </li>
        ))}
      </ul>
      <button onClick={handleDownloadAll}>Download All</button>
    </div>
  );
};

export default WebScraper;
