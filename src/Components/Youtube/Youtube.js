import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactPlayer from "react-player";
import "./Youtube.css";
import { blockedKeywords } from "./blockedwords";
const apiKey = "AIzaSyAH79Uk0Sq41I3-GCVnYH2IYE3kfoPQFCU";
const totalResults = 380; // Set the total number of results
const resultsPerPage = 10; // Set 40 results per page
export const Youtube = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    // const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [isFetching, setIsFetching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOption, setFilterOption] = useState("any");
    const [sortOption, setSortOption] = useState("relevance");
    const [isVideoEmbedded, setIsVideoEmbedded] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState(""); // Add the selectedVideoId state
    // const [userVideos, setUserVideos] = useState<VideoItem[]>([]);
    const [showUserVideos, setShowUserVideos] = useState(false);
    // const [userVideoSortOption, setUserVideoSortOption] = useState<string>("newest");
    const [uploaderVideos, setUploaderVideos] = useState([]);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
    const resultsContainerRef = useRef(null);
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
            const items = data.items || [];
            setSearchResults(items);
            setIsFetching(false);
        }
        catch (error) {
            console.error("Error fetching search results:", error);
            setIsFetching(false);
        }
    }, [searchQuery]);
    useEffect(() => {
        if (searchButtonClicked) {
            setIsFetching(true);
            fetchSearchResults();
            setSearchButtonClicked(false); // Reset the search button click state after triggering the search
        }
        else {
            // If the debouncedSearchQuery becomes empty or the search button is not clicked,
            // reset the video embedded state and selected video id
            setIsFetching(false);
            setIsVideoEmbedded(false);
            setSelectedVideoId("");
        }
    }, [searchButtonClicked, fetchSearchResults]);
    // Helper function to format video duration
    const formatDuration = (duration) => {
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
    function checkForBlockedKeywords(value) {
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
        if (!containsBlockedKeyword) {
            setCurrentPage(1);
            setIsVideoEmbedded(false); // Reset video embedded state
            setSelectedVideoId(""); // Reset selected video id
            // setShowUserVideos(false); // Hide user videos when a new search is initiated
            // Set the search button click state to true to trigger the search
            setSearchButtonClicked(true);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };
    const handlePagination = (page) => {
        setCurrentPage(page);
    };
    const renderPagination = () => {
        const totalPages = Math.ceil(searchResults.length / resultsPerPage);
        const paginationItems = [];
        for (let i = 1; i <= totalPages; i++) {
            paginationItems.push(React.createElement("a", { key: i, href: "#", onClick: () => handlePagination(i), className: currentPage === i ? "active" : "" }, i));
        }
        return paginationItems;
    };
    const handleEmbedVideo = (videoId) => {
        setIsVideoEmbedded(true);
        setSelectedVideoId(videoId);
    };
    const handleUserVideoClick = useCallback(async (channelId, event) => {
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
                const videoIds = data.items.map((item) => item.id.videoId);
                if (videoIds.length > 0) {
                    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
                    const detailsResponse = await fetch(detailsUrl);
                    if (!detailsResponse.ok) {
                        throw new Error(`Network response for video details was not ok (status ${detailsResponse.status})`);
                    }
                    const detailsData = await detailsResponse.json();
                    const resultsWithDetails = data.items.map((item) => {
                        const videoDetail = detailsData.items.find((detail) => detail.id === item.id.videoId);
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
                }
                else {
                    // If there are no videos for the selected channel, reset the states
                    setShowUserVideos(false);
                    setUploaderVideos([]);
                }
            }
            else {
                // If there are no videos for the selected channel, reset the states
                setShowUserVideos(false);
                setUploaderVideos([]);
            }
        }
        catch (error) {
            console.log("Error fetching videos by uploader:", error);
            setShowUserVideos(false);
            setUploaderVideos([]);
        }
    }, [sortOption]);
    // Inside your component function
    // const handleUserVideoSortOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //   const newSortOption = event.target.value;
    //   setUserVideoSortOption(newSortOption);
    //   if (showUserVideos) {
    //     if (newSortOption === 'newest') {
    //       const sortedVideos = [...uploaderVideos].sort((a, b) => {
    //         return new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime();
    //       });
    //       setUploaderVideos(sortedVideos);
    //     } else if (newSortOption === 'popular') {
    //       const sortedVideos = [...uploaderVideos].sort((a, b) => b?.viewCount  - a?.viewCount);
    //       setUploaderVideos(sortedVideos);
    //     }
    //   }
    // };
    const handleBackButtonClick = () => {
        setIsVideoEmbedded(false);
        setSelectedVideoId("");
        setShowUserVideos(false); // Hide user videos
    };
    const handleBackUserVideos = () => {
        setIsVideoEmbedded(false);
        setSelectedVideoId("");
        // setShowUserVideos(true); // Hide user videos
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toDateString();
    };
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);
    return (React.createElement("div", { className: "youtube-container" },
        React.createElement("div", { className: "wrapper" },
            React.createElement("div", { className: "filter-container" },
                React.createElement("label", null,
                    "Filter by:",
                    React.createElement("select", { value: filterOption, onChange: (e) => setFilterOption(e.target.value) },
                        React.createElement("option", { value: "any" }, "Any"),
                        React.createElement("option", { value: "lastWeek" }, "Last Week"),
                        React.createElement("option", { value: "lastMonth" }, "Last Month"),
                        React.createElement("option", { value: "lastYear" }, "Last Year"),
                        React.createElement("option", { value: "short" }, "Short"),
                        React.createElement("option", { value: "medium" }, "Medium"),
                        React.createElement("option", { value: "long" }, "Long"))),
                React.createElement("label", null,
                    "Sort by:",
                    React.createElement("select", { value: sortOption, onChange: (e) => setSortOption(e.target.value) },
                        React.createElement("option", { value: "relevance" }, "Relevance"),
                        React.createElement("option", { value: "date" }, "Date"),
                        React.createElement("option", { value: "viewCount" }, "Views"),
                        React.createElement("option", { value: "rating" }, "Rating"),
                        React.createElement("option", { value: "title" }, "Title"),
                        React.createElement("option", { value: "videoCount" }, "Video Count"),
                        React.createElement("option", { value: "channelCount" }, "Channel Count")))),
            React.createElement("div", { className: "search-container" },
                React.createElement("input", { type: "text", placeholder: "Enter your search query", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: handleKeyPress, className: "search-input" }),
                React.createElement("button", { onClick: handleSearch, className: "search-button" }, "Search"))),
        isFetching && React.createElement("div", { className: "loading" }, "Loading..."),
        !isVideoEmbedded && !showUserVideos && searchResults.length > 0 && (React.createElement("div", { ref: resultsContainerRef, id: "resultsContainer" }, searchResults.length > 0 ? (searchResults.slice(startIndex, endIndex).map((item) => (React.createElement("div", { key: item.id.videoId, className: "result-item", onClick: () => handleEmbedVideo(item.id.videoId) },
            React.createElement("img", { src: item.snippet.thumbnails.medium.url, alt: item.snippet.title }),
            React.createElement("div", { className: "title" }, item.snippet.title),
            React.createElement("div", { className: "upload-date" },
                "Uploaded: ",
                formatDate(item.snippet.publishedAt)),
            React.createElement("div", { className: "duration" },
                "Duration: ",
                formatDuration(item.duration)),
            React.createElement("div", { className: "view-count" },
                "Views: ",
                item.viewCount),
            " ",
            React.createElement("div", { className: "channel-name" },
                "Uploader:",
                React.createElement("button", { className: "uploader-button", onClick: (e) => handleUserVideoClick(item.snippet.channelId, e) }, item.snippet.channelTitle)))))
        // ) : debouncedSearchQuery.trim() !== "" ? (
        //   <div className="no-results">No results found.</div>
        // ) : null
        // }
        ) : searchQuery.trim() !== "" ? (React.createElement("div", { className: "no-results" }, "No results found.")) : null)),
        !isVideoEmbedded && showUserVideos && uploaderVideos.length > 0 && (React.createElement("div", { className: "user-videos" },
            React.createElement("div", { className: "user-videos-header" },
                React.createElement("h2", null,
                    "Videos from ",
                    searchResults[0]?.snippet.channelTitle)),
            React.createElement("div", { className: "wrapper-user-videos" },
                React.createElement("div", { className: "user-videos-list" }, uploaderVideos.map((item) => (React.createElement("div", { key: item.id.videoId, className: "user-video-item", onClick: () => handleEmbedVideo(item.id.videoId) },
                    React.createElement("img", { src: item.snippet.thumbnails.medium.url, alt: item.snippet.title }),
                    React.createElement("div", { className: "user-video-title" }, item.snippet.title),
                    React.createElement("div", { className: "user-video-upload-date" },
                        "Uploaded: ",
                        formatDate(item.snippet.publishedAt)),
                    React.createElement("div", { className: "user-video-duration" },
                        "Duration: ",
                        formatDuration(item.duration)),
                    React.createElement("div", { className: "view-count" },
                        "Views: ",
                        item.viewCount),
                    " ",
                    React.createElement("div", { className: "channel-name-user-videos" },
                        "Uploader: ",
                        item.snippet.channelTitle)))))),
            React.createElement("button", { onClick: handleBackButtonClick }, "Back to Search Results"),
            " ")),
        isVideoEmbedded && (React.createElement("div", { className: "embed-container" },
            React.createElement(ReactPlayer, { url: `https://www.youtube.com/watch?v=${selectedVideoId}`, controls: true, playing: true, 
                // width="1024px"
                // height="576px"
                width: "100%", height: "100%" }),
            React.createElement("div", { className: "wrapper-button" },
                React.createElement("button", { onClick: handleBackButtonClick, className: "back-button" }, "Search Results"),
                showUserVideos && (React.createElement("button", { onClick: handleBackUserVideos, className: "back-button" }, "User Videos"))))),
        !isVideoEmbedded && (React.createElement("div", { id: "paginationContainer" },
            React.createElement("div", { className: "pagination" }, renderPagination())))));
};
