/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import nodejs from 'nodejs-mobile-react-native';
import { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [postData, setPostData] = useState<any>(null);

  useEffect(() => {
    nodejs.start('main.js');

    const messageListener = (msg: string) => {
      console.log('From node: ' + msg);
      setMessages(prev => [...prev, msg]);

      // Check if it's POST data
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'POST_DATA') {
          setPostData(parsed.data);
        }
      } catch (e) {
        // Not JSON, just a regular message
      }
    };

    nodejs.channel.addListener('message', messageListener);

    return () => nodejs.channel.removeListener('message', messageListener);
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent messages={messages} postData={postData} />
    </SafeAreaProvider>
  );
}

interface AppContentProps {
  messages: string[];
  postData: any;
}

function AppContent({ messages, postData }: AppContentProps) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: safeAreaInsets.top }]}>
      <Text style={styles.title}>Express Server in React Native</Text>

      <Button
        title="Message Node"
        onPress={() => {
          console.log('button pressed');
          nodejs.channel.send('A message!');
        }}
      />

      {postData && (
        <View style={styles.postDataContainer}>
          <Text style={styles.subtitle}>Latest POST Data:</Text>
          <ScrollView style={styles.dataContainer}>
            <Text style={styles.dataText}>
              {JSON.stringify(postData, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}

      <View style={styles.messagesContainer}>
        <Text style={styles.subtitle}>Node.js Messages:</Text>
        <ScrollView style={styles.messagesList}>
          {messages.map((message, index) => (
            <Text key={index} style={styles.messageText}>
              {message}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  postDataContainer: {
    marginTop: 20,
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  dataContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  dataText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
    marginTop: 20,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default App;
