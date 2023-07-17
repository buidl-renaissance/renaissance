import React from 'react';
import { KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeaderTitleImage } from '../Components/HeaderTitleImage';
import { Button } from '../Components/Button';
import { TextInputGroup } from '../Components/TextInputGroup';

import * as Google from 'expo-auth-session/providers/google';

import { lightGreen } from '../colors';

const GetStartedScreen = ({
    navigation,
    route,
}) => {
    const [name, onChangeName] = React.useState<string>();
    const [email, onChangeEmail] = React.useState<string>();
    const [phone, onChangePhone] = React.useState<string>();
  
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: '272979904049-mfrnnrpd2ta5q8bdcsprkb70d2c3djtk.apps.googleusercontent.com', // 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
        iosClientId: '272979904049-ifajosp5u7bivlhbf16998t05e3q721u.apps.googleusercontent.com',
        // androidClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
        // webClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    });
    
    React.useEffect(() => {
        if (response?.type === 'success') {
          const { authentication } = response;
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${authentication?.accessToken}`)
            .then((res) => res.json())
            .then((res) => {
                alert(`${JSON.stringify(res)}`);
            });
        }
      }, [response]);
    
    navigation.setOptions({
        headerTitle: () => <HeaderTitleImage />,
    });

    const handleRegister = React.useCallback(() => {
        const params = { name, email, phone };
        alert(`Register!${JSON.stringify(params)}`);
    }, [ name, email, phone ]);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ flex: 1, paddingBottom: 32 }}>
                <View style={{ padding: 16, }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Welcome,</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Please register to get started.</Text>
                    <TextInputGroup
                        label="Name"
                        placeholder='Name (required)'
                        onChangeText={onChangeName}
                        value={name}
                    />
                    <TextInputGroup
                        label="Email"
                        placeholder='Email'
                        autoCapitalize='none'
                        keyboardType="email-address"
                        onChangeText={onChangeEmail}
                        value={email}
                    />
                    <TextInputGroup
                        label="Phone Number"
                        placeholder='Phone Number (required)'
                        keyboardType="phone-pad"
                        onChangeText={onChangePhone}
                        value={phone}
                    />
                    <Button title="REGISTER" onPress={handleRegister} />
                    <Button
                        title="Login with Google"
                        onPress={() => {promptAsync()}}
                    />
                </View>
            </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightGreen,
        flexDirection: 'column',
        borderColor: '#999',
        borderTopWidth: 1,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        // paddingTop: 4,
        // paddingBottom: 32,
        borderColor: '#999',
        borderBottomWidth: 1,
        backgroundColor: lightGreen,
        // backgroundColor: darkGrey,
    }
});
    
export default GetStartedScreen;