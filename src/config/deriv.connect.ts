const { DerivWebSocket } = require('./deriv');

const deriv = new DerivWebSocket({
  apiToken: process.env.DERIV_API_TOKEN,
  appId: process.env.DERIV_APP_ID || '1089',
  reconnect: true,
  maxReconnectAttempts: 10,
  heartbeatInterval: 15000
});

deriv.connect();

module.exports = { deriv };