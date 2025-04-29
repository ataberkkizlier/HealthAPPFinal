import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressBar = ({ progress, color = '#007bff', height = 10 }) => {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.progressBar,
          { 
            width: `${validProgress}%`,
            backgroundColor: color
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%'
  }
});

export default ProgressBar; 