import { generateWallet, loadWallet } from "./web3";
import * as SecureStore from "expo-secure-store";

async function save(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
  return SecureStore.getItemAsync(key);
}

export const getWallet = async () => {
  const pk = await getValueFor("WALLET_PK");
  if (pk) {
    return loadWallet(pk);
  } else {
    const newWallet = generateWallet();
    save("WALLET_PK", newWallet.privateKey);
    return newWallet;
  }
};
