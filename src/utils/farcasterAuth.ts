import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";
import { createAppClient, viemConnector } from "@farcaster/auth-client";

// App configuration
const APP_DOMAIN = "renaissance.app";
const APP_NAME = "Renaissance";

// Create the Farcaster auth client
const appClient = createAppClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector(),
});

interface AuthResult {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifications?: string[];
  message?: string;
  signature?: string;
}

// Store the current auth session
let currentAuthSession: {
  channelToken: string;
  pollInterval?: NodeJS.Timeout;
  resolve?: (value: AuthResult) => void;
  reject?: (reason: Error) => void;
} | null = null;

/**
 * Initiate Farcaster authentication
 */
export async function initiateWarpcastAuth(): Promise<AuthResult> {
  try {
    console.log("[FarcasterAuth] Starting Farcaster auth flow...");

    // Get the callback URL for our app
    const callbackUrl = Linking.createURL("auth/farcaster");

    // Create a Sign In With Farcaster channel
    const channel = await appClient.createChannel({
      siweUri: callbackUrl,
      domain: APP_DOMAIN,
      nonce: generateNonce(),
      notBefore: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
    });

    console.log("[FarcasterAuth] Channel created:", {
      channelToken: channel.data?.channelToken,
      url: channel.data?.url,
    });

    if (!channel.data?.channelToken || !channel.data?.url) {
      throw new Error("Failed to create auth channel");
    }

    const { channelToken, url: farcasterUrl } = channel.data;

    console.log("[FarcasterAuth] Opening Farcaster with URL:", farcasterUrl);

    // Check if Farcaster is installed
    const canOpen = await Linking.canOpenURL("farcaster://");

    if (!canOpen) {
      // Fall back to web URL or show install prompt
      Alert.alert(
        "Farcaster Required",
        "Please install the Farcaster app to sign in.",
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

    // Open Farcaster
    await Linking.openURL(farcasterUrl);

    // Poll for completion
    const result = await pollForCompletion(channelToken);
    console.log("[FarcasterAuth] Auth completed:", result);

    // Call the global callback to update auth state
    if ((global as any).__authFarcasterCallback && result.fid) {
      (global as any).__authFarcasterCallback({
        fid: result.fid,
        username: result.username,
        displayName: result.displayName,
        pfpUrl: result.pfpUrl,
        custodyAddress: result.custodyAddress,
        verifications: result.verifications,
      });
    }

    return result;
  } catch (error) {
    console.error("[FarcasterAuth] Auth error:", error);
    throw error;
  }
}

/**
 * Generate a random nonce
 */
function generateNonce(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 16; i++) {
    nonce += chars[Math.floor(Math.random() * chars.length)];
  }
  return nonce;
}

/**
 * Poll the channel for completion using the auth-client
 */
function pollForCompletion(
  channelToken: string,
  maxAttempts = 60
): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    currentAuthSession = {
      channelToken,
      resolve,
      reject,
    };

    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(currentAuthSession?.pollInterval);
        currentAuthSession = null;
        reject(new Error("Authentication timed out"));
        return;
      }

      try {
        const status = await appClient.status({ channelToken });
        console.log("[FarcasterAuth] Poll status:", status.data?.state);

        if (status.data?.state === "completed") {
          clearInterval(currentAuthSession?.pollInterval);
          currentAuthSession = null;

          const result: AuthResult = {
            fid: status.data.fid!,
            username: status.data.username,
            displayName: status.data.displayName,
            pfpUrl: status.data.pfpUrl,
            custodyAddress: status.data.custody,
            verifications: status.data.verifications,
            message: status.data.message,
            signature: status.data.signature,
          };

          resolve(result);
        }
      } catch (error) {
        console.error("[FarcasterAuth] Poll error:", error);
        // Continue polling despite errors
      }
    };

    // Poll every 2 seconds
    currentAuthSession.pollInterval = setInterval(poll, 2000);

    // Initial poll
    poll();
  });
}

/**
 * Cancel any ongoing auth session
 */
export function cancelAuth(): void {
  if (currentAuthSession?.pollInterval) {
    clearInterval(currentAuthSession.pollInterval);
  }
  if (currentAuthSession?.reject) {
    currentAuthSession.reject(new Error("Authentication cancelled"));
  }
  currentAuthSession = null;
}

/**
 * Handle deep link callback from Farcaster
 * This is called when the user returns to the app after authenticating
 */
export function handleAuthCallback(url: string): void {
  console.log("[FarcasterAuth] Received callback URL:", url);

  // Parse the URL for any data
  // The actual user data comes from polling the relay, not the callback URL
  // The callback just indicates the user has returned to the app
}

/**
 * Set up listener for Farcaster auth deep links
 * Should be called once when the app starts
 */
export function setupFarcasterAuthListener(): () => void {
  // Handle URLs when app is already running
  const subscription = Linking.addEventListener("url", (event) => {
    console.log("[FarcasterAuth] Deep link received:", event.url);

    if (
      event.url.includes("auth/farcaster") ||
      event.url.includes("farcaster")
    ) {
      handleAuthCallback(event.url);
    }
  });

  // Check for initial URL (app opened via deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log("[FarcasterAuth] Initial URL:", url);
      if (url.includes("auth/farcaster") || url.includes("farcaster")) {
        handleAuthCallback(url);
      }
    }
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
}

/**
 * Create a Sign In request for mini apps
 * Opens Farcaster to get a fresh custody signature with a specific nonce
 */
export interface SignInRequestOptions {
  nonce: string;
  notBefore?: string;
  expirationTime?: string;
}

export interface SignInRequestResult {
  message: string;
  signature: string;
  fid: number;
  custodyAddress: string;
}

export async function createSignInRequest(
  options: SignInRequestOptions
): Promise<SignInRequestResult> {
  console.log("[FarcasterAuth] Creating signIn request with nonce:", options.nonce);

  try {
    // Get the callback URL for our app
    const callbackUrl = Linking.createURL("auth/farcaster/signin");

    // Create a Sign In With Farcaster channel with the mini app's nonce
    const channel = await appClient.createChannel({
      siweUri: callbackUrl,
      domain: APP_DOMAIN,
      nonce: options.nonce,
      notBefore: options.notBefore || new Date().toISOString(),
      expirationTime:
        options.expirationTime ||
        new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
    });

    console.log("[FarcasterAuth] SignIn channel created:", {
      channelToken: channel.data?.channelToken,
    });

    if (!channel.data?.channelToken || !channel.data?.url) {
      throw new Error("Failed to create signIn channel");
    }

    const { channelToken, url: farcasterUrl } = channel.data;

    // Check if Farcaster is installed
    const canOpen = await Linking.canOpenURL("farcaster://");

    if (!canOpen) {
      throw new Error("Farcaster app not installed - please install Farcaster to use this feature");
    }

    // Open Farcaster for signature
    console.log("[FarcasterAuth] Opening Farcaster for signature");
    await Linking.openURL(farcasterUrl);

    // Poll for completion (shorter timeout for signIn)
    const result = await pollForCompletion(channelToken, 30); // 60 seconds max

    if (!result.message || !result.signature) {
      throw new Error("Signature not received from Farcaster");
    }

    console.log("[FarcasterAuth] SignIn completed with FID:", result.fid);

    return {
      message: result.message,
      signature: result.signature,
      fid: result.fid,
      custodyAddress: result.custodyAddress || "",
    };
  } catch (error) {
    console.error("[FarcasterAuth] SignIn request error:", error);
    throw error;
  }
}

export default {
  initiateWarpcastAuth,
  cancelAuth,
  handleAuthCallback,
  setupFarcasterAuthListener,
  createSignInRequest,
};
