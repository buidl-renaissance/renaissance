import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWallet } from "./wallet";
import { ethers } from "ethers";
import {
  createAndSignConnection,
  getConnectionsForUserFromAPI,
  confirmPendingConnection,
  Connection as APIConnection,
} from "../api/connections";

export interface ConnectionRequest {
  type: "renaissance_connection";
  userId: string; // fid or wallet address
  walletAddress: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  profileUrl?: string;
  timestamp: number;
  nonce: string;
}

export interface Connection {
  id: string; // Unique connection ID (combination of both user IDs)
  userA: {
    userId: string;
    walletAddress: string;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    signature: string;
  };
  userB: {
    userId: string;
    walletAddress: string;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    signature: string;
  };
  timestamp: number;
  status: "pending" | "confirmed";
}

const CONNECTIONS_STORAGE_KEY = "RenaissanceConnections";

/**
 * Generate a connection request QR code data
 */
export async function generateConnectionRequest(
  userId: string,
  walletAddress: string,
  username?: string,
  displayName?: string,
  pfpUrl?: string,
  profileUrl?: string
): Promise<ConnectionRequest> {
  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(16));
  const timestamp = Date.now();

  return {
    type: "renaissance_connection",
    userId,
    walletAddress,
    username,
    displayName,
    pfpUrl,
    profileUrl,
    timestamp,
    nonce,
  };
}

/**
 * Sign a connection request message
 */
export async function signConnectionRequest(
  request: ConnectionRequest,
  signerWalletAddress: string
): Promise<string> {
  const wallet = await getWallet();
  
  if (wallet.address.toLowerCase() !== signerWalletAddress.toLowerCase()) {
    throw new Error("Wallet address mismatch");
  }

  // Create a message to sign: connection request data + signer's address
  const message = JSON.stringify({
    request,
    signer: signerWalletAddress,
  });

  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Verify a connection signature
 */
export async function verifyConnectionSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Create a connection record from a scanned QR code
 * This function creates a connection on the server with a signed message
 */
export async function createConnection(
  scannedRequest: ConnectionRequest,
  currentUser: {
    userId: string;
    walletAddress: string;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  }
): Promise<Connection> {
  // Validate that both usernames are present (required by API)
  if (!scannedRequest.username) {
    throw new Error("Scanned user's username is required to create a connection");
  }
  if (!currentUser.username) {
    throw new Error("Current user's username is required to create a connection");
  }

  // Validate wallet addresses
  if (!scannedRequest.walletAddress) {
    throw new Error("Scanned user's wallet address is required");
  }
  if (!currentUser.walletAddress) {
    throw new Error("Current user's wallet address is required");
  }

  try {
    // Create connection on server with signed message
    // We pass the current user (scanner) as username1/address1 so we can sign with their wallet
    // The API will sort usernames alphabetically internally for the message, but will verify
    // that address1 matches username1 and address2 matches username2 from the database
    const apiConnection = await createAndSignConnection({
      username1: currentUser.username,
      username2: scannedRequest.username,
      address1: currentUser.walletAddress,
      address2: scannedRequest.walletAddress,
    });

    // Validate API response
    if (!apiConnection || !apiConnection.id) {
      throw new Error("Invalid API response: connection ID missing");
    }

    // Convert API response to local Connection format for backward compatibility
    // Use the API response's username1/username2 to determine mapping
    // The API may have sorted them, so we check which username matches which
    const isCurrentUserUsername1 = apiConnection.username1 === currentUser.username;
    
    const connection: Connection = {
      id: apiConnection.id.toString(),
      userA: {
        userId: isCurrentUserUsername1 ? currentUser.userId : scannedRequest.userId,
        walletAddress: isCurrentUserUsername1 ? apiConnection.address1 : apiConnection.address2,
        username: isCurrentUserUsername1 ? apiConnection.username1 : apiConnection.username2,
        displayName: isCurrentUserUsername1 ? currentUser.displayName : scannedRequest.displayName,
        pfpUrl: isCurrentUserUsername1 ? currentUser.pfpUrl : scannedRequest.pfpUrl,
        signature: isCurrentUserUsername1 ? (apiConnection.signature1 || "") : (apiConnection.signature2 || ""),
      },
      userB: {
        userId: isCurrentUserUsername1 ? scannedRequest.userId : currentUser.userId,
        walletAddress: isCurrentUserUsername1 ? apiConnection.address2 : apiConnection.address1,
        username: isCurrentUserUsername1 ? apiConnection.username2 : apiConnection.username1,
        displayName: isCurrentUserUsername1 ? scannedRequest.displayName : currentUser.displayName,
        pfpUrl: isCurrentUserUsername1 ? scannedRequest.pfpUrl : currentUser.pfpUrl,
        signature: isCurrentUserUsername1 ? (apiConnection.signature2 || "") : (apiConnection.signature1 || ""),
      },
      timestamp: new Date(apiConnection.createdAt).getTime(),
      status: apiConnection.verified ? "confirmed" : "pending",
    };

    // Save connection locally for backward compatibility
    await saveConnection(connection);

    return connection;
  } catch (error) {
    console.error("Error creating connection on server:", error);
    throw error;
  }
}

/**
 * Get all connections
 */
export async function getConnections(): Promise<Connection[]> {
  try {
    const data = await AsyncStorage.getItem(CONNECTIONS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading connections:", error);
    return [];
  }
}

/**
 * Get a specific connection by ID
 */
export async function getConnectionById(connectionId: string): Promise<Connection | null> {
  const connections = await getConnections();
  return connections.find((c) => c.id === connectionId) || null;
}

/**
 * Convert API Connection format to local Connection format
 */
function convertAPIConnectionToLocal(
  apiConnection: APIConnection,
  currentUserId: string,
  currentUsername: string,
  currentWalletAddress: string
): Connection | null {
  // Determine which user is the current user in the API response
  const isCurrentUserUsername1 = apiConnection.username1 === currentUsername;
  const isCurrentUserUsername2 = apiConnection.username2 === currentUsername;

  if (!isCurrentUserUsername1 && !isCurrentUserUsername2) {
    // Current user is not part of this connection
    return null;
  }

  // The API already has usernames sorted alphabetically (username1 < username2)
  // We need to determine which one is the current user and which is the other
  const currentUserIsFirst = isCurrentUserUsername1;
  
  // Get the other user's information
  const otherUsername = currentUserIsFirst ? apiConnection.username2 : apiConnection.username1;
  const otherWalletAddress = currentUserIsFirst ? apiConnection.address2 : apiConnection.address1;
  const otherSignature = currentUserIsFirst ? (apiConnection.signature2 || "") : (apiConnection.signature1 || "");
  const currentUserSignature = currentUserIsFirst ? (apiConnection.signature1 || "") : (apiConnection.signature2 || "");

  // Always put current user in userA and other user in userB for consistency
  // This makes it easier to identify which is which later
  const localConnection: Connection = {
    id: apiConnection.id.toString(),
    userA: {
      userId: currentUserId,
      walletAddress: currentUserIsFirst ? apiConnection.address1 : apiConnection.address2,
      username: currentUsername,
      signature: currentUserSignature,
    },
    userB: {
      userId: otherWalletAddress, // Use wallet address as fallback since we don't have their userId
      walletAddress: otherWalletAddress,
      username: otherUsername,
      signature: otherSignature,
    },
    timestamp: new Date(apiConnection.createdAt).getTime(),
    status: apiConnection.verified ? "confirmed" : "pending",
  };

  // Verify the conversion is correct
  if (localConnection.userA.username !== currentUsername) {
    console.error("Conversion error: userA username doesn't match current user", {
      userAUsername: localConnection.userA.username,
      currentUsername,
      apiUsername1: apiConnection.username1,
      apiUsername2: apiConnection.username2,
    });
  }

  return localConnection;
}

/**
 * Get connections for a specific user ID
 * @param userId User ID to fetch connections for
 * @param useServer If true, fetch from server API and sync to local storage
 * @param username Username for server fetching (required if useServer is true)
 * @param walletAddress Wallet address for server fetching (required if useServer is true)
 * @returns Promise<Connection[]> Array of connections
 */
export async function getConnectionsForUser(
  userId: string,
  useServer?: boolean,
  username?: string,
  walletAddress?: string
): Promise<Connection[]> {
  if (useServer && username && walletAddress) {
    // Fetch from server and sync to local storage
    try {
      const apiConnections = await getConnectionsForUserFromAPI(username);
      const localConnections: Connection[] = [];

      for (const apiConn of apiConnections) {
        const localConn = convertAPIConnectionToLocal(
          apiConn,
          userId,
          username,
          walletAddress
        );
        if (localConn) {
          localConnections.push(localConn);
          // Sync to local storage
          await saveConnection(localConn);
        }
      }

      return localConnections;
    } catch (error) {
      console.error("Error fetching connections from server, falling back to local:", error);
      // Fall back to local storage on error
      const connections = await getConnections();
      return connections.filter(
        (c) => c.userA.userId === userId || c.userB.userId === userId
      );
    }
  } else {
    // Use local storage
    const connections = await getConnections();
    return connections.filter(
      (c) => c.userA.userId === userId || c.userB.userId === userId
    );
  }
}

/**
 * Sync connections from server to local storage
 * @param username Username to fetch connections for
 * @param userId User ID for local storage mapping
 * @param walletAddress Wallet address for current user
 * @returns Promise<Connection[]> Synced connections
 */
export async function syncConnectionsFromServer(
  username: string,
  userId: string,
  walletAddress: string
): Promise<Connection[]> {
  try {
    const apiConnections = await getConnectionsForUserFromAPI(username);
    const localConnections: Connection[] = [];

    for (const apiConn of apiConnections) {
      const localConn = convertAPIConnectionToLocal(
        apiConn,
        userId,
        username,
        walletAddress
      );
      if (localConn) {
        localConnections.push(localConn);
        // Sync to local storage
        await saveConnection(localConn);
      }
    }

    return localConnections;
  } catch (error) {
    console.error("Error syncing connections from server:", error);
    throw error;
  }
}

/**
 * Get the other user in a connection
 */
export function getOtherUser(
  connection: Connection,
  currentUserId: string,
  currentUsername?: string
): Connection["userA"] | Connection["userB"] {
  // Check by userId first
  if (connection.userA.userId === currentUserId) {
    return connection.userB;
  }
  if (connection.userB.userId === currentUserId) {
    return connection.userA;
  }
  
  // If userId doesn't match, check by username
  if (currentUsername) {
    if (connection.userA.username === currentUsername) {
      return connection.userB;
    }
    if (connection.userB.username === currentUsername) {
      return connection.userA;
    }
  }
  
  // Fallback: return userB if we can't determine
  return connection.userB;
}

/**
 * Save a connection to storage
 */
async function saveConnection(connection: Connection): Promise<void> {
  const connections = await getConnections();
  const existingIndex = connections.findIndex((c) => c.id === connection.id);

  if (existingIndex >= 0) {
    // Update existing connection
    connections[existingIndex] = connection;
  } else {
    // Add new connection
    connections.push(connection);
  }

  await AsyncStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
}

/**
 * Remove a connection (from both server and local storage)
 */
export async function removeConnection(connectionId: string): Promise<void> {
  try {
    // Delete from server
    const connectionIdNum = parseInt(connectionId, 10);
    if (!isNaN(connectionIdNum)) {
      const { deleteConnection } = await import("../api/connections");
      await deleteConnection(connectionIdNum);
    }
  } catch (error) {
    console.error("Error deleting connection from server:", error);
    // Continue to delete from local storage even if server delete fails
  }

  // Delete from local storage
  const connections = await getConnections();
  const filtered = connections.filter((c) => c.id !== connectionId);
  await AsyncStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Confirm a pending connection by signing and verifying it
 * @param connectionId Connection ID (as string, will be converted to number)
 * @param username1 First username
 * @param username2 Second username
 * @param currentUserId Current user ID for local storage update
 * @param currentUsername Current username
 * @param currentWalletAddress Current wallet address
 * @returns Promise<Connection> Updated connection
 */
export async function confirmConnection(
  connectionId: string,
  username1: string,
  username2: string,
  currentUserId: string,
  currentUsername: string,
  currentWalletAddress: string
): Promise<Connection> {
  try {
    // Convert connection ID to number for API call
    const connectionIdNum = parseInt(connectionId, 10);
    if (isNaN(connectionIdNum)) {
      throw new Error("Invalid connection ID");
    }

    // Call API to verify connection
    const apiConnection = await confirmPendingConnection(
      connectionIdNum,
      username1,
      username2
    );

    // Convert API response to local format
    const localConn = convertAPIConnectionToLocal(
      apiConnection,
      currentUserId,
      currentUsername,
      currentWalletAddress
    );

    if (!localConn) {
      throw new Error("Failed to convert API connection to local format");
    }

    // Update local storage
    await saveConnection(localConn);

    return localConn;
  } catch (error) {
    console.error("Error confirming connection:", error);
    throw error;
  }
}
