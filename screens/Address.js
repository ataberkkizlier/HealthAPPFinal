import { View, StyleSheet, FlatList } from 'react-native';
import React from 'react';
import { COLORS, SIZES } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { userAddresses } from '../data';
import UserAddressItem from '../components/UserAddressItem';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';

// user address location
const Address = ({ navigation }) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Address" />
                <ScrollView
                    contentContainerStyle={{ marginVertical: 12 }}
                    showsVerticalScrollIndicator={false}>
                    <FlatList
                        data={userAddresses}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <UserAddressItem
                                name={item.name}
                                address={item.address}
                                onPress={() => console.log("Clicked")}
                            />
                        )}
                    />
                </ScrollView>
            </View>
            <View style={styles.btnContainer}>
                <Button
                    title="Add New Address"
                    onPress={() => navigation.navigate("AddNewAddress")}
                    filled
                    style={styles.btn}
                />
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
    btnContainer: {
        alignItems: "center"
    },
    btn: {
        width: SIZES.width - 32,
        paddingHorizontal: 16,
    }
})

export default Address