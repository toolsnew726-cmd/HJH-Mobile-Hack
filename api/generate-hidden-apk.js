export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.',
      timestamp: new Date().toISOString() 
    });
  }
  
  try {
    const config = req.body;
    
    // Generate response
    const response = {
      success: true,
      apk_id: `hjh_${Date.now()}`,
      download_url: 'https://github.com/learning-zone/Android-APK-files/raw/master/app-debug.apk',
      message: 'APK generated successfully from hjh-mobile-hack',
      config: config,
      server: 'Vercel API',
      timestamp: new Date().toISOString(),
      url: 'https://hjh-mobile-hack.vercel.app'
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
