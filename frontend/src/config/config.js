const config = {
  // For Android emulator, use 10.0.2.2 to access host machine
  // For iOS simulator, use localhost or 127.0.0.1
  // For physical device, use your computer's IP address
  API_BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:3000/api'  // Android emulator
    : 'https://your-production-api.com/api',
  
  // Alternative URLs for different environments
  ANDROID_EMULATOR_URL: 'http://10.0.2.2:3000/api',
  IOS_SIMULATOR_URL: 'http://localhost:3000/api',
  LOCALHOST_URL: 'http://127.0.0.1:3000/api',
  
  // Timeout settings
  API_TIMEOUT: 10000, // 10 seconds
  
  // Other config
  APP_VERSION: '1.0.0',
  DEBUG: __DEV__,
};

export default config;
