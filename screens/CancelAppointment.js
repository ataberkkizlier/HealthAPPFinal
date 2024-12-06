import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from 'react-native-safe-area-context';
import ReasonItem from '../components/ReasonItem';
import Button from '../components/Button';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeProvider';

const CancelAppointment = ({ navigation }) => {
  const { colors, dark } = useTheme();
  /***
   * Render content
  */
  const renderContent = () => {
    const [comment, setComment] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const handleCheckboxPress = (itemTitle) => {
      if (selectedItem === itemTitle) {
        // If the clicked item is already selected, deselect it
        setSelectedItem(null);
      } else {
        // Otherwise, select the clicked item
        setSelectedItem(itemTitle);
      }
    };

    const handleCommentChange = (text) => {
      setComment(text);
    };
    return (
      <View style={{ marginVertical: 12 }}>
        <Text style={[styles.inputLabel, {
          color: dark ? COLORS.grayscale100 : COLORS.greyscale900
        }]}>Please select the reason for the cancellations</Text>
        <View style={{ marginVertical: 16 }}>
          <ReasonItem
            checked={selectedItem === 'I want to change to another doctor'} // Check if it's the selected item
            onPress={() => handleCheckboxPress('I want to change to another doctor')} // Pass the item title
            title="I want to change to another doctor"
          />
          <ReasonItem
            checked={selectedItem === 'I want to change package'}
            onPress={() => handleCheckboxPress('I want to change package')}
            title="I want to change package"
          />
          <ReasonItem
            checked={selectedItem === "I don't want to consult"}
            onPress={() => handleCheckboxPress("I don't want to consult")}
            title="I don't want to consult"
          />
          <ReasonItem
            checked={selectedItem === "I have recovered from the disease"}
            onPress={() => handleCheckboxPress("I have recovered from the disease")}
            title="I have recovered from the disease"
          />
          <ReasonItem
            checked={selectedItem === 'I have found a suitable medicine'}
            onPress={() => handleCheckboxPress('I have found a suitable medicine')}
            title="I have found a suitable medicine"
          />
           <ReasonItem
            checked={selectedItem === 'I just want to cancel'}
            onPress={() => handleCheckboxPress('I just want to cancel')}
            title="I just want to cancel"
          />
           <ReasonItem
            checked={selectedItem === "I don't want to tell"}
            onPress={() => handleCheckboxPress("I don't want to tell")}
            title="I don't want to tell"
          />
          <ReasonItem
            checked={selectedItem === 'Others'}
            onPress={() => handleCheckboxPress('Others')}
            title="Others"
          />
        </View>
        <Text style={[styles.inputLabel, {
          color: dark ? COLORS.grayscale100 : COLORS.greyscale900
        }]}>Add detailed reason</Text>
        <TextInput
          style={[styles.input, {
            color: dark ? COLORS.secondaryWhite : COLORS.greyscale900,
            borderColor: dark ? COLORS.grayscale100 : COLORS.greyscale900
          }]}
          placeholder="Write your reason here..."
          placeholderTextColor={dark ? COLORS.secondaryWhite : COLORS.greyscale900}
          multiline={true}
          numberOfLines={4} // Set the number of lines you want to display initially
        />
      </View>
    )
  }

  /**
      * Render submit buttons
      */
  const renderSubmitButton = () => {
    return (
      <View style={[styles.btnContainer, {
        backgroundColor: colors.background
      }]}>
        <Button
          title="Submit"
          filled
          style={styles.submitBtn}
          onPress={() => navigation.navigate("CancelAppointmentPaymentMethods")}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Cancel Appointment" />
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
      {renderSubmitButton()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
    alignItems: "center"
  },
  headerIcon: {
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: COLORS.gray
  },
  arrowLeft: {
    height: 24,
    width: 24,
    tintColor: COLORS.black
  },
  moreIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black
  },
  input: {
    borderColor: "gray",
    borderWidth: .3,
    borderRadius: 5,
    width: "100%",
    padding: 10,
    paddingBottom: 10,
    fontSize: 12,
    height: 150,
    textAlignVertical: "top"
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 16
  },
  btnContainer: {
    position: "absolute",
    bottom: 22,
    height: 72,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    alignItems: "center"
  },
  btn: {
    height: 48,
    width: SIZES.width - 32,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  submitBtn: {
    width: SIZES.width - 32,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.white
  },
})

export default CancelAppointment