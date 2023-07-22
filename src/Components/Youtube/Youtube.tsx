import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import ReactPlayer from "react-player";
import "./Youtube.css";

const apiKey = "AIzaSyC4posUPygqWuA4DDmDYXg2mr34Othn0Zg";
const totalResults = 80; // Set the total number of results
const resultsPerPage = 40; // Set 40 results per page

// Interface for YouTube video item
interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
  duration: string; // Add the 'duration' property to the VideoItem interface
}

type DetailItem = {
  id: string;
}
// Define your own Options type

export const Youtube: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterOption, setFilterOption] = useState<string>("any");
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [isVideoEmbedded, setIsVideoEmbedded] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>(""); // Add the selectedVideoId state

  const delay = 3000; // 3 seconds delay

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const getDateFilter = useCallback(() => {
    const currentDate = new Date();
    switch (filterOption) {
      case "lastWeek":
        currentDate.setDate(currentDate.getDate() - 7);
        break;
      case "lastMonth":
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "lastYear":
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        break;
    }
    return currentDate.toISOString();
  }, [filterOption]);

  // Wrap fetchSearchResults with useCallback to maintain the same reference
  const fetchSearchResults = useCallback(() => {
      const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&maxResults=${totalResults}&key=${apiKey}&order=${sortOption}&publishedAfter=${getDateFilter()}`;
    
      fetch(requestUrl)
        .then((response) => response.json())
        .then((data) => {
          const items = data.items || [];
          const videoIds: string[] = items.map((item: VideoItem) => item.id.videoId);
    
          if (videoIds.length > 0) {
            // Fetch additional video details using the video IDs
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
    
            fetch(detailsUrl)
              .then((response) => response.json())
              .then((detailsData) => {
                const resultsWithDetails = items.map((item: VideoItem) => {
                  const videoDetail = detailsData.items.find((detail: DetailItem) => detail.id === item.id.videoId);
                  return {
                    id: item.id,
                    snippet: item.snippet,
                    duration: videoDetail?.contentDetails?.duration || "N/A", // Provide a default value if duration is not available
                  };
                });
    
                setSearchResults(resultsWithDetails);
                setIsFetching(false); // Set isFetching to false after successfully fetching data

              })
              .catch((error) => {
                 console.log("Error fetching video details:", error);
                 setIsFetching(false); // Set isFetching to false after error
              });
          } else {
            setSearchResults([]); // No video IDs found, set empty array
            setIsFetching(false); // Set isFetching to false as there are no results
          }
        })
        .catch((error) => console.log("Error fetching search results:", error));
      // ... (same implementation as before)
    }, [currentPage, filterOption, sortOption, searchQuery, getDateFilter]); // Include getDateFilter in the dependency array
  

    // Debounce the search query
  useEffect(() => {

    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, delay);

    // Clear the previous timeout if the search query changes within the delay
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


   // Fetch data from YouTube when debouncedSearchQuery changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsFetching(true);
      fetchSearchResults();
    }
  }, [debouncedSearchQuery]);

  const handleSearch = () => {
    setDebouncedSearchQuery(searchQuery); // Start the debounce process
    setCurrentPage(1);
  };


  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return ""; // Handle the case when match is null
    const hours = parseInt(match[1]?.replace("H", "")) || 0;
    const minutes = parseInt(match[2]?.replace("M", "")) || 0;
    const seconds = parseInt(match[3]?.replace("S", "")) || 0;
    const formattedDuration = [];
    if (hours > 0) {
      formattedDuration.push(`${hours}h`);
    }
    if (minutes > 0) {
      formattedDuration.push(`${minutes}m`);
    }
    if (seconds > 0) {
      formattedDuration.push(`${seconds}s`);
    }
    return formattedDuration.join(" ");
  };


  

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePagination = (page: number) => {
    setCurrentPage(page);
  };
  
  const renderPagination = () => {
    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
    const paginationItems = [];
  
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(
        <a
          key={i}
          href="#"
          onClick={() => handlePagination(i)}
          className={currentPage === i ? "active" : ""}
        >
          {i}
        </a>
      );
    }
  
    return paginationItems;
  };

  const handleEmbedVideo = (videoId: string) => {
    setIsVideoEmbedded(true);
    setSelectedVideoId(videoId);
  };

  const handleBackButtonClick = () => {
    setIsVideoEmbedded(false);
    setSelectedVideoId("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toDateString();
  };

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);

  return (
    <div className="youtube-container">
      <div className="wrapper">
      <div className="filter-container">
        {/* Filter and sort options */}
        <label>
          Filter by:
          <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            <option value="any">Any</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="lastYear">Last Year</option>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
        <label>
          Sort by:
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="viewCount">Views</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
            <option value="videoCount">Video Count</option>
            <option value="channelCount">Channel Count</option>
          </select>
        </label>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter your search query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="search-input" 
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>
      
      </div>
      {isFetching && <div className="loading">Loading...</div>}

      {!isVideoEmbedded && (
        <div ref={resultsContainerRef} id="resultsContainer">
          {searchResults.length > 0 ? (
            searchResults.slice(startIndex, endIndex).map((item) => (
              <div
                key={item.id.videoId}
                className="result-item"
                onClick={() => handleEmbedVideo(item.id.videoId)}
              >
                <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
                <div className="title">{item.snippet.title}</div>
                <div className="upload-date">Uploaded: {formatDate(item.snippet.publishedAt)}</div>
                <div className="duration">Duration: {formatDuration(item.duration)}</div>
              </div>
            ))
          ) : debouncedSearchQuery.trim() !== "" ? (
            <div className="no-results">No results found.</div>
          ) : null
          }
        </div>
      )}
      {isVideoEmbedded && (
        <div className="embed-container">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${selectedVideoId}`}
            controls={true}
            playing={true}
            // width="1024px"
            // height="576px"
            width="100%"
            height="100%"
          />
          <button onClick={handleBackButtonClick} className="back-button">Back</button>
        </div>
      )}
      {!isVideoEmbedded && (
        <div  id="paginationContainer">
          <div className="pagination">
            
          
{renderPagination()}
          </div>
        </div>
      )}
     
    </div>
  );
  
  
};
