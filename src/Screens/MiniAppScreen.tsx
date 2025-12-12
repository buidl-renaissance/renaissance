import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useWebViewRpcAdapter } from "@farcaster/frame-host-react-native";
import { useFarcasterFrame } from "../context/FarcasterFrame";
import { Ionicons } from "@expo/vector-icons";

const MiniAppScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const webViewRef = useRef<WebView>(null);
  const { state, createSdk, setIsLoading, setFrameUrl, setPrimaryButtonClickHandler, onPrimaryButtonClick } = useFarcasterFrame();
  
  const frameUrl = route.params?.url || state.currentFrameUrl;
  const title = route.params?.title || "Mini App";
  
  const [canGoBack, setCanGoBack] = useState(false);
  
  // Extract domain from URL for the RPC adapter
  const domain = useMemo(() => {
    if (!frameUrl) return "";
    try {
      return new URL(frameUrl).hostname;
    } catch {
      return "";
    }
  }, [frameUrl]);
  
  // Memoize SDK instance to prevent infinite re-renders
  const sdk = useMemo(() => createSdk(), [createSdk]);

  // Set up the WebView RPC adapter
  const { onMessage, emit } = useWebViewRpcAdapter({
    webViewRef: webViewRef as React.RefObject<WebView>,
    domain,
    sdk,
    debug: __DEV__,
  });

  // Navigation handlers stored in refs to avoid re-render issues
  const canGoBackRef = useRef(canGoBack);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);

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

  // Set up primary button click handler to emit events
  useEffect(() => {
    setPrimaryButtonClickHandler(() => {
      emitRef.current?.({ event: "primary_button_clicked" });
    });
    return () => {
      setPrimaryButtonClickHandler(null);
    };
  }, [setPrimaryButtonClickHandler]);

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
  }, [setIsLoading]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webViewContainer}>
        {state.isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: frameUrl }}
          style={styles.webView}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={["*"]}
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
              
              console.log('[MiniApp] Frame host initialized');
            })();
            true;
          `}
        />
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

