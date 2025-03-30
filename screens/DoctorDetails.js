import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, images } from '../constants';
import { ScrollView } from 'react-native-virtualized-view';
import { doctorReviews } from '../data';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';

const DoctorDetails = ({ navigation, route }) => {
    const { dark, colors } = useTheme();
    const [isFavourite, setIsFavourite] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Critical param check FIRST
    if (!route.params?.doctor) {
        Alert.alert(
            "Error",
            "Doctor data not found",
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return null;
    }

    // Direct destructuring with defaults
    const {
        name = "Dr. Unknown",
        image = images.doctor1,
        type = "General Practitioner",
        hospital = "General Hospital",
        patients = 0,
        yearsExperience = 5,
        rating = "4.5",
        numReviews = "0",
        workingTime = "Monday - Friday, 09:00 AM - 05:00 PM",
        description = "No description available",
        isAvailable = true,
        consultationFee = "$0"
    } = route.params.doctor;

    const safeDoctor = {
        name,
        image,
        speciality: type,
        hospital,
        patients: typeof patients === 'number' ? patients : parseInt(patients),
        yearsExperience: parseInt(yearsExperience),
        rating: rating.toString(),
        numReviews,
        workingTime,
        description,
        isAvailable,
        consultationFee
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            source={icons.back}
                            resizeMode='contain'
                            style={[styles.backIcon, {
                                tintColor: dark ? COLORS.white : COLORS.black,
                            }]}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: dark ? COLORS.white : COLORS.black,
                    }]}>{safeDoctor.name}</Text>
                </View>
                <View style={styles.viewRight}>
                    <TouchableOpacity onPress={() => setIsFavourite(!isFavourite)}>
                        <Image
                            source={isFavourite ? icons.heart2 : icons.heart2Outline}
                            resizeMode='contain'
                            style={[styles.heartIcon, {
                                tintColor: isFavourite ? COLORS.primary : COLORS.greyscale900,
                            }]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        return (
            <View>
                <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }}>
                    <View style={[styles.doctorCard, {
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    }]}>
                        <Image
                            source={safeDoctor.image}
                            resizeMode='contain'
                            style={styles.doctorImage}
                        />
                        <View>
                            <Text style={[styles.doctorName, {
                                color: dark ? COLORS.white : COLORS.greyscale900,
                            }]}>{safeDoctor.name}</Text>
                            <View style={[styles.separateLine, {
                                backgroundColor: dark ? COLORS.grayscale700 : COLORS.grayscale200,
                            }]} />
                            <Text style={[styles.doctorSpeciality, {
                                color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                            }]}>{safeDoctor.speciality}</Text>
                            <Text style={[styles.doctorHospital, {
                                color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                            }]}>{safeDoctor.hospital}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.featureContainer}>
                    <View style={styles.featureItemContainer}>
                        <View style={styles.featureIconContainer}>
                            <Image
                                source={icons.friends}
                                resizeMode='contain'
                                style={styles.featureIcon}
                            />
                        </View>
                        <Text style={styles.featureItemNum}>{safeDoctor.patients}+</Text>
                        <Text style={[styles.featureItemName, {
                            color: dark ? COLORS.greyscale300 : COLORS.greyScale800,
                        }]}>patients</Text>
                    </View>
                    <View style={styles.featureItemContainer}>
                        <View style={styles.featureIconContainer}>
                            <Image
                                source={icons.activity}
                                resizeMode='contain'
                                style={styles.featureIcon}
                            />
                        </View>
                        <Text style={styles.featureItemNum}>{safeDoctor.yearsExperience}+</Text>
                        <Text style={[styles.featureItemName, {
                            color: dark ? COLORS.greyscale300 : COLORS.greyScale800,
                        }]}>years expert.</Text>
                    </View>
                    <View style={styles.featureItemContainer}>
                        <View style={styles.featureIconContainer}>
                            <Image
                                source={icons.starHalf}
                                resizeMode='contain'
                                style={styles.featureIcon}
                            />
                        </View>
                        <Text style={styles.featureItemNum}>{safeDoctor.rating}</Text>
                        <Text style={[styles.featureItemName, {
                            color: dark ? COLORS.greyscale300 : COLORS.greyScale800,
                        }]}>rating</Text>
                    </View>
                    <View style={styles.featureItemContainer}>
                        <View style={styles.featureIconContainer}>
                            <Image
                                source={icons.chatBubble2}
                                resizeMode='contain'
                                style={styles.featureIcon}
                            />
                        </View>
                        <Text style={styles.featureItemNum}>{safeDoctor.numReviews}</Text>
                        <Text style={[styles.featureItemName, {
                            color: dark ? COLORS.greyscale300 : COLORS.greyScale800,
                        }]}>reviews</Text>
                    </View>
                </View>

                <Text style={[styles.contentTitle, {
                    color: dark ? COLORS.secondaryWhite : COLORS.greyscale900,
                }]}>About me</Text>
                <Text style={[styles.description, {
                    color: dark ? COLORS.grayscale400 : COLORS.grayscale700,
                }]} numberOfLines={expanded ? undefined : 2}>
                    {safeDoctor.description}
                </Text>
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <Text style={styles.viewBtn}>
                        {expanded ? 'View Less' : 'View More'}
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.contentTitle, {
                    color: dark ? COLORS.secondaryWhite : COLORS.greyscale900,
                }]}>Working Time</Text>
                <Text style={[styles.description, {
                    color: dark ? COLORS.grayscale400 : COLORS.grayscale700,
                }]}>{safeDoctor.workingTime}</Text>

                <View style={styles.reviewTitleContainer}>
                    <Text style={[styles.contentTitle, {
                        color: dark ? COLORS.secondaryWhite : COLORS.greyscale900,
                    }]}>Reviews</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("DoctorReviews")}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={doctorReviews.slice(0, 2)}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ReviewCard
                            avatar={item.avatar}
                            name={item.name}
                            description={item.description}
                            avgRating={item.avgRating}
                            date={item.date}
                            numLikes={item.numLikes}
                        />
                    )}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                <ScrollView
                    style={[styles.scrollView, { backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }]}
                    showsVerticalScrollIndicator={false}>
                    {renderContent()}
                </ScrollView>
            </View>
            <View style={[styles.bottomContainer, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            }]}>
                <Button
                    title="Book Appointment"
                    filled
                    style={styles.btn}
                    onPress={() => navigation.navigate("BookAppointment", { doctor: safeDoctor })}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16,
    },
    scrollView: {
        backgroundColor: COLORS.tertiaryWhite,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "bold",
        color: COLORS.black,
    },
    moreIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.black,
    },
    heartIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900,
        marginRight: 16,
    },
    viewRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    doctorCard: {
        height: 142,
        width: SIZES.width - 32,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        flexDirection: "row",
        alignItems: "center",
    },
    doctorImage: {
        height: 110,
        width: 110,
        borderRadius: 16,
        marginHorizontal: 16,
    },
    doctorName: {
        fontSize: 18,
        color: COLORS.greyscale900,
        fontFamily: "bold",
    },
    separateLine: {
        height: 1,
        width: SIZES.width - 32,
        backgroundColor: COLORS.grayscale200,
        marginVertical: 12,
    },
    doctorSpeciality: {
        fontSize: 12,
        color: COLORS.greyScale800,
        fontFamily: "medium",
        marginBottom: 8,
    },
    doctorHospital: {
        fontSize: 12,
        color: COLORS.greyScale800,
        fontFamily: "medium",
    },
    featureContainer: {
        width: SIZES.width - 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 16,
    },
    featureItemContainer: {
        alignItems: "center",
    },
    featureIconContainer: {
        height: 60,
        width: 60,
        backgroundColor: COLORS.tansparentPrimary,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
    featureIcon: {
        height: 28,
        width: 28,
        tintColor: COLORS.primary,
    },
    featureItemNum: {
        fontSize: 16,
        fontFamily: "bold",
        color: COLORS.primary,
        marginVertical: 6,
    },
    featureItemName: {
        fontSize: 12,
        fontFamily: "medium",
        color: COLORS.greyScale800,
    },
    contentTitle: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginVertical: 16,
    },
    description: {
        fontSize: 14,
        color: COLORS.grayscale700,
        fontFamily: "regular",
    },
    viewBtn: {
        color: COLORS.primary,
        marginTop: 5,
        fontSize: 14,
        fontFamily: "semiBold",
    },
    reviewTitleContainer: {
        width: SIZES.width - 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    seeAll: {
        color: COLORS.primary,
        fontSize: 16,
        fontFamily: "bold",
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 99,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
    },
    btn: {
        width: SIZES.width - 32,
    },
});

export default DoctorDetails;