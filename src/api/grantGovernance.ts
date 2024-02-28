
import Web3 from "web3";
import BN from "bn.js";
import TruffleContract from "@truffle/contract";
const ABI = require('../build/contracts/GrantGovernance.json'); // Assuming you have the ABI of your contract

// @ts-ignore
const GrantGovernance = TruffleContract(ABI);


// Initialize Web3 with your provider
const web3 = new Web3('http://localhost:8545'); // Update with your provider URL


const CONTRACT_ADDRESS = '0x123...'; // Update with the contract address in truffle develop

// Create contract instance
const contractInstance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Function to create a proposal

interface GrantContractDetails {
    proposalId: String,
    description: String,
    creator: String
    forVotes: BigInt,
    againstVotes: BigInt,
    executed: boolean,
    revoked:boolean,
    queued: boolean
}

export async function createProposal(
    web3: Web3,
    description: string
  ) {
    GrantGovernance.setProvider(web3.currentProvider);
    const grantDAO = await GrantGovernance.deployed();
  
    await grantDAO.createProposal({ description });
  }




















// async function createProposal(description) {
//     try {
//       const accounts = await web3.eth.getAccounts();
//       const result = await contractInstance.methods.createProposal(description).send({ from: accounts[0] });
//       console.log("Proposal created:", result);
//       return result;
//     } catch (error) {
//       console.error("Error creating proposal:", error);
//     }
//   }

// async function vote(proposalId, inFavor) {
//     try {
//       const accounts = await web3.eth.getAccounts();
//       const result = await contractInstance.methods.vote(proposalId, inFavor).send({ from: accounts[0] });
//       console.log("Vote submitted:", result);
//       return result;
//     } catch (error) {
//       console.error("Error voting:", error);
//     }
//   }
  
//   // Function to stake tokens
//   async function stakeTokens(amount) {
//     try {
//       const accounts = await web3.eth.getAccounts();
//       const result = await contractInstance.methods.stakeTokens(amount).send({ from: accounts[0] });
//       console.log("Tokens staked:", result);
//       return result;
//     } catch (error) {
//       console.error("Error staking tokens:", error);
//     }
//   }