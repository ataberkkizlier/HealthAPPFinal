import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  Alert,
  SafeAreaView
} from 'react-native';
import { useMentalHealth } from '../context/MentalHealthContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

// Updated questions with more professional options and scoring
const questions = [
  {
    id: 1,
    question: 'Today, how would you rate your mood?',
    options: [
      { id: 1, answer: 'Very good', score: 3 },
      { id: 2, answer: 'Good', score: 2 },
      { id: 3, answer: 'Fair', score: 1 },
      { id: 4, answer: 'Poor', score: 0 },
    ],
  },
  {
    id: 2,
    question: 'Today, how much interest or pleasure did you have in your activities?',
    options: [
      { id: 1, answer: 'Normal amount', score: 3 },
      { id: 2, answer: 'Slightly reduced', score: 2 },
      { id: 3, answer: 'Significantly reduced', score: 1 },
      { id: 4, answer: 'Little to none', score: 0 },
    ],
  },
  {
    id: 3,
    question: 'How would you rate your energy levels today?',
    options: [
      { id: 1, answer: 'Very high', score: 3 },
      { id: 2, answer: 'Moderate', score: 2 },
      { id: 3, answer: 'Low', score: 1 },
      { id: 4, answer: 'Very low', score: 0 },
    ],
  },
  {
    id: 4,
    question: 'How well did you sleep last night?',
    options: [
      { id: 1, answer: 'Very well', score: 3 },
      { id: 2, answer: 'Adequately', score: 2 },
      { id: 3, answer: 'Poorly', score: 1 },
      { id: 4, answer: 'Very poorly/not at all', score: 0 },
    ],
  },
  {
    id: 5,
    question: 'How anxious or worried have you felt today?',
    options: [
      { id: 1, answer: 'Not at all', score: 3 },
      { id: 2, answer: 'Slightly', score: 2 },
      { id: 3, answer: 'Moderately', score: 1 },
      { id: 4, answer: 'Extremely', score: 0 },
    ],
  },
  {
    id: 6,
    question: 'Did you feel supported by people in your life today?',
    options: [
      { id: 1, answer: 'Yes, completely', score: 3 },
      { id: 2, answer: 'Somewhat', score: 2 },
      { id: 3, answer: 'Not really', score: 1 },
      { id: 4, answer: 'Not at all', score: 0 },
    ],
  },
  {
    id: 7,
    question: 'How was your ability to focus and concentrate today?',
    options: [
      { id: 1, answer: 'Very good', score: 3 },
      { id: 2, answer: 'Good', score: 2 },
      { id: 3, answer: 'Poor', score: 1 },
      { id: 4, answer: 'Very poor', score: 0 },
    ],
  },
];

// Calculate total possible score
const TOTAL_POSSIBLE_SCORE = questions.reduce(
  (total, question) => total + Math.max(...question.options.map(o => o.score)),
  0
);

