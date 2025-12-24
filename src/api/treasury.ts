import { getProvider } from "../utils/web3";
import { ethers } from "ethers";
import { GRANT_GOVERNANCE_CONTRACT_ADDRESS } from "@env";

/**
 * Get the ETH balance of the GrantGovernance contract treasury
 * @returns Promise<string> - Balance in ETH as a formatted string
 */
export async function getTreasuryBalance(): Promise<string> {
    try {
        const provider = getProvider();
        
        // Get contract address from environment variable
        // Since Web3/Truffle doesn't work in React Native, we use env var
        const contractAddress = GRANT_GOVERNANCE_CONTRACT_ADDRESS;
        
        if (!contractAddress) {
            throw new Error("GRANT_GOVERNANCE_CONTRACT_ADDRESS environment variable is not set");
        }
        
        // Get balance using ethers provider
        const balance = await provider.getBalance(contractAddress);
        
        // Format balance from wei to ETH
        return ethers.utils.formatEther(balance);
    } catch (error) {
        console.error("Error fetching treasury balance:", error);
        throw error;
    }
}

