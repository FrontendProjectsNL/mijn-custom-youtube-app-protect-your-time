import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import ReactPlayer from "react-player";
import "./Youtube.css";

// ****************************************************************************
// !!!!! Controleer of alle comments grammaticaal (engels) kloppen!!!!!
// ****************************************************************************


const apiKey = "AIzaSyC4posUPygqWuA4DDmDYXg2mr34Othn0Zg";
// const apiKey = "AIzaSyAC24p-7mdNUtORivgikdrVO0Q8KnmIBJ4";
// const apiKey = "AIzaSyAH79Uk0Sq41I3-GCVnYH2IYE3kfoPQFCU";
const totalResults = 80; // Set the total number of results
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
// Define your own Options type

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

  const [wordsArray, setWordsArray] = useState([]);



  // const delay = 3000; 

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  let blockedKeywords = ["ufc", "mma", "common man show", "common man", "common show", "tribal people", "reactistan" ,"novice squad", "telegraaf", "ad", "nos", "pow", "nieuws", "news", "Iran international", "CNN", "FOX", "FoxNews", "ParsTV", "Pars TV", "Iran", "Shahram Homayoun", "Channel One", "ChannelOne"];

  // create array from porn keywords:

  useEffect(() => {
    async function fetchTextFile() {
      try {
        const response = await fetch('AllPornKeywords.txt');
        if (!response.ok) {
          throw new Error('Failed to fetch the file');
        }
        const fileContent = await response.text();

        // Split the content into an array of words
        const wordsArray = fileContent.split(/\s+/);

        // Clean up the words (remove punctuation and special characters if needed)
        const cleanedWords = wordsArray.map((word) =>
          word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase()
        );

        setWordsArray(cleanedWords);
      } catch (error) {
        console.error('Error reading the file:', error);
        setWordsArray([]);
      }
    }

    fetchTextFile();
  }, []);



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

  // const fetchSearchResults = useCallback(() => {
  //   const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${searchQuery}&maxResults=${totalResults}&key=${apiKey}&order=${sortOption}&publishedAfter=${getDateFilter()}`;
  
  //   fetch(requestUrl)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const items = data.items || [];
  //       const videoIds: string[] = items.map((item: VideoItem) => item.id.videoId);
  
  //       if (videoIds.length > 0) {
  //         // Fetch additional video details using the video IDs
  //         const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
  
  //         fetch(detailsUrl)
  //           .then((response) => response.json())
  //           .then((detailsData) => {
  //             const resultsWithDetails = items.map((item: VideoItem) => {
  //               const videoDetail = detailsData.items.find((detail: DetailItem) => detail.id === item.id.videoId);
  //               return {
  //                 id: item.id,
  //                 snippet: item.snippet,
  //                 duration: videoDetail?.contentDetails?.duration || "N/A",
  //                 viewCount: videoDetail?.statistics?.viewCount ? parseInt(videoDetail.statistics.viewCount) : 0,
  //               };
  //             });
  
  //             setSearchResults(resultsWithDetails);
  //             setIsFetching(false); // Set isFetching to false after successfully fetching data

  //             // Reset the state that tracks user videos to hide the list of user-videos
  //           setShowUserVideos(false);
  //           setUploaderVideos([]);
  //           setSelectedChannelId("");

  //           })
  //           .catch((error) => {
  //             console.log("Error fetching video details:", error);
  //             setIsFetching(false); // Set isFetching to false after error
  //           });
  //       } else {
  //         setSearchResults([]); // No video IDs found, set empty array
  //         setIsFetching(false); // Set isFetching to false as there are no results

  //         // Reset the state that tracks user videos to hide the list of user-videos
  //       setShowUserVideos(false);
  //       setUploaderVideos([]);
  //       setSelectedChannelId("");
        
  //       }
  //     })
  //     .catch((error) => { 
  //       console.log("Error fetching search results:", error);
  //       setIsFetching(false);
  //     });
  // }, [currentPage, filterOption, sortOption, searchQuery, getDateFilter]);
  
//to make my api key secure I changed my previous fetchSearchResults (see code above) to this:
 
const fetchSearchResults = useCallback(async () => {
  try {
    const apiKeyParam = `key=${apiKey}`;
    const searchQueryParam = `q=${encodeURIComponent(searchQuery)}`;
    const maxResultsParam = `maxResults=${totalResults}`;
    const orderParam = `order=${sortOption}`;
    const publishedAfterParam = `publishedAfter=${getDateFilter()}`;

    const baseRequestUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video";
    const requestUrl = `${baseRequestUrl}&${searchQueryParam}&${maxResultsParam}&${orderParam}&${publishedAfterParam}&${apiKeyParam}`;

    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok (status ${response.status})`);
    }

    const data = await response.json();
    const items = data.items || [];
    const videoIds: string[] = items.map((item: VideoItem) => item.id.videoId);

    if (videoIds.length > 0) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) {
        throw new Error(`Network response for video details was not ok (status ${detailsResponse.status})`);
      }

      const detailsData = await detailsResponse.json();
      const resultsWithDetails = items.map((item: VideoItem) => {
        const videoDetail = detailsData.items.find((detail: DetailItem) => detail.id === item.id.videoId);
        return {
          id: item.id,
          snippet: item.snippet,
          duration: videoDetail?.contentDetails?.duration || "N/A",
          viewCount: videoDetail?.statistics?.viewCount ? parseInt(videoDetail.statistics.viewCount) : 0,
        };
      });

      setSearchResults(resultsWithDetails);
      setIsFetching(false); // Set isFetching to false after successfully fetching data

      // Reset the state that tracks user videos to hide the list of user-videos
      setShowUserVideos(false);
      setUploaderVideos([]);
      setSelectedChannelId("");
    } else {
      setSearchResults([]); // No video IDs found, set empty array
      setIsFetching(false); // Set isFetching to false as there are no results

      // Reset the state that tracks user videos to hide the list of user-videos
      setShowUserVideos(false);
      setUploaderVideos([]);
      setSelectedChannelId("");
    }
  } catch (error) {
    console.log("Error fetching search results:", error);
    setIsFetching(false);
  }
}, [sortOption, getDateFilter, searchQuery]);


 // Debounce the search query
//  useEffect(() => {
//   const timeoutId = setTimeout(() => {
//     setDebouncedSearchQuery(searchQuery);
//   }, delay);

//   // Clear the previous timeout if the search query changes within the delay
//   return () => clearTimeout(timeoutId);
// }, [searchQuery]);



// Fetch data from YouTube when debouncedSearchQuery or searchButtonClicked changes
// useEffect(() => {
//   if (debouncedSearchQuery && searchButtonClicked) {
//     setIsFetching(true);
//     fetchSearchResults();
//     setSearchButtonClicked(false); // Reset the search button click state after triggering the search
//   } else {
//     // If the debouncedSearchQuery becomes empty or the search button is not clicked,
//     // reset the video embedded state and selected video id
//     setIsFetching(false);
//     setIsVideoEmbedded(false);
//     setSelectedVideoId("");
//   }
// }, [debouncedSearchQuery, fetchSearchResults, searchButtonClicked]);

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


  const handleSearch = () => {
    setCurrentPage(1);
    setIsVideoEmbedded(false); // Reset video embedded state
    setSelectedVideoId(""); // Reset selected video id
    // setShowUserVideos(false); // Hide user videos when a new search is initiated

    // Set the search button click state to true to trigger the search
    setSearchButtonClicked(true);
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
      // Check if the search query contains blocked keywords
      const lowerCasedQuery = searchQuery.toLowerCase().trim();
      blockedKeywords = [...blockedKeywords, ...wordsArray];
      const containsBlockedKeyword = blockedKeywords.some(keyword =>
        lowerCasedQuery === keyword.toLowerCase()
      );

      if (containsBlockedKeyword) {
        // Display an alert if blocked keyword is found
        alert("The keyword You want to search is blacklisted. Please enter a different search query.");
        return;
      }

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
  
  
  // const fetchUserVideos = async (channelName: string) => {
  //   try {
  //     // Properly encode the channel name by replacing spaces with %20
  //     const encodedChannelName = encodeURIComponent(channelName);
  //     const requestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelType=any&channelId=${encodedChannelName}&maxResults=${totalResults}&key=${apiKey}&order=${sortOption}`;
  
  //     console.log("Request URL:", requestUrl);
  
  //     const response = await fetch(requestUrl);
  //     if (!response.ok) {
  //       throw new Error(`Network response was not ok (status ${response.status})`);
  //     }
  
  //     const data = await response.json();
  //     console.log("Response from YouTube API:", data); // Log the response from the API
  
  //     if (data.items) {
  //       const videoIds: string[] = data.items.map((item: VideoItem) => item.id.videoId);
  
  //       if (videoIds.length > 0) {
  //         const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
  
  //         const detailsResponse = await fetch(detailsUrl);
  //         const detailsData = await detailsResponse.json();
  
  //         const resultsWithDetails = data.items.map((item: VideoItem) => {
  //           const videoDetail = detailsData.items.find((detail: DetailItem) => detail.id === item.id.videoId);
  //           return {
  //             id: item.id,
  //             snippet: item.snippet,
  //             duration: videoDetail?.contentDetails?.duration || "N/A",
  //           };
  //         });
  
  //         setUploaderVideos(resultsWithDetails);
  //       } else {
  //         setUploaderVideos([]);
  //       }
  //     } else {
  //       setUploaderVideos([]);
  //     }
  //   } catch (error) {
  //     console.log("Error fetching videos by uploader:", error);
  //     setUploaderVideos([]);
  //   }
  // };

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
