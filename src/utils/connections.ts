import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWallet } from "./wallet";
import { ethers } from "ethers";

export interface ConnectionRequest {
  type: "renaissance_connection";
  userId: string; // fid or wallet address
  walletAddress: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
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
  pfpUrl?: string
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
  const wallet = await getWallet();
  
  // Sign the connection request as the current user
  const currentUserSignature = await signConnectionRequest(scannedRequest, wallet.address);

  // Create connection ID (sorted user IDs to ensure uniqueness)
  const userIds = [scannedRequest.userId, currentUser.userId].sort();
  const connectionId = `${userIds[0]}_${userIds[1]}`;

  // Determine which user is A and which is B based on sorted order
  let connection: Connection;
  if (scannedRequest.userId < currentUser.userId) {
    connection = {
      id: connectionId,
      userA: {
        userId: scannedRequest.userId,
        walletAddress: scannedRequest.walletAddress,
        username: scannedRequest.username,
        displayName: scannedRequest.displayName,
        pfpUrl: scannedRequest.pfpUrl,
        signature: "", // Other user's signature will be added later
      },
      userB: {
        userId: currentUser.userId,
        walletAddress: currentUser.walletAddress,
        username: currentUser.username,
        displayName: currentUser.displayName,
        pfpUrl: currentUser.pfpUrl,
        signature: currentUserSignature,
      },
      timestamp: Date.now(),
      status: "pending",
    };
  } else {
    connection = {
      id: connectionId,
      userA: {
        userId: currentUser.userId,
        walletAddress: currentUser.walletAddress,
        username: currentUser.username,
        displayName: currentUser.displayName,
        pfpUrl: currentUser.pfpUrl,
        signature: currentUserSignature,
      },
      userB: {
        userId: scannedRequest.userId,
        walletAddress: scannedRequest.walletAddress,
        username: scannedRequest.username,
        displayName: scannedRequest.displayName,
        pfpUrl: scannedRequest.pfpUrl,
        signature: "", // Other user's signature will be added later
      },
      timestamp: Date.now(),
      status: "pending",
    };
  }

  // Save connection
  await saveConnection(connection);

  return connection;
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
 * Get connections for a specific user ID
 */
export async function getConnectionsForUser(userId: string): Promise<Connection[]> {
  const connections = await getConnections();
  return connections.filter(
    (c) => c.userA.userId === userId || c.userB.userId === userId
  );
}

/**
 * Get the other user in a connection
 */
export function getOtherUser(
  connection: Connection,
  currentUserId: string
): Connection["userA"] | Connection["userB"] {
  if (connection.userA.userId === currentUserId) {
    return connection.userB;
  }
  return connection.userA;
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
 * Remove a connection
 */
export async function removeConnection(connectionId: string): Promise<void> {
  const connections = await getConnections();
  const filtered = connections.filter((c) => c.id !== connectionId);
  await AsyncStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Confirm a connection (mark as confirmed)
 */
export async function confirmConnection(connectionId: string): Promise<void> {
  const connection = await getConnectionById(connectionId);
  if (connection) {
    connection.status = "confirmed";
    await saveConnection(connection);
  }
}
