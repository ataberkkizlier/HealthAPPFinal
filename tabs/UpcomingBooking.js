import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { upcomingAppointments } from '../data';
import { SIZES, COLORS, icons } from '../constants';
import RBSheet from "react-native-raw-bottom-sheet";
import { useTheme } from '../theme/ThemeProvider';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from "@expo/vector-icons";

const UpcomingBooking = () => {
  const [bookings, setBookings] = useState(upcomingAppointments);
  const refRBSheet = useRef();
  const { dark } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, {
      backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite
    }]}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.cardContainer, {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate({
                name:
                  item.package === "Messaging" ? "MyAppointmentMessaging" :
                    item.package === "Video Call" ? "MyAppointmentVideoCall" :
                      item.package === "Voice Call" ? "MyAppointmentVoiceCall" : null
              })}
              style={styles.detailsViewContainer}>
              <View style={styles.detailsContainer}>
                <View>
                  <Image
                    source={item.image}
                    resizeMode='cover'
                    style={styles.serviceImage}
                  />
                  <View style={styles.reviewContainer}>
                    <FontAwesome name="star" size={12} color="orange" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
                <View style={styles.detailsRightContainer}>
                  <Text style={[styles.name, {
                    color: dark ? COLORS.secondaryWhite : COLORS.greyscale900
                  }]}>{item.doctor}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.address, {
                      color: dark ? COLORS.grayscale400 : COLORS.grayscale700,
                    }]}>{item.package} - </Text>
                    <View style={styles.statusContainer}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.address, {
                    color: dark ? COLORS.grayscale400 : COLORS.grayscale700,
                  }]}>{item.date}</Text>

                </View>
              </View>
              <TouchableOpacity
               onPress={() => navigation.navigate({
                name:
                  item.package === "Messaging" ? "MyAppointmentMessaging" :
                    item.package === "Video Call" ? "MyAppointmentVideoCall" :
                      item.package === "Voice Call" ? "MyAppointmentVoiceCall" : null
              })} 
               style={styles.iconContainer}>
                <Image
                  source={
                    item.package === "Messaging"
                      ? icons.chatBubble2
                      : item.package === "Video Call"
                        ? icons.videoCamera
                        : item.package === "Voice Call"
                          ? icons.telephone
                          : null // Add a fallback in case none of the conditions match
                  }
                  resizeMode='contain'
                  style={styles.chatIcon}
                />
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={[styles.separateLine, {
              marginVertical: 10,
              backgroundColor: dark ? COLORS.greyScale800 : COLORS.grayscale200,
            }]} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => refRBSheet.current.open()}
                style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("RescheduleAppointment")}
                style={styles.receiptBtn}>
                <Text style={styles.receiptBtnText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={false}
        height={332}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          draggableIcon: {
            backgroundColor: dark ? COLORS.greyscale300 : COLORS.greyscale300,
          },
          container: {
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            height: 332,
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            alignItems: "center",
            width: "100%"
          }
        }}>
        <Text style={[styles.bottomSubtitle, {
          color: dark ? COLORS.red : COLORS.red
        }]}>Cancel Appointment</Text>
        <View style={[styles.separateLine, {
          backgroundColor: dark ? COLORS.greyScale800 : COLORS.grayscale200,
        }]} />

        <View style={styles.selectedCancelContainer}>
          <Text style={[styles.cancelTitle, {
            color: dark ? COLORS.secondaryWhite : COLORS.greyscale900
          }]}>Are you sure you want to cancel your appointment?</Text>
          <Text style={[styles.cancelSubtitle, {
            color: dark ? COLORS.grayscale400 : COLORS.grayscale700
          }]}>Only 80% of the money you can refund from your payment according to our policy.</Text>
        </View>

        <View style={styles.bottomContainer}>
          <Button
            title="Cancel"
            style={{
              width: (SIZES.width - 32) / 2 - 8,
              backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary,
              borderRadius: 32,
              borderColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary
            }}
            textColor={dark ? COLORS.white : COLORS.primary}
            onPress={() => refRBSheet.current.close()}
          />
          <Button
            title="Yes, Cancel"
            filled
            style={styles.removeButton}
            onPress={() => {
              refRBSheet.current.close();
              navigation.navigate("CancelAppointment");
            }}
          />
        </View>
      </RBSheet>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.tertiaryWhite,
    marginVertical: 22
  },
  cardContainer: {
    width: SIZES.width - 32,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.greyscale900
  },
  statusContainer: {
    width: 58,
    height: 24,
    borderRadius: 6,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1
  },
  statusText: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: "medium",
  },
  separateLine: {
    width: "100%",
    height: .7,
    backgroundColor: COLORS.greyScale800,
    marginVertical: 12
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    marginHorizontal: 12
  },
  detailsRightContainer: {
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontFamily: "bold",
    color: COLORS.greyscale900
  },
  address: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayscale700,
    marginVertical: 6
  },
  serviceTitle: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayscale700,
  },
  serviceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: "medium",
    marginTop: 6
  },
  cancelBtn: {
    width: (SIZES.width - 32) / 2 - 16,
    height: 36,
    borderRadius: 24,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderColor: COLORS.primary,
    borderWidth: 1.4,
    marginBottom: 12
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.primary,
  },
  receiptBtn: {
    width: (SIZES.width - 32) / 2 - 16,
    height: 36,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderColor: COLORS.primary,
    borderWidth: 1.4,
    marginBottom: 12
  },
  receiptBtnText: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  remindMeText: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayscale700,
    marginVertical: 4
  },
  switch: {
    marginLeft: 8,
    transform: [{ scaleX: .8 }, { scaleY: .8 }], // Adjust the size of the switch
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    paddingHorizontal: 16,
    width: "100%"
  },
  cancelButton: {
    width: (SIZES.width - 32) / 2 - 8,
    backgroundColor: COLORS.tansparentPrimary,
    borderRadius: 32
  },
  removeButton: {
    width: (SIZES.width - 32) / 2 - 8,
    backgroundColor: COLORS.primary,
    borderRadius: 32
  },
  bottomTitle: {
    fontSize: 24,
    fontFamily: "semiBold",
    color: "red",
    textAlign: "center",
  },
  bottomSubtitle: {
    fontSize: 22,
    fontFamily: "bold",
    color: COLORS.greyscale900,
    textAlign: "center",
    marginVertical: 12
  },
  selectedCancelContainer: {
    marginVertical: 24,
    paddingHorizontal: 36,
    width: "100%"
  },
  cancelTitle: {
    fontSize: 18,
    fontFamily: "semiBold",
    color: COLORS.greyscale900,
    textAlign: "center",
  },
  cancelSubtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.grayscale700,
    textAlign: "center",
    marginVertical: 8,
    marginTop: 16
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: "semiBold",
    color: COLORS.primary,
    textAlign: "center",
  },
  duration: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.grayscale700,
    textAlign: "center",
  },
  priceItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,

  },
  reviewContainer: {
    position: "absolute",
    top: 6,
    right: 16,
    width: 46,
    height: 20,
    borderRadius: 16,
    backgroundColor: COLORS.transparentWhite2,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  rating: {
    fontSize: 12,
    fontFamily: "semiBold",
    color: COLORS.primary,
    marginLeft: 4
  },
  detailsViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  iconContainer: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: COLORS.tansparentPrimary,
    alignItems: "center",
    justifyContent: "center"
  },
  chatIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.primary
  }
})

export default UpcomingBooking