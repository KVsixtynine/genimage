import { Client } from "@gradio/client";
import express from "express";
import cors from "cors";

const app = express();

// CORS Configuration - Open for all origins (adjust if needed)
app.use(cors());

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

// Keep-Alive Ping 
app.use("/myping", (req, res) => {
  res.send("Ping!");
});

// Function to generate image URLs
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

    console.log("Raw result:", result); 

    if (!result.data || !result.data[0] || !result.data[0].length) {
      throw new Error("No image data found in the response.");
    }

    const imageUrls = result.data[0].map((item) => item.image.url); 
    return imageUrls;
  } catch (error) {
    console.error("Error generating image URLs:", error);
    return [];
  }
}

// Export for Vercel
export default app;
