import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { getWallet } from "../utils/wallet";
import { login as dpopLogin, register as dpopRegister } from "../dpop";
import {
  initiateDirectSignIn,
  getStoredSignerUuid,
  getStoredFid,
  clearNeynarAuth,
  fetchUserProfile,
  postCast as neynarPostCast,
  type NeynarUser,
} from "../utils/neynarAuth";

// Types for authentication
export type AuthType = "farcaster" | "local_wallet" | "local_email" | null;

export interface FarcasterUserData {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifications?: string[];
  signerUuid?: string; // Neynar signer UUID for posting
}

export interface LocalUserData {
  localId: string; // Negative FID for local users or unique identifier
  username?: string;
  displayName?: string;
  email?: string;
  walletAddress?: string;
}

export interface AuthUser {
  type: AuthType;
  farcaster?: FarcasterUserData;
  local?: LocalUserData;
  // Unified fields for easy access
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSigner: boolean;
  signerUuid: string | null;
}

interface AuthContextValue {
  state: AuthState;
  signInWithFarcaster: () => Promise<void>;
  signInWithWallet: () => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  registerWithEmail: (params: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Farcaster posting
  postCast: (text: string, options?: { parentUrl?: string; parentHash?: string }) => Promise<{ hash: string }>;
}

const AUTH_STORAGE_KEY = "AUTH_USER";
const LOCAL_FID_COUNTER_KEY = "LOCAL_FID_COUNTER";

// Start local FIDs at -1 and go down to avoid collision with real FIDs
const getNextLocalFid = async (): Promise<number> => {
  const current = await SecureStore.getItemAsync(LOCAL_FID_COUNTER_KEY);
  const nextFid = current ? parseInt(current) - 1 : -1;
  await SecureStore.setItemAsync(LOCAL_FID_COUNTER_KEY, nextFid.toString());
  return nextFid;
};

const INITIAL_STATE: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasSigner: false,
  signerUuid: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  // Load saved auth state on mount
  useEffect(() => {
    loadSavedAuth();
  }, []);

  const loadSavedAuth = async () => {
    try {
      const savedAuth = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
      const signerUuid = await getStoredSignerUuid();
      const storedFid = await getStoredFid();
      
      if (savedAuth) {
        const user = JSON.parse(savedAuth) as AuthUser;
        // Check if signer matches the user's FID
        const hasSigner = signerUuid !== null && 
                          storedFid !== null &&
                          storedFid === user.fid;
        
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          hasSigner,
          signerUuid: hasSigner ? signerUuid : null,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("[Auth] Error loading saved auth:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuth = async (user: AuthUser) => {
    try {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("[Auth] Error saving auth:", error);
    }
  };

  const clearAuth = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("[Auth] Error clearing auth:", error);
    }
  };

  // Sign in with Farcaster via Neynar (includes signer approval)
  const signInWithFarcaster = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      console.log("[Auth] Starting Neynar sign-in flow...");
      
      // Use Neynar's direct sign-in which creates signer and gets approval in one flow
      const result = await initiateDirectSignIn();
      
      console.log("[Auth] Neynar sign-in completed:", result.user.username);
      
      // Create the user object with signer info
      const farcasterData: FarcasterUserData = {
        fid: result.user.fid,
        username: result.user.username,
        displayName: result.user.displayName,
        pfpUrl: result.user.pfpUrl,
        custodyAddress: result.user.custodyAddress,
        verifications: result.user.verifications,
        signerUuid: result.signerUuid,
      };
      
      const user: AuthUser = {
        type: "farcaster",
        farcaster: farcasterData,
        fid: result.user.fid,
        username: result.user.username,
        displayName: result.user.displayName,
        pfpUrl: result.user.pfpUrl,
      };

      await saveAuth(user);
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        hasSigner: result.isApproved,
        signerUuid: result.signerUuid,
      });
      
      console.log("[Auth] User authenticated with posting permissions!");
    } catch (error) {
      console.error("[Auth] Farcaster sign in error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Sign in with local wallet (anonymous)
  const signInWithWallet = useCallback(async (): Promise<AuthUser> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const wallet = await getWallet();
      const localFid = await getNextLocalFid();

      // Generate a username from wallet address
      const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

      const user: AuthUser = {
        type: "local_wallet",
        local: {
          localId: localFid.toString(),
          username: `anon_${shortAddress}`,
          displayName: `Anonymous User`,
          walletAddress: wallet.address,
        },
        fid: localFid,
        username: `anon_${shortAddress}`,
        displayName: `Anonymous User`,
      };

      await saveAuth(user);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        hasSigner: false, // Local wallets don't have Farcaster signers
        signerUuid: null,
      });

      return user;
    } catch (error) {
      console.error("[Auth] Wallet sign in error:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Sign in with email/password
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const result = await dpopLogin(email, password);

        if (!result.user) {
          throw new Error("Login failed - no user returned");
        }

        // Use the server user ID as a negative FID to avoid collision
        const localFid = -Math.abs(result.user.id || Date.now());

        const user: AuthUser = {
          type: "local_email",
          local: {
            localId: localFid.toString(),
            username: result.user.public_name || result.user.name,
            displayName: result.user.name,
            email: result.user.email,
          },
          fid: localFid,
          username: result.user.public_name || result.user.name,
          displayName: result.user.name,
        };

        await saveAuth(user);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          hasSigner: false, // Email accounts don't have Farcaster signers
          signerUuid: null,
        });

        return user;
      } catch (error) {
        console.error("[Auth] Email sign in error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    []
  );

  // Register with email/password
  const registerWithEmail = useCallback(
    async (params: {
      email: string;
      password: string;
      name?: string;
    }): Promise<AuthUser> => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const result = await dpopRegister({
          email: params.email,
          password: params.password,
          name: params.name || "",
          phone: "",
          organization: "",
        });

        if (!result.user) {
          throw new Error("Registration failed - no user returned");
        }

        const localFid = -Math.abs(result.user.id || Date.now());

        const user: AuthUser = {
          type: "local_email",
          local: {
            localId: localFid.toString(),
            username: result.user.public_name || result.user.name,
            displayName: result.user.name,
            email: result.user.email,
          },
          fid: localFid,
          username: result.user.public_name || result.user.name,
          displayName: result.user.name,
        };

        await saveAuth(user);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          hasSigner: false,
          signerUuid: null,
        });

        return user;
      } catch (error) {
        console.error("[Auth] Email registration error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    []
  );

  // Sign out
  const signOut = useCallback(async () => {
    await clearAuth();
    await clearNeynarAuth(); // Also clear the Neynar signer
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      hasSigner: false,
      signerUuid: null,
    });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await loadSavedAuth();
  }, []);

  // Post a cast to Farcaster
  const postCast = useCallback(async (
    text: string,
    options?: { parentUrl?: string; parentHash?: string }
  ): Promise<{ hash: string }> => {
    if (!state.hasSigner || !state.signerUuid) {
      throw new Error("No signer available - please sign in with Farcaster first");
    }

    console.log("[Auth] Posting cast...");
    
    const result = await neynarPostCast(text, options);
    
    console.log("[Auth] Cast posted:", result.hash);
    
    return { hash: result.hash };
  }, [state.hasSigner, state.signerUuid]);

  const value: AuthContextValue = {
    state,
    signInWithFarcaster,
    signInWithWallet,
    signInWithEmail,
    registerWithEmail,
    signOut,
    refreshUser,
    postCast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

