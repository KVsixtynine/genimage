import { Client } from "@gradio/client";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// CORS Configuration (Only allow your specific frontend origin)
const corsOptions = {
  origin: "https://huggingface.co/spaces/kevin666444/imagen",
  methods: ["GET", "POST"], // Adjust methods as needed
  allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers
};

const app = express(); // Create a new Express.js application
app.use(cors(corsOptions));
const port = process.env.PORT || 7860;

app.use(express.static(path.join(__dirname, "/")));
app.use(express.json()); // Parse JSON request bodies

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/generate/:prompt/:style", async (req, res) => {
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


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
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





/**
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
 */
