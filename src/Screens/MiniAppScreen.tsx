import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
  InteractionManager,
  Animated,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useWebViewRpcAdapter } from "@farcaster/frame-host-react-native";
import { useFarcasterFrame } from "../context/FarcasterFrame";
import { useAuth } from "../context/Auth";
import { Ionicons } from "@expo/vector-icons";

const MiniAppScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const webViewRef = useRef<WebView>(null);
  const { state, createSdk, setIsLoading, setFrameUrl, setPrimaryButtonClickHandler, onPrimaryButtonClick } = useFarcasterFrame();
  const { state: authState } = useAuth();
  
  const frameUrl = route.params?.url || state.currentFrameUrl;
  const title = route.params?.title || "Mini App";
  const emoji = route.params?.emoji || "🧩";
  
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const webViewKeyRef = useRef(0); // Force remount on URL change
  const splashOpacity = useRef(new Animated.Value(1)).current;
  
  // Extract domain from URL for the RPC adapter
  const domain = useMemo(() => {
    if (!frameUrl) return "";
    try {
      return new URL(frameUrl).hostname;
    } catch {
      return "";
    }
  }, [frameUrl]);
  
  // Memoize SDK instance - but note context is now a dynamic getter
  const sdk = useMemo(() => {
    try {
      return createSdk();
    } catch (error) {
      console.error("[MiniAppScreen] Error creating SDK:", error);
      return null;
    }
  }, [createSdk]);
  
  // Log current auth state for debugging
  useEffect(() => {
    console.log("[MiniAppScreen] Auth state changed:", {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user ? {
        fid: authState.user.fid,
        username: authState.user.username,
        type: authState.user.type,
      } : null,
    });
    if (sdk) {
      console.log("[MiniAppScreen] SDK context.user:", sdk.context?.user);
    }
  }, [authState.user, sdk]);

  // Set up the WebView RPC adapter with error handling
  // Use a safe domain and SDK to prevent crashes
  const safeDomain = domain || "localhost";
  const safeSdk = sdk || {
    context: { user: { fid: 0 }, client: { platformType: "mobile" as const } },
    close: () => {},
  };
  
  // Always call the hook (hooks must be called unconditionally)
  const { onMessage, emit } = useWebViewRpcAdapter({
    webViewRef: webViewRef as React.RefObject<WebView>,
    domain: safeDomain,
    sdk: safeSdk,
    debug: __DEV__,
  });

  // Navigation handlers stored in refs to avoid re-render issues
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

  // Reset splash screen and force WebView remount when URL changes
  useEffect(() => {
    // Stop previous WebView if it exists
    if (webViewRef.current) {
      try {
        webViewRef.current.stopLoading();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Force WebView remount by incrementing key
    webViewKeyRef.current += 1;
    
    // Reset all state
    setShowSplash(true);
    splashOpacity.setValue(1);
    setIsReady(true); // Start loading immediately
    setHasError(false);
    setErrorMessage(null);
    setIsLoading(true);
  }, [frameUrl, setIsLoading]);

  // Fade out splash screen once WebView finishes loading
  useEffect(() => {
    if (isReady && !state.isLoading && !hasError && showSplash) {
      // Fade out quickly when WebView is loaded
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }
  }, [isReady, state.isLoading, hasError, showSplash]);

  // Set navigation header once on mount
  useEffect(() => {
    navigation.setOptions({
      title,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (canGoBackRef.current && webViewRef.current) {
              webViewRef.current.goBack();
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            setFrameUrl(null);
            navigation.goBack();
          }}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, setFrameUrl]);

  // Store emit in a ref to avoid dependency issues
  const emitRef = useRef(emit);
  useEffect(() => {
    emitRef.current = emit;
  }, [emit]);

  // Track previous auth state to detect changes
  const prevAuthUserRef = useRef(authState.user);
  
  // Notify mini app when auth state changes while mini app is open
  useEffect(() => {
    const prevUser = prevAuthUserRef.current;
    const currentUser = authState.user;
    
    // Check if user changed (login/logout)
    const userChanged = 
      (prevUser === null && currentUser !== null) ||
      (prevUser !== null && currentUser === null) ||
      (prevUser?.fid !== currentUser?.fid);
    
    if (userChanged && webViewRef.current && sdk) {
      console.log("[MiniAppScreen] Auth changed, sending updated context to WebView");
      // Inject updated context into WebView
      const contextData = JSON.stringify(sdk.context);
      const injectCode = `
        (function() {
          try {
            const context = ${contextData};
            const authenticated = ${!!currentUser};
            
            window.dispatchEvent(new CustomEvent('farcaster:context:updated', {
              detail: { context, authenticated }
            }));
            window.__renaissanceAuthContext = context;
          } catch (e) {
            console.error('[MiniApp] Error handling context update:', e);
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(injectCode);
    }
    
    prevAuthUserRef.current = currentUser;
  }, [authState.user, sdk]);

  // Set up primary button click handler to emit events
  useEffect(() => {
    setPrimaryButtonClickHandler(() => {
      emitRef.current?.({ event: "primary_button_clicked" });
    });
    return () => {
      setPrimaryButtonClickHandler(null);
    };
  }, [setPrimaryButtonClickHandler]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Stop WebView loading on unmount
      if (webViewRef.current) {
        try {
          webViewRef.current.stopLoading();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      onMessage(event);
    },
    [onMessage]
  );

  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage(null);
    
    // Set a timeout to prevent infinite loading (30 seconds)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (state.isLoading) {
        console.warn("[MiniAppScreen] Load timeout - taking too long to load");
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("The mini app is taking too long to load. Please check your connection and try again.");
      }
    }, 30000); // 30 second timeout
  }, [setIsLoading, state.isLoading]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setErrorMessage(null);
    
    // Clear timeout on successful load
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Send initial context to mini app when page loads
    // The mini app can also call sdk.context or sdk.signIn() via RPC
    if (emitRef.current && sdk && webViewRef.current) {
      const isAuthenticated = !!sdk.context?.user?.fid && sdk.context.user.fid > 0;
      console.log("[MiniAppScreen] Page loaded, context available:", {
        user: sdk.context?.user,
        isAuthenticated,
      });
      
      // If user is authenticated, send context to WebView immediately
      // This helps with iOS cookie/session issues by providing context upfront
      if (isAuthenticated && webViewRef.current) {
        // Inject JavaScript to send context to WebView
        // This is more reliable than postMessage for React Native -> WebView communication
        const contextData = JSON.stringify(sdk.context);
        const injectCode = `
          (function() {
            try {
              const context = ${contextData};
              console.log('[MiniApp] Received authenticated context from Renaissance via inject:', {
                fid: context?.user?.fid,
                username: context?.user?.username
              });
              
              // Dispatch event that mini app can listen for
              window.dispatchEvent(new CustomEvent('farcaster:context:ready', {
                detail: context
              }));
              
              // Store on window for easy access
              window.__renaissanceAuthContext = context;
              
              // Also trigger window.postMessage for apps that listen to that
              if (window.postMessage) {
                window.postMessage(JSON.stringify({
                  type: 'farcaster:context:ready',
                  context: context,
                  authenticated: true
                }), '*');
              }
            } catch (e) {
              console.error('[MiniApp] Error handling context injection:', e);
            }
          })();
          true;
        `;
        
        // Inject immediately - WebView is ready after onLoadEnd
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(injectCode);
          console.log("[MiniAppScreen] Injected context into WebView");
        }
      }
    }
  }, [setIsLoading, sdk]);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("[MiniAppScreen] WebView error:", nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(nativeEvent.description || "Failed to load mini app");
    
    // Hide splash screen on error
    setShowSplash(false);
    
    // Clear timeout on error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("[MiniAppScreen] WebView HTTP error:", nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(`HTTP Error ${nativeEvent.statusCode || "Unknown"}: Failed to load mini app`);
    
    // Hide splash screen on error
    setShowSplash(false);
    
    // Clear timeout on error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Validate URL before rendering WebView
  const isValidUrl = useMemo(() => {
    if (!frameUrl) return false;
    try {
      const url = new URL(frameUrl);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, [frameUrl]);

  if (!frameUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="apps-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>No mini app selected</Text>
          <Text style={styles.emptySubtext}>
            Open a Farcaster Frame or mini app to view it here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isValidUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.emptyText}>Invalid URL</Text>
          <Text style={styles.emptySubtext}>
            The mini app URL is invalid or malformed
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setFrameUrl(null);
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Splash Screen - Shows immediately while transitioning */}
      {showSplash && (
        <Animated.View 
          style={[
            styles.splashContainer,
            { opacity: splashOpacity }
          ]}
          pointerEvents={isReady ? "none" : "auto"}
        >
          <View style={styles.splashContent}>
            <Text style={styles.splashEmoji}>{emoji}</Text>
            <Text style={styles.splashTitle}>{title}</Text>
            <ActivityIndicator 
              size="large" 
              color="#8B5CF6" 
              style={styles.splashLoader}
            />
            <Text style={styles.splashSubtext}>Loading...</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.webViewContainer}>
        {/* Render WebView immediately to start loading */}
        {isReady && (
          <>
            {state.isLoading && !hasError && !showSplash && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            )}
            {hasError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={styles.errorText}>Failed to load mini app</Text>
                <Text style={styles.errorSubtext}>{errorMessage || "An error occurred while loading the app"}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setHasError(false);
                    setErrorMessage(null);
                    setIsLoading(true);
                    if (webViewRef.current) {
                      webViewRef.current.reload();
                    }
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setFrameUrl(null);
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <WebView
                key={`${frameUrl}-${webViewKeyRef.current}`}
                ref={webViewRef}
                source={{ uri: frameUrl }}
                style={styles.webView}
                onMessage={handleMessage}
                onNavigationStateChange={handleNavigationStateChange}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                onHttpError={handleHttpError}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowsBackForwardNavigationGestures
                sharedCookiesEnabled
                thirdPartyCookiesEnabled
                originWhitelist={["*"]}
                // Performance optimizations
                startInLoadingState={true}
                cacheEnabled={false}
                cacheMode="LOAD_NO_CACHE"
                // Start loading immediately
                onShouldStartLoadWithRequest={() => true}
                // Safari-like scrolling
                scrollEnabled={true}
                bounces={true}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                decelerationRate="normal"
                nestedScrollEnabled={true}
                overScrollMode="always"
                // Inject script to set up Farcaster Frame SDK communication
                injectedJavaScriptBeforeContentLoaded={`
            (function() {
              // Create a message channel for frame communication
              window.ReactNativeWebView = window.ReactNativeWebView || {};
              
              // Listen for messages from the frame
              document.addEventListener('FarcasterFrameCallback', function(e) {
                console.log('[MiniApp] FarcasterFrameCallback', e.data);
              });
              
              document.addEventListener('FarcasterFrameEvent', function(e) {
                console.log('[MiniApp] FarcasterFrameEvent', e.data);
              });
              
              // Make context available immediately when page loads
              // The RPC adapter will handle actual SDK calls, but we can set up
              // a flag to indicate the host is ready with authenticated context
              window.farcasterHostReady = true;
              
              console.log('[MiniApp] Frame host initialized - context available via RPC');
            })();
            true;
          `}
          // Inject script after page loads to ensure context is available
          injectedJavaScript={`
            (function() {
              // Listen for postMessage (for any apps that use window.postMessage)
              window.addEventListener('message', function(event) {
                try {
                  const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                  if (data && data.type === 'farcaster:context:ready' && data.authenticated) {
                    console.log('[MiniApp] Received context via window.postMessage:', {
                      fid: data.context?.user?.fid,
                      username: data.context?.user?.username
                    });
                    window.__renaissanceAuthContext = data.context;
                    window.dispatchEvent(new CustomEvent('farcaster:context:ready', {
                      detail: data.context
                    }));
                  }
                } catch (e) {
                  // Ignore non-JSON or invalid messages
                }
              });
              
              // Check if RPC adapter has made window.farcaster available yet
              // Mini apps should primarily use window.farcaster.signIn() or window.farcaster.context
              if (window.farcaster && window.farcaster.context) {
                const context = window.farcaster.context;
                if (context.user && context.user.fid > 0) {
                  console.log('[MiniApp] Authenticated context available via RPC:', {
                    fid: context.user.fid,
                    username: context.user.username
                  });
                  // Store and dispatch for apps that listen to events
                  window.__renaissanceAuthContext = context;
                  window.dispatchEvent(new CustomEvent('farcaster:context:ready', {
                    detail: context
                  }));
                }
              }
              
              // Helper function mini apps can call to get context
              window.getRenaissanceAuth = function() {
                return window.__renaissanceAuthContext || (window.farcaster?.context || null);
              };
            })();
            true;
          `}
              />
            )}
          </>
        )}
      </View>

      {/* Primary Button */}
      {!state.primaryButton.hidden && (
        <View style={styles.primaryButtonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              state.primaryButton.disabled && styles.primaryButtonDisabled,
              state.primaryButton.loading && styles.primaryButtonLoading,
            ]}
            onPress={onPrimaryButtonClick}
            disabled={state.primaryButton.disabled || state.primaryButton.loading}
          >
            {state.primaryButton.loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {state.primaryButton.text}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  splashContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  splashEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 32,
  },
  splashLoader: {
    marginBottom: 16,
  },
  splashSubtext: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  primaryButtonContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#ccc",
  },
  primaryButtonLoading: {
    backgroundColor: "#a78bfa",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MiniAppScreen;

