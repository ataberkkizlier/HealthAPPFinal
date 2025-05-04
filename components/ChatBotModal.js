import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { COLORS, icons } from '../constants';
import { Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '../config/apiKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for chat messages
const CHAT_STORAGE_KEY = 'HEALTH_COACH_CHAT_MESSAGES';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

// Create a function to get responses from Gemini API
const getGeminiResponse = async (message, healthData = {}) => {
  try {
    // Ensure healthData has expected structure
    const safeHealthData = {
      overallScore: healthData?.overallScore || 0,
      waterIntake: {
        percentage: healthData?.waterIntake?.percentage || 0,
        value: healthData?.waterIntake?.value || 0,
        goal: healthData?.waterIntake?.goal || 2000
      },
      steps: {
        value: healthData?.steps?.value || 0,
        goal: healthData?.steps?.goal || 10000,
        percentage: healthData?.steps?.percentage || 0
      },
      workout: {
        percentage: healthData?.workout?.percentage || 0
      },
      nutrition: {
        percentage: healthData?.nutrition?.percentage || 0
      },
      sleep: {
        percentage: healthData?.sleep?.percentage || 0
      },
      mentalHealth: {
        percentage: healthData?.mentalHealth?.percentage || 0,
        status: healthData?.mentalHealth?.status || 'unknown',
        needsAssessment: healthData?.mentalHealth?.needsAssessment || false
      }
    };

    // Access the Gemini model (using Gemini-1.5-pro or Gemini-1.0-pro based on availability)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a detailed prompt with health data context
    const prompt = `You are a helpful and supportive HealthCoach AI in a health tracking app. 
    Your responses should be concise, helpful, and encouraging.
    
    The user's current health data:
    - Overall health score: ${safeHealthData.overallScore}%
    - Water intake: ${safeHealthData.waterIntake.value}ml out of ${safeHealthData.waterIntake.goal}ml goal (${Math.round(safeHealthData.waterIntake.percentage)}%)
    - Steps: ${safeHealthData.steps.value} out of ${safeHealthData.steps.goal} daily goal (${Math.round(safeHealthData.steps.percentage)}%)
    - Workout completion: ${safeHealthData.workout.percentage}%
    - Nutrition score: ${safeHealthData.nutrition.percentage}%
    - Sleep quality: ${safeHealthData.sleep.percentage}%
    - Mental health: ${safeHealthData.mentalHealth.percentage}% ${safeHealthData.mentalHealth.needsAssessment ? '(daily check-in needed)' : ''}
    
    Based on this data, provide personalized health advice that is encouraging and actionable.
    User message: ${message.text}
    
    Keep your response under 150 words and focus specifically on what the user is asking about.`;

    // Generate content from the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Return formatted message for GiftedChat
    return {
      _id: Math.round(Math.random() * 1000000),
      text: text,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'HealthCoach AI',
        avatar: 'https://ui-avatars.com/api/?background=2E86C1&color=fff&name=H+C',
      },
    };
  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    // Return a friendly error message
    return {
      _id: Math.round(Math.random() * 1000000),
      text: "I'm having trouble connecting to my brain at the moment. This could be due to an API key issue or a network problem. Please try again later or check your API configuration.",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'HealthCoach AI',
        avatar: 'https://ui-avatars.com/api/?background=2E86C1&color=fff&name=H+C',
      },
    };
  }
};

