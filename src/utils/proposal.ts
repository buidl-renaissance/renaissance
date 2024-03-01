// import TruffleContract from "@truffle/contract";

import { ethers } from "ethers";
import { getWallet } from "./wallet";
import { getProvider } from "./web3";
import { useState } from "react";
const ABI = require("../build/contracts/GrantGovernance.json"); // Assuming you have the ABI of your contract

// const GrantGovernance = TruffleContract(ABI);

const CONTRACT_ADDRESS = "0xA537eaF343Ce614F3793F037384673dA9EA6E72C"; // Update with the contract address in truffle develop

export const getProposal = async (address: string) => {
  const provider = await getProvider();
  const contract = new ethers.Contract(address, ABI.abi, provider);
  try {
    return await contract.getProposal();
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const getProposals = async () => {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  try {
    return await contract.getProposals();
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const createProposal = async (description: string) => {
  const wallet = await getWallet();
  console.log("proposal wallet: ", wallet.address);
  //   const contract = new ethers.ContractFactory(CONTRACT_ADDRESS, ABI, wallet);
  //   GrantGovernance.setProvider(wallet.provider);
  //   const grantGovernance = await GrantGovernance.deployed();

  //   const proposal = await grantGovernance.createProposal({description})
  //     console.log(proposal);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, wallet);
  // const contract = new ethers.ContractFactory(ABI.abi, ABI.bytecode, wallet);
  // const contractInstance = await contract.deploy();
  // await contractInstance.deployed();
  // console.log('proposalContract: ', contractInstance.address)
  try {
    return await contract.createProposal({ description });
  } catch (err) {
    console.log("error creating proposal", err);
  }

  // const grantProposalInstance = await contract.deploy();
  //   const grantProposal = await contract.deployed();
  //   console.log("Contract deployed to:", grantProposal.address);

  // console.log('proposal contract: ', grantProposal);
  //   return await contract.createProposal({ description });
};
