// Vercel serverless function for handling forms
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

// Helper function to read database
function readDatabase() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      forms: [],
      settings: {
        currentFormIndex: 0,
        qrRefreshInterval: 5000,
        autoRefreshEnabled: true
      },
      sessions: [],
      attendance: []
    };
  }
}

// Helper function to write database
function writeDatabase(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Read all forms
function handleGet(req, res) {
  const db = readDatabase();
  res.status(200).json({
    success: true,
    forms: db.forms,
    settings: db.settings
  });
}

// POST - Add new form
function handlePost(req, res) {
  const { name, url, sheetUrl } = req.body;

  // Validate input
  if (!name || !url) {
    return res.status(400).json({
      success: false,
      error: 'Form name and URL are required'
    });
  }

  // Validate URLs
  try {
    new URL(url);
    if (sheetUrl) {
      new URL(sheetUrl);
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Please provide valid URLs'
    });
  }

  const db = readDatabase();
  
  // Create new form
  const newForm = {
    id: Date.now(), // Simple ID generation
    name: name.trim(),
    url: url.trim(),
    sheetUrl: sheetUrl ? sheetUrl.trim() : '',
    createdAt: new Date().toISOString(),
    isActive: false
  };

  // Add form to database
  db.forms.push(newForm);
  
  // Write to database
  if (writeDatabase(db)) {
    res.status(201).json({
      success: true,
      form: newForm,
      message: 'Form added successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save form to database'
    });
  }
}

// PUT - Update form or settings
function handlePut(req, res) {
  const { id, action, ...data } = req.body;

  const db = readDatabase();

  if (action === 'setActive') {
    // Set active form
    const formIndex = db.forms.findIndex(form => form.id === id);
    if (formIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Form not found'
      });
    }

    // Update active status
    db.forms.forEach((form, index) => {
      form.isActive = (index === formIndex);
    });
    db.settings.currentFormIndex = formIndex;

    if (writeDatabase(db)) {
      res.status(200).json({
        success: true,
        message: 'Active form updated',
        currentForm: db.forms[formIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update active form'
      });
    }
  } else if (action === 'updateSettings') {
    // Update settings
    db.settings = { ...db.settings, ...data };
    
    if (writeDatabase(db)) {
      res.status(200).json({
        success: true,
        message: 'Settings updated',
        settings: db.settings
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update settings'
      });
    }
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid action'
    });
  }
}

// DELETE - Remove form
function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Form ID is required'
    });
  }

  const db = readDatabase();
  const formIndex = db.forms.findIndex(form => form.id === parseInt(id));

  if (formIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Form not found'
    });
  }

  // Remove form
  const removedForm = db.forms.splice(formIndex, 1)[0];

  // Update current form index if needed
  if (db.settings.currentFormIndex >= db.forms.length) {
    db.settings.currentFormIndex = Math.max(0, db.forms.length - 1);
  }

  if (writeDatabase(db)) {
    res.status(200).json({
      success: true,
      message: 'Form removed successfully',
      removedForm: removedForm
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to remove form from database'
    });
  }
}
