// setup.js - Run this once to setup database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://izsehstqinayqboabegb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6c2Voc3RxaW5heXFib2FiZWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDA5MTEsImV4cCI6MjA4MTExNjkxMX0.yoKxKpLckJ3ZTP6VJZ-rLMGnyiHgVi2x3HAChJxzF0o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  const sqlCommands = `
    -- Create devices table
    CREATE TABLE IF NOT EXISTS devices (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        device_id TEXT UNIQUE NOT NULL,
        device_name TEXT,
        device_model TEXT,
        last_seen TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'online',
        data_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create device_data table
    CREATE TABLE IF NOT EXISTS device_data (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        device_id TEXT REFERENCES devices(device_id) ON DELETE CASCADE,
        data_type TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create commands table
    CREATE TABLE IF NOT EXISTS commands (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        device_id TEXT REFERENCES devices(device_id) ON DELETE CASCADE,
        command TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        user_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create user_tokens table
    CREATE TABLE IF NOT EXISTS user_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create generated_apks table
    CREATE TABLE IF NOT EXISTS generated_apks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        config JSONB NOT NULL,
        download_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  try {
    // Note: This requires service role key for full access
    console.log('Please run these SQL commands in Supabase SQL Editor:');
    console.log(sqlCommands);
    console.log('\n✅ Copy and paste the above SQL in Supabase SQL Editor');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setupDatabase();
