// const path = require('path');
// const fs = require('fs');
//
// // Set up proper storage path for Android before requiring SmythOS SDK
// const androidAppDir = '/data/data/com.nodejsinmobile/files';
// const smythStorageDir = path.join(androidAppDir, '.smyth', 'storage', 'local');
//
// // Create storage directories if they don't exist
// try {
//   fs.mkdirSync(smythStorageDir, { recursive: true });
//   console.log('Created SmythOS storage directory at:', smythStorageDir);
// } catch (error) {
//   console.log('Storage directory creation result:', error.message);
// }
//
// // Set environment variable to override default storage path (if supported)
// process.env.SMYTH_STORAGE_PATH = smythStorageDir;
// process.env.SMYTH_HOME = path.join(androidAppDir, '.smyth');
//

process.env.LOG_LEVEL = 'debug';
process.env.LOG_FILTER = '';
//
// // Override homedir to point to app directory
// const os = require('os');
// const originalHomedir = os.homedir;
// os.homedir = () => androidAppDir;
//
// console.log('SmythOS storage configured for Android app directory');
// console.log('Storage path:', smythStorageDir);
// console.log('SMYTH_HOME:', process.env.SMYTH_HOME);
// console.log(
//   'Google AI API Key configured:',
//   process.env.GOOGLE_AI_API_KEY ? 'Yes' : 'No',
// );

// Now require and run the SmythOS SDK
require('./dist/index.cjs');
