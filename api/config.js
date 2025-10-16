export default function handler(req, res) {
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
    // Get Google Sheets API key from environment variables
    // In Vercel: GOOGLE_SHEETS_API_KEY
    // For local development: check for .env.local or fallback
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
      const isLocal = process.env.NODE_ENV !== "production";
      const errorMessage = isLocal
        ? "Google Sheets API key not configured. Please create a .env.local file with GOOGLE_SHEETS_API_KEY=your_api_key. See env.example for reference."
        : "Google Sheets API key not configured. Please set GOOGLE_SHEETS_API_KEY environment variable in your Vercel deployment settings.";

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }

    // Return the configuration with the API key
    res.status(200).json({
      success: true,
      googleSheets: {
        apiKey: apiKey,
      },
      app: {
        name: "CSE 210 Attendance System",
        version: "1.0.0",
        qrRefreshInterval: 5000,
      },
    });
  } catch (error) {
    console.error("Error serving config:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
