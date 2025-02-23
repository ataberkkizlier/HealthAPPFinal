import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, images } from '../constants';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const slides = [
    {
        image: images.onboardingSplash1,
        title: 'Welcome to HealthApp',
        subtitle: 'Track your health metrics easily',
    },
    {
        image: images.onboardingSplash2,
        title: 'Stay Organized',
        subtitle: 'Manage all your health data in one place',
    },
    {
        image: images.onboardingSplash3,
        title: 'Get Insights',
        subtitle: 'Understand your health patterns',
    },
    {
        image: images.onboardingSplash4,
        title: 'Ready to Start?',
        subtitle: 'Begin your health journey now',
    },
];

const OnboardingCarousel = ({ navigation }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const completeOnboarding = () => {
        navigation.replace('Welcome');
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>

                <View style={styles.buttonContainer}>
                    {index === slides.length - 1 ? (
                        <Button
                            title="Get Started"
                            filled
                            onPress={completeOnboarding}
                            style={styles.button}
                        />
                    ) : (
                        <Button
                            title="Skip"
                            onPress={completeOnboarding}
                            textColor={COLORS.white}
                            style={styles.skipButton}
                        />
                    )}
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            <Carousel
                data={slides}
                renderItem={renderItem}
                width={width}
                onSnapToItem={setActiveIndex}
                autoPlay
                autoPlayInterval={4000}
                loop={false}
            />
            <View style={styles.pagination}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            activeIndex === index && styles.activeDot
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    slide: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    gradient: {
        height: '40%',
        padding: 20,
        justifyContent: 'flex-end',
    },
    title: {
        fontSize: 32,
        color: COLORS.white,
        fontFamily: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.white,
        fontFamily: 'regular',
        marginBottom: 30,
    },
    pagination: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.gray,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 20,
    },
    buttonContainer: {
        marginTop: 20,
    },
    button: {
        width: '100%',
        borderRadius: 30,
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
});

export default OnboardingCarousel;