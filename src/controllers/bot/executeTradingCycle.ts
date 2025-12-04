const botStates = require('../../types/botStates');
const { executeTradeOnDeriv } = require('./executeTradeOnDeriv');
const { getCandlesFromDeriv } = require('./getCandlesFromDeriv');
const { saveTradeToDatabase } = require('./saveTradeToDatabase');
const { updateExistingTrades } = require('./UpdateExistingTrades');
import { delay } from "../../utils/delay";

const executeTradingCycle = async (userId: string, config: any) => {
  const botState = botStates.get(userId);
  
  if (!botState || !botState.isRunning) return;

  try {
    // For each symbol, get recent candles and analyze
    for (const symbol of config.symbols) {
      if (!botState.isRunning) break;

      try {
        // Get historical data
        const timeframe = config.timeframe || 60; // Default 1-minute candles
        const candles = await getCandlesFromDeriv(symbol, timeframe, 100);
        
        if (candles.length < 20) {
          console.log(`⚠️ [${userId}] Insufficient data for ${symbol}`);
          continue;
        }

        // Analyze with supply/demand strategy
        const signal = botState.strategy.analyzeCandles(candles, symbol, timeframe);
        
        if (signal.action !== 'HOLD') {
          console.log(`🎯 [${userId}] Signal generated: ${signal.action} ${signal.symbol}`);
          
          // Adjust amount based on user config
          signal.amount = config.amountPerTrade || 10;
          
          // Execute trade
          const tradeResult = await executeTradeOnDeriv(userId, signal, config);
          
          if (tradeResult) {
            botState.tradesExecuted++;
            botState.currentTrades.push(tradeResult);
            
            // Save trade to database
            await saveTradeToDatabase(userId, tradeResult);
          }
        }

        // Small delay to avoid rate limits
        await delay(1000);
        
      } catch (error: any) {
        console.error(`❌ [${userId}] Error analyzing ${symbol}:`, error.message);
      }
    }

    // Update existing trades
    updateExistingTrades(userId);

  } catch (error: any) {
    console.error(`❌ [${userId}] Trading cycle error:`, error.message);
  }
}

module.exports = executeTradingCycle;