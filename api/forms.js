import { 
  withMongoDB, 
  getFormsCollection, 
  getSettingsCollection, 
  initializeDefaultSettings 
} from './mongodb.js';

// Function to append form data to Google Sheet using Google Apps Script
async function appendToTrackingSheet(formData) {
  try {
    const trackingSheetUrl = process.env.FORM_TRACKING_SHEET_URL;
    
    console.log("Attempting to append to Google Sheet:");
    console.log("Tracking Sheet URL:", trackingSheetUrl ? "SET" : "NOT SET");
    console.log("Form Data:", formData);
    
    if (!trackingSheetUrl) {
      console.log("Tracking sheet URL not configured, skipping sheet update");
      return;
    }

    // Extract sheet ID from the Google Sheet URL
    const sheetIdMatch = trackingSheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      console.error("Invalid Google Sheet URL format");
      return;
    }
    
    const sheetId = sheetIdMatch[1];
    console.log("Extracted Sheet ID:", sheetId);
    
    // Prepare the data in the required format: Timestamp, Form Name, Form Link, Responses Link
    const timestamp = new Date().toLocaleString();
    const values = [
      [timestamp, formData.name, formData.url, formData.sheetUrl || ""]
    ];
    
    console.log("Prepared values:", values);
    
    // Use Google Apps Script Web App to append data (this bypasses OAuth requirements)
    // First, we need to create a Google Apps Script web app
    const webAppUrl = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
    
    if (webAppUrl) {
      console.log("Using Google Apps Script Web App");
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId: sheetId,
          values: values
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to append to Google Sheet via Apps Script:", errorData);
      } else {
        const successData = await response.text();
        console.log("Successfully appended form data to tracking sheet:", successData);
      }
    } else {
      console.log("Google Apps Script Web App URL not configured. Please set GOOGLE_APPS_SCRIPT_WEB_APP_URL environment variable.");
      console.log("For now, logging the data that would be written:");
      console.log("Sheet ID:", sheetId);
      console.log("Data:", values);
    }
  } catch (error) {
    console.error("Error appending to tracking sheet:", error);
  }
}

// MongoDB database operations
async function readDatabase() {
  return await withMongoDB(async () => {
    await initializeDefaultSettings();
    
    const formsCollection = await getFormsCollection();
    const settingsCollection = await getSettingsCollection();
    
    const forms = await formsCollection.find({}).sort({ createdAt: 1 }).toArray();
    const settings = await settingsCollection.findOne({ _id: 'app_settings' });
    
    return {
      forms: forms || [],
      settings: settings || {
        currentFormIndex: 0,
        qrRefreshInterval: 5000,
        autoRefreshEnabled: true,
      },
      sessions: [],
      attendance: [],
    };
  });
}

