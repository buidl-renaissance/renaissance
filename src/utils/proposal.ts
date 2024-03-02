// import TruffleContract from "@truffle/contract";

import { ethers } from "ethers";
import { getWallet } from "./wallet";
import { getProvider } from "./web3";

const ABI = require("../build/contracts/GrantGovernance.json"); // Assuming you have the ABI of your contract

// const GrantGovernance = TruffleContract(ABI);

const CONTRACT_ADDRESS = "0x6Af9c955CE0780f78944F0472fb1fE24cfeF0800"; // Update with the contract address in truffle develop

export interface ProposalData {
  id?: string;
  body: string;
  budget: string;
  category: string;
  description: string;
  title: string;
}

export const getProposal = async (proposalId: string) => {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  try {
    return await contract.getProposal(proposalId);
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const getProposals = async () => {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  try {
    const proposalData = await contract.getProposals();
    return proposalData.map((proposalData) => {
      // console.log('proposalData: ', proposalData);
      return {
        body: proposalData.body,
        budget: proposalData.estBudget,
        category: proposalData.category,
        description: proposalData.description,
        id: Number(proposalData[0].toJSON().hex),
        title: proposalData.title,
      };
    });
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const createProposal = async (data: ProposalData) => {
  const wallet = await getWallet();
  console.log("proposal wallet: ", wallet.address);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, wallet);
  try {
    return await contract.createProposal(
      data.title,
      data.description,
      data.category,
      data.body,
      data.budget,
      {
        gasPrice: 5000000000,
        gasLimit: 1000000,
      }
    );
  } catch (err) {
    console.log("error creating proposal", err);
  }
};
