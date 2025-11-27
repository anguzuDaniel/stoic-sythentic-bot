const { supabase } = require("../config/supabase");

const TEMP_USER_ID = "dev-user-123";

exports.saveBotConfig = async (req, res) => {
  try {
    const config = req.body;

    const { error } = await supabase
      .from("bot_configs")
      .upsert({
        user_id: TEMP_USER_ID,
        config_data: config, // Store entire config as JSON
        updated_at: new Date()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.log('Supabase error:', error);
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
    const { data, error } = await supabase
      .from("bot_configs")
      .select("config_data")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ config: data?.config_data || {} });
  } catch (error) {
    console.error('Get bot config error:', error);
    res.status(500).json({ error: 'Failed to get bot configuration' });
  }
};

let botInterval = null;

exports.startBot = async (req, res) => {
  try {
    // Check if bot is already running in database
    const { data: existingStatus } = await supabase
      .from("bot_status")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (existingStatus && existingStatus.is_running) {
      return res.status(400).json({ error: "Bot is already running" });
    }

    // Get bot configuration
    const { data: config } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    // Save bot status to database
    const startedAt = new Date();
    const { error: statusError } = await supabase
      .from("bot_status")
      .upsert({
        user_id: TEMP_USER_ID,
        is_running: true,
        started_at: startedAt,
        current_trades: [],
        updated_at: startedAt
      });

    if (statusError) {
      console.log('Database error:', statusError);
      return res.status(400).json({ error: statusError.message });
    }

    // Start the trading interval
    botInterval = setInterval(() => {
      simulateTradingCycle(TEMP_USER_ID);
    }, 10000);

    console.log('🤖 Bot started and status saved to database');

    res.json({ 
      message: "Bot started successfully",
      status: "running",
      startedAt: startedAt,
      config: config || {}
    });
  } catch (error) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
};

exports.stopBot = async (req, res) => {
  try {
    // Check bot status in database
    const { data: status } = await supabase
      .from("bot_status")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (!status || !status.is_running) {
      return res.status(400).json({ error: "Bot is not running" });
    }

    // Stop the interval
    if (botInterval) {
      clearInterval(botInterval);
      botInterval = null;
    }

    // Update database
    const stoppedAt = new Date();
    const { error } = await supabase
      .from("bot_status")
      .update({
        is_running: false,
        stopped_at: stoppedAt,
        updated_at: stoppedAt
      })
      .eq("user_id", TEMP_USER_ID);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log('🛑 Bot stopped and status updated in database');

    res.json({ 
      message: "Bot stopped successfully",
      status: "stopped",
      startedAt: status.started_at,
      stoppedAt: stoppedAt
    });
  } catch (error) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
};