async function writeDatabase(data) {
  return await withMongoDB(async () => {
    const formsCollection = await getFormsCollection();
    const settingsCollection = await getSettingsCollection();
    
    // Update forms
    if (data.forms) {
      // Clear existing forms and insert new ones
      await formsCollection.deleteMany({});
      if (data.forms.length > 0) {
        await formsCollection.insertMany(data.forms);
      }
    }
    
    // Update settings
    if (data.settings) {
      await settingsCollection.updateOne(
        { _id: 'app_settings' },
        { 
          $set: { 
            ...data.settings, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
    }
    
    return true;
  });
}

export default async function handler(req, res) {
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
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
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

async function handleGet(req, res) {
  try {
    const db = await readDatabase();
    res.status(200).json({
      success: true,
      forms: db.forms,
      settings: db.settings,
    });
  } catch (error) {
    console.error("Error in handleGet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve data from database",
    });
  }
}

async function handlePost(req, res) {
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

  try {
    const newForm = {
      id: Date.now(),
      name: String(name).trim(),
      url: String(url).trim(),
      sheetUrl: sheetUrl ? String(sheetUrl).trim() : "",
      createdAt: new Date(),
      isActive: true,
    };

    const success = await withMongoDB(async () => {
      const formsCollection = await getFormsCollection();
      const settingsCollection = await getSettingsCollection();
      
      // Get current form count for index calculation (much faster than fetching all forms)
      const formCount = await formsCollection.countDocuments();
      
      // Set all other forms to inactive
      await formsCollection.updateMany({}, { $set: { isActive: false } });
      
      // Insert the new form as active
      await formsCollection.insertOne(newForm);
      
      // Update settings with calculated index (no need to fetch all forms)
      await settingsCollection.updateOne(
        { _id: 'app_settings' },
        { 
          $set: { 
            currentFormIndex: formCount, // New form will be at this index
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );
      
      return true;
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        error: "Failed to save form to database",
      });
    }

    // Append form data to tracking sheet (non-blocking)
    appendToTrackingSheet(newForm).catch(error => {
      console.error("Failed to update tracking sheet:", error);
    });

    res.status(201).json({
      success: true,
      form: newForm,
      message: "Form added successfully",
    });
  } catch (error) {
    console.error("Error in handlePost:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add form to database",
    });
  }
}

async function handlePut(req, res) {
  const { id, action, ...data } = req.body || {};

  try {
    if (action === "setActive") {
      const success = await withMongoDB(async () => {
        const formsCollection = await getFormsCollection();
        const settingsCollection = await getSettingsCollection();
        
        const form = await formsCollection.findOne({ id: id });
        if (!form) {
          throw new Error("Form not found");
        }

        // Update all forms to set isActive to false
        await formsCollection.updateMany({}, { $set: { isActive: false } });
        
        // Set the selected form as active
        await formsCollection.updateOne({ id: id }, { $set: { isActive: true } });
        
        // Calculate form index efficiently - count forms created before this one
        const formIndex = await formsCollection.countDocuments({ 
          createdAt: { $lt: form.createdAt } 
        });
        
        await settingsCollection.updateOne(
          { _id: 'app_settings' },
          { 
            $set: { 
              currentFormIndex: formIndex,
              updatedAt: new Date() 
            } 
          },
          { upsert: true }
        );
        
        return true;
      });

      if (!success) {
        return res.status(500).json({
          success: false,
          error: "Failed to update active form",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Active form updated",
      });
    }

    if (action === "updateSettings") {
      const success = await withMongoDB(async () => {
        const settingsCollection = await getSettingsCollection();
        await settingsCollection.updateOne(
          { _id: 'app_settings' },
          { 
            $set: { 
              ...data, 
              updatedAt: new Date() 
            } 
          },
          { upsert: true }
        );
        return true;
      });

      if (!success) {
        return res.status(500).json({
          success: false,
          error: "Failed to update settings",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Settings updated",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Invalid action",
    });
  } catch (error) {
    console.error("Error in handlePut:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update data",
    });
  }
}

async function handleDelete(req, res) {
  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Form ID is required",
    });
  }

  try {
    const result = await withMongoDB(async () => {
      const formsCollection = await getFormsCollection();
      const settingsCollection = await getSettingsCollection();
      
      const form = await formsCollection.findOne({ id: parseInt(id, 10) });
      if (!form) {
        throw new Error("Form not found");
      }

      // Delete the form
      await formsCollection.deleteOne({ id: parseInt(id, 10) });
      
      // Update current form index if needed
      const remainingForms = await formsCollection.find({}).sort({ createdAt: 1 }).toArray();
      const currentSettings = await settingsCollection.findOne({ _id: 'app_settings' });
      
      if (currentSettings && currentSettings.currentFormIndex >= remainingForms.length) {
        const newIndex = Math.max(0, remainingForms.length - 1);
        await settingsCollection.updateOne(
          { _id: 'app_settings' },
          { 
            $set: { 
              currentFormIndex: newIndex,
              updatedAt: new Date() 
            } 
          }
        );
      }
      
      return form;
    });

    res.status(200).json({
      success: true,
      message: "Form removed successfully",
      removedForm: result,
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove form from database",
    });
  }
}
