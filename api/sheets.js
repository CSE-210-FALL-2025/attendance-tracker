import { 
  withMongoDB, 
  getFormsCollection, 
  initializeDefaultSettings 
} from './mongodb.js';

// Get all forms with their Google Sheet links
async function getAllSheets() {
  return await withMongoDB(async () => {
    await initializeDefaultSettings();
    
    const formsCollection = await getFormsCollection();
    const forms = await formsCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    // Filter forms that have sheetUrl and return relevant data
    const sheets = forms
      .filter(form => form.sheetUrl && form.sheetUrl.trim() !== '')
      .map(form => ({
        id: form.id,
        name: form.name,
        sheetUrl: form.sheetUrl,
        createdAt: form.createdAt,
        isActive: form.isActive
      }));
    
    return {
      success: true,
      sheets: sheets
    };
  });
}

export default async function handler(req, res) {
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
    const result = await getAllSheets();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting sheets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Google Sheet links",
    });
  }
}
