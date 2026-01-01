import { getWallet } from "../utils/wallet";

const API_BASE_URL = "https://people.builddetroit.xyz/api";

/**
 * Construct the message that needs to be signed for account updates
 * This matches the backend's constructUpdateMessage function
 */
export function constructUpdateMessage(
  userId: number,
  farcasterId: string | null | undefined,
  profilePicture: string | null | undefined
): string {
  const parts = [
    `Update account for user ID: ${userId}`,
    farcasterId !== undefined
      ? `Farcaster ID: ${farcasterId ?? "null"}`
      : null,
    profilePicture !== undefined
      ? `Profile Picture: ${profilePicture ? "updated" : "null"}`
      : null,
  ].filter((part) => part !== null) as string[];

  return parts.join("\n");
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
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
    console.log("[updateUserProfile] Message to sign:", message);
    const signature = await signUpdateMessage(message);
    console.log("[updateUserProfile] Signature:", signature);
    updateData.signature = signature;
  }

  const url = `${API_BASE_URL}/users/${userId}`;
  const requestBody = JSON.stringify(updateData);
  
  console.log("[updateUserProfile] Request URL:", url);
  console.log("[updateUserProfile] Request method: PUT");
  console.log("[updateUserProfile] Request headers:", {
    "Content-Type": "application/json",
  });
  console.log("[updateUserProfile] Request body:", {
    ...updateData,
    profilePicture: profilePicture ? `${profilePicture.substring(0, 50)}... (${profilePicture.length} chars)` : profilePicture,
  });
  console.log("[updateUserProfile] Full request body length:", requestBody.length, "bytes");

  let response: Response;
  try {
    console.log("[updateUserProfile] Sending fetch request...");
    response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });
    console.log("[updateUserProfile] Fetch completed, response received");
    console.log("[updateUserProfile] Response status:", response.status, response.statusText);
    console.log("[updateUserProfile] Response ok:", response.ok);
  } catch (error) {
    console.error("[updateUserProfile] Network error:", error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Failed to send request"}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[updateUserProfile] Error response text:", errorText);
    let errorMessage = "Failed to update user profile";
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
      console.log("[updateUserProfile] Error response data:", errorData);
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  console.log("[updateUserProfile] Success response:", responseData);
  return responseData;
}
