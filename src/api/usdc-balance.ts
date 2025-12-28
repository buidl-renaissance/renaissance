import { ethers } from "ethers";
import { ALCHEMY_API_KEY } from "@env";

// USDC contract address on Base Sepolia testnet
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Base Sepolia network configuration
const BASE_SEPOLIA_NETWORK = {
  name: "base-sepolia",
  chainId: 84532,
};

// ERC20 ABI - we only need the balanceOf function
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

/**
 * Get a provider for Base Sepolia testnet
 * Uses StaticJsonRpcProvider to avoid ENS resolution attempts
 */
function getBaseProvider() {
  // Create a provider for Base Sepolia testnet
  const baseRpcUrl = ALCHEMY_API_KEY 
    ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    : "https://sepolia.base.org";
  
  // Use StaticJsonRpcProvider which doesn't support ENS resolution
  // This prevents the "network does not support ENS" error
  return new ethers.providers.StaticJsonRpcProvider(baseRpcUrl, BASE_SEPOLIA_NETWORK);
}

/**
 * Get the USDC balance of a wallet address on Base Sepolia testnet
 * @param address - The wallet address to check
 * @returns Promise<string> - Balance in USDC as a formatted string (with 6 decimals)
 */
export async function getUSDCBalance(address: string): Promise<string> {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    const provider = getBaseProvider();
    const contract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider);

    // Get the balance (returns BigNumber in smallest unit)
    const balance = await contract.balanceOf(address);

    // USDC has 6 decimals
    // Format from smallest unit to USDC (divide by 10^6)
    const formattedBalance = ethers.utils.formatUnits(balance, 6);

    return formattedBalance;
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    throw error;
  }
}

