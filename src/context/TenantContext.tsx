import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TENANT_STORAGE_KEY = "selectedTenant";

export const DEFAULT_TENANT_ID = "detroit";
export const DEFAULT_TENANT_DISPLAY_NAME = "Detroit";

export type Tenant = {
  id: string;
  displayName: string;
  image: number; // require() result for local asset
  heroBackground?: number;
  heroTitle?: string;
  heroSubtitle?: string;
  heroHideText?: boolean;
  heroHideOverlay?: boolean;
};

export const TENANTS: Tenant[] = [
  {
    id: "detroit",
    displayName: "Detroit",
    image: require("../../assets/renaissance.png"),
    heroBackground: require("../../assets/renaissance-right.png"),
    heroTitle: "Welcome to the Renaissance City",
    heroSubtitle: "Discover and shape Detroit's living culture.",
  },
  {
    id: "eth-denver",
    displayName: "ETH Denver",
    image: require("../../assets/eth-denver-icon.png"),
    heroBackground: require("../../assets/eth-denver-header.png"),
    heroHideText: true,
    heroHideOverlay: true,
  },
];

interface TenantContextValue {
  tenantId: string;
  displayName: string;
  image: number;
  setTenant: (tenantId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string>(DEFAULT_TENANT_ID);

  useEffect(() => {
    AsyncStorage.getItem(TENANT_STORAGE_KEY).then((stored) => {
      if (stored) {
        const match = TENANTS.find((t) => t.id === stored);
        if (match) {
          setTenantIdState(match.id);
        }
      }
    });
  }, []);

  const setTenant = useCallback(async (id: string) => {
    const match = TENANTS.find((t) => t.id === id);
    if (match) {
      setTenantIdState(match.id);
      await AsyncStorage.setItem(TENANT_STORAGE_KEY, match.id);
    }
  }, []);

  const currentTenant = TENANTS.find((t) => t.id === tenantId);
  const displayName = currentTenant?.displayName ?? DEFAULT_TENANT_DISPLAY_NAME;
  const image = currentTenant?.image ?? TENANTS[0].image;

  const value: TenantContextValue = {
    tenantId,
    displayName,
    image,
    setTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext);
}
