const Web3 = require('web3');
const ABI = require('../build/contracts/GrantGovernance.json'); // Assuming you have the ABI of your contract

// Initialize Web3 with your provider
const web3 = new Web3('http://localhost:8545'); // Update with your provider URL


const CONTRACT_ADDRESS = '0x123...'; // Update with the contract address in truffle develop

// Create contract instance
const contractInstance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Function to create a proposal

type GrantContractDetails {

    
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