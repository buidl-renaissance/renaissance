import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import InstagramLogin from 'react-native-instagram-login';
// import CookieManager from '@react-native-community/cookies';

export default function App() {
  const insRef = useRef();
  const [token, setToken] = useState(null);

  const onClear = () => {
    // CookieManager.clearAll(true)
    //   .then((res) => {
    //     setToken(null);
    //   });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => insRef.current.show()}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Login now</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { marginTop: 10, backgroundColor: 'green' }]}
        onPress={onClear}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Logout</Text>
      </TouchableOpacity>
      <Text style={{ margin: 10 }}>Token: {token}</Text>
      <InstagramLogin
        ref={insRef}
        appId='201471972879546'
        appSecret='a112b5c12958b55cf1fb5496d9aba593'
        redirectUrl='https://dpop.tech/oauth/instagram'
        scopes={['user_profile', 'user_media']}
        onLoginSuccess={(token) => setToken(token)}
        onLoginFailure={(data) => console.log(data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 5,
    backgroundColor: 'orange',
    height: 30,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  }
});