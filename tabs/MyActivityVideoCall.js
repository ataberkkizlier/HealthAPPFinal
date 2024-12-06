import { View, FlatList } from 'react-native';
import React from 'react';
import { COLORS, icons } from '../constants';
import { videoCallData } from '../data';
import CallCard from '../components/CallCard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';

const MyActivityVideoCall = () => {
    const navigation = useNavigation();
    const { dark } = useTheme();

    return (
        <View style={{
            backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite,
            marginVertical: 12
        }}>
            <FlatList
                data={videoCallData}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <CallCard
                        name={item.name}
                        image={item.image}
                        type={item.type}
                        date={item.date}
                        time={item.time}
                        icon={icons.next2}
                        onPress={() => navigation.navigate("VideoCallHistoryDetails")}
                    />
                )}
            />
        </View>
    )
}

export default MyActivityVideoCall