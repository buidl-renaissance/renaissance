import * as Linking from "expo-linking";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { getWallet } from "./wallet";
import type { FarcasterUserData } from "../context/Auth";

// Storage keys
const SIWF_NONCE_KEY = "SIWF_NONCE";
const SIWF_STATE_KEY = "SIWF_STATE";

// Warpcast deep link URLs
const WARPCAST_SIWF_URL = "https://warpcast.com/~/sign-in-with-farcaster";

// Your app's URL scheme (configure in app.json)
const APP_SCHEME = "renaissance";
const CALLBACK_PATH = "auth/farcaster/callback";

/**
 * Generate a cryptographically secure nonce
 */
const generateNonce = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Generate a state parameter for CSRF protection
 */
const generateState = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Build the callback URL for Warpcast to redirect back to
 */
export const getCallbackUrl = (): string => {
  return Linking.createURL(CALLBACK_PATH);
};

/**
 * Initiate Warpcast Sign-In With Farcaster flow
 * Opens Warpcast app with auth request
 */
export const initiateWarpcastAuth = async (): Promise<void> => {
  // Generate and store nonce and state for verification
  const nonce = await generateNonce();
  const state = await generateState();

  await SecureStore.setItemAsync(SIWF_NONCE_KEY, nonce);
  await SecureStore.setItemAsync(SIWF_STATE_KEY, state);

  // Get the wallet for custody address
  const wallet = await getWallet();
  const custodyAddress = wallet.address;

  // Build the callback URL
  const callbackUrl = getCallbackUrl();

  // Build the Warpcast SIWF URL with parameters
  const params = new URLSearchParams({
    channelToken: nonce, // Used as channel token for the auth flow
    nonce,
    state,
    redirectUrl: callbackUrl,
    custody: custodyAddress,
  });

  const authUrl = `${WARPCAST_SIWF_URL}?${params.toString()}`;

  console.log("[FarcasterAuth] Opening Warpcast auth URL:", authUrl);

  // Check if Warpcast is installed
  const canOpen = await Linking.canOpenURL("warpcast://");

  if (canOpen) {
    // Open Warpcast directly
    await Linking.openURL(authUrl);
  } else {
    // Fallback to web URL which will prompt to install or open web
    await Linking.openURL(authUrl);
  }
};

/**
 * Parse the callback URL from Warpcast
 */
export const parseCallbackUrl = (
  url: string
): {
  fid?: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  state?: string;
  signature?: string;
  message?: string;
  error?: string;
} | null => {
  try {
    const parsed = Linking.parse(url);

    if (!parsed.queryParams) {
      return null;
    }

    return {
      fid: parsed.queryParams.fid as string | undefined,
      username: parsed.queryParams.username as string | undefined,
      displayName: parsed.queryParams.displayName as string | undefined,
      pfpUrl: parsed.queryParams.pfpUrl as string | undefined,
      custodyAddress: parsed.queryParams.custodyAddress as string | undefined,
      state: parsed.queryParams.state as string | undefined,
      signature: parsed.queryParams.signature as string | undefined,
      message: parsed.queryParams.message as string | undefined,
      error: parsed.queryParams.error as string | undefined,
    };
  } catch (error) {
    console.error("[FarcasterAuth] Error parsing callback URL:", error);
    return null;
  }
};

/**
 * Verify the state parameter matches what we sent
 */
export const verifyState = async (receivedState: string): Promise<boolean> => {
  const savedState = await SecureStore.getItemAsync(SIWF_STATE_KEY);
  return savedState === receivedState;
};

/**
 * Handle the callback from Warpcast
 * Returns the authenticated user data or throws an error
 */
export const handleWarpcastCallback = async (
  url: string
): Promise<FarcasterUserData> => {
  const params = parseCallbackUrl(url);

  if (!params) {
    throw new Error("Invalid callback URL");
  }

  if (params.error) {
    throw new Error(`Warpcast auth error: ${params.error}`);
  }

  // Verify state to prevent CSRF
  if (params.state) {
    const stateValid = await verifyState(params.state);
    if (!stateValid) {
      throw new Error("Invalid state parameter - possible CSRF attack");
    }
  }

  if (!params.fid) {
    throw new Error("No FID returned from Warpcast");
  }

  // Clear stored nonce and state
  await SecureStore.deleteItemAsync(SIWF_NONCE_KEY);
  await SecureStore.deleteItemAsync(SIWF_STATE_KEY);

  const userData: FarcasterUserData = {
    fid: parseInt(params.fid, 10),
    username: params.username,
    displayName: params.displayName,
    pfpUrl: params.pfpUrl,
    custodyAddress: params.custodyAddress,
  };

  console.log("[FarcasterAuth] Successfully authenticated:", userData);

  // Call the global callback to update auth state
  if ((global as any).__authFarcasterCallback) {
    await (global as any).__authFarcasterCallback(userData);
  }

  return userData;
};

/**
 * Check if a URL is a Farcaster auth callback
 */
export const isFarcasterCallback = (url: string): boolean => {
  try {
    const parsed = Linking.parse(url);
    return parsed.path === CALLBACK_PATH || parsed.path?.includes("farcaster/callback") || false;
  } catch {
    return false;
  }
};

/**
 * Setup deep link listener for Farcaster auth callbacks
 * Call this in your app's root component
 */
export const setupFarcasterAuthListener = (): (() => void) => {
  const handleUrl = async (event: { url: string }) => {
    console.log("[FarcasterAuth] Received deep link:", event.url);

    if (isFarcasterCallback(event.url)) {
      try {
        await handleWarpcastCallback(event.url);
      } catch (error) {
        console.error("[FarcasterAuth] Callback handling error:", error);
      }
    }
  };

  // Listen for incoming links
  const subscription = Linking.addEventListener("url", handleUrl);

  // Check if app was opened with a link
  Linking.getInitialURL().then((url) => {
    if (url && isFarcasterCallback(url)) {
      handleUrl({ url });
    }
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};

/**
 * Fetch additional user data from Farcaster Hub or Neynar (optional enhancement)
 * This can be used to get more details about a user after auth
 */
export const fetchFarcasterUserDetails = async (
  fid: number
): Promise<Partial<FarcasterUserData>> => {
  try {
    // You can implement calls to Neynar API or Farcaster Hub here
    // For now, return empty object - the basic data from callback is sufficient
    console.log("[FarcasterAuth] Fetching additional details for FID:", fid);
    return {};
  } catch (error) {
    console.error("[FarcasterAuth] Error fetching user details:", error);
    return {};
  }
};

