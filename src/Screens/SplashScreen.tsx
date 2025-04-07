import React from 'react';
import { StyleSheet, Image, Text, View, Dimensions } from 'react-native';
import { Button } from '../Components/Button';
import { FadeInView } from '../Components/AnimatedDisplay';
// import { generateWallet, loadWallet } from '../utils/web3';
// import * as SecureStore from 'expo-secure-store';

// async function save(key, value) {
//     await SecureStore.setItemAsync(key, value);
// }

// async function getValueFor(key) {
//     return SecureStore.getItemAsync(key);
// }

const SplashScreen = ({
    navigation
}) => {

    // const [wallet, setWallet] = React.useState<any>();
  
    navigation.setOptions({
        headerTitle: () => null,
    });

    // React.useEffect(() => {
    //     const fetchWallet = async () => {
    //         const pk = await getValueFor('WALLET_PK');
    //         if (pk) {
    //             const existingWallet = loadWallet(pk);
    //             setWallet(existingWallet);
    //             console.log(existingWallet);
    //         } else {
    //             const newWallet = generateWallet();
    //             save('WALLET_PK', newWallet.privateKey);    
    //         }
    //     };        
    //     fetchWallet();
    // }, [ setWallet ]);

    const handleGetStarted = React.useCallback(() => {
        navigation.push('Home');
        // navigation.push('GetStarted');
    }, []);

    return (
        <View style={styles.container}>
            <FadeInView delay={0} duration={2000}>
                <Image
                    source={require('../../assets/DetroitArt-Logo.png')}
                    style={{
                        width: 240,
                        resizeMode: 'contain',
                        height: 120,
                    }}
                />
            </FadeInView>
            <View style={{ padding: 16 }}>
                <FadeInView delay={1000} duration={4000}>
                    <Text style={{ marginBottom: 18, fontSize: 24, textAlign: 'left' }}>
                        We're at the dawn of a new age, a Digital Renaissance, that is birthing boundless creativity and endless possibilities.
                    </Text>
                </FadeInView>
                {/* <FadeInView delay={3500} duration={4000}>
                    <Text style={{ marginBottom: 18, fontSize: 24, textAlign: 'left' }}>
                        Here in Detroit, the first City of Design, a diverse group of artist activity that feeds the collective creativity of our community. 
                    </Text>
                </FadeInView>
                <FadeInView delay={7000} duration={4000}>
                    <Text style={{ marginBottom: 18, fontSize: 24, textAlign: 'left' }}>
                        Join us on a journey as we explore this creativity and collect relics from an era that will be forever cherished in the infinite halls of the digital realm.
                    </Text>
                </FadeInView> */}
            </View>
            <FadeInView delay={10000} duration={500}>
                <Button title="GET STARTED" onPress={handleGetStarted} />
            </FadeInView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d2e4dd',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 32,
    },
});
    
export default SplashScreen;