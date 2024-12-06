import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import { COLORS, SIZES, illustrations, images } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import Rating from '../components/Rating';
import { FontAwesome } from '@expo/vector-icons';
import Button from '../components/Button';

const LeaveReview = ({ navigation }) => {
  const { colors, dark } = useTheme();
  const [selection, setSelection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const RoundedCheckbox = ({ label, isSelected, onSelect }) => {
    return (
      <TouchableOpacity onPress={onSelect} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <FontAwesome name="check" size={16} color="white" />}
        </View>
        <Text style={[styles.label,{ 
          color: dark ? COLORS.white : COLORS.greyscale900
        }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Render modal
  const renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}>
        <TouchableWithoutFeedback
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalSubContainer, {
              backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            }]}>
              <View style={styles.backgroundIllustration}>
                <Image
                  source={illustrations.star}
                  resizeMode='contain'
                  style={styles.modalIllustration}
                />
              </View>
              <Text style={styles.modalTitle}>Review Successful!</Text>
              <Text style={[styles.modalSubtitle, {
                color: dark ? COLORS.grayscale200 : COLORS.black,
              }]}>
                Your review has been successfully submitted, thank you very much!
              </Text>
              <Button
                title="Okay"
                filled
                onPress={() => {
                  setModalVisible(false)
                  navigation.navigate("Home")
                }}
                style={styles.successBtn}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Write a Review" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.background}>
            <Image
              source={images.doctor5}
              resizeMode='contain'
              style={styles.doctorImage}
            />
            <Text style={[styles.description, { 
              color: dark ? COLORS.grayscale200 : COLORS.greyscale900
            }]}>How was your experience
              with Dr. Drake Boeson?</Text>
            <View>
              <Rating color={COLORS.primary} />
            </View>
            <View style={styles.separateLine} />
          </View>
          <Text style={[styles.title, { 
            color: dark ? COLORS.white : COLORS.greyscale900,
          }]}>Write Your Review</Text>
          <TextInput
            placeholder='Your review here...'
            style={[styles.reviewInput, { 
              backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite,
              color: dark? COLORS.grayscale200 : COLORS.greyscale900,
            }]}
            multiline={true}
          />
          <Text style={[styles.title, { 
            color: dark ? COLORS.white : COLORS.greyscale900,
          }]}>Would you recommend Dr. Drake Boeson to your friends?</Text>
          <View style={styles.roundedContainer}>
            <RoundedCheckbox
              label="Yes"
              isSelected={selection === 'Yes'}
              onSelect={() => setSelection('Yes')}
            />
            <RoundedCheckbox
              label="No"
              isSelected={selection === 'No'}
              onSelect={() => setSelection('No')}
            />
          </View>
        </ScrollView>
      </View>
      <View style={[styles.bottomContainer, { 
        backgroundColor: dark ? COLORS.dark1 : COLORS.white,
      }]}>
        <Button
          title="Cancel"
          style={styles.btnCancel}
          onPress={() => navigation.navigate("Home")}
        />
        <Button
          title="Submit"
          filled
          style={styles.btnSubmit}
          onPress={() => setModalVisible(true)}
        />
      </View>
      {renderModal()}
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16
  },
  background: {
    alignItems: "center"
  },
  doctorImage: {
    height: 160,
    width: 160,
    borderRadius: 999,
    marginVertical: 16
  },
  description: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.greyscale900,
    marginVertical: 8,
    textAlign: "center",
    width: 260
  },
  separateLine: {
    width: "100%",
    height: .2,
    backgroundColor: COLORS.greyscale300,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.greyscale900,
    marginVertical: 8
  },
  reviewInput: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.tertiaryWhite,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 6,
    paddingVertical: 8,
    borderColor: COLORS.primary,
    textAlignVertical: "top",
    fontFamily: "regular",
  },
  roundedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
    width: 140
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.greyscale900,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 112,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 16
  },
  btnCancel: {
    width: (SIZES.width - 32) / 2 - 18,
    backgroundColor: COLORS.tansparentPrimary,
    borderWidth: 0
  },
  btnSubmit: {
    width: (SIZES.width - 32) / 2 - 18
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 12
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.black,
    textAlign: "center",
    marginVertical: 12
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  modalSubContainer: {
    height: 460,
    width: SIZES.width * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  modalIllustration: {
    height: 180,
    width: 180,
    marginVertical: 22
  },
  successBtn: {
    width: "100%",
    marginTop: 12,
    borderRadius: 32
  },
  receiptBtn: {
    width: "100%",
    marginTop: 12,
    borderRadius: 32,
    backgroundColor: COLORS.tansparentPrimary,
    borderColor: COLORS.tansparentPrimary
  },
  editPencilIcon: {
    width: 42,
    height: 42,
    tintColor: COLORS.white,
    zIndex: 99999,
    position: "absolute",
    top: 54,
    left: 58,
  },
  backgroundIllustration: {
    height: 150,
    width: 150,
    marginVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -999
  },
})

export default LeaveReview