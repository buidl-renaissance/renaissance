import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Linking, Vibration, Alert } from "react-native";
import type { MiniAppHost, SetPrimaryButtonOptions } from "@farcaster/frame-host-react-native";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { ethers } from "ethers";
import { getProvider } from "../utils/web3";
import { NavigationContainerRef } from "@react-navigation/native";
import { navigationRef } from "../../App";

// Define MiniAppContext type locally since it's not exported
interface MiniAppContext {
  client: {
    platformType: "mobile" | "web";
    clientFid: number;
    added: boolean;
    safeAreaInsets: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    renaissanceUserId?: number; // Backend user ID from people.builddetroit.xyz
    publicAddress?: string; // User's wallet address
  };
  features: {
    haptics: boolean;
    cameraAndMicrophoneAccess: boolean;
  };
}
import { useAuth, AuthUser } from "./Auth";
import { getWallet } from "../utils/wallet";

// Types for the frame context
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface PrimaryButtonState {
  text: string;
  loading: boolean;
  disabled: boolean;
  hidden: boolean;
}

interface FarcasterFrameState {
  currentFrameUrl: string | null;
  isLoading: boolean;
  user: FarcasterUser | null;
  primaryButton: PrimaryButtonState;
  isFrameAdded: boolean;
}

interface FarcasterFrameContextValue {
  state: FarcasterFrameState;
  setFrameUrl: (url: string | null) => void;
  setUser: (user: FarcasterUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  createSdk: () => Omit<MiniAppHost, "ethProviderRequestV2">;
  onPrimaryButtonClick: () => void;
  setPrimaryButtonClickHandler: (handler: (() => void) | null) => void;
}

const INITIAL_STATE: FarcasterFrameState = {
  currentFrameUrl: null,
  isLoading: false,
  user: null,
  primaryButton: {
    text: "",
    loading: false,
    disabled: false,
    hidden: true,
  },
  isFrameAdded: false,
};

const FarcasterFrameContext = createContext<FarcasterFrameContextValue | null>(null);

export function useFarcasterFrame() {
  const context = useContext(FarcasterFrameContext);
  if (!context) {
    throw new Error("useFarcasterFrame must be used within FarcasterFrameProvider");
  }
  return context;
}

interface FarcasterFrameProviderProps {
  children: ReactNode;
}

export const FarcasterFrameProvider: React.FC<FarcasterFrameProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<FarcasterFrameState>(INITIAL_STATE);
  const [primaryButtonClickHandler, setPrimaryButtonClickHandlerState] = useState<(() => void) | null>(null);
  const [signInResolver, setSignInResolver] = useState<{
    resolve: (result: any) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Get auth context
  const auth = useAuth();

  // Sync auth user to frame user
  React.useEffect(() => {
    if (auth.state.user) {
      const frameUser: FarcasterUser = {
        fid: auth.state.user.fid,
        username: auth.state.user.username,
        displayName: auth.state.user.displayName,
        pfpUrl: auth.state.user.pfpUrl,
      };
      setState((prev) => ({ ...prev, user: frameUser }));
      
      // Resolve any pending signIn request
      if (signInResolver) {
        signInResolver.resolve({
          fid: auth.state.user.fid,
          username: auth.state.user.username,
          displayName: auth.state.user.displayName,
          pfpUrl: auth.state.user.pfpUrl,
        });
        setSignInResolver(null);
      }
    } else {
      setState((prev) => ({ ...prev, user: null }));
    }
  }, [auth.state.user, signInResolver]);

  const setFrameUrl = useCallback((url: string | null) => {
    setState((prev) => ({ ...prev, currentFrameUrl: url, isLoading: !!url }));
  }, []);

  const setUser = useCallback((user: FarcasterUser | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setPrimaryButton = useCallback((options: SetPrimaryButtonOptions) => {
    setState((prev) => ({
      ...prev,
      primaryButton: {
        text: options.text,
        loading: options.loading ?? false,
        disabled: options.disabled ?? false,
        hidden: options.hidden ?? false,
      },
    }));
  }, []);

  const setPrimaryButtonClickHandler = useCallback((handler: (() => void) | null) => {
    setPrimaryButtonClickHandlerState(() => handler);
  }, []);

  const onPrimaryButtonClick = useCallback(() => {
    if (primaryButtonClickHandler) {
      primaryButtonClickHandler();
    }
  }, [primaryButtonClickHandler]);

  // Use refs to always access current auth state in SDK methods
  const authRef = React.useRef(auth);
  const stateRef = React.useRef(state);
  
  React.useEffect(() => {
    authRef.current = auth;
  }, [auth]);
  
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Create the SDK object that implements MiniAppHost interface
  const createSdk = useCallback((): Omit<MiniAppHost, "ethProviderRequestV2"> => {
    // Use a getter to dynamically return current context
    const getContext = (): MiniAppContext => {
      const currentUser = authRef.current.state.user;
      const currentState = stateRef.current;
      
      return {
        client: {
          platformType: "mobile",
          clientFid: 0, // Your app's FID - set to 0 for now
          added: currentState.isFrameAdded,
          safeAreaInsets: {
            top: 44,
            bottom: 34,
            left: 0,
            right: 0,
          },
        },
        user: currentUser
          ? {
              fid: currentUser.fid,
              username: currentUser.username,
              displayName: currentUser.displayName,
              pfpUrl: currentUser.pfpUrl,
              renaissanceUserId: currentUser.local?.backendUserId,
              publicAddress: currentUser.local?.walletAddress,
            }
          : {
              fid: 0,
            },
        features: {
          haptics: true,
          cameraAndMicrophoneAccess: true,
        },
      };
    };

    return {
      // Use Object.defineProperty to make context a dynamic getter
      get context() {
        return getContext();
      },

      close: () => {
        try {
          console.log("[FarcasterFrame] close requested");
          setFrameUrl(null);
        } catch (error: any) {
          console.error("[FarcasterFrame] Error closing frame:", error);
        }
      },

      ready: async (options) => {
        try {
          console.log("[FarcasterFrame] ready", options);
          setIsLoading(false);
          return {};
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in ready:", error);
          setIsLoading(false);
          return {};
        }
      },

      openUrl: (url: string) => {
        try {
          console.log("[FarcasterFrame] openUrl", url);
          if (!url || typeof url !== "string") {
            console.warn("[FarcasterFrame] Invalid URL provided:", url);
            return;
          }
          Linking.openURL(url).catch((error) => {
            console.error("[FarcasterFrame] Error opening URL:", error);
            Alert.alert("Error", `Failed to open URL: ${url}`);
          });
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in openUrl:", error);
        }
      },

      signIn: async (options) => {
        console.log("[FarcasterFrame] signIn requested", options);
        
        const currentUser = authRef.current.state.user;
        const fid = currentUser?.fid || 0;
        
        // Check if user is authenticated with Farcaster (positive FID)
        if (currentUser?.type === "farcaster" && fid > 0) {
          console.log("[FarcasterFrame] User authenticated with Farcaster, creating SIWF message...");
          
          try {
            // Create a SIWF (Sign-In With Farcaster) message signed with the local wallet
            // Format follows SIWF spec: https://eips.ethereum.org/EIPS/eip-4361
            // The mini app will verify the signature matches the wallet address and extract FID from Resources
            const wallet = await getWallet();
            const nonce = options?.nonce || `nonce-${Date.now()}`;
            const notBefore = options?.notBefore;
            const expirationTime = options?.expirationTime;
            
            const domain = "renaissance.app";
            const uri = `https://${domain}`;
            const statement = "Farcaster Auth";
            const issuedAt = new Date().toISOString();
            const chainId = 10; // Optimism (Farcaster's chain)
            
            // Build SIWF message according to spec
            // Format: domain wants you to sign in...\naddress\n\nstatement\n\nURI: ...\nVersion: 1\n...
            const messageParts = [
              `${domain} wants you to sign in with your Ethereum account:`,
              wallet.address,
              "",
              statement,
              "",
              `URI: ${uri}`,
              `Version: 1`,
              `Chain ID: ${chainId}`,
              `Nonce: ${nonce}`,
              `Issued At: ${issuedAt}`,
            ];
            
            if (notBefore) {
              messageParts.push(`Not Before: ${notBefore}`);
            }
            if (expirationTime) {
              messageParts.push(`Expiration Time: ${expirationTime}`);
            }
            
            // Resources section contains the FID for Farcaster verification
            messageParts.push(`Resources:`);
            messageParts.push(`- farcaster://fid/${fid}`);
            
            const message = messageParts.join("\n");
            const signature = await wallet.signMessage(message);
            
            console.log("[FarcasterFrame] signIn completed for FID:", fid);
            console.log("[FarcasterFrame] SIWF Message structure:", {
              hasDomain: message.includes(domain),
              hasAddress: message.includes(wallet.address),
              hasStatement: message.includes(statement),
              hasURI: message.includes(uri),
              hasVersion: message.includes("Version: 1"),
              hasChainId: message.includes(`Chain ID: ${chainId}`),
              hasNonce: message.includes("Nonce:"),
              hasIssuedAt: message.includes("Issued At:"),
              hasResources: message.includes("Resources:"),
              hasFid: message.includes(`farcaster://fid/${fid}`),
              messageLength: message.length,
              signatureLength: signature.length,
              authMethod: options?.acceptAuthAddress !== false ? "authAddress" : "custody",
            });
            
            // Use authAddress method since we're using a delegated address
            return {
              message,
              signature,
              authMethod: (options?.acceptAuthAddress !== false ? "authAddress" : "custody") as "custody" | "authAddress",
            };
          } catch (error: any) {
            console.error("[FarcasterFrame] signIn error:", error);
            throw new Error(error.message || "Failed to sign in");
          }
        }
        
        // User has local account (wallet or email) - sign with local wallet
        if (currentUser) {
          console.log("[FarcasterFrame] Local user, signing with local wallet...");
          
          try {
            const wallet = await getWallet();
            const nonce = options?.nonce || `nonce-${Date.now()}`;
            
            const domain = "renaissance.app";
            const uri = `https://${domain}`;
            const statement = "Farcaster Auth";
            const issuedAt = new Date().toISOString();
            const chainId = 10;
            
            const messageParts = [
              `${domain} wants you to sign in with your Ethereum account:`,
              wallet.address,
              "",
              statement,
              "",
              `URI: ${uri}`,
              `Version: 1`,
              `Chain ID: ${chainId}`,
              `Nonce: ${nonce}`,
              `Issued At: ${issuedAt}`,
              `Resources:`,
              `- farcaster://fid/${fid}`,
            ];
            
            const message = messageParts.join("\n");
            const signature = await wallet.signMessage(message);
            
            console.log("[FarcasterFrame] signIn completed for local user");
            console.log("[FarcasterFrame] SIWF Message structure (local user):", {
              hasDomain: message.includes("renaissance.app"),
              hasAddress: message.includes(wallet.address),
              hasStatement: message.includes("Farcaster Auth"),
              hasURI: message.includes("https://renaissance.app"),
              hasVersion: message.includes("Version: 1"),
              hasChainId: message.includes("Chain ID: 10"),
              hasNonce: message.includes("Nonce:"),
              hasIssuedAt: message.includes("Issued At:"),
              hasResources: message.includes("Resources:"),
              hasFid: message.includes(`farcaster://fid/${fid}`),
              messageLength: message.length,
              signatureLength: signature.length,
              authMethod: "custody",
            });
            
            return {
              message,
              signature,
              authMethod: "custody" as const,
            };
          } catch (error: any) {
            console.error("[FarcasterFrame] signIn error:", error);
            throw new Error(error.message || "Failed to sign in");
          }
        }
        
        // Not authenticated at all
        console.log("[FarcasterFrame] User not authenticated");
        throw new Error("Please sign in to use this feature");
      },

      signManifest: async (options) => {
        console.log("[FarcasterFrame] signManifest requested", options);
        
        try {
          if (!options.domain) {
            throw new Error("Domain is required");
          }

          // Validate domain format
          const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
          if (!domainRegex.test(options.domain)) {
            throw new Error("Invalid domain format");
          }

          const wallet = await getWallet();
          
          // Create JWT-like structure: header.payload.signature
          // Header: base64url encoded JSON with alg and typ
          const header = {
            alg: "ES256K", // ECDSA with secp256k1
            typ: "JWT",
          };
          
          // Payload: base64url encoded JSON with domain and other claims
          const payload = {
            domain: options.domain,
            iss: wallet.address,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          };

          // Encode header and payload
          const encodeBase64Url = (obj: any): string => {
            const json = JSON.stringify(obj);
            const base64 = Buffer.from(json).toString("base64");
            return base64
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=/g, "");
          };

          const encodedHeader = encodeBase64Url(header);
          const encodedPayload = encodeBase64Url(payload);
          
          // Create message to sign: header.payload
          const message = `${encodedHeader}.${encodedPayload}`;
          
          // Sign the message
          const signature = await wallet.signMessage(message);
          
          // Remove 0x prefix and convert to base64url
          const sigBytes = ethers.utils.arrayify(signature);
          const encodedSignature = Buffer.from(sigBytes)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");

          console.log("[FarcasterFrame] Manifest signed for domain:", options.domain);
          
          return {
            header: encodedHeader,
            payload: encodedPayload,
            signature: encodedSignature,
          };
        } catch (error: any) {
          console.error("[FarcasterFrame] signManifest error:", error);
          
          if (error.message?.includes("Invalid domain")) {
            throw new Error("Invalid domain provided");
          }
          
          throw new Error(error.message || "Failed to sign manifest");
        }
      },

      setPrimaryButton,

      ethProviderRequest: async (request) => {
        console.log("[FarcasterFrame] ethProviderRequest", request);
        
        try {
          const { method, params } = request;
          const wallet = await getWallet();
          const provider = getProvider();

          switch (method) {
            case "eth_requestAccounts":
            case "eth_accounts": {
              return [wallet.address];
            }

            case "eth_chainId": {
              const network = await provider.getNetwork();
              return `0x${network.chainId.toString(16)}`;
            }

            case "personal_sign": {
              const [message, address] = params as [string, string];
              if (address.toLowerCase() !== wallet.address.toLowerCase()) {
                throw new Error("Address mismatch");
              }
              // Remove 0x prefix if present and handle hex strings
              const messageToSign = message.startsWith("0x")
                ? ethers.utils.toUtf8String(message)
                : message;
              const signature = await wallet.signMessage(messageToSign);
              return signature;
            }

            case "eth_sign": {
              const [address, messageHash] = params as [string, string];
              if (address.toLowerCase() !== wallet.address.toLowerCase()) {
                throw new Error("Address mismatch");
              }
              // eth_sign signs the hash directly
              const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
              return signature;
            }

            case "eth_signTypedData":
            case "eth_signTypedData_v4": {
              const [address, typedData] = params as [string, any];
              if (address.toLowerCase() !== wallet.address.toLowerCase()) {
                throw new Error("Address mismatch");
              }
              
              // Handle both string and object formats
              const data = typeof typedData === "string" ? JSON.parse(typedData) : typedData;
              const domain = data.domain || {};
              const types = data.types || {};
              const message = data.message || {};
              
              // Remove EIP712Domain from types as ethers does this automatically
              const { EIP712Domain, ...messageTypes } = types;
              
              const signature = await wallet._signTypedData(domain, messageTypes, message);
              return signature;
            }

            case "eth_sendTransaction": {
              const [tx] = params as [any];
              
              // Show confirmation dialog
              const confirmed = await new Promise<boolean>((resolve) => {
                Alert.alert(
                  "Confirm Transaction",
                  `Send ${tx.value ? ethers.utils.formatEther(tx.value) : "0"} ETH${tx.to ? `\nTo: ${tx.to}` : ""}\nGas: ${tx.gasLimit || "auto"}`,
                  [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Confirm", onPress: () => resolve(true) },
                  ]
                );
              });

              if (!confirmed) {
                throw new Error("Transaction rejected by user");
              }

              // Connect wallet to provider
              const signer = wallet.connect(provider);
              
              // Build transaction
              const txRequest: ethers.providers.TransactionRequest = {
                to: tx.to,
                value: tx.value ? ethers.BigNumber.from(tx.value) : undefined,
                data: tx.data,
                gasLimit: tx.gasLimit ? ethers.BigNumber.from(tx.gasLimit) : undefined,
                gasPrice: tx.gasPrice ? ethers.BigNumber.from(tx.gasPrice) : undefined,
                nonce: tx.nonce ? parseInt(tx.nonce, 16) : undefined,
              };

              // Send transaction
              const txResponse = await signer.sendTransaction(txRequest);
              console.log("[FarcasterFrame] Transaction sent:", txResponse.hash);
              
              return txResponse.hash;
            }

            case "eth_getBalance": {
              const [address] = params as [string];
              const balance = await provider.getBalance(address);
              return ethers.utils.hexlify(balance);
            }

            case "eth_getTransactionCount": {
              const [address, blockTag] = params as [string, string];
              const nonce = await provider.getTransactionCount(address, blockTag || "latest");
              return ethers.utils.hexlify(nonce);
            }

            case "eth_estimateGas": {
              const [tx] = params as [any];
              const estimate = await provider.estimateGas({
                to: tx.to,
                value: tx.value ? ethers.BigNumber.from(tx.value) : undefined,
                data: tx.data,
              });
              return ethers.utils.hexlify(estimate);
            }

            case "eth_gasPrice": {
              const gasPrice = await provider.getGasPrice();
              return ethers.utils.hexlify(gasPrice);
            }

            case "eth_getTransactionReceipt": {
              const [txHash] = params as [string];
              const receipt = await provider.getTransactionReceipt(txHash);
              if (!receipt) {
                return null as any;
              }
              return {
                transactionHash: receipt.transactionHash,
                transactionIndex: ethers.utils.hexlify(receipt.transactionIndex),
                blockHash: receipt.blockHash,
                blockNumber: ethers.utils.hexlify(receipt.blockNumber),
                from: receipt.from,
                to: receipt.to,
                cumulativeGasUsed: ethers.utils.hexlify(receipt.cumulativeGasUsed),
                gasUsed: ethers.utils.hexlify(receipt.gasUsed),
                contractAddress: receipt.contractAddress,
                logs: receipt.logs,
                status: receipt.status ? ethers.utils.hexlify(receipt.status) : undefined,
                logsBloom: receipt.logsBloom,
              } as any;
            }

            case "eth_blockNumber": {
              const blockNumber = await provider.getBlockNumber();
              return ethers.utils.hexlify(blockNumber);
            }

            case "eth_call": {
              const [tx, blockTag] = params as [any, string];
              const result = await provider.call(
                {
                  to: tx.to,
                  data: tx.data,
                  value: tx.value ? ethers.BigNumber.from(tx.value) : undefined,
                },
                blockTag || "latest"
              );
              return result;
            }

            default:
              console.warn("[FarcasterFrame] Unsupported method:", method);
              throw new Error(`Unsupported method: ${method}`);
          }
        } catch (error: any) {
          console.error("[FarcasterFrame] ethProviderRequest error:", error);
          throw new Error(error.message || "Ethereum provider request failed");
        }
      },

      eip6963RequestProvider: () => {
        try {
          console.log("[FarcasterFrame] eip6963RequestProvider requested");
          // EIP-6963 provider announcement - emit event if needed
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in eip6963RequestProvider:", error);
        }
      },

      addFrame: async () => {
        try {
          console.log("[FarcasterFrame] addFrame requested");
          setState((prev) => ({ ...prev, isFrameAdded: true }));
          return {
            notificationDetails: undefined,
          };
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in addFrame:", error);
          throw error;
        }
      },

      addMiniApp: async () => {
        try {
          console.log("[FarcasterFrame] addMiniApp requested");
          setState((prev) => ({ ...prev, isFrameAdded: true }));
          return {
            notificationDetails: undefined,
          };
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in addMiniApp:", error);
          throw error;
        }
      },

      viewCast: async (options) => {
        try {
          console.log("[FarcasterFrame] viewCast", options);
          if (!options?.hash) {
            console.warn("[FarcasterFrame] viewCast called without hash");
            return;
          }
          // Open cast in Warpcast or your app
          const url = `https://warpcast.com/~/conversations/${options.hash}`;
          Linking.openURL(url).catch((error) => {
            console.error("[FarcasterFrame] Error opening cast URL:", error);
          });
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in viewCast:", error);
        }
      },

      viewProfile: async (options) => {
        try {
          console.log("[FarcasterFrame] viewProfile", options);
          if (!options?.fid) {
            console.warn("[FarcasterFrame] viewProfile called without fid");
            return;
          }
          const url = `https://warpcast.com/~/profiles/${options.fid}`;
          Linking.openURL(url).catch((error) => {
            console.error("[FarcasterFrame] Error opening profile URL:", error);
          });
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in viewProfile:", error);
        }
      },

      viewToken: async (options) => {
        try {
          console.log("[FarcasterFrame] viewToken", options);
          if (!options?.token) {
            console.warn("[FarcasterFrame] viewToken called without token");
            return;
          }
          // Handle token viewing
          Alert.alert("View Token", `Token: ${options.token}`);
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in viewToken:", error);
        }
      },

      sendToken: async (options) => {
        console.log("[FarcasterFrame] sendToken requested", options);
        
        try {
          const wallet = await getWallet();
          const provider = getProvider();
          const signer = wallet.connect(provider);

          if (!options.recipientAddress && !options.recipientFid) {
            return {
              success: false,
              reason: "send_failed" as const,
              error: {
                error: "missing_recipient",
                message: "Recipient address or FID is required",
              },
            };
          }

          if (!options.amount) {
            return {
              success: false,
              reason: "send_failed" as const,
              error: {
                error: "missing_amount",
                message: "Amount is required",
              },
            };
          }

          // For recipientFid, we'd need to resolve it to an address
          // For now, require recipientAddress
          if (!options.recipientAddress) {
            return {
              success: false,
              reason: "send_failed" as const,
              error: {
                error: "fid_resolution_not_implemented",
                message: "Recipient FID resolution not yet implemented. Please use recipientAddress.",
              },
            };
          }

          let txHash: string;

          // Parse CAIP-19 token ID if provided
          if (options.token) {
            // Format: eip155:chainId/erc20:address or eip155:chainId/native
            const [chainPart, tokenPart] = options.token.split("/");
            const chainId = parseInt(chainPart.split(":")[1]);
            const isNative = tokenPart === "native";

            if (isNative) {
              // Native ETH transfer
              const amount = ethers.BigNumber.from(options.amount);
              
              // Show confirmation
              const confirmed = await new Promise<boolean>((resolve) => {
                Alert.alert(
                  "Confirm Token Transfer",
                  `Send ${ethers.utils.formatEther(amount)} ETH\nTo: ${options.recipientAddress}`,
                  [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Confirm", onPress: () => resolve(true) },
                  ]
                );
              });

              if (!confirmed) {
                return {
                  success: false,
                  reason: "rejected_by_user" as const,
                };
              }

              const tx = await signer.sendTransaction({
                to: options.recipientAddress,
                value: amount,
              });
              txHash = tx.hash;
            } else {
              // ERC20 token transfer
              const tokenAddress = tokenPart.split(":")[1];
              
              // ERC20 transfer function signature: transfer(address,uint256)
              const iface = new ethers.utils.Interface([
                "function transfer(address to, uint256 amount) returns (bool)",
              ]);
              
              const data = iface.encodeFunctionData("transfer", [
                options.recipientAddress,
                ethers.BigNumber.from(options.amount),
              ]);

              // Show confirmation
              const confirmed = await new Promise<boolean>((resolve) => {
                Alert.alert(
                  "Confirm Token Transfer",
                  `Send ${options.amount} tokens\nToken: ${tokenAddress}\nTo: ${options.recipientAddress}`,
                  [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Confirm", onPress: () => resolve(true) },
                  ]
                );
              });

              if (!confirmed) {
                return {
                  success: false,
                  reason: "rejected_by_user" as const,
                };
              }

              const tx = await signer.sendTransaction({
                to: tokenAddress,
                data,
              });
              txHash = tx.hash;
            }
          } else {
            // Default to native ETH
            const amount = ethers.BigNumber.from(options.amount);
            
            const confirmed = await new Promise<boolean>((resolve) => {
              Alert.alert(
                "Confirm Token Transfer",
                `Send ${ethers.utils.formatEther(amount)} ETH\nTo: ${options.recipientAddress}`,
                [
                  { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                  { text: "Confirm", onPress: () => resolve(true) },
                ]
              );
            });

            if (!confirmed) {
              return {
                success: false,
                reason: "rejected_by_user" as const,
              };
            }

            const tx = await signer.sendTransaction({
              to: options.recipientAddress,
              value: amount,
            });
            txHash = tx.hash;
          }

          console.log("[FarcasterFrame] Token sent:", txHash);
          
          return {
            success: true,
            send: {
              transaction: txHash as `0x${string}`,
            },
          };
        } catch (error: any) {
          console.error("[FarcasterFrame] sendToken error:", error);
          
          if (error.message?.includes("rejected") || error.message?.includes("user")) {
            return {
              success: false,
              reason: "rejected_by_user" as const,
            };
          }
          
          return {
            success: false,
            reason: "send_failed" as const,
            error: {
              error: "transaction_failed",
              message: error.message || "Failed to send token",
            },
          };
        }
      },

      swapToken: async (options) => {
        console.log("[FarcasterFrame] swapToken requested", options);
        
        // Token swapping requires DEX integration (e.g., Uniswap, 1inch)
        // For now, return an error indicating this needs to be implemented
        // with a proper DEX aggregator
        
        try {
          if (!options.sellToken || !options.buyToken || !options.sellAmount) {
            return {
              success: false,
              reason: "swap_failed" as const,
              error: {
                error: "missing_parameters",
                message: "sellToken, buyToken, and sellAmount are required",
              },
            };
          }

          // TODO: Integrate with a DEX aggregator API (e.g., 1inch, 0x, Uniswap)
          // For now, return a not implemented error
          return {
            success: false,
            reason: "swap_failed" as const,
            error: {
              error: "not_implemented",
              message: "Token swapping requires DEX integration. This feature is not yet implemented.",
            },
          };
        } catch (error: any) {
          console.error("[FarcasterFrame] swapToken error:", error);
          
          return {
            success: false,
            reason: "swap_failed" as const,
            error: {
              error: "swap_error",
              message: error.message || "Failed to swap token",
            },
          };
        }
      },

      openMiniApp: async (options) => {
        console.log("[FarcasterFrame] openMiniApp", options);
        
        try {
          // Set the frame URL in state
          setFrameUrl(options.url);
          
          // Navigate to MiniApp screen if navigation is available
          const nav = navigationRef.current as NavigationContainerRef<any> | null;
          if (nav?.isReady()) {
            nav.navigate("MiniApp", {
              url: options.url,
              title: "Mini App",
            });
          } else {
            // If navigation not ready, the URL is set in state
            // and MiniAppScreen will pick it up from context
            console.log("[FarcasterFrame] Navigation not ready, URL set in state");
          }
        } catch (error: any) {
          console.error("[FarcasterFrame] openMiniApp error:", error);
          // Still set the URL even if navigation fails
          setFrameUrl(options.url);
        }
      },

      composeCast: async (options) => {
        console.log("[FarcasterFrame] composeCast", options);
        
        try {
          // If close is true, return undefined (void)
          if (options.close) {
            // Close the mini app
            setFrameUrl(null);
            return undefined as any;
          }

          // For now, we don't have direct Farcaster API integration
          // So we'll open Warpcast compose screen with the suggested content
          // In a full implementation, you'd use the Farcaster API to create the cast
          
          const params = new URLSearchParams();
          if (options.text) {
            params.append("text", options.text);
          }
          if (options.embeds && options.embeds.length > 0) {
            params.append("embeds", options.embeds.join(","));
          }
          if (options.parent) {
            params.append("parent", options.parent.hash);
          }
          if (options.channelKey) {
            params.append("channel", options.channelKey);
          }

          // Open Warpcast compose URL
          const composeUrl = `https://warpcast.com/~/compose?${params.toString()}`;
          Linking.openURL(composeUrl);

          // Return null cast since we're opening external app
          // In a full implementation with API access, you'd return the created cast
          return {
            cast: null,
          } as any;
        } catch (error: any) {
          console.error("[FarcasterFrame] composeCast error:", error);
          
          // Return null cast on error
          return {
            cast: null,
          } as any;
        }
      },

      requestCameraAndMicrophoneAccess: async () => {
        console.log("[FarcasterFrame] requestCameraAndMicrophoneAccess");
        try {
          // Request camera permission
          const cameraStatus = await Camera.requestCameraPermissionsAsync();
          if (!cameraStatus.granted) {
            console.warn("[FarcasterFrame] Camera permission not granted");
          }

          // Request microphone permission
          const audioStatus = await Audio.requestPermissionsAsync();
          if (!audioStatus.granted) {
            console.warn("[FarcasterFrame] Microphone permission not granted");
          }

          console.log("[FarcasterFrame] Permissions requested:", {
            camera: cameraStatus.granted,
            microphone: audioStatus.granted,
          });
        } catch (error: any) {
          console.error("[FarcasterFrame] Error requesting permissions:", error);
          // Don't throw - method returns void
        }
      },

      // Haptic feedback
      impactOccurred: async (style) => {
        console.log("[FarcasterFrame] impactOccurred", style);
        switch (style) {
          case "light":
            Vibration.vibrate(10);
            break;
          case "medium":
            Vibration.vibrate(20);
            break;
          case "heavy":
            Vibration.vibrate(30);
            break;
          default:
            Vibration.vibrate(20);
        }
      },

      notificationOccurred: async (type) => {
        console.log("[FarcasterFrame] notificationOccurred", type);
        switch (type) {
          case "success":
            Vibration.vibrate([0, 10, 50, 10]);
            break;
          case "warning":
            Vibration.vibrate([0, 20, 40, 20]);
            break;
          case "error":
            Vibration.vibrate([0, 30, 30, 30, 30, 30]);
            break;
          default:
            Vibration.vibrate(20);
        }
      },

      selectionChanged: async () => {
        console.log("[FarcasterFrame] selectionChanged");
        Vibration.vibrate(5);
      },

      getCapabilities: async () => {
        return [
          "actions.ready",
          "actions.openUrl",
          "actions.close",
          "actions.setPrimaryButton",
          "actions.addMiniApp",
          "actions.viewCast",
          "actions.viewProfile",
          "actions.composeCast",
          "actions.openMiniApp",
          "haptics.impactOccurred",
          "haptics.notificationOccurred",
          "haptics.selectionChanged",
        ];
      },

      getChains: async () => {
        return ["eip155:1", "eip155:8453", "eip155:10"]; // Ethereum, Base, Optimism
      },

      updateBackState: async (state) => {
        try {
          console.log("[FarcasterFrame] updateBackState", state);
          // Update back navigation state if needed
        } catch (error: any) {
          console.error("[FarcasterFrame] Error in updateBackState:", error);
        }
      },
    };
  }, [state.isFrameAdded, setFrameUrl, setIsLoading, setPrimaryButton]);

  const value = useMemo(
    () => ({
      state,
      setFrameUrl,
      setUser,
      setIsLoading,
      createSdk,
      onPrimaryButtonClick,
      setPrimaryButtonClickHandler,
    }),
    [state, setFrameUrl, setUser, setIsLoading, createSdk, onPrimaryButtonClick, setPrimaryButtonClickHandler]
  );

  return (
    <FarcasterFrameContext.Provider value={value}>
      {children}
    </FarcasterFrameContext.Provider>
  );
};

export default FarcasterFrameProvider;

