import dotenv from "dotenv";
import { DerivWebSocket } from "../config/deriv";
dotenv.config();

export const deriv = new DerivWebSocket({
  apiToken: process.env.DERIV_API_TOKEN!,
  appId: process.env.DERIV_APP_ID!,
});

export const connectDeriv = () => {
  deriv.connect();
  
  // Subscribe to symbols after connection
  setTimeout(() => {
    // Subscribe to real-time ticks for symbols you want to trade
    deriv.subscribeTicks('R_100');  // Volatility 100 Index
    deriv.subscribeTicks('R_75');   // Volatility 75 Index
    deriv.subscribeTicks('1HZ100V'); // High volatility symbol
    
    // Get historical data to start zone detection
    deriv.getCandles('R_100', 60, 100); // 1-minute candles, last 100
    deriv.getCandles('R_75', 300, 100); // 5-minute candles, last 100
    deriv.getCandles('1HZ100V', 60, 100); // 1-minute candles, last 100

    console.log('🤖 Supply/Demand trading bot activated!');
  }, 3000);
  
  return deriv;
};
