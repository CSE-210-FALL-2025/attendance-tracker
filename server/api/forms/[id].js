// Vercel serverless function for handling individual form operations
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Form ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, parseInt(id));
      case 'PUT':
        return handlePut(req, res, parseInt(id));
      case 'DELETE':
        return handleDelete(req, res, parseInt(id));
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Get specific form
function handleGet(req, res, id) {
  const db = readDatabase();
  const form = db.forms.find(f => f.id === id);

  if (!form) {
    return res.status(404).json({
      success: false,
      error: 'Form not found'
    });
  }

  res.status(200).json({
    success: true,
    form: form
  });
}

// PUT - Update specific form
function handlePut(req, res, id) {
  const { name, url, sheetUrl } = req.body;
  const db = readDatabase();
  const formIndex = db.forms.findIndex(f => f.id === id);

  if (formIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Form not found'
    });
  }

  // Validate URLs if provided
  if (url) {
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form URL'
      });
    }
  }

  if (sheetUrl) {
    try {
      new URL(sheetUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sheet URL'
      });
    }
  }

  // Update form
  const form = db.forms[formIndex];
  if (name) form.name = name.trim();
  if (url) form.url = url.trim();
  if (sheetUrl !== undefined) form.sheetUrl = sheetUrl.trim();
  form.updatedAt = new Date().toISOString();

  if (writeDatabase(db)) {
    res.status(200).json({
      success: true,
      form: form,
      message: 'Form updated successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to update form in database'
    });
  }
}

// DELETE - Delete specific form
function handleDelete(req, res, id) {
  const db = readDatabase();
  const formIndex = db.forms.findIndex(f => f.id === id);

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
      message: 'Form deleted successfully',
      removedForm: removedForm
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete form from database'
    });
  }
}
