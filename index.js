import { Client } from "@gradio/client";
import express from "express"; // Import the Express.js framework
import { fileURLToPath } from "url"; // Import a utility function to convert file URLs to paths
import path from "path"; // Import the Path module for working with file paths
import cors from "cors";

const __filename = fileURLToPath(import.meta.url); // Get the current file's path
const __dirname = path.dirname(__filename); // Get the current file's directory path

const app = express(); // Create a new Express.js application
const port = process.env.PORT || 3600; // Set the port to use for the server (default: 3000)

// CORS Configuration (Only allow your specific frontend origin)
const corsOptions = {
  origin: "https://letcreationguideyou.w3spaces.com",
  methods: ["GET", "POST"], // Adjust methods as needed
  allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers
};

app.use(cors(corsOptions));

// API Endpoint
app.get("/generate/:prompt/:style", cors(), async (req, res) => {

  try {
    const prompt = decodeURIComponent(req.params.prompt);
    const style = decodeURIComponent(req.params.style);
    const imageUrls = await generateImageUrls(prompt, false, style, 1024, 1024);
    console.log(imageUrls);
    res.json({ imageUrls });
  } catch (error) {
    console.error("Error generating or handling image URLs: ", error);
    res.status(500).json({ error: "Image generation failed." });
  }
});

// Used to keep this awake
app.use("/myping", (req, res) => {
  // Define a keep-alive endpoint
  res.send("Ping!"); // Send a response to keep the server alive
});

app.listen(port, () => {
  // Start the server and listen on the specified port
  console.log(`Server running on port ${port}`); // Log a message to the console when the server starts
});

async function generateImageUrls(_prompt, _negativeP, _style, _width, _height) {
  try {
    const client = await Client.connect("prithivMLmods/DALLE-4K");
    console.log(_prompt, _style);
    const result = await client.predict("/run", {
      prompt: _prompt,
      negative_prompt: _negativeP,
      use_negative_prompt: _negativeP,
      style: _style,
      seed: 0,
      width: _width,
      height: _height,
      guidance_scale: 6,
      randomize_seed: true,
    });

    console.log("Raw result:", result); // Log for debugging

    // Error handling: check for image data
    if (!result.data || !result.data[0] || !result.data[0].length) {
      throw new Error("No image data found in the response.");
    }

    const imageUrls = result.data[0].map((item) => item.image.url); // Get image URLs

    return imageUrls; // Return the array of image URLs
  } catch (error) {
    console.error("Error generating image URLs:", error);
    return []; // Return an empty array in case of errors
  }
}
