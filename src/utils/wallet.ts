import { generateWallet, loadWallet } from "./web3";
import * as SecureStore from "expo-secure-store";

// import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
// import "react-native-get-random-values"; // Required for crypto operations

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

// export const generateCosmosWallet = async () => {
//   // const mnemonic =
//   //   "surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put";
//   // const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
//   const pk = await getValueFor("WALLET_PK");
//   // Convert the string to Uint8Array since fromKey expects Uint8Array
//   const pkBytes = pk ? new Uint8Array(Buffer.from(pk, 'hex')) : new Uint8Array();
//   const wallet = await DirectSecp256k1Wallet.fromKey(pkBytes);
//   const [firstAccount] = await wallet.getAccounts();
//   console.log(firstAccount);

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
