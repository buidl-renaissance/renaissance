import "react-native-get-random-values";
import "@ethersproject/shims";
import "@react-native-anywhere/polyfill-base64";
import { ethers } from "ethers";
import { ALCHEMY_API_KEY } from "@env";

export const generateWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  console.log('address:', wallet.address)
  console.log('mnemonic:', wallet.mnemonic.phrase)
  console.log('privateKey:', wallet.privateKey)
  return wallet;
};

export const loadWallet = (pk: string) => {
  const wallet = new ethers.Wallet(pk);
  console.log('address:', wallet.address)
  // console.log('mnemonic:', wallet.mnemonic.phrase)
  console.log('privateKey:', wallet.privateKey)
  return wallet;
};

export const getProvider = () => {
  // Use the mainnet
  const network = "homestead";

  // Specify your own API keys
  // Each is optional, and if you omit it the default
  // API key for that service will be used.
  return ethers.getDefaultProvider(network, {
    alchemy: ALCHEMY_API_KEY,
  });
};
