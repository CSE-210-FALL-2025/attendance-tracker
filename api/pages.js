import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { page } = req.query;

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

  try {
    let filePath;

    switch (page) {
      case "admin":
        filePath = path.join(process.cwd(), "public", "admin", "index.html");
        break;
      case "instructor":
        filePath = path.join(
          process.cwd(),
          "public",
          "instructor",
          "index.html"
        );
        break;
      case "student":
      default:
        filePath = path.join(process.cwd(), "public", "index.html");
        break;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const html = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("Error serving page:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
