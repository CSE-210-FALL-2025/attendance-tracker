import fs from "fs";
import path from "path";

// Use /tmp directory for serverless environments like Vercel
const dbPath = path.join("/tmp", "db.json");

function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (_err) {
    // If /tmp/db.json doesn't exist, try to read from the original db.json
    // and copy it to /tmp for future operations
    try {
      const originalDbPath = path.join(process.cwd(), "db.json");
      const originalData = fs.readFileSync(originalDbPath, "utf8");
      const db = JSON.parse(originalData);

      // Copy to /tmp for future writes
      writeDatabase(db);
      return db;
    } catch (_originalErr) {
      // If original db.json doesn't exist either, return default structure
      return {
        forms: [],
        settings: {
          currentFormIndex: 0,
          qrRefreshInterval: 5000,
          autoRefreshEnabled: true,
        },
        sessions: [],
        attendance: [],
      };
    }
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (_err) {
    return false;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      case "PUT":
        return handlePut(req, res);
      case "DELETE":
        return handleDelete(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res
          .status(405)
          .json({ success: false, error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

function handleGet(req, res) {
  const db = readDatabase();
  res.status(200).json({
    success: true,
    forms: db.forms,
    settings: db.settings,
  });
}

function handlePost(req, res) {
  const { name, url, sheetUrl } = req.body || {};

  if (!name || !url) {
    return res.status(400).json({
      success: false,
      error: "Form name and URL are required",
    });
  }

  try {
    new URL(url);
    if (sheetUrl) new URL(sheetUrl);
  } catch (_e) {
    return res.status(400).json({
      success: false,
      error: "Please provide valid URLs",
    });
  }

  const db = readDatabase();
  const newForm = {
    id: Date.now(),
    name: String(name).trim(),
    url: String(url).trim(),
    sheetUrl: sheetUrl ? String(sheetUrl).trim() : "",
    createdAt: new Date().toISOString(),
    isActive: false,
  };

  db.forms.push(newForm);

  if (!writeDatabase(db)) {
    return res.status(500).json({
      success: false,
      error: "Failed to save form to database",
    });
  }

  res.status(201).json({
    success: true,
    form: newForm,
    message: "Form added successfully",
  });
}

function handlePut(req, res) {
  const { id, action, ...data } = req.body || {};
  const db = readDatabase();

  if (action === "setActive") {
    const formIndex = db.forms.findIndex((f) => f.id === id);
    if (formIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Form not found",
      });
    }

    db.forms.forEach((f, idx) => {
      f.isActive = idx === formIndex;
    });
    db.settings.currentFormIndex = formIndex;

    if (!writeDatabase(db)) {
      return res.status(500).json({
        success: false,
        error: "Failed to update active form",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active form updated",
      currentForm: db.forms[formIndex],
    });
  }

  if (action === "updateSettings") {
    db.settings = { ...db.settings, ...data };
    if (!writeDatabase(db)) {
      return res.status(500).json({
        success: false,
        error: "Failed to update settings",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Settings updated",
      settings: db.settings,
    });
  }

  return res.status(400).json({
    success: false,
    error: "Invalid action",
  });
}

function handleDelete(req, res) {
  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Form ID is required",
    });
  }

  const db = readDatabase();
  const idx = db.forms.findIndex((f) => f.id === parseInt(id, 10));

  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: "Form not found",
    });
  }

  const removedForm = db.forms.splice(idx, 1)[0];

  if (db.settings.currentFormIndex >= db.forms.length) {
    db.settings.currentFormIndex = Math.max(0, db.forms.length - 1);
  }

  if (!writeDatabase(db)) {
    return res.status(500).json({
      success: false,
      error: "Failed to remove form from database",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Form removed successfully",
    removedForm,
  });
}
