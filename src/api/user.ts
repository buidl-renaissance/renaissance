import { getWallet } from "../utils/wallet";

const API_BASE_URL = "https://people.builddetroit.xyz/api";

/**
 * Get the profile image URL for a user by their username
 * Returns the API endpoint URL which will redirect (302) to the actual profile image
 * @param username Username of the user
 * @returns Profile image URL endpoint
 */
export function getUserProfileImageUrl(username: string | null | undefined): string | null {
  if (!username) {
    return null;
  }
  return `${API_BASE_URL}/users/image/${encodeURIComponent(username)}`;
}

/**
 * Construct the message that needs to be signed for account creation
 * This matches the backend's constructCreateMessage function
 */
export function constructCreateMessage(
  publicAddress: string,
  username: string,
  name: string | null | undefined
): string {
  const parts = [
    `Create Renaissance account`,
    `Address: ${publicAddress}`,
    `Username: ${username}`,
    name ? `Name: ${name}` : null,
  ].filter((part) => part !== null) as string[];

  return parts.join("\n");
}

/**
 * Construct the message that needs to be signed for account updates
 * This matches the backend's constructUpdateMessage function
 */
export function constructUpdateMessage(
  userId: number,
  farcasterId: string | null | undefined,
  profilePicture: string | null | undefined,
  name: string | null | undefined,
  email: string | null | undefined,
  phone: string | null | undefined
): string {
  const parts = [
    `Update account for user ID: ${userId}`,
    farcasterId !== undefined
      ? `Farcaster ID: ${farcasterId ?? "null"}`
      : null,
    profilePicture !== undefined
      ? `Profile Picture: ${profilePicture ? "updated" : "null"}`
      : null,
    name !== undefined
      ? `Name: ${name ?? "null"}`
      : null,
    email !== undefined
      ? `Email: ${email ?? "null"}`
      : null,
    phone !== undefined
      ? `Phone: ${phone ?? "null"}`
      : null,
  ].filter((part) => part !== null) as string[];

  return parts.join("\n");
}

/**
 * Sign a message with the wallet
 */
export async function signMessage(message: string): Promise<string> {
  const wallet = await getWallet();
  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Sign an update message with the wallet (alias for signMessage for backwards compatibility)
 */
export async function signUpdateMessage(message: string): Promise<string> {
  return signMessage(message);
}

/**
 * Get user by wallet address
 */
export async function getUserByWalletAddress(
  walletAddress: string
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/address/${encodeURIComponent(walletAddress)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("User not found");
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
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/username/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("User not found");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
}

/**
 * Create a new user account with signature verification
 * Requires signature to prove ownership of the publicAddress
 */
export async function createUserAccount(params: {
  publicAddress: string;
  username: string;
  name?: string | null;
  displayName?: string | null;
  profilePicture?: string | null; // base64 encoded image data
  email?: string | null;
  phone?: string | null;
  farcasterId?: string | null;
}): Promise<any> {
  const { publicAddress, username, name, displayName, profilePicture, email, phone, farcasterId } = params;

  // Construct the message that needs to be signed
  const message = constructCreateMessage(publicAddress, username, name || displayName);
  console.log("[createUserAccount] Message to sign:", message);
  
  // Sign the message to prove ownership of the wallet
  const signature = await signMessage(message);
  console.log("[createUserAccount] Signature:", signature);

  // Build request data
  const requestData: any = {
    publicAddress,
    username,
    signature,
  };
  
  if (name !== undefined) {
    requestData.name = name;
  }
  if (displayName !== undefined) {
    requestData.displayName = displayName;
  }
  if (profilePicture !== undefined) {
    requestData.profilePicture = profilePicture;
  }
  if (email !== undefined) {
    requestData.email = email;
  }
  if (phone !== undefined) {
    requestData.phone = phone;
  }
  if (farcasterId !== undefined) {
    requestData.farcasterId = farcasterId;
  }

  const url = `${API_BASE_URL}/users`;
  const requestBody = JSON.stringify(requestData);
  
  console.log("[createUserAccount] Request URL:", url);
  console.log("[createUserAccount] Request method: POST");
  console.log("[createUserAccount] Request body:", {
    ...requestData,
    profilePicture: profilePicture ? `${profilePicture.substring(0, 50)}... (${profilePicture.length} chars)` : profilePicture,
    signature: `${signature.substring(0, 20)}...`,
  });
  console.log("[createUserAccount] Full request body length:", requestBody.length, "bytes");

  let response: Response;
  try {
    console.log("[createUserAccount] Sending fetch request...");
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });
    console.log("[createUserAccount] Fetch completed, response received");
    console.log("[createUserAccount] Response status:", response.status, response.statusText);
    console.log("[createUserAccount] Response ok:", response.ok);
  } catch (error) {
    console.error("[createUserAccount] Network error:", error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Failed to send request"}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[createUserAccount] Error response text:", errorText);
    let errorMessage = "Failed to create account";
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
      console.log("[createUserAccount] Error response data:", errorData);
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  console.log("[createUserAccount] Success response:", responseData);
  return responseData;
}

/**
 * Update user profile (profilePicture, farcasterId, displayName, email, phone)
 * Requires signature verification for all protected fields
 */
export async function updateUserProfile(params: {
  userId: number;
  farcasterId?: string | null;
  profilePicture?: string | null; // base64 encoded image data
  username?: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<any> {
  const { userId, farcasterId, profilePicture, username, displayName, email, phone } = params;

  // Build update data
  const updateData: any = {};
  if (username !== undefined) {
    updateData.username = username;
  }
  if (displayName !== undefined) {
    updateData.displayName = displayName;
  }
  if (email !== undefined) {
    updateData.email = email;
  }
  if (phone !== undefined) {
    updateData.phone = phone;
  }
  if (farcasterId !== undefined) {
    updateData.farcasterId = farcasterId;
  }
  if (profilePicture !== undefined) {
    updateData.profilePicture = profilePicture;
  }

  // All profile updates now require signature verification
  // Construct message with all fields that are being updated
  const message = constructUpdateMessage(
    userId,
    farcasterId,
    profilePicture,
    displayName,
    email,
    phone
  );
  console.log("[updateUserProfile] Message to sign:", message);
  const signature = await signMessage(message);
  console.log("[updateUserProfile] Signature:", signature);
  updateData.signature = signature;

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