const ChatBotModal = ({ visible, onClose, healthData }) => {
  const { dark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Check for midnight resets and load saved messages
  useEffect(() => {
    if (visible) {
      loadMessages();
      setupMidnightReset();
    }
  }, [visible]);

  // Check API key on component mount
  useEffect(() => {
    if (GOOGLE_GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      Alert.alert(
        'API Key Not Configured',
        'Please set up your Google Gemini API key in config/apiKeys.js',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Load messages from AsyncStorage
  const loadMessages = async () => {
    try {
      setLoading(true);
      const savedMessages = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Filter out messages older than today (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight
        
        const validMessages = parsedMessages.filter(msg => {
          const msgDate = new Date(msg.createdAt);
          return msgDate >= today;
        });
        
        if (validMessages.length > 0) {
          // Convert strings back to Date objects
          const processedMessages = validMessages.map(msg => ({
            ...msg,
            createdAt: new Date(msg.createdAt)
          }));
          setMessages(processedMessages);
        } else {
          // If no valid messages, show welcome message
          addWelcomeMessage();
        }
      } else {
        // If no messages at all, show welcome message
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      addWelcomeMessage();
    } finally {
      setLoading(false);
    }
  };

  // Save messages to AsyncStorage
  const saveMessages = async (messagesToSave) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    const welcomeMsg = {
      _id: 1,
      text: `Hello! I'm your HealthCoach AI. How may I assist you today?`,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'HealthCoach AI',
        avatar: 'https://ui-avatars.com/api/?background=2E86C1&color=fff&name=H+C',
      },
    };
    setMessages([welcomeMsg]);
    saveMessages([welcomeMsg]);
  };

  // Setup midnight reset
  const setupMidnightReset = () => {
    // Calculate time until next midnight
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // next day
      0, 0, 0 // midnight - 00:00:00
    );
    const timeToMidnight = night.getTime() - now.getTime();

    // Set timeout to clear messages at midnight
    const midnightTimer = setTimeout(() => {
      clearMessages();
      // Reset for the next day
      setupMidnightReset();
    }, timeToMidnight);

    // Clear timeout when component unmounts
    return () => clearTimeout(midnightTimer);
  };

  // Clear all messages
  const clearMessages = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
      setMessages([]);
      addWelcomeMessage();
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  };

  // Reset messages when modal is closed
  useEffect(() => {
    if (!visible) {
      // Just hide the modal, don't clear messages
      setInputText('');
      setIsTyping(false);
    }
  }, [visible]);

  // Create a custom close handler
  const handleClose = () => {
    // First call the original onClose
    onClose();
    // Don't clear messages, just reset input state
    setInputText('');
    setIsTyping(false);
  };

  const handleSend = useCallback((newMessages = []) => {
    if (newMessages[0] && newMessages[0].text.trim().length > 0) {
      const updatedMessages = GiftedChat.append(messages, newMessages);
      setMessages(updatedMessages);
      saveMessages(updatedMessages); // Save to AsyncStorage
      setIsTyping(true);

      // Get response from Gemini API
      getGeminiResponse(newMessages[0], healthData).then(botMessage => {
        setIsTyping(false);
        const messagesWithBot = GiftedChat.append(updatedMessages, [botMessage]);
        setMessages(messagesWithBot);
        saveMessages(messagesWithBot); // Save to AsyncStorage
      });
    }
  }, [messages, healthData]);

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: COLORS.primary,
          },
          left: {
            backgroundColor: dark ? COLORS.dark : COLORS.secondaryWhite,
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: dark ? COLORS.white : COLORS.gray,
          },
        }}
      />
    );
  };

  const renderInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          borderTopColor: dark ? COLORS.dark : COLORS.secondaryWhite,
          padding: 4,
        }}
      />
    );
  };

  const renderSend = props => {
    return (
      <Send
        {...props}
        disabled={!props.text.trim()}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
          marginBottom: 5,
        }}
        onSend={() => {
          if (props.text && props.text.trim().length > 0) {
            props.onSend({ text: props.text.trim() }, true);
          }
        }}
      >
        <View style={[styles.sendButton, {
          backgroundColor: props.text.trim() ? COLORS.primary : COLORS.gray,
        }]}>
          <Image
            source={icons.send}
            style={[styles.sendIcon, { tintColor: COLORS.white }]}
          />
        </View>
      </Send>
    );
  };

  // Create a custom renderComposer function to handle multiline input better
  const renderComposer = (props) => {
    return (
      <View style={{
        flex: 1,
        marginLeft: 10, 
        marginRight: 10,
        marginBottom: 5,
        marginTop: 5,
        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxHeight: 120,
      }}>
        <TextInput
          {...props}
          style={{
            color: dark ? COLORS.white : COLORS.gray,
            fontSize: 16,
            lineHeight: 20,
            paddingTop: 8,
            paddingBottom: 8,
            maxHeight: 120,
          }}
          value={props.text}
          onChangeText={props.onTextChanged}
          multiline={true}
          placeholder="Type a message..."
          placeholderTextColor={dark ? COLORS.gray : '#CCCCCC'}
          autoCorrect={false}
          autoCapitalize='none'
          keyboardType='default'
          textContentType='none'
          spellCheck={false}
          onSubmitEditing={() => {
            if (props.text && props.text.trim().length > 0) {
              props.onSend({ text: props.text.trim() }, true);
            }
          }}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: dark ? COLORS.dark : COLORS.white }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
            HealthCoach AI
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearMessages} style={styles.headerButton}>
              <Image
                source={icons.trash}
                style={[styles.headerIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Image
                source={icons.cancelSquare}
                style={[styles.headerIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, {color: dark ? COLORS.white : COLORS.gray}]}>
                Loading conversation...
              </Text>
            </View>
          ) : (
            <GiftedChat
              messages={messages}
              onSend={handleSend}
              text={inputText}
              onInputTextChanged={text => setInputText(text)}
              user={{ _id: 1 }}
              renderBubble={renderBubble}
              renderInputToolbar={renderInputToolbar}
              renderSend={renderSend}
              renderComposer={renderComposer}
              isTyping={isTyping}
              scrollToBottom
              alwaysShowSend
              inverted={true}
              minInputToolbarHeight={60}
              maxComposerHeight={120}
              timeTextStyle={{
                right: { color: 'rgba(255, 255, 255, 0.7)' },
                left: { color: dark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)' }
              }}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryWhite,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 5,
    marginLeft: 15,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'medium',
  },
});

export default ChatBotModal; 