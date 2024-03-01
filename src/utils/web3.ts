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
  const provider = getProvider();
  // provider.listAccounts();
  // const wallet = new ethers.Wallet('9e7c10ddd9b7e38dbd38bf0a14c43f936831b627c25bd842d4bc67a0eba40834', provider);
  const wallet = new ethers.Wallet(pk, provider);
  console.log('address:', wallet.address)
  // console.log('mnemonic:', wallet.mnemonic.phrase)
  // console.log('privateKey:', wallet.privateKey)
  return wallet;
};

export const getProvider = () => {
  // Use the mainnet
  const network = "homestead";

  // Specify your own API keys
  // Each is optional, and if you omit it the default
  // API key for that service will be used.
  return new ethers.providers.JsonRpcBatchProvider('http://127.0.0.1:9545/');
  // return new ethers.providers.AlchemyProvider(network, ALCHEMY_API_KEY);
};
