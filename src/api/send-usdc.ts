import { ethers } from "ethers";
import { ALCHEMY_API_KEY } from "@env";
import { getWallet } from "../utils/wallet";

// USDC contract address on Base Sepolia testnet
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Base Sepolia network configuration
const BASE_SEPOLIA_NETWORK = {
  name: "base-sepolia",
  chainId: 84532,
};

// ERC20 ABI - we need transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

/**
 * Get a provider for Base Sepolia testnet
 */
function getBaseProvider() {
  const baseRpcUrl = ALCHEMY_API_KEY 
    ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    : "https://sepolia.base.org";
  
  return new ethers.providers.StaticJsonRpcProvider(baseRpcUrl, BASE_SEPOLIA_NETWORK);
}

/**
 * Send USDC tokens on Base Sepolia testnet
 * @param recipientAddress - The recipient wallet address
 * @param amount - The amount in USDC (will be converted to smallest unit)
 * @returns Promise<string> - Transaction hash
 */
export async function sendUSDC(
  recipientAddress: string,
  amount: string
): Promise<string> {
  try {
    if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("Invalid amount");
    }

    // Get the wallet
    const wallet = await getWallet();
    const provider = getBaseProvider();
    
    // Connect wallet to provider
    const signer = wallet.connect(provider);

    // Check ETH balance for gas fees
    const ethBalance = await provider.getBalance(wallet.address);
    if (ethBalance.eq(0)) {
      throw new Error("Insufficient ETH for gas fees. You need testnet ETH on Base Sepolia to send transactions.");
    }

    // Create contract instance
    const contract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, signer);

    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = ethers.utils.parseUnits(amount, 6);

    // Check USDC balance
    const balance = await contract.balanceOf(wallet.address);
    if (balance.lt(amountInSmallestUnit)) {
      throw new Error("Insufficient USDC balance");
    }

    // Estimate gas to check if transaction will succeed
    try {
      await contract.estimateGas.transfer(recipientAddress, amountInSmallestUnit);
    } catch (estimateError: any) {
      // If gas estimation fails, check if it's due to insufficient ETH
      if (estimateError.code === "UNPREDICTABLE_GAS_LIMIT" || estimateError.message?.includes("gas required exceeds allowance")) {
        const formattedEthBalance = ethers.utils.formatEther(ethBalance);
        throw new Error(`Insufficient ETH for gas fees. You have ${formattedEthBalance} ETH. You need testnet ETH on Base Sepolia to send transactions.`);
      }
      throw new Error(`Transaction may fail: ${estimateError.message || "Unknown error"}`);
    }

    // Send transaction
    const tx = await contract.transfer(recipientAddress, amountInSmallestUnit);
    
    console.log("USDC transfer transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Error sending USDC:", error);
    throw error;
  }
}

