const { supabase } = require("../config/supabase");

exports.saveBotConfig = async (req, res) => {
  try {
    const user = req.user;
    const config = req.body;

    if (!user || !user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { error } = await supabase
      .from("bot_configs")
      .upsert({
        user_id: user.id,
        ...config,
        updated_at: new Date()
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Bot settings saved" });
  } catch (error) {
    console.error('Save bot config error:', error);
    res.status(500).json({ error: 'Failed to save bot configuration' });
  }
};

exports.getBotConfig = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { data, error } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ config: data || {} });
  } catch (error) {
    console.error('Get bot config error:', error);
    res.status(500).json({ error: 'Failed to get bot configuration' });
  }
};

exports.startBot = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Your bot start logic here
    res.json({ message: "Bot started successfully" });
  } catch (error) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
};

exports.stopBot = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Your bot stop logic here
    res.json({ message: "Bot stopped successfully" });
  } catch (error) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
};