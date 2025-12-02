/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';

polyfillFetch();
polyfillReadableStream();

AppRegistry.registerComponent(appName, () => App);
