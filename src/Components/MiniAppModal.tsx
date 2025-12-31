import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, PanResponder, Animated } from "react-native";
import Modal from "react-native-modal";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Icon, { IconTypes } from "./Icon";
import { useWebViewRpcAdapter } from "@farcaster/frame-host-react-native";
import { useFarcasterFrame } from "../context/FarcasterFrame";
import { useAuth } from "../context/Auth";

interface MiniAppModalProps {
  isVisible: boolean;
  url: string | null;
  title?: string;
  onClose: () => void;
  nativeButtons?: Array<{
    icon: string;
    onPress: () => void;
    color?: string;
  }>;
}

export const MiniAppModal: React.FC<MiniAppModalProps> = ({
  isVisible,
  url,
  title,
  onClose,
  nativeButtons = [],
}) => {
  const webViewRef = useRef<WebView>(null);
  const { state, createSdk, setIsLoading, setFrameUrl, setPrimaryButtonClickHandler, onPrimaryButtonClick } = useFarcasterFrame();
  const { state: authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const isAtTopRef = useRef(true);
  
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Pan responder for drag handle and title header only
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        
        // If dragged down more than 100px, dismiss the modal
        if (gestureState.dy > 100) {
          setIsDismissing(true);
          onClose();
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setIsDismissing(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  // Handle scroll events from WebView via injected JavaScript
  const handleWebViewScrollMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'scroll') {
        const scrollY = data.scrollY || 0;
        const wasAtTop = scrollY <= 0;
        setIsAtTop(wasAtTop);
        isAtTopRef.current = wasAtTop;
      }
    } catch (e) {
      // Ignore non-JSON messages or messages that aren't scroll events
      // Other messages are handled by handleMessage
    }
  }, []);

  // Extract domain from URL for the RPC adapter
  const domain = useMemo(() => {
    if (!url) return "";
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }, [url]);

  // Memoize SDK instance
  const sdk = useMemo(() => createSdk(), [createSdk]);

  // Set up the WebView RPC adapter
  const { onMessage, emit } = useWebViewRpcAdapter({
    webViewRef: webViewRef as React.RefObject<WebView>,
    domain,
    sdk,
    debug: __DEV__,
  });

  // Store emit in a ref to avoid dependency issues
  const emitRef = useRef(emit);
  useEffect(() => {
    emitRef.current = emit;
  }, [emit]);

  // Track previous auth state to detect changes
  const prevAuthUserRef = useRef(authState.user);

  // Notify mini app when auth state changes while mini app is open
  useEffect(() => {
    if (!isVisible) return;
    
    const prevUser = prevAuthUserRef.current;
    const currentUser = authState.user;
    
    // Check if user changed (login/logout)
    const userChanged = 
      (prevUser === null && currentUser !== null) ||
      (prevUser !== null && currentUser === null) ||
      (prevUser?.fid !== currentUser?.fid);
    
    if (userChanged && webViewRef.current && sdk) {
      console.log("[MiniAppModal] Auth changed, sending updated context to WebView");
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
  }, [authState.user, sdk, isVisible]);

  // Set up primary button click handler to emit events
  useEffect(() => {
    if (!isVisible) return;
    
    setPrimaryButtonClickHandler(() => {
      emitRef.current?.({ event: "primary_button_clicked" });
    });
    return () => {
      setPrimaryButtonClickHandler(null);
    };
  }, [setPrimaryButtonClickHandler, isVisible]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isVisible && url) {
      setLoading(true);
      setFrameUrl(url);
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
    } else if (!isVisible) {
      setFrameUrl(null);
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
    }
  }, [isVisible, url, setFrameUrl, translateY]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      // Handle scroll messages separately
      handleWebViewScrollMessage(event);
      // Handle other messages via RPC adapter
      onMessage(event);
    },
    [onMessage, handleWebViewScrollMessage]
  );

  const handleNavigationStateChange = useCallback((navState: any) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setIsLoading(true);
  }, [setIsLoading]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    setIsLoading(false);
    
    // Send initial context to mini app when page loads
    if (emitRef.current && sdk && webViewRef.current) {
      const isAuthenticated = !!sdk.context?.user?.fid && sdk.context.user.fid > 0;
      console.log("[MiniAppModal] Page loaded, context available:", {
        user: sdk.context?.user,
        isAuthenticated,
      });
      
      // If user is authenticated, send context to WebView immediately
      if (isAuthenticated && webViewRef.current) {
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
        
        // Use setTimeout to ensure WebView is fully ready
        setTimeout(() => {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(injectCode);
            console.log("[MiniAppModal] Injected context into WebView");
          }
        }, 300);
      }
    }
  }, [setIsLoading, sdk]);

  return (
    <Modal
      isVisible={isVisible && !isDismissing}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      backdropOpacity={0.5}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragHandleBar} />
        </View>
        
        {/* Title header at top */}
        <View style={styles.titleHeader} {...panResponder.panHandlers}>
          <Text style={styles.titleHeaderText} numberOfLines={1}>
            {title || "Mini App"}
          </Text>
          {url && (
            <Text style={styles.titleHeaderUrl} numberOfLines={1}>
              {url}
            </Text>
          )}
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {url && (
            <>
              {state.isLoading && loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              )}
              <WebView
                ref={webViewRef}
                source={{ uri: url }}
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
                scrollEnabled={true}
                bounces={true}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                decelerationRate="normal"
                nestedScrollEnabled={true}
                overScrollMode="always"
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading mini app...</Text>
                  </View>
                )}
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
                    window.farcasterHostReady = true;
                    
                    console.log('[MiniApp] Frame host initialized - context available via RPC');
                  })();
                  true;
                `}
                // Inject script after page loads to ensure context is available
                injectedJavaScript={`
                  (function() {
                    // Track scroll position for dismiss gesture
                    let lastScrollY = window.scrollY || window.pageYOffset || 0;
                    
                    function handleScroll() {
                      const scrollY = window.scrollY || window.pageYOffset || 0;
                      if (Math.abs(scrollY - lastScrollY) > 5) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'scroll',
                          scrollY: scrollY
                        }));
                        lastScrollY = scrollY;
                      }
                    }
                    
                    window.addEventListener('scroll', handleScroll, { passive: true });
                    window.addEventListener('touchmove', handleScroll, { passive: true });
                    
                    // Initial check
                    handleScroll();
                    
                    // Also check on load
                    if (document.readyState === 'complete') {
                      handleScroll();
                    } else {
                      window.addEventListener('load', handleScroll);
                    }
                    
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
                    if (window.farcaster && window.farcaster.context) {
                      const context = window.farcaster.context;
                      if (context.user && context.user.fid > 0) {
                        console.log('[MiniApp] Authenticated context available via RPC:', {
                          fid: context.user.fid,
                          username: context.user.username
                        });
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
            </>
          )}
        </View>

        {/* Floating action buttons */}
        <View style={styles.floatingButtons}>
          {/* Native buttons */}
          {nativeButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              onPress={button.onPress}
              style={[
                styles.floatingNativeButton,
                button.color && { backgroundColor: button.color },
              ]}
            >
              <Icon
                type={IconTypes.Ionicons}
                name={button.icon}
                size={22}
                color="#333"
              />
            </TouchableOpacity>
          ))}
          
          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.floatingCloseButton}>
            <Icon
              type={IconTypes.Ionicons}
              name="close"
              size={24}
              color="#333"
            />
          </TouchableOpacity>
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
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "90%",
    overflow: "hidden",
  },
  dragHandle: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  titleHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  titleHeaderUrl: {
    fontSize: 11,
    color: "#666",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  floatingNativeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF", // Solid white for efficient shadow calculation
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF", // Solid white for efficient shadow calculation
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
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

