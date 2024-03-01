
// import TruffleContract from "@truffle/contract";

import { ethers } from "ethers";
import { getWallet } from "./wallet";
const ABI = require("../build/contracts/GrantGovernance.json"); // Assuming you have the ABI of your contract

// const GrantGovernance = TruffleContract(ABI);

const CONTRACT_ADDRESS = "0x3743b2Cb8c9EF42A624380a9bec9aCe8e98191B6"; // Update with the contract address in truffle develop

export const createProposal = async (description: string) => {
  const wallet = await getWallet();
  console.log("proposal wallet: ", wallet.address);
  //   const contract = new ethers.ContractFactory(CONTRACT_ADDRESS, ABI, wallet);
//   GrantGovernance.setProvider(wallet.provider);
//   const grantGovernance = await GrantGovernance.deployed();

//   const proposal = await grantGovernance.createProposal({description})
//     console.log(proposal);

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, wallet);
    return await contract.createProposal({ description });
  } catch (error) {
    console.log("error: ", error);
  }

  // const grantProposalInstance = await contract.deploy();
  //   const grantProposal = await contract.deployed();
  //   console.log("Contract deployed to:", grantProposal.address);

  // console.log('proposal contract: ', grantProposal);
//   return await contract.createProposal({ description });
};
