/**
 * Farcaster Signer Management
 * 
 * This module handles creating and managing Farcaster signers (app keys)
 * that allow the app to post on behalf of users.
 * 
 * Uses Neynar's managed signer API for simplicity.
 * 
 * Flow:
 * 1. Create signer via Neynar API
 * 2. User approves in Farcaster app via deep link
 * 3. Poll for completion
 * 4. Store signer for future use
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";

// Configure ed25519 to use sha512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Neynar API for managed signers (free tier available)
const NEYNAR_API = "https://api.neynar.com/v2/farcaster";
// Note: You should get your own API key from neynar.com
// This is a demo key with limited rate limits
const NEYNAR_API_KEY = "NEYNAR_API_DOCS"; // Replace with your actual key

const APP_NAME = "Renaissance";

// Storage keys
const SIGNER_PRIVATE_KEY = "FARCASTER_SIGNER_PRIVATE_KEY";
const SIGNER_PUBLIC_KEY = "FARCASTER_SIGNER_PUBLIC_KEY";
const SIGNER_FID = "FARCASTER_SIGNER_FID";
const SIGNER_STATUS = "FARCASTER_SIGNER_STATUS";

export interface SignerInfo {
  publicKey: string;
  privateKey: string;
  fid: number;
  status: "pending" | "approved" | "revoked";
}

/**
 * Generate a new Ed25519 keypair for signing
 */
export async function generateSignerKeypair(): Promise<{
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return { publicKey, privateKey };
}

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to bytes
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Get stored signer info
 */
export async function getStoredSigner(): Promise<SignerInfo | null> {
  try {
    const privateKey = await SecureStore.getItemAsync(SIGNER_PRIVATE_KEY);
    const publicKey = await SecureStore.getItemAsync(SIGNER_PUBLIC_KEY);
    const fid = await SecureStore.getItemAsync(SIGNER_FID);
    const status = await SecureStore.getItemAsync(SIGNER_STATUS);

    if (!privateKey || !publicKey || !fid) {
      return null;
    }

    return {
      privateKey,
      publicKey,
      fid: parseInt(fid, 10),
      status: (status as SignerInfo["status"]) || "pending",
    };
  } catch (error) {
    console.error("[FarcasterSigner] Error loading stored signer:", error);
    return null;
  }
}

/**
 * Store signer info securely
 */
async function storeSigner(signer: SignerInfo): Promise<void> {
  await SecureStore.setItemAsync(SIGNER_PRIVATE_KEY, signer.privateKey);
  await SecureStore.setItemAsync(SIGNER_PUBLIC_KEY, signer.publicKey);
  await SecureStore.setItemAsync(SIGNER_FID, signer.fid.toString());
  await SecureStore.setItemAsync(SIGNER_STATUS, signer.status);
}

/**
 * Clear stored signer
 */
export async function clearStoredSigner(): Promise<void> {
  await SecureStore.deleteItemAsync(SIGNER_PRIVATE_KEY);
  await SecureStore.deleteItemAsync(SIGNER_PUBLIC_KEY);
  await SecureStore.deleteItemAsync(SIGNER_FID);
  await SecureStore.deleteItemAsync(SIGNER_STATUS);
}

/**
 * Create a signer request and get approval from user using Neynar's managed signers
 */
