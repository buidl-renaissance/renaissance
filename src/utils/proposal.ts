// import TruffleContract from "@truffle/contract";

import { ethers } from "ethers";
import { getWallet } from "./wallet";
import { getProvider } from "./web3";

const ABI = require("../build/contracts/GrantGovernance.json"); // Assuming you have the ABI of your contract

// const GrantGovernance = TruffleContract(ABI);

const CONTRACT_ADDRESS = "0xc5d580994EBCA8fa987cB2CEc178C7FecF8a11A3"; // Update with the contract address in truffle develop

export interface ProposalData { 
  againstVotes?: number;
  body: string;
  budget: string;
  category: string;
  description: string;
  forVotes?: number;
  id?: string | number;
  tokensStaked?: number;
  title: string;
}

const extractProposalData = (data) => {
  return {
    againstVotes: Number(data.againstVotes.toJSON().hex),
    body: data.body,
    budget: data.estBudget,
    category: data.category,
    description: data.description,
    forVotes: Number(data.forVotes.toJSON().hex),
    id: Number(data[0].toJSON().hex),
    tokensStaked: Number(data.tokensStaked?.toJSON().hex),
    title: data.title,
  };
}

export const getProposal = async (proposalId: string | number) => {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  try {
    const result = await contract.getProposal(proposalId);
    return extractProposalData(result);
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const getProposals = async () => {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
  try {
    const proposalData = await contract.getProposals();
    return proposalData.map((data) => {
      return extractProposalData(data);
    });
  } catch (err) {
    console.log("error getting proposal", err);
  }
};

export const voteOnProposal = async (proposalId: string, inFavor: boolean) => {
  const wallet = await getWallet();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, wallet);
  try {
    return await contract.vote(
      proposalId,
      inFavor,
      {
        gasPrice: 5000000000,
        gasLimit: 1000000,
      }
    );
  } catch (err) {
    console.log("error voting on proposal", err);
  }
};

export const stakeTokens = async (proposalId: string, amount: number) => {
  const wallet = await getWallet();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, wallet);
  try {
    return await contract.stakeTokens(
      proposalId,
      amount,
      {
        gasPrice: 5000000000,
        gasLimit: 1000000,
      }
    );
  } catch (err) {
    console.log("error staking on proposal", err);
  }
};

export const createProposal = async (data: ProposalData) => {
  const wallet = await getWallet();
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
