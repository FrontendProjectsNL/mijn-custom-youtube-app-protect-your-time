const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Allow cross-origin requests from your React app
app.use(cors());

// Proxy endpoint to fetch data from the external website
app.get("/api/fetchData", async (req, res) => {
  try {
    const response = await axios.get("https://howjsay.com/a?page=2");
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Start the server on port 3001 (you can change the port as needed)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