exports.getBotStatus = async (req, res) => {
  try {
    // Get status from database
    const { data: status, error } = await supabase
      .from("bot_status")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      isRunning: status?.is_running || false,
      startedAt: status?.started_at,
      stoppedAt: status?.stopped_at,
      currentTrades: status?.current_trades?.length || 0,
      status: status?.is_running ? "running" : "stopped"
    });
  } catch (error) {
    console.error('Get bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
};

// Bot state management
let botState = {
  isRunning: false,
  startedAt: null,
  currentTrades: [],
  botInstance: null,
  totalProfit: 0,
  tradesExecuted: 0
};

// Enhanced trading simulation
function simulateTradingCycle(config) {
  if (!botState.isRunning) return;

  const tradingPairs = config?.trading_pairs || ['BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 'DOT/USD'];
  const maxTrades = config?.max_trades_per_day || 10;
  const riskLevel = config?.risk_level || 'medium';
  
  // Adjust trading frequency based on risk level
  let tradeProbability = 0.3; // medium risk default
  if (riskLevel === 'low') tradeProbability = 0.15;
  if (riskLevel === 'high') tradeProbability = 0.5;

  // Simulate market conditions
  const marketVolatility = Math.random();
  const isBullMarket = Math.random() > 0.4;

  console.log(`📊 Market: ${isBullMarket ? '🟢 BULL' : '🔴 BEAR'} | Volatility: ${(marketVolatility * 100).toFixed(1)}%`);

  // Trading logic
  if (botState.currentTrades.length < maxTrades && Math.random() < tradeProbability) {
    executeTrade(tradingPairs, isBullMarket, marketVolatility, config);
  }

  // Update existing trades (simulate price movements)
  updateExistingTrades(isBullMarket, marketVolatility);

  // Log current status
  console.log(`🤖 Bot Status | Trades: ${botState.currentTrades.length}/${maxTrades} | Profit: $${botState.totalProfit.toFixed(2)}`);
}

function executeTrade(tradingPairs, isBullMarket, volatility, config) {
  const pair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
  const basePrices = {
    'BTC/USD': 45000,
    'ETH/USD': 2500,
    'SOL/USD': 100,
    'ADA/USD': 0.5,
    'DOT/USD': 7
  };

  const basePrice = basePrices[pair] || 100;
  
  // Simulate price with volatility
  const priceVariation = (Math.random() - 0.5) * volatility * 0.1;
  const currentPrice = basePrice * (1 + priceVariation);
  
  // Trading decision based on market condition
  const action = isBullMarket ? 
    (Math.random() > 0.3 ? 'BUY' : 'SELL') : 
    (Math.random() > 0.7 ? 'BUY' : 'SELL');

  const amount = (Math.random() * 0.05 + 0.01).toFixed(4);
  const investment = currentPrice * parseFloat(amount);

  const trade = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    pair: pair,
    action: action,
    entryPrice: currentPrice.toFixed(2),
    amount: amount,
    investment: investment.toFixed(2),
    stopLoss: (currentPrice * (1 - (config?.stop_loss_percentage || 2) / 100)).toFixed(2),
    takeProfit: (currentPrice * (1 + (config?.take_profit_percentage || 4) / 100)).toFixed(2),
    status: 'open',
    pnl: 0,
    pnlPercentage: 0,
    timestamp: new Date().toISOString()
  };

  botState.currentTrades.push(trade);
  botState.tradesExecuted++;
  
  console.log(`🎯 NEW TRADE: ${trade.action} ${trade.amount} ${trade.pair} at $${trade.entryPrice}`);
  console.log(`   💰 Investment: $${trade.investment} | SL: $${trade.stopLoss} | TP: $${trade.takeProfit}`);
}

function updateExistingTrades(isBullMarket, volatility) {
  botState.currentTrades.forEach((trade, index) => {
    if (trade.status === 'open') {
      // Simulate price movement
      const priceChange = (Math.random() - 0.5) * volatility * 0.08;
      const directionMultiplier = isBullMarket ? 1.2 : 0.8; // Bull markets tend up
      const currentPrice = parseFloat(trade.entryPrice) * (1 + priceChange * directionMultiplier);
      
      // Calculate P&L
      const priceDifference = currentPrice - parseFloat(trade.entryPrice);
      const pnl = priceDifference * parseFloat(trade.amount);
      const pnlPercentage = (priceDifference / parseFloat(trade.entryPrice)) * 100;

      trade.currentPrice = currentPrice.toFixed(2);
      trade.pnl = pnl;
      trade.pnlPercentage = pnlPercentage;

      // Check stop loss / take profit
      if (currentPrice <= parseFloat(trade.stopLoss)) {
        closeTrade(trade, index, 'stop_loss');
      } else if (currentPrice >= parseFloat(trade.takeProfit)) {
        closeTrade(trade, index, 'take_profit');
      } else if (Math.random() < 0.05) { // 5% chance of manual close
        closeTrade(trade, index, 'manual');
      }
    }
  });
}

function closeTrade(trade, index, closeReason) {
  trade.status = 'closed';
  trade.closeReason = closeReason;
  trade.closedAt = new Date().toISOString();
  trade.closePrice = trade.currentPrice;

  // Update total profit
  botState.totalProfit += trade.pnl;

  const emoji = trade.pnl >= 0 ? '💰' : '💸';
  console.log(`🔒 TRADE CLOSED: ${emoji} ${trade.pair} | P&L: $${trade.pnl.toFixed(2)} (${trade.pnlPercentage.toFixed(2)}%) | Reason: ${closeReason}`);
  
  // Remove from current trades after a delay
  setTimeout(() => {
    botState.currentTrades = botState.currentTrades.filter(t => t.id !== trade.id);
  }, 5000);
}

// Update your existing functions to use the enhanced simulation
exports.startBot = async (req, res) => {
  try {
    if (botState.isRunning) {
      return res.status(400).json({ error: "Bot is already running" });
    }

    // Get bot configuration
    const { data: config, error } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    // Start the bot with enhanced simulation
    botState.isRunning = true;
    botState.startedAt = new Date();
    botState.currentTrades = [];
    botState.totalProfit = 0;
    botState.tradesExecuted = 0;

    console.log('🚀 STARTING ENHANCED TRADING BOT');
    console.log('⚙️  Configuration:', config);

    // Run trading cycle every 8 seconds for better simulation
    botState.botInstance = setInterval(() => {
      simulateTradingCycle(config);
    }, 8000);

    res.json({ 
      message: "Enhanced trading bot started successfully",
      status: "running",
      startedAt: botState.startedAt,
      config: config || {},
      simulation: {
        interval: "8 seconds",
        features: ["market conditions", "stop loss/take profit", "real-time P&L", "volatility simulation"]
      }
    });
  } catch (error) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
};

exports.getBotStatus = async (req, res) => {
  try {
    const activeTrades = botState.currentTrades.filter(trade => trade.status === 'open');
    const closedTrades = botState.currentTrades.filter(trade => trade.status === 'closed');

    res.json({
      isRunning: botState.isRunning,
      startedAt: botState.startedAt,
      performance: {
        totalProfit: botState.totalProfit,
        tradesExecuted: botState.tradesExecuted,
        activeTrades: activeTrades.length,
        winRate: botState.tradesExecuted > 0 ? 
          ((botState.tradesExecuted - closedTrades.filter(t => t.pnl < 0).length) / botState.tradesExecuted * 100).toFixed(1) : 0
      },
      activeTrades: activeTrades,
      status: botState.isRunning ? "running" : "stopped"
    });
  } catch (error) {
    console.error('Get bot status error:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
};

// Add this to your bot.controller.ts
exports.forceTrade = async (req, res) => {
  try {
    const { data: config } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    console.log('🎯 MANUALLY FORCING TRADE');
    executeTrade(
      config?.trading_pairs || ['BTC/USD', 'ETH/USD'], 
      true, 
      0.5, 
      config
    );

    res.json({ 
      message: "Trade forced successfully",
      activeTrades: botState.currentTrades.length
    });
  } catch (error) {
    console.error('Force trade error:', error);
    res.status(500).json({ error: 'Failed to force trade' });
  }
};