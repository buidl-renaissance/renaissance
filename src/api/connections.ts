import { getWallet } from "../utils/wallet";

const API_BASE_URL = "https://people.builddetroit.xyz/api";

/**
 * Construct the message that needs to be signed for connections
 * The message is the alphabetically sorted username pair joined with a colon
 * e.g., "alice:bob" (sorted alphabetically)
 */
export function constructConnectionMessage(
  username1: string,
  username2: string
): string {
  // Sort usernames alphabetically
  const sortedUsernames = [username1, username2].sort();
  return `${sortedUsernames[0]}:${sortedUsernames[1]}`;
}

/**
 * Sign a connection message with the wallet
 */
export async function signConnectionMessage(message: string): Promise<string> {
  const wallet = await getWallet();
  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Connection response type
 */
export interface Connection {
  id: number;
  username1: string;
  username2: string;
  address1: string;
  address2: string;
  signature1: string | null;
  signature2: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all connections, or a specific connection by username pair
 * @param username1 Optional first username
 * @param username2 Optional second username
 * @returns Promise<Connection | Connection[]>
 */
export async function getConnections(
  username1?: string,
  username2?: string
): Promise<Connection | Connection[]> {
  try {
    const params = new URLSearchParams();
    if (username1) params.append("username1", username1);
    if (username2) params.append("username2", username2);

    const url = `${API_BASE_URL}/connections${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch connections";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw error;
  }
}

/**
 * Get a connection by ID
 * @param id Connection ID
 * @returns Promise<Connection>
 */
export async function getConnectionById(id: number): Promise<Connection> {
  try {
    const response = await fetch(`${API_BASE_URL}/connections/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch connection";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching connection:", error);
    throw error;
  }
}

/**
 * Create a new connection with the first signature
 * @param params Connection creation parameters
 * @returns Promise<Connection>
 */
export async function createConnection(params: {
  username1: string;
  username2: string;
  address1: string;
  address2: string;
  signature1: string;
}): Promise<Connection> {
  try {
    const { username1, username2, address1, address2, signature1 } = params;

    const response = await fetch(`${API_BASE_URL}/connections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username1,
        username2,
        address1,
        address2,
        signature1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to create connection";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error;
  }
}

/**
 * Create a connection and automatically sign it with the first user's wallet
 * This is a convenience function that constructs the message and signs it
 * @param params Connection creation parameters (without signature1)
 * @returns Promise<Connection>
 */
export async function createAndSignConnection(params: {
  username1: string;
  username2: string;
  address1: string;
  address2: string;
}): Promise<Connection> {
  const message = constructConnectionMessage(params.username1, params.username2);
  const signature1 = await signConnectionMessage(message);

  return createConnection({
    ...params,
    signature1,
  });
}

/**
 * Add the second signature to verify a connection
 * @param id Connection ID
 * @param signature2 Ethereum signature from address2
 * @returns Promise<Connection>
 */
export async function verifyConnection(
  id: number,
  signature2: string
): Promise<Connection> {
  try {
    const response = await fetch(`${API_BASE_URL}/connections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to verify connection";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error verifying connection:", error);
    throw error;
  }
}

/**
 * Verify a connection by automatically signing with the second user's wallet
 * This is a convenience function that constructs the message and signs it
 * @param id Connection ID
 * @param username1 First username
 * @param username2 Second username
 * @returns Promise<Connection>
 */
export async function verifyAndSignConnection(
  id: number,
  username1: string,
  username2: string
): Promise<Connection> {
  const message = constructConnectionMessage(username1, username2);
  const signature2 = await signConnectionMessage(message);

  return verifyConnection(id, signature2);
}

/**
 * Delete a connection
 * @param id Connection ID
 * @returns Promise<void>
 */
export async function deleteConnection(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/connections/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to delete connection";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error deleting connection:", error);
    throw error;
  }
}

/**
 * Get connections for a specific user from the server API
 * @param username Username to fetch connections for
 * @returns Promise<Connection[]> Array of connections
 */
export async function getConnectionsForUserFromAPI(
  username: string
): Promise<Connection[]> {
  try {
    const response = await getConnections(username);
    
    // getConnections can return a single connection or an array
    if (Array.isArray(response)) {
      return response;
    } else {
      // If it's a single connection, return it as an array
      return [response];
    }
  } catch (error) {
    console.error("Error fetching connections from API:", error);
    throw error;
  }
}

/**
 * Confirm a pending connection by signing and verifying it
 * This is a convenience wrapper around verifyAndSignConnection
 * @param id Connection ID
 * @param username1 First username
 * @param username2 Second username
 * @returns Promise<Connection> Updated connection
 */
export async function confirmPendingConnection(
  id: number,
  username1: string,
  username2: string
): Promise<Connection> {
  return verifyAndSignConnection(id, username1, username2);
}
