import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const questions = [
  {
    id: 1,
    question: 'How often do you feel stressed or anxious?',
    options: [
      { id: 1, answer: 'Never', score: 1 },
      { id: 2, answer: 'Rarely', score: 2 },
      { id: 3, answer: 'Sometimes', score: 3 },
      { id: 4, answer: 'Often', score: 4 },
    ],
  },
  {
    id: 2,
    question: 'Do you feel you have enough time for yourself?',
    options: [
      { id: 1, answer: 'Yes', score: 1 },
      { id: 2, answer: 'No', score: 4 },
    ],
  },
  {
    id: 3,
    question: 'How would you rate your energy levels throughout the day?',
    options: [
      { id: 1, answer: 'Very high', score: 1 },
      { id: 2, answer: 'Moderate', score: 2 },
      { id: 3, answer: 'Low', score: 3 },
      { id: 4, answer: 'Very low', score: 4 },
    ],
  },
  {
    id: 4,
    question: 'Do you sleep well at night?',
    options: [
      { id: 1, answer: 'Yes, always', score: 1 },
      { id: 2, answer: 'Sometimes', score: 3 },
      { id: 3, answer: 'No', score: 4 },
    ],
  },
  {
    id: 5,
    question: 'Do you feel emotionally supported by friends or family?',
    options: [
      { id: 1, answer: 'Yes', score: 1 },
      { id: 2, answer: 'No', score: 4 },
    ],
  },
];

const MentalHealth = () => {
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const navigation = useNavigation();

  const handleAnswer = (questionId, score, optionId) => {
    setResponses({ ...responses, [questionId]: score });
    setScore((prevScore) => prevScore + score);
    setSelectedOption({ ...selectedOption, [questionId]: optionId });
  };

  const handleSubmit = () => {
    if (Object.keys(responses).length === questions.length) {
      let result = 'Good mental health';
      if (score > 10 && score <= 15) {
        result = 'Average mental health';
      } else if (score > 15) {
        result = 'Poor mental health';
      }

      Alert.alert('Your Mental Health Result', result);
    } else {
      Alert.alert('Warning', 'Please answer all questions.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mental Health Assessment</Text>

      {questions.map((question) => (
        <View key={question.id} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedOption[question.id] === option.id && styles.selectedOptionButton,
              ]}
              onPress={() => handleAnswer(question.id, option.score, option.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption[question.id] === option.id && styles.selectedOptionText,
                ]}
              >
                {option.answer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      {/* Back Button at the bottom */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/icons/back.png')} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Soft modern background color
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
    fontFamily: 'Arial, sans-serif',
  },
  questionContainer: {
    marginBottom: 25,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
    fontFamily: 'Arial, sans-serif',
  },
  optionButton: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#3498db',
    elevation: 6,
    shadowOpacity: 0.2,
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  selectedOptionText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  submitText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
  backButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Space from bottom of screen
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 6,
    shadowOpacity: 0.3,
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
});

export default MentalHealth;
