import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import ReactPlayer from "react-player";
import "./Youtube.css";
import { blockedKeywords } from "./blockedwords";

// ****************************************************************************
// !!!!! Controleer of alle comments grammaticaal (engels) kloppen!!!!!
// ****************************************************************************


// const apiKey = "AIzaSyC4posUPygqWuA4DDmDYXg2mr34Othn0Zg";
// const apiKey = "AIzaSyAC24p-7mdNUtORivgikdrVO0Q8KnmIBJ4";
const apiKey = "AIzaSyAH79Uk0Sq41I3-GCVnYH2IYE3kfoPQFCU";
const totalResults = 380; // Set the total number of results
const resultsPerPage = 10; // Set 40 results per page

// Interface for YouTube video item
interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    channelId: string;
    channelTitle: string;
    title: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
  duration: string;
  viewCount?: number;
}

type DetailItem = {
  id: string;
}

export const Youtube: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  // const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterOption, setFilterOption] = useState<string>("any");
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [isVideoEmbedded, setIsVideoEmbedded] = useState<boolean>(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>(""); // Add the selectedVideoId state

  // const [userVideos, setUserVideos] = useState<VideoItem[]>([]);
  const [showUserVideos, setShowUserVideos] = useState<boolean>(false);
  const [userVideoSortOption, setUserVideoSortOption] = useState<string>("newest");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");

  const [uploaderVideos, setUploaderVideos] = useState<VideoItem[]>([]);
  

  const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(false);

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // create array from porn keywords:

  // useEffect(() => {
  //   async function fetchTextFile() {
  //     try {
  //       const response = await fetch('AllPornKeywords.txt');
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch the file');
  //       }
  //       const fileContent = await response.text();

  //       // Split the content into an array of lines
  //       const linesArray = fileContent.split('\n');

  //       // Clean up the lines (if needed)
  //       // You can apply additional cleanup for each line here if required.

  //       setLinesArray(linesArray);
  //     } catch (error) {
  //       console.error('Error reading the file:', error);
  //       setLinesArray([]);
  //     }
  //   }

  //   fetchTextFile(); 
  // }, []);



const fetchSearchResults = useCallback(async () => {
  setIsFetching(true);
  try {
    const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&maxResults=${totalResults}&key=${apiKey}`;

    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch search results (status ${response.status})`);
    }

    const data = await response.json();
    const items: VideoItem[] = data.items || [];
    setSearchResults(items);
    setIsFetching(false);
  } catch (error) {
    console.error("Error fetching search results:", error);
    setIsFetching(false);
  }
}, [searchQuery]);

useEffect(() => {
  if (searchButtonClicked) {
    setIsFetching(true);
    fetchSearchResults();
    setSearchButtonClicked(false); // Reset the search button click state after triggering the search
  } else {
    // If the debouncedSearchQuery becomes empty or the search button is not clicked,
    // reset the video embedded state and selected video id
    setIsFetching(false);
    setIsVideoEmbedded(false);
    setSelectedVideoId("");
  }
}, [searchButtonClicked, fetchSearchResults]);


