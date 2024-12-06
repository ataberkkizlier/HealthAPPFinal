import { Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

const SocialIcon = ({ icon, name, onPress }) => {
  const { dark } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={icon}
        resizeMode='contain'
        style={styles.icon}
      />
      <Text style={[styles.name, {
        color: dark ? COLORS.white : COLORS.greyscale900
      }]}>{name}</Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column"
  },
  icon: {
    width: (SIZES.width - 32) / 4 - 24,
    height: (SIZES.width - 32) / 4 - 24,
  },
  name: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "center",
    fontFamily: "regular",
    marginTop: 6
  }
})

export default SocialIcon