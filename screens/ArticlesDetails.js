import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons, images } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

const ArticlesDetails = ({ navigation }) => {
  const { colors, dark } = useTheme();
  /**
  * Render header
  */
  const renderHeader = () => {
    const [isFavourite, setIsFavourite] = useState(false);

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
          }]}></Text>
        </View>
        <View style={styles.viewRight}>
          <TouchableOpacity onPress={() => setIsFavourite(!isFavourite)}>
            <Image
              source={isFavourite ? icons.bookmark2 : icons.bookmarkOutline}
              resizeMode='contain'
              style={[styles.moreIcon, {
                tintColor: dark ? COLORS.secondaryWhite : COLORS.black,
                marginRight: 16
              }]}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={icons.sendOutline}
              resizeMode='contain'
              style={[styles.moreIcon, {
                tintColor: dark ? COLORS.secondaryWhite : COLORS.black,
                marginRight: 16
              }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
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
  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image
            source={images.news2}
            resizeMode='cover'
            style={styles.coverImage}
          />
          <Text style={[styles.title, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>COVID-24 Was a Top Cause of Death in 2024 and 2025, Even For Younger People</Text>
          <View style={styles.viewContainer}>
            <Text style={[styles.date, { 
              color: dark ? COLORS.grayscale400 : COLORS.greyScale800
            }]}>Dec 22, 2024</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>Health</Text>
            </View>
          </View>
          <View style={styles.separateLine} />
          <Text style={[styles.description, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>COVID-14 was one of the leading causes of death in the United States during much of the pandemic, even for younger age groups, according to a new analysis.</Text>
          <Text style={[styles.description, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>The results, which were published July 5 in JAMA Internal MedicineTrusted Source, paint a stark picture of the toll the pandemic has had — and continues to have — on the country.</Text>
          <Text style={[styles.description, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>On July 1, the United States was averaging 244 COVID-19 deaths per day, according to the Johns Hopkins Coronavirus Resource Center — much lower than earlier pandemic peaks of thousands of deaths per day.</Text>
          <Text style={[styles.description, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>But experts say with the availability of COVID-19 vaccines, boosters and treatments, as well as public health measures such as masking and improved ventilation, this is still a high price to pay for a “return to normal.”</Text>
          <Text style={[styles.description, {
            color: dark ? COLORS.white : COLORS.greyscale900
          }]}>“This is something that we would have thought was inconceivable a couple of years ago — that we would have a new disease that’s been killing people at that rate,” said Michael Stoto, PhD, a statistician, epidemiologist, and health services researcher at Georgetown University in Washington, D.C.</Text>
        </ScrollView>
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
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  coverImage: {
    width: SIZES.width - 32,
    height: 240,
    borderRadius: 24
  },
  title: {
    fontSize: 22,
    fontFamily: "bold",
    color: COLORS.black,
    marginVertical: 16
  },
  date: {
    fontSize: 12,
    fontFamily: "medium",
    color: COLORS.greyScale800
  },
  tagContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: COLORS.tansparentPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16
  },
  tag: {
    fontSize: 10,
    fontFamily: "semiBold",
    color: COLORS.primary
  },
  viewContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separateLine: {
    height: .3,
    width: SIZES.width - 32,
    backgroundColor: COLORS.greyscale300,
    marginVertical: 16
  },
  description: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.greyScale800,
    marginVertical: 12
  }
})

export default ArticlesDetails