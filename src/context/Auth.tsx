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
// import { initiateWarpcastAuth } from "../utils/farcasterAuth"; // Disabled - viem compatibility issue
import { fetchUserProfile } from "../utils/neynarAuth";
import { getUserById } from "../api/user";

// Types for authentication
export type AuthType = "farcaster" | "local_wallet" | "local_email" | null;

export interface FarcasterUserData {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifications?: string[];
}

export interface LocalUserData {
  localId: string; // Negative FID for local users or unique identifier
  username?: string;
  displayName?: string;
  email?: string;
  walletAddress?: string;
  backendUserId?: number; // Backend user ID from people.builddetroit.xyz
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
}

interface AuthContextValue {
  state: AuthState;
  signInWithFarcaster: () => Promise<void>;
  signInWithWallet: (params?: { username?: string; displayName?: string; pfpUrl?: string; backendUserId?: number }) => Promise<AuthUser>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>;
  registerWithEmail: (params: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      
      if (savedAuth) {
        const user = JSON.parse(savedAuth) as AuthUser;
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
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

  // Sign in with Farcaster via Warpcast deep link
  // Disabled temporarily due to viem compatibility issues with React Native
  const signInWithFarcaster = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: false }));
    throw new Error("Farcaster auth is temporarily disabled due to compatibility issues");
    // setState((prev) => ({ ...prev, isLoading: true }));
    // try {
    //   console.log("[Auth] Starting Warpcast sign-in flow...");
    //   
    //   // Use Warpcast deep-link flow for identity
    //   await initiateWarpcastAuth();
    //   
    //   // The actual user data will be received via deep link callback
    //   // which is handled in the farcasterAuth module and calls handleFarcasterCallback
    //   // Don't set isLoading to false here - wait for callback
    //   console.log("[Auth] Warpcast auth initiated - waiting for callback...");
    // } catch (error) {
    //   console.error("[Auth] Farcaster sign in error:", error);
    //   setState((prev) => ({ ...prev, isLoading: false }));
    //   throw error;
    // }
  }, []);

  // Handle Farcaster auth callback (called from deep link handler)
  const handleFarcasterCallback = useCallback(
    async (farcasterData: FarcasterUserData) => {
      console.log("[Auth] Received Farcaster callback:", farcasterData.username);
      
      // If pfpUrl is missing, fetch full profile from Neynar
      let finalFarcasterData = farcasterData;
      if (!farcasterData.pfpUrl && farcasterData.fid > 0) {
        try {
          console.log("[Auth] Fetching full profile from Neynar for FID:", farcasterData.fid);
          const fullProfile = await fetchUserProfile(farcasterData.fid);
          finalFarcasterData = {
            ...farcasterData,
            pfpUrl: fullProfile.pfpUrl || farcasterData.pfpUrl,
            displayName: fullProfile.displayName || farcasterData.displayName,
            username: fullProfile.username || farcasterData.username,
          };
          console.log("[Auth] Fetched profile with pfpUrl:", fullProfile.pfpUrl ? "yes" : "no");
        } catch (error) {
          console.error("[Auth] Error fetching profile from Neynar:", error);
          // Continue with original data if fetch fails
        }
      }
      
      const user: AuthUser = {
        type: "farcaster",
        farcaster: finalFarcasterData,
        fid: finalFarcasterData.fid,
        username: finalFarcasterData.username,
        displayName: finalFarcasterData.displayName,
        pfpUrl: finalFarcasterData.pfpUrl,
      };

      await saveAuth(user);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      console.log("[Auth] Farcaster user authenticated!", {
        fid: user.fid,
        username: user.username,
        hasPfpUrl: !!user.pfpUrl,
      });
    },
    []
  );

  // Expose handleFarcasterCallback for the deep link handler
  useEffect(() => {
    // Store the callback globally so it can be called from the deep link handler
    (global as any).__authFarcasterCallback = handleFarcasterCallback;
    return () => {
      delete (global as any).__authFarcasterCallback;
    };
  }, [handleFarcasterCallback]);

  // Sign in with local wallet (anonymous or Renaissance account)
  const signInWithWallet = useCallback(async (params?: { username?: string; displayName?: string; pfpUrl?: string; backendUserId?: number }): Promise<AuthUser> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const wallet = await getWallet();
      const localFid = await getNextLocalFid();

      // Use provided username or generate one from wallet address
      const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
      const username = params?.username || `anon_${shortAddress}`;
      const displayName = params?.displayName || params?.username || `Anonymous User`;

      const user: AuthUser = {
        type: "local_wallet",
        local: {
          localId: localFid.toString(),
          username: username,
          displayName: displayName,
          walletAddress: wallet.address,
          backendUserId: params?.backendUserId,
        },
        fid: localFid,
        username: username,
        displayName: displayName,
        pfpUrl: params?.pfpUrl,
      };

      console.log("[Auth] Signing in with wallet, backendUserId:", params?.backendUserId);
      console.log("[Auth] User object being saved:", {
        ...user,
        local: { ...user.local, walletAddress: wallet.address.slice(0, 10) + "..." },
      });

      await saveAuth(user);
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      console.log("[Auth] User saved and state updated with backendUserId:", user.local?.backendUserId);

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
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (state.user?.type === "farcaster" && state.user.fid > 0) {
      try {
        console.log("[Auth] Refreshing user profile from Neynar...");
        const fullProfile = await fetchUserProfile(state.user.fid);
        
        const updatedUser: AuthUser = {
          ...state.user,
          farcaster: {
            ...state.user.farcaster!,
            pfpUrl: fullProfile.pfpUrl || state.user.farcaster.pfpUrl,
            displayName: fullProfile.displayName || state.user.farcaster.displayName,
            username: fullProfile.username || state.user.farcaster.username,
          },
          pfpUrl: fullProfile.pfpUrl || state.user.pfpUrl,
          displayName: fullProfile.displayName || state.user.displayName,
          username: fullProfile.username || state.user.username,
        };

        await saveAuth(updatedUser);
        setState((prev) => ({
          ...prev,
          user: updatedUser,
        }));
        
        console.log("[Auth] User profile refreshed");
      } catch (error) {
        console.error("[Auth] Error refreshing user profile:", error);
        // Fall back to loading saved auth
        await loadSavedAuth();
      }
    } else if (state.user?.type === "local_wallet") {
      try {
        // Try to get backendUserId - either from state or by fetching
        let backendUserId = state.user.local?.backendUserId;
        
        if (!backendUserId && state.user.local?.walletAddress) {
          console.log("[Auth] BackendUserId not stored, fetching by wallet address...");
          const { getUserByWalletAddress } = await import("../api/user");
          try {
            const userData = await getUserByWalletAddress(state.user.local.walletAddress);
            const user = Array.isArray(userData) ? userData[0] : userData;
            backendUserId = user?.id;
          } catch (error) {
            console.error("[Auth] Error fetching user by wallet address:", error);
          }
        }
        
        if (backendUserId) {
          console.log("[Auth] Refreshing local wallet user profile from backend...", { backendUserId });
          const userData = await getUserById(backendUserId);
          console.log("[Auth] Backend user data:", { 
            profilePicture: userData.profilePicture ? `${userData.profilePicture.substring(0, 50)}...` : null,
            username: userData.username 
          });
          
          // Add cache-busting parameter to profile picture URL to force refresh
          let profilePictureUrl = userData.profilePicture || state.user.pfpUrl;
          if (profilePictureUrl) {
            const separator = profilePictureUrl.includes('?') ? '&' : '?';
            profilePictureUrl = `${profilePictureUrl}${separator}v=${Date.now()}`;
          }
          
          const updatedUser: AuthUser = {
            ...state.user,
            pfpUrl: profilePictureUrl,
            username: userData.username || state.user.username,
            displayName: userData.displayName || userData.username || state.user.displayName,
            local: {
              ...state.user.local,
              backendUserId: backendUserId,
              username: userData.username || state.user.local.username,
              displayName: userData.displayName || userData.username || state.user.local.displayName,
            },
          };

          console.log("[Auth] Updated user pfpUrl:", updatedUser.pfpUrl);
          await saveAuth(updatedUser);
          setState((prev) => ({
            ...prev,
            user: updatedUser,
          }));
          
          console.log("[Auth] Local wallet user profile refreshed");
        } else {
          console.log("[Auth] No backendUserId available, skipping refresh");
          await loadSavedAuth();
        }
      } catch (error) {
        console.error("[Auth] Error refreshing local wallet user profile:", error);
        // Fall back to loading saved auth
        await loadSavedAuth();
      }
    } else {
      await loadSavedAuth();
    }
  }, [state.user]);

  const value: AuthContextValue = {
    state,
    signInWithFarcaster,
    signInWithWallet,
    signInWithEmail,
    registerWithEmail,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

