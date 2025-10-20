import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// MongoDB connection configuration
let client = null;
let db = null;

// Load environment variables from .env.local if it exists
function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=');
            process.env[key] = value;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading .env.local:', error);
  }
}

// Initialize MongoDB connection
export async function connectToMongoDB() {
  try {
    // Load environment variables
    loadEnvLocal();
    
    if (client && db) {
      return { client, db };
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    await client.connect();
    console.log('Connected to MongoDB successfully');

    // Get database name from URI or use default
    const dbName = process.env.MONGODB_DB_NAME || 'attendance_tracker';
    db = client.db(dbName);

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Close MongoDB connection
export async function closeMongoDBConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

// Get database instance
export async function getDatabase() {
  if (!db) {
    await connectToMongoDB();
  }
  return db;
}

// Get forms collection
export async function getFormsCollection() {
  const database = await getDatabase();
  return database.collection('forms');
}

// Get settings collection
export async function getSettingsCollection() {
  const database = await getDatabase();
  return database.collection('settings');
}

// Initialize default settings if they don't exist
export async function initializeDefaultSettings() {
  try {
    const settingsCollection = await getSettingsCollection();
    const existingSettings = await settingsCollection.findOne({ _id: 'app_settings' });
    
    if (!existingSettings) {
      const defaultSettings = {
        _id: 'app_settings',
        currentFormIndex: 0,
        qrRefreshInterval: 5000,
        autoRefreshEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await settingsCollection.insertOne(defaultSettings);
      console.log('Default settings initialized');
    }
  } catch (error) {
    console.error('Failed to initialize default settings:', error);
  }
}

// Helper function to handle MongoDB operations with error handling
export async function withMongoDB(operation) {
  try {
    await connectToMongoDB();
    return await operation();
  } catch (error) {
    console.error('MongoDB operation failed:', error);
    throw error;
  }
}