// Helper function to format video duration
const formatDuration = (duration: string | undefined) => {
  if (!duration) {
    return "Unknown";
  }

  // Regular expression to match ISO 8601 duration format
  const durationRegex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const match = duration.match(durationRegex);

  if (!match) {
    return "Unknown";
  }

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};



 // Function to check if the user input contains any blocked keywords
 function checkForBlockedKeywords(value: string) {
  const lowerCasedInputValue = value.toLowerCase().replace(/\s+/g, ' ').trim();


  for (let i = 0; i < blockedKeywords.length; i++) {
    const blockedKeyword = blockedKeywords[i].toLowerCase();

    if (lowerCasedInputValue.includes(blockedKeyword)) {


        // Display an alert if a blocked keyword is found
        alert(`The keyword ${blockedKeyword} You want to search is blacklisted. Please enter a different search query.`);

      return true;
    }
  }
  return false;
}

  const handleSearch = () => {


      const containsBlockedKeyword = checkForBlockedKeywords(searchQuery);
    

    if(!containsBlockedKeyword) {

      setCurrentPage(1);
    setIsVideoEmbedded(false); // Reset video embedded state
    setSelectedVideoId(""); // Reset selected video id
    // setShowUserVideos(false); // Hide user videos when a new search is initiated

    // Set the search button click state to true to trigger the search
    setSearchButtonClicked(true);
    }


    
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

  const handleUserVideoClick = useCallback(async (channelId: string, event: React.MouseEvent<HTMLButtonElement> | null) => {
    try {
      event?.stopPropagation();
  
      const encodedChannelId = encodeURIComponent(channelId);
      const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${encodedChannelId}&maxResults=${totalResults}&key=${apiKey}&order=${sortOption}`;
  
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok (status ${response.status})`);
      }
  
      const data = await response.json();
      console.log("Response from YouTube API:", data); // Log the response from the API
  
      if (data.items) {
        const videoIds: string[] = data.items.map((item: VideoItem) => item.id.videoId);
  
        if (videoIds.length > 0) {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
  
          const detailsResponse = await fetch(detailsUrl);
          if (!detailsResponse.ok) {
            throw new Error(`Network response for video details was not ok (status ${detailsResponse.status})`);
          }
  
          const detailsData = await detailsResponse.json();
  
          const resultsWithDetails = data.items.map((item: VideoItem) => {
            const videoDetail = detailsData.items.find((detail: DetailItem) => detail.id === item.id.videoId);
            return {
              id: item.id,
              snippet: item.snippet,
              duration: videoDetail?.contentDetails?.duration || "N/A",
              viewCount: videoDetail?.statistics?.viewCount ? parseInt(videoDetail.statistics.viewCount) : 0,
            };
          });
  
          // Update both showUserVideos and uploaderVideos states together
          setShowUserVideos(true);
          setUploaderVideos(resultsWithDetails);
          setSelectedChannelId(channelId);
        } else {
          // If there are no videos for the selected channel, reset the states
          setShowUserVideos(false);
          setUploaderVideos([]);
          setSelectedChannelId("");
        }
      } else {
        // If there are no videos for the selected channel, reset the states
        setShowUserVideos(false);
        setUploaderVideos([]);
        setSelectedChannelId("");
      }
    } catch (error) {
      console.log("Error fetching videos by uploader:", error);
      setShowUserVideos(false);
      setUploaderVideos([]);
      setSelectedChannelId("");
    }
  }, [sortOption]);
  


  const handleUserVideoSortOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserVideoSortOption(event.target.value);
    if (showUserVideos) {
      // Pass both arguments to handleUserVideoClick
      handleUserVideoClick(selectedChannelId, null);
    }
  };

  const handleBackButtonClick = () => {
    setIsVideoEmbedded(false);
    setSelectedVideoId("");
    setShowUserVideos(false); // Hide user videos
  };

  const handleBackUserVideos = () => {
    setIsVideoEmbedded(false);
    setSelectedVideoId("");
    // setShowUserVideos(true); // Hide user videos
  }

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
        {/* {console.log(wordsArray)}
        {console.log("This is just to test whther netlify is updating changes from my github or not")} */}
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

      {!isVideoEmbedded && !showUserVideos && searchResults.length > 0 && (
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
                <div className="view-count">Views: {item.viewCount}</div> {/* Display view count */}
                <div className="channel-name">Uploader: 
                <button
            className="uploader-button"
            onClick={(e) => handleUserVideoClick(item.snippet.channelId, e)}
          >
            {item.snippet.channelTitle}
          </button>
                
                </div>
              </div>
            ))
          // ) : debouncedSearchQuery.trim() !== "" ? (
          //   <div className="no-results">No results found.</div>
          // ) : null
          // }
          ) : searchQuery.trim() !== "" ? (
            <div className="no-results">No results found.</div>
          ) : null
          }
        </div>
      )}

{/* {showUserVideos && userVideos.length > 0 && ( */}
{!isVideoEmbedded && showUserVideos && uploaderVideos.length > 0 && (
        <div className="user-videos">
          <div className="user-videos-header">
            <h2>Videos from {searchResults[0]?.snippet.channelTitle}</h2>
            <label>
              Sort by:
              <select value={userVideoSortOption} onChange={handleUserVideoSortOptionChange}>
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </label>
          </div>
          <div className="wrapper-user-videos">
          <div className="user-videos-list">
            {uploaderVideos.map((item) => (
              <div key={item.id.videoId} className="user-video-item" onClick={() => handleEmbedVideo(item.id.videoId)}>
                <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
                <div className="user-video-title">{item.snippet.title}</div>
                <div className="user-video-upload-date">Uploaded: {formatDate(item.snippet.publishedAt)}</div>
                <div className="user-video-duration">Duration: {formatDuration(item.duration)}</div>
                <div className="view-count">Views: {item.viewCount}</div> {/* Display view count */}
                <div className="channel-name-user-videos">Uploader: {item.snippet.channelTitle}</div>

              </div>
            ))}
          </div>
          </div>
          <button onClick={handleBackButtonClick}>Back to Search Results</button> {/* Back button */}
          
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
          <div className="wrapper-button">
          <button onClick={handleBackButtonClick} className="back-button">Search Results</button>
{showUserVideos &&  (<button onClick={handleBackUserVideos} className="back-button">User Videos</button>)} 
          </div>


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
