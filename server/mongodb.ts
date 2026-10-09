import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import 'dotenv/config';

// Connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'trader_discipline';

// Global cached client for serverless environments (e.g. Vercel)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;
let isConnected = false;
let connectionAttempted = false;
let connectionError: string | null = null;

if (MONGODB_URI) {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    if (process.env.NODE_ENV === 'development') {
      // In development, preserve value across module reloads
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      // In production/serverless, cache connection per instance
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    }
  } catch (err: any) {
    connectionError = err.message || 'Failed to initialize MongoClient';
    console.error('[MongoDB Atlas] Initialization error:', connectionError);
  }
} else {
  console.log('[MongoDB Atlas] No MONGODB_URI provided in environment. Running in local fallback mode.');
}

export async function getMongoDb(): Promise<Db | null> {
  if (!MONGODB_URI || !clientPromise) {
    return null;
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    if (!isConnected) {
      // Verify connection with a quick ping
      await db.command({ ping: 1 });
      isConnected = true;
      connectionAttempted = true;
      console.log(`[MongoDB Atlas] Successfully connected to database: "${DB_NAME}"`);
      await initMongoIndexes(db);
    }
    return db;
  } catch (err: any) {
    isConnected = false;
    connectionAttempted = true;
    connectionError = err.message || 'Connection failed';
    console.warn('[MongoDB Atlas] Could not connect to Atlas, using fallback storage:', err.message);
    return null;
  }
}

export function getMongoStatus() {
  return {
    isConfigured: !!MONGODB_URI,
    isConnected,
    connectionAttempted,
    databaseName: DB_NAME,
    error: connectionError,
    provider: isConnected ? 'mongodb_atlas' : 'local_storage',
  };
}

async function initMongoIndexes(db: Db): Promise<void> {
  try {
    // Ensure unique email on users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // Ensure unique token on sessions
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    // Ensure index on trades by userId and date
    await db.collection('trades').createIndex({ userId: 1, date: -1 });
    // Ensure index on daily_practice by userId and date
    await db.collection('daily_practice').createIndex({ userId: 1, date: 1 }, { unique: true });
    // Ensure index on mistakes by userId and date
    await db.collection('mistakes').createIndex({ userId: 1, date: -1 });
    // Ensure index on psychology_logs by userId and createdAt
    await db.collection('psychology_logs').createIndex({ userId: 1, createdAt: -1 });
    // Ensure index on daily_reviews by userId and date
    await db.collection('daily_reviews').createIndex({ userId: 1, date: 1 }, { unique: true });
    // Ensure index on weekly_reviews by userId and weekStartDate
    await db.collection('weekly_reviews').createIndex({ userId: 1, weekStartDate: 1 }, { unique: true });
    // Ensure index on skills by userId and skillName
    await db.collection('skills').createIndex({ userId: 1, skillName: 1 });
    // Ensure index on msp1_setups by userId and setupId / date
    await db.collection('msp1_setups').createIndex({ userId: 1, setupId: 1 }, { unique: true });
    await db.collection('msp1_setups').createIndex({ userId: 1, date: -1 });
  } catch (err) {
    console.warn('[MongoDB Atlas] Index setup notice:', err);
  }
}
