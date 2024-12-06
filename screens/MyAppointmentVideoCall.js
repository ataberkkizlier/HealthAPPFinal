import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, images } from '../constants';
import { ScrollView } from 'react-native-virtualized-view';

const MyAppointmentVideoCall = ({ navigation }) => {
  const { dark } = useTheme();

  /**
   * Render header
   */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}>
            <Image
              source={icons.back}
              resizeMode='contain'
              style={[styles.backIcon, {
                tintColor: dark ? COLORS.white : COLORS.black
              }]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {
            color: dark ? COLORS.white : COLORS.black
          }]}>My Appointment</Text>
        </View>
        <View style={styles.viewRight}>
          <TouchableOpacity>
            <Image
              source={icons.moreCircle}
              resizeMode='contain'
              style={[styles.moreIcon, {
                tintColor: dark ? COLORS.secondaryWhite : COLORS.black
              }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  /**
   * render content
   */

  const renderContent = () => {
    return (
      <View>
        <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }}>
          <View style={[styles.doctorCard, {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
          }]}>
            <Image
              source={images.doctor5}
              resizeMode='contain'
              style={styles.doctorImage}
            />
            <View>
              <Text style={[styles.doctorName, {
                color: dark ? COLORS.white : COLORS.greyscale900
              }]}>Dr.  Jenny Watson</Text>
              <View style={[styles.separateLine, {
                backgroundColor: dark ? COLORS.grayscale700 : COLORS.grayscale200,
              }]} />
              <Text style={[styles.doctorSpeciality, {
                color: dark ? COLORS.grayscale400 : COLORS.greyScale800
              }]}>Immunologists</Text>
              <Text style={[styles.doctorHospital, {
                color: dark ? COLORS.grayscale400 : COLORS.greyScale800
              }]}>Christ Hospital in London, UK</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.subtitle, {
          color: dark ? COLORS.grayscale200 : COLORS.greyscale900
        }]}>Scheduled Appointment</Text>
        <Text style={[styles.description, {
          color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
        }]}>Today, December 22, 2022</Text>
        <Text style={[styles.description, {
          color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
        }]}>16:00 - 16:30 PM (30 minutes)</Text>
        <Text style={[styles.subtitle, {
          color: dark ? COLORS.grayscale200 : COLORS.greyscale900
        }]}>Patient Information</Text>
        <View style={styles.viewContainer}>
          <View style={styles.viewLeft}>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>Full Name</Text>
          </View>
          <View>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>:  Andrew Ainsley</Text>
          </View>
        </View>
        <View style={styles.viewContainer}>
          <View style={styles.viewLeft}>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>Gender</Text>
          </View>
          <View>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>:  Male</Text>
          </View>
        </View>
        <View style={styles.viewContainer}>
          <View style={styles.viewLeft}>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>Age</Text>
          </View>
          <View>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>:  27</Text>
          </View>
        </View>
        <View style={styles.viewContainer}>
          <View style={styles.viewLeft}>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>Problem</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.description, {
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
            }]}>:  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. </Text>
          </View>
        </View>
        <Text style={[styles.subtitle, {
          color: dark ? COLORS.grayscale200 : COLORS.greyscale900
        }]}>Your Package</Text>
        <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }}>
          <View style={[styles.pkgContainer, {
            backgroundColor: dark ? COLORS.dark2 : COLORS.white
          }]}>
            <View style={styles.pkgLeftContainer}>
              <View style={styles.pkgIconContainer}>
                <Image
                  source={icons.videoCamera}
                  resizeMode='contain'
                  style={styles.pkgIcon}
                />
              </View>
              <View>
                <Text style={[styles.pkgTitle, {
                  color: dark ? COLORS.greyscale300 : COLORS.greyscale900
                }]}>Video Call</Text>
                <Text style={[styles.pkgDescription, {
                  color: dark ? COLORS.greyscale300 : COLORS.greyScale800
                }]}>Video call with doctor</Text>
              </View>
            </View>
            <View style={styles.pkgRightContainer}>
              <Text style={styles.pkgPrice}>$40</Text>
              <Text style={[styles.pkgPriceTag, {
                color: dark ? COLORS.grayscale400 : COLORS.greyScale800
              }]}>(paid)</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: dark ? COLORS.dark1 : COLORS.white }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
      <View style={[styles.bottomContainer, {
        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
      }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("VideoCall")}
          style={styles.btn}>
          <Image
            source={icons.videoCamera}
            resizeMode='contain'
            style={styles.btnIcon}
          />
          <Text style={styles.btnText}>Video Call (Start at 10:00 AM)</Text>
        </TouchableOpacity>
      </View>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16
  },
  scrollView: {
    backgroundColor: COLORS.tertiaryWhite
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  backIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.black,
    marginRight: 16
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "bold",
    color: COLORS.black
  },
  moreIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black
  },
  heartIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.greyscale900,
    marginRight: 16
  },
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  doctorCard: {
    height: 142,
    width: SIZES.width - 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12
  },
  doctorImage: {
    height: 110,
    width: 110,
    borderRadius: 16,
    marginHorizontal: 16
  },
  doctorName: {
    fontSize: 18,
    color: COLORS.greyscale900,
    fontFamily: "bold"
  },
  separateLine: {
    height: 1,
    width: SIZES.width - 32,
    backgroundColor: COLORS.grayscale200,
    marginVertical: 12
  },
  doctorSpeciality: {
    fontSize: 12,
    color: COLORS.greyScale800,
    fontFamily: "medium",
    marginBottom: 8
  },
  doctorHospital: {
    fontSize: 12,
    color: COLORS.greyScale800,
    fontFamily: "medium"
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.greyscale900,
    marginVertical: 8
  },
  description: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.greyScale800,
    marginVertical: 6
  },
  viewContainer: {
    flexDirection: "row",
    marginVertical: 2,
  },
  viewLeft: {
    width: 120,
  },
  pkgContainer: {
    height: 100,
    width: SIZES.width - 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12
  },
  pkgLeftContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  pkgIconContainer: {
    height: 60,
    width: 60,
    borderRadius: 999,
    backgroundColor: COLORS.tansparentPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginRight: 12
  },
  pkgIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.primary
  },
  pkgTitle: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.greyscale900,
    marginVertical: 8
  },
  pkgDescription: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.greyScale800,
  },
  pkgRightContainer: {
    alignItems: "center",
    marginRight: 12
  },
  pkgPrice: {
    fontSize: 18,
    fontFamily: "bold",
    color: COLORS.primary,
    marginBottom: 4
  },
  pkgPriceTag: {
    fontSize: 10,
    fontFamily: "medium",
    color: COLORS.greyScale800
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 99,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center"
  },
  btn: {
    height: 58,
    width: SIZES.width - 32,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  btnIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.white,
    marginRight: 16
  },
  btnText: {
    fontSize: 16,
    fontFamily: "bold",
    color: COLORS.white
  }
})

export default MyAppointmentVideoCall