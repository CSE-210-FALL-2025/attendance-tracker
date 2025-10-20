import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { asset } = req.query;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  if (!asset) {
    res.status(400).json({ error: "Asset parameter is required" });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), "public", asset);

    // Security check - ensure the file is within the public directory
    const publicDir = path.join(process.cwd(), "public");
    const resolvedPath = path.resolve(filePath);
    const resolvedPublicDir = path.resolve(publicDir);

    if (!resolvedPath.startsWith(resolvedPublicDir)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(asset).toLowerCase();

    // Set appropriate content type
    let contentType = "text/plain";
    switch (ext) {
      case ".js":
        contentType = "application/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".html":
        contentType = "text/html";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      case ".ico":
        contentType = "image/x-icon";
        break;
    }

    res.setHeader("Content-Type", contentType);
    
    // Disable caching for JavaScript files to ensure updates are reflected immediately
    if (ext === ".js") {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else {
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    }
    
    res.status(200).send(fileContent);
  } catch (error) {
    console.error("Error serving asset:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
