import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Linking, Vibration, Alert } from "react-native";
import type { MiniAppHost, SetPrimaryButtonOptions } from "@farcaster/frame-host-react-native";

// Define MiniAppContext type locally since it's not exported
interface MiniAppContext {
  client: {
    platformType: "mobile" | "web";
    clientFid: number;
    added: boolean;
    safeAreaInsets: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  features: {
    haptics: boolean;
    cameraAndMicrophoneAccess: boolean;
  };
}
import { useAuth, AuthUser } from "./Auth";
import { getWallet } from "../utils/wallet";

// Types for the frame context
interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface PrimaryButtonState {
  text: string;
  loading: boolean;
  disabled: boolean;
  hidden: boolean;
}

interface FarcasterFrameState {
  currentFrameUrl: string | null;
  isLoading: boolean;
  user: FarcasterUser | null;
  primaryButton: PrimaryButtonState;
  isFrameAdded: boolean;
}

interface FarcasterFrameContextValue {
  state: FarcasterFrameState;
  setFrameUrl: (url: string | null) => void;
  setUser: (user: FarcasterUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  createSdk: () => Omit<MiniAppHost, "ethProviderRequestV2">;
  onPrimaryButtonClick: () => void;
  setPrimaryButtonClickHandler: (handler: (() => void) | null) => void;
}

const INITIAL_STATE: FarcasterFrameState = {
  currentFrameUrl: null,
  isLoading: false,
  user: null,
  primaryButton: {
    text: "",
    loading: false,
    disabled: false,
    hidden: true,
  },
  isFrameAdded: false,
};

const FarcasterFrameContext = createContext<FarcasterFrameContextValue | null>(null);

export function useFarcasterFrame() {
  const context = useContext(FarcasterFrameContext);
  if (!context) {
    throw new Error("useFarcasterFrame must be used within FarcasterFrameProvider");
  }
  return context;
}

interface FarcasterFrameProviderProps {
  children: ReactNode;
}

export const FarcasterFrameProvider: React.FC<FarcasterFrameProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<FarcasterFrameState>(INITIAL_STATE);
  const [primaryButtonClickHandler, setPrimaryButtonClickHandlerState] = useState<(() => void) | null>(null);
  const [signInResolver, setSignInResolver] = useState<{
    resolve: (result: any) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Get auth context
  const auth = useAuth();

  // Sync auth user to frame user
  React.useEffect(() => {
    if (auth.state.user) {
      const frameUser: FarcasterUser = {
        fid: auth.state.user.fid,
        username: auth.state.user.username,
        displayName: auth.state.user.displayName,
        pfpUrl: auth.state.user.pfpUrl,
      };
      setState((prev) => ({ ...prev, user: frameUser }));
      
      // Resolve any pending signIn request
      if (signInResolver) {
        signInResolver.resolve({
          fid: auth.state.user.fid,
          username: auth.state.user.username,
          displayName: auth.state.user.displayName,
          pfpUrl: auth.state.user.pfpUrl,
        });
        setSignInResolver(null);
      }
    } else {
      setState((prev) => ({ ...prev, user: null }));
    }
  }, [auth.state.user, signInResolver]);

  const setFrameUrl = useCallback((url: string | null) => {
    setState((prev) => ({ ...prev, currentFrameUrl: url, isLoading: !!url }));
  }, []);

  const setUser = useCallback((user: FarcasterUser | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setPrimaryButton = useCallback((options: SetPrimaryButtonOptions) => {
    setState((prev) => ({
      ...prev,
      primaryButton: {
        text: options.text,
        loading: options.loading ?? false,
        disabled: options.disabled ?? false,
        hidden: options.hidden ?? false,
      },
    }));
  }, []);

  const setPrimaryButtonClickHandler = useCallback((handler: (() => void) | null) => {
    setPrimaryButtonClickHandlerState(() => handler);
  }, []);

  const onPrimaryButtonClick = useCallback(() => {
    if (primaryButtonClickHandler) {
      primaryButtonClickHandler();
    }
  }, [primaryButtonClickHandler]);

  // Use refs to always access current auth state in SDK methods
  const authRef = React.useRef(auth);
  const stateRef = React.useRef(state);
  
  React.useEffect(() => {
    authRef.current = auth;
  }, [auth]);
  
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Create the SDK object that implements MiniAppHost interface
  const createSdk = useCallback((): Omit<MiniAppHost, "ethProviderRequestV2"> => {
    // Use a getter to dynamically return current context
    const getContext = (): MiniAppContext => {
      const currentUser = authRef.current.state.user;
      const currentState = stateRef.current;
      
      return {
        client: {
          platformType: "mobile",
          clientFid: 0, // Your app's FID - set to 0 for now
          added: currentState.isFrameAdded,
          safeAreaInsets: {
            top: 44,
            bottom: 34,
            left: 0,
            right: 0,
          },
        },
        user: currentUser
          ? {
              fid: currentUser.fid,
              username: currentUser.username,
              displayName: currentUser.displayName,
              pfpUrl: currentUser.pfpUrl,
            }
          : {
              fid: 0,
            },
        features: {
          haptics: true,
          cameraAndMicrophoneAccess: true,
        },
      };
    };

    return {
      // Use Object.defineProperty to make context a dynamic getter
      get context() {
        return getContext();
      },

      close: () => {
        console.log("[FarcasterFrame] close requested");
        setFrameUrl(null);
      },

      ready: async (options) => {
        console.log("[FarcasterFrame] ready", options);
        setIsLoading(false);
        return {};
      },

      openUrl: (url: string) => {
        console.log("[FarcasterFrame] openUrl", url);
        Linking.openURL(url);
      },

      signIn: async (options) => {
        console.log("[FarcasterFrame] signIn requested", options);
        
        const currentUser = authRef.current.state.user;
        
        // Generate a signed response for authentication
        // This works for both local accounts and Farcaster accounts
        try {
          const wallet = await getWallet();
          const nonce = options?.nonce || `nonce-${Date.now()}`;
          const notBefore = options?.notBefore;
          const expirationTime = options?.expirationTime;
          
          // Create a SIWF-compatible message (based on EIP-4361 SIWE format)
          const domain = "renaissance.app";
          const uri = `https://${domain}`;
          const statement = "Farcaster Auth";
          const issuedAt = new Date().toISOString();
          const chainId = 10; // Optimism (Farcaster uses Optimism)
          const fid = currentUser?.fid || 0;
          
          // Build the message in EIP-4361 SIWE format
          const messageParts = [
            `${domain} wants you to sign in with your Ethereum account:`,
            wallet.address,
            "",
            statement,
            "",
            `URI: ${uri}`,
            `Version: 1`,
            `Chain ID: ${chainId}`,
            `Nonce: ${nonce}`,
            `Issued At: ${issuedAt}`,
          ];
          
          // Add optional fields if provided
          if (notBefore) {
            messageParts.push(`Not Before: ${notBefore}`);
          }
          if (expirationTime) {
            messageParts.push(`Expiration Time: ${expirationTime}`);
          }
          
          // Add Farcaster-specific resource
          messageParts.push(`Resources:`);
          messageParts.push(`- farcaster://fid/${fid}`);
          
          const message = messageParts.join("\n");
          
          // Sign the message with the wallet
          const signature = await wallet.signMessage(message);
          
          console.log("[FarcasterFrame] signIn signed message for user:", currentUser?.username || "anonymous");
          
          return {
            message,
            signature,
            authMethod: "custody" as const,
          };
        } catch (error) {
          console.error("[FarcasterFrame] signIn signing error:", error);
          throw new Error("Failed to sign authentication message");
        }
      },

      signManifest: async () => {
        console.log("[FarcasterFrame] signManifest requested");
        throw new Error("Sign manifest not implemented");
      },

      setPrimaryButton,

      ethProviderRequest: async (request) => {
        console.log("[FarcasterFrame] ethProviderRequest", request);
        // Implement your Ethereum provider here
        // This should integrate with your Web3 context
        throw new Error("ETH provider not implemented");
      },

      eip6963RequestProvider: () => {
        console.log("[FarcasterFrame] eip6963RequestProvider requested");
      },

      addFrame: async () => {
        console.log("[FarcasterFrame] addFrame requested");
        setState((prev) => ({ ...prev, isFrameAdded: true }));
        return {
          notificationDetails: undefined,
        };
      },

      addMiniApp: async () => {
        console.log("[FarcasterFrame] addMiniApp requested");
        setState((prev) => ({ ...prev, isFrameAdded: true }));
        return {
          notificationDetails: undefined,
        };
      },

      viewCast: async (options) => {
        console.log("[FarcasterFrame] viewCast", options);
        // Open cast in Warpcast or your app
        const url = `https://warpcast.com/~/conversations/${options.hash}`;
        Linking.openURL(url);
      },

      viewProfile: async (options) => {
        console.log("[FarcasterFrame] viewProfile", options);
        const url = `https://warpcast.com/~/profiles/${options.fid}`;
        Linking.openURL(url);
      },

      viewToken: async (options) => {
        console.log("[FarcasterFrame] viewToken", options);
        // Handle token viewing
        Alert.alert("View Token", `Token: ${options.token}`);
      },

      sendToken: async () => {
        console.log("[FarcasterFrame] sendToken requested");
        throw new Error("Send token not implemented");
      },

      swapToken: async () => {
        console.log("[FarcasterFrame] swapToken requested");
        throw new Error("Swap token not implemented");
      },

      openMiniApp: async (options) => {
        console.log("[FarcasterFrame] openMiniApp", options);
        // Open another mini app
        setFrameUrl(options.url);
      },

      composeCast: async (options) => {
        console.log("[FarcasterFrame] composeCast", options);
        // Handle cast composition
        if (options.close) {
          return { sent: false } as any;
        }
        return undefined as any;
      },

      requestCameraAndMicrophoneAccess: async () => {
        console.log("[FarcasterFrame] requestCameraAndMicrophoneAccess");
        // Request permissions through Expo - returns void per type definition
      },

      // Haptic feedback
      impactOccurred: async (style) => {
        console.log("[FarcasterFrame] impactOccurred", style);
        switch (style) {
          case "light":
            Vibration.vibrate(10);
            break;
          case "medium":
            Vibration.vibrate(20);
            break;
          case "heavy":
            Vibration.vibrate(30);
            break;
          default:
            Vibration.vibrate(20);
        }
      },

      notificationOccurred: async (type) => {
        console.log("[FarcasterFrame] notificationOccurred", type);
        switch (type) {
          case "success":
            Vibration.vibrate([0, 10, 50, 10]);
            break;
          case "warning":
            Vibration.vibrate([0, 20, 40, 20]);
            break;
          case "error":
            Vibration.vibrate([0, 30, 30, 30, 30, 30]);
            break;
          default:
            Vibration.vibrate(20);
        }
      },

      selectionChanged: async () => {
        console.log("[FarcasterFrame] selectionChanged");
        Vibration.vibrate(5);
      },

      getCapabilities: async () => {
        return [
          "actions.ready",
          "actions.openUrl",
          "actions.close",
          "actions.setPrimaryButton",
          "actions.addMiniApp",
          "actions.viewCast",
          "actions.viewProfile",
          "actions.composeCast",
          "actions.openMiniApp",
          "haptics.impactOccurred",
          "haptics.notificationOccurred",
          "haptics.selectionChanged",
        ];
      },

      getChains: async () => {
        return ["eip155:1", "eip155:8453", "eip155:10"]; // Ethereum, Base, Optimism
      },

      updateBackState: async (state) => {
        console.log("[FarcasterFrame] updateBackState", state);
      },
    };
  }, [state.isFrameAdded, setFrameUrl, setIsLoading, setPrimaryButton]);

  const value = useMemo(
    () => ({
      state,
      setFrameUrl,
      setUser,
      setIsLoading,
      createSdk,
      onPrimaryButtonClick,
      setPrimaryButtonClickHandler,
    }),
    [state, setFrameUrl, setUser, setIsLoading, createSdk, onPrimaryButtonClick, setPrimaryButtonClickHandler]
  );

  return (
    <FarcasterFrameContext.Provider value={value}>
      {children}
    </FarcasterFrameContext.Provider>
  );
};

export default FarcasterFrameProvider;