const MentalHealth = ({ navigation }) => {
  const { 
    mentalHealthPercentage, 
    mentalHealthStatus, 
    mentalHealthScore, 
    assessmentDate, 
    needsNewAssessment,
    updateMentalHealthAssessment, 
    resetMentalHealth 
  } = useMentalHealth();
  const { user } = useAuth();
  
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  // Check if there's existing assessment data
  useEffect(() => {
    if (mentalHealthScore > 0 && assessmentDate && !needsNewAssessment) {
      setHasCompletedAssessment(true);
    } else {
      setHasCompletedAssessment(false);
    }
  }, [mentalHealthScore, assessmentDate, needsNewAssessment]);

  const handleAnswer = (questionId, score, optionId) => {
    // Remove previous score from total if changing answer
    const oldScore = responses[questionId] || 0;
    const newTotalScore = (calculateTotalScore() - oldScore) + score;
    
    setResponses({ ...responses, [questionId]: score });
    setScore(newTotalScore);
    setSelectedOption({ ...selectedOption, [questionId]: optionId });
  };

  const calculateTotalScore = () => {
    return Object.values(responses).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = () => {
    if (Object.keys(responses).length === questions.length) {
      const finalScore = calculateTotalScore();
      
      // Update context (which saves to AsyncStorage and Firebase)
      // and get the returned values
      const { percentage } = updateMentalHealthAssessment(finalScore, TOTAL_POSSIBLE_SCORE);
      
      setHasCompletedAssessment(true);
      
      Alert.alert(
        'Assessment Complete', 
        `Your mental well-being score has been updated.\n\nScore: ${percentage}%`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Incomplete Assessment', 'Please answer all questions to get an accurate assessment.');
    }
  };

  const resetAssessment = () => {
    Alert.alert(
      'Reset Assessment',
      'Are you sure you want to reset your mental health assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetMentalHealth();
            setResponses({});
            setScore(0);
            setSelectedOption({});
            setHasCompletedAssessment(false);
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderResults = () => (
    <View style={styles.resultsCard}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Today's Mental Well-being</Text>
        <TouchableOpacity 
          style={styles.resetAssessmentButton}
          onPress={resetAssessment}
        >
          <Text style={styles.resetAssessmentText}>New Check-in</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{mentalHealthPercentage}%</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreStatus}>{mentalHealthStatus}</Text>
          <Text style={styles.assessmentDate}>
            Checked in: {formatDate(assessmentDate)}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${mentalHealthPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.resultsDescription}>
        <Text style={styles.resultsDescriptionText}>
          {mentalHealthPercentage >= 85 ? 
            'Your daily check-in indicates excellent mental well-being today. Keep maintaining healthy habits.' :
            mentalHealthPercentage >= 70 ?
            'Your daily check-in indicates good mental well-being today. Continue your positive practices.' :
            mentalHealthPercentage >= 40 ?
            'Your daily check-in indicates moderate mental well-being today. Consider some self-care activities.' :
            'Your daily check-in indicates your mental well-being needs attention today. Consider some wellness activities or speaking with someone you trust.'
          }
        </Text>
      </View>
      
      <View style={styles.tipSection}>
        <View style={styles.tipHeader}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tipTitle}>Today's Wellness Tips</Text>
        </View>
        
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>• Take a 10-minute mindfulness break</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>• Get some physical activity or fresh air</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>• Connect with a friend or loved one</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>• Practice deep breathing for 5 minutes</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipText}>• Do something creative or enjoyable</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Mental Check-in</Text>
          <View style={styles.headerRight}>
            {hasCompletedAssessment && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetAssessment}
              >
                <Ionicons name="refresh" size={22} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {hasCompletedAssessment ? (
          renderResults()
        ) : (
          <>
            <View style={styles.assessmentCard}>
              <Text style={styles.assessmentTitle}>Daily Mental Well-being Check-in</Text>
              <Text style={styles.assessmentDescription}>
                {needsNewAssessment && assessmentDate ? 
                  "It's time for today's mental well-being check-in. Taking a moment each day helps track changes and maintain awareness of your mental health." :
                  "This quick daily check-in helps track your mental well-being day to day. Your responses are private and only used to provide personalized insights."
                }
              </Text>
            </View>
            
            {questions.map((question) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionText}>{question.question}</Text>
                <View style={styles.optionsContainer}>
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
              </View>
            ))}
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                Object.keys(responses).length === questions.length ? 
                  styles.submitButtonActive : styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={Object.keys(responses).length !== questions.length}
            >
              <Text style={styles.submitText}>Complete Daily Check-in</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  resetButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  assessmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  assessmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 5,
  },
  optionButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOptionButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resetAssessmentButton: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetAssessmentText: {
    fontSize: 12,
    color: '#555',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreStatus: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  assessmentDate: {
    fontSize: 14,
    color: '#777',
  },
  progressBarContainer: {
    marginVertical: 15,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  resultsDescription: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  resultsDescriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipSection: {
    marginTop: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tipItem: {
    marginVertical: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  }
});

export default MentalHealth;
