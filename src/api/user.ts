import { getWallet } from "../utils/wallet";

const API_BASE_URL = "https://people.builddetroit.xyz/api";

/**
 * Construct the message that needs to be signed for account updates
 * This should match the backend's constructUpdateMessage function
 */
export function constructUpdateMessage(
  userId: number,
  farcasterId: string | null | undefined,
  profilePicture: string | null | undefined
): string {
  const parts = [`Update account ${userId}`];
  
  if (farcasterId !== undefined) {
    parts.push(`farcasterId=${farcasterId || ""}`);
  }
  
  if (profilePicture !== undefined) {
    parts.push(`profilePicture=${profilePicture ? "updated" : "removed"}`);
  }
  
  return parts.join(", ");
}

/**
 * Sign an update message with the wallet
 */
export async function signUpdateMessage(message: string): Promise<string> {
  const wallet = await getWallet();
  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Get user by wallet address
 * Note: This endpoint may not exist - if it doesn't, users will need to have backendUserId stored
 */
export async function getUserByWalletAddress(
  walletAddress: string
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users?publicAddress=${encodeURIComponent(walletAddress)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // Try alternative endpoint format
      const altResponse = await fetch(
        `${API_BASE_URL}/user/by-address/${encodeURIComponent(walletAddress)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!altResponse.ok) {
        throw new Error("User not found");
      }
      
      return altResponse.json();
    }

    const data = await response.json();
    // Handle both array and object responses
    return data;
  } catch (error) {
    console.error("Error fetching user by wallet address:", error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

/**
 * Update user profile (profilePicture and/or farcasterId)
 * Requires signature verification for these fields
 */
export async function updateUserProfile(params: {
  userId: number;
  farcasterId?: string | null;
  profilePicture?: string | null; // base64 encoded image data
  username?: string;
}): Promise<any> {
  const { userId, farcasterId, profilePicture, username } = params;

  // Build update data
  const updateData: any = {};
  if (username !== undefined) {
    updateData.username = username;
  }
  if (farcasterId !== undefined) {
    updateData.farcasterId = farcasterId;
  }
  if (profilePicture !== undefined) {
    updateData.profilePicture = profilePicture;
  }

  // If updating farcasterId or profilePicture, we need a signature
  if (farcasterId !== undefined || profilePicture !== undefined) {
    const message = constructUpdateMessage(userId, farcasterId, profilePicture);
    const signature = await signUpdateMessage(message);
    updateData.signature = signature;
  }

  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Failed to update user profile";
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
