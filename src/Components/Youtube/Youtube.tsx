import { useState, useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";
import "./Youtube.css";

const apiKey = "AIzaSyAohGQyp_2FKsqEcIY3-BH9hCtLZk3PGqY";
const totalResults = 80; // Set the total number of results
const resultsPerPage = 40; // Set 20 results per page

export const Youtube = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOption, setFilterOption] = useState("any");
  const [sortOption, setSortOption] = useState("relevance");
  const [isVideoEmbedded, setIsVideoEmbedded] = useState(false);

  const resultsContainerRef = useRef(null);
  const paginationContainerRef = useRef(null);
  const embedContainerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    fetchSearchResults();
  }, [currentPage, filterOption, sortOption]);

  const fetchSearchResults = () => {
    const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&maxResults=${totalResults}&key=${apiKey}&order=${sortOption}&publishedAfter=${getDateFilter()}`;

    fetch(requestUrl)
      .then((response) => response.json())
      .then((data) => {
        const items = data.items || [];
        const videoIds = items.map((item) => item.id.videoId).join(",");

        if (videoIds) {
          // Fetch additional video details using the video IDs
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`;

          fetch(detailsUrl)
            .then((response) => response.json())
            .then((detailsData) => {
              const resultsWithDetails = items.map((item) => {
                const videoDetail = detailsData.items.find((detail) => detail.id === item.id.videoId);
                return {
                  id: item.id,
                  snippet: item.snippet,
                  duration: videoDetail.contentDetails.duration,
                };
              });

              setSearchResults(resultsWithDetails); // Add the video details to the searchResults state
            })
            .catch((error) => console.log("Error fetching video details:", error));
        } else {
          setSearchResults([]); // No video IDs found, set empty array
        }
      })
      .catch((error) => console.log("Error fetching search results:", error));
  };


  const getDateFilter = () => {
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
  };

  const handleSearch = () => {
    fetchSearchResults();
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePagination = (page) => {
    setCurrentPage(page);
  };


  const handleEmbedVideo = (videoId) => {
    setIsVideoEmbedded(true);
    embedContainerRef.current.style.display = "block";
    paginationContainerRef.current.style.display = "none";

    // Use the YouTube Player API to embed and control the video
    playerRef.current = YouTubePlayer(embedContainerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
    });

    playerRef.current.playVideo();
  };

  const handleBackButtonClick = () => {
    setIsVideoEmbedded(false);
    embedContainerRef.current.style.display = "none";
    paginationContainerRef.current.style.display = "block";

    // Stop and remove the YouTube player when going back to the search results
    if (playerRef.current) {
      playerRef.current.stopVideo();
      playerRef.current.destroy();
      playerRef.current = null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toDateString();
  };

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
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

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);


  return (
    <div className="youtube-container">
       <div className="search-container">
      <input
        type="text"
        placeholder="Enter your search query"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
    <div className="filter-container">
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
    {!isVideoEmbedded && (
      <div ref={resultsContainerRef} id="resultsContainer">
        {searchResults.length > 0 ? (
          searchResults.slice(startIndex, endIndex).map((item) => (
            <div key={item.id.videoId} className="result-item" onClick={() => handleEmbedVideo(item.id.videoId)}>
              <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
              <div className="title">{item.snippet.title}</div>
              <div className="upload-date">Uploaded: {formatDate(item.snippet.publishedAt)}</div>
              <div className="duration">Duration: {formatDuration(item.duration)}</div>
            </div>
          ))
        ) : (
          <div className="no-results">No results found.</div>
        )}
      </div>
    )}
    {!isVideoEmbedded && (
      <div ref={paginationContainerRef} id="paginationContainer">
        <div className="pagination">
          {Array.from({ length: Math.ceil(searchResults.length / resultsPerPage) }, (_, index) => (
            <a
              key={index + 1}
              href="#"
              onClick={() => handlePagination(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </a>
          ))}
        </div>
      </div>
    )}
    {/* Container for the embedded video */}
    <div ref={embedContainerRef} className="embed-container" style={{ display: isVideoEmbedded ? "block" : "none" }}>
      <button onClick={handleBackButtonClick}>Back</button>
    </div>
  </div>
);
  }
