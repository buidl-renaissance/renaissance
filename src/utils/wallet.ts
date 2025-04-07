import { generateWallet, loadWallet } from "./web3";
import * as SecureStore from "expo-secure-store";

// import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
// import * as Crypto from "expo-crypto";

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
    save("WALLET_ADDRESS", newWallet.address);
    save("WALLET_MNEMONIC", newWallet.mnemonic.phrase);
    return newWallet;
  }
};

// export const generateCosmosWallet = async () => {
//   // Generate entropy using expo-crypto
//   const entropy = await Crypto.getRandomBytesAsync(32);
//   // Convert to hex string
//   const entropyHex = Array.from(entropy)
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("");

//   const mnemonic =
//     "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
//   const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
//     prefix: "cosmos",
//   });
//   const accounts = await wallet.getAccounts();
//   console.log("COSMOS WALLET accounts", accounts);
//   return { wallet, accounts };

//   // const rpcEndpoint = "https://rpc.my_tendermint_rpc_node";
//   // const client = await SigningStargateClient.connectWithSigner(
//   //   rpcEndpoint,
//   //   wallet
//   // );

//   // const recipient = "cosmos1xv9tklw7d82sezh9haa573wufgy59vmwe6xxe5";
//   // const amount = {
//   //   denom: "ucosm",
//   //   amount: "1234567",
//   // };
//   // const result = await client.sendTokens(
//   //   firstAccount.address,
//   //   recipient,
//   //   [amount],
//   // );
// };