export async function requestSignerApproval(userFid: number): Promise<SignerInfo> {
  console.log("[FarcasterSigner] Requesting signer approval for FID:", userFid);

  try {
    // Step 1: Create a signer via Neynar API
    console.log("[FarcasterSigner] Creating signer via Neynar...");
    const createResponse = await fetch(`${NEYNAR_API}/signer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": NEYNAR_API_KEY,
      },
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("[FarcasterSigner] Neynar create signer error:", createResponse.status, errorText);
      throw new Error(`Failed to create signer: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    console.log("[FarcasterSigner] Signer created:", createData);

    const { signer_uuid, public_key } = createData;

    if (!signer_uuid || !public_key) {
      throw new Error("Invalid signer response from Neynar");
    }

    // Step 2: Register the signed key (get approval URL)
    console.log("[FarcasterSigner] Registering signed key...");
    const registerResponse = await fetch(`${NEYNAR_API}/signer/signed_key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid,
        app_fid: userFid, // Using user's FID for sponsorship
        deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      }),
    });

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error("[FarcasterSigner] Neynar register key error:", registerResponse.status, errorText);
      
      // If registration fails, try alternative approach - direct Warpcast deep link
      console.log("[FarcasterSigner] Trying alternative deep link approach...");
      return await requestSignerViaDeepLink(userFid);
    }

    const registerData = await registerResponse.json();
    console.log("[FarcasterSigner] Signed key registered:", registerData);

    const { signer_approval_url } = registerData;

    if (!signer_approval_url) {
      throw new Error("No approval URL received");
    }

    // Check if Farcaster is installed
    const canOpen = await Linking.canOpenURL("farcaster://");

    if (!canOpen) {
      Alert.alert(
        "Farcaster Required",
        "Please install the Farcaster app to authorize posting.",
        [
          {
            text: "Install Farcaster",
            onPress: () => {
              const storeUrl = Platform.select({
                ios: "https://apps.apple.com/app/farcaster/id1600555445",
                android:
                  "https://play.google.com/store/apps/details?id=com.farcaster.mobile",
              });
              if (storeUrl) Linking.openURL(storeUrl);
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      throw new Error("Farcaster not installed");
    }

    // Open Farcaster for approval
    console.log("[FarcasterSigner] Opening Farcaster for approval:", signer_approval_url);
    await Linking.openURL(signer_approval_url);

    // Poll for completion via Neynar
    const result = await pollNeynarSignerStatus(signer_uuid);

    if (result.status !== "approved") {
      throw new Error("Signer approval was not completed");
    }

    // Store the approved signer
    const signerInfo: SignerInfo = {
      publicKey: public_key,
      privateKey: signer_uuid, // Store signer_uuid as the "private key" for Neynar managed signers
      fid: userFid,
      status: "approved",
    };

    await storeSigner(signerInfo);
    console.log("[FarcasterSigner] Signer approved and stored");

    return signerInfo;
  } catch (error) {
    console.error("[FarcasterSigner] Error requesting signer approval:", error);
    throw error;
  }
}

/**
 * Alternative approach using direct Warpcast deep link
 * This works when Neynar API is not available
 */
async function requestSignerViaDeepLink(userFid: number): Promise<SignerInfo> {
  console.log("[FarcasterSigner] Using deep link approach for FID:", userFid);

  // Generate new keypair
  const { publicKey, privateKey } = await generateSignerKeypair();
  const publicKeyHex = "0x" + bytesToHex(publicKey);
  const privateKeyHex = "0x" + bytesToHex(privateKey);

  console.log("[FarcasterSigner] Generated keypair, public key:", publicKeyHex);

  // Create a simple deep link to request signer approval
  // This opens Warpcast's signer approval flow
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  
  // The deep link format for signer requests
  const deepLinkUrl = `https://warpcast.com/~/add-app-key?publicKey=${encodeURIComponent(publicKeyHex)}&name=${encodeURIComponent(APP_NAME)}`;

  // Check if we can open it
  const canOpen = await Linking.canOpenURL(deepLinkUrl);

  if (!canOpen) {
    // Try the farcaster:// scheme
    const farcasterUrl = `farcaster://add-app-key?publicKey=${encodeURIComponent(publicKeyHex)}&name=${encodeURIComponent(APP_NAME)}`;
    await Linking.openURL(farcasterUrl);
  } else {
    await Linking.openURL(deepLinkUrl);
  }

  // For the deep link approach, we need to manually check if it was approved
  // Show instructions to the user
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Approve in Farcaster",
      "Please approve the app key request in Farcaster, then return here and tap 'Done'.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => reject(new Error("User cancelled")),
        },
        {
          text: "Done",
          onPress: async () => {
            // Store as pending - user claims they approved
            const signerInfo: SignerInfo = {
              publicKey: publicKeyHex,
              privateKey: privateKeyHex,
              fid: userFid,
              status: "approved", // Trust the user for now
            };

            await storeSigner(signerInfo);
            resolve(signerInfo);
          },
        },
      ]
    );
  });
}

/**
 * Poll Neynar for signer approval status
 */
async function pollNeynarSignerStatus(
  signerUuid: string,
  maxAttempts = 60
): Promise<{ status: string; fid?: number }> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        reject(new Error("Signer approval timed out"));
        return;
      }

      try {
        const response = await fetch(
          `${NEYNAR_API}/signer?signer_uuid=${signerUuid}`,
          {
            method: "GET",
            headers: {
              "api_key": NEYNAR_API_KEY,
            },
          }
        );

        if (!response.ok) {
          console.error("[FarcasterSigner] Poll error:", response.status);
          // Continue polling despite errors
          setTimeout(poll, 2000);
          return;
        }

        const data = await response.json();
        const status = data.status;

        console.log("[FarcasterSigner] Poll status:", status);

        if (status === "approved") {
          resolve({
            status,
            fid: data.fid,
          });
          return;
        }

        if (status === "pending_approval" || status === "generated") {
          setTimeout(poll, 2000);
          return;
        }

        // Status is something else (e.g., "revoked")
        reject(new Error(`Signer status: ${status}`));
      } catch (error) {
        console.error("[FarcasterSigner] Poll fetch error:", error);
        setTimeout(poll, 2000);
      }
    };

    // Start polling
    poll();
  });
}

/**
 * Sign a message with the stored signer
 */
export async function signWithSigner(message: Uint8Array): Promise<Uint8Array> {
  const signer = await getStoredSigner();

  if (!signer || signer.status !== "approved") {
    throw new Error("No approved signer available");
  }

  const privateKeyBytes = hexToBytes(signer.privateKey.replace("0x", ""));
  const signature = await ed.signAsync(message, privateKeyBytes);

  return signature;
}

/**
 * Check if we have an approved signer for a specific FID
 */
export async function hasApprovedSigner(fid: number): Promise<boolean> {
  const signer = await getStoredSigner();
  return signer !== null && signer.fid === fid && signer.status === "approved";
}

export default {
  generateSignerKeypair,
  getStoredSigner,
  clearStoredSigner,
  requestSignerApproval,
  signWithSigner,
  hasApprovedSigner,
};

