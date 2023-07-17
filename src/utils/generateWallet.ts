import "react-native-get-random-values"
import "@ethersproject/shims";
import "@react-native-anywhere/polyfill-base64";
import { ethers } from "ethers";

export const generateWallet = () => {
    const wallet = ethers.Wallet.createRandom()
    // console.log('address:', wallet.address)
    // console.log('mnemonic:', wallet.mnemonic.phrase)
    // console.log('privateKey:', wallet.privateKey)
    return wallet;
};

export const loadWallet = (pk: string) => {
    const wallet = new ethers.Wallet(pk);
    // console.log('address:', wallet.address)
    // console.log('mnemonic:', wallet.mnemonic.phrase)
    // console.log('privateKey:', wallet.privateKey)
    return wallet;
};