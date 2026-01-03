import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, AuthUser } from "../context/Auth";
import { lightGreen, theme } from "../colors";
import { useImagePicker } from "../hooks/useImagePicker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { getWallet } from "../utils/wallet";
import { updateUserProfile, getUserById, getUserByWalletAddress } from "../api/user";

interface AccountManagementScreenProps {
  navigation: any;
}

type AuthMode = "select" | "email_login" | "email_register";

const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  navigation,
}) => {
  const { state, signInWithFarcaster, signInWithWallet, signInWithEmail, registerWithEmail, signOut, refreshUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Renaissance signup modal state
  const [showRenaissanceModal, setShowRenaissanceModal] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [profileImagePreviewUri, setProfileImagePreviewUri] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [lastProcessedImageUri, setLastProcessedImageUri] = useState<string | null>(null);
  
  // Profile update state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateProfileImageBase64, setUpdateProfileImageBase64] = useState<string | null>(null);
  const [updateProfileImagePreviewUri, setUpdateProfileImagePreviewUri] = useState<string | null>(null);
  const [isProcessingUpdateImage, setIsProcessingUpdateImage] = useState(false);
  const [lastProcessedUpdateImageUri, setLastProcessedUpdateImageUri] = useState<string | null>(null);
  const [connectedFarcasterId, setConnectedFarcasterId] = useState<string | null>(null);
  const [displayUserId, setDisplayUserId] = useState<number | null>(null);
  const isProcessingUpdateImageRef = React.useRef(false);
  
  // Helper function to get backend user ID
  const getBackendUserId = async (): Promise<number | null> => {
    const currentUser = state.user;
    
    if (currentUser?.local?.backendUserId) {
      return currentUser.local.backendUserId;
    }
    
    if (!currentUser?.local?.walletAddress) {
      return null;
    }
    
    try {
      const userData = await getUserByWalletAddress(currentUser.local.walletAddress);
      // userData might be an array or object, handle both
      const user = Array.isArray(userData) ? userData[0] : userData;
      if (user?.id) {
        return user.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };
  
  const { pickImage, image } = useImagePicker({
    allowsEditing: true,
    aspect: [1, 1],
  });
  
  // Separate image picker for profile updates
  const { pickImage: pickUpdateImage, image: updateImage } = useImagePicker({
    allowsEditing: true,
    aspect: [1, 1],
  });

  React.useEffect(() => {
    navigation.setOptions({
      title: state.isAuthenticated ? "Account" : "Sign In",
    });
  }, [navigation, state.isAuthenticated]);

  // Load user ID for display
  React.useEffect(() => {
    const loadUserId = async () => {
      if (state.user?.type === "local_wallet") {
        if (state.user.local?.backendUserId) {
          setDisplayUserId(state.user.local.backendUserId);
        } else {
          // Try to fetch it
          const userId = await getBackendUserId();
          if (userId) {
            setDisplayUserId(userId);
          }
        }
      }
    };
    loadUserId();
  }, [state.user]);

  const handleFarcasterLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithFarcaster();
      // Navigation will happen after callback
    } catch (error) {
      Alert.alert("Error", "Failed to initiate Farcaster login. Make sure Warpcast is installed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setShowRenaissanceModal(true);
  };

  const closeRenaissanceModal = () => {
    setShowRenaissanceModal(false);
    setUsername("");
    setUsernameError("");
    setProfileImageBase64(null);
    setProfileImagePreviewUri(null);
    setLastProcessedImageUri(null);
  };

  const validateUsername = (value: string): string => {
    if (!value) {
      return "Username is required";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must be at most 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError(validateUsername(value));
  };

  const handleImagePick = async () => {
    await pickImage();
  };

  React.useEffect(() => {
    const processSelectedImage = async () => {
      if (image && image.length > 0 && image[0].uri !== lastProcessedImageUri) {
        setIsProcessingImage(true);
        try {
          // Resize image to 200x200 and get base64
          const manipulatedImage = await manipulateAsync(
            image[0].uri,
            [{ resize: { width: 200, height: 200 } }],
            { compress: 1, format: SaveFormat.JPEG, base64: true }
          );

          // Store base64 string (manipulateAsync returns it directly when base64: true)
          if (manipulatedImage.base64) {
            setProfileImageBase64(manipulatedImage.base64);
            setProfileImagePreviewUri(manipulatedImage.uri);
            setLastProcessedImageUri(image[0].uri);
          } else {
            throw new Error("Failed to generate base64 image");
          }
        } catch (error) {
          console.error("Image processing error:", error);
          Alert.alert("Error", "Failed to process image");
        } finally {
          setIsProcessingImage(false);
        }
      }
    };
    processSelectedImage();
  }, [image, lastProcessedImageUri]);

  // Process update profile image and auto-save
  React.useEffect(() => {
    const processUpdateImage = async () => {
      if (updateImage && updateImage.length > 0 && updateImage[0].uri !== lastProcessedUpdateImageUri && !isProcessingUpdateImageRef.current) {
        // Set flags immediately to prevent re-triggering
        isProcessingUpdateImageRef.current = true;
        setLastProcessedUpdateImageUri(updateImage[0].uri);
        
        setIsProcessingUpdateImage(true);
        try {
          // Resize image to 200x200 and get base64
          const manipulatedImage = await manipulateAsync(
            updateImage[0].uri,
            [{ resize: { width: 200, height: 200 } }],
            { compress: 1, format: SaveFormat.JPEG, base64: true }
          );

          if (manipulatedImage.base64) {
            setUpdateProfileImageBase64(manipulatedImage.base64);
            setUpdateProfileImagePreviewUri(manipulatedImage.uri);
            
            // Auto-save the image
            const userId = await getBackendUserId();
            if (userId) {
              try {
                setIsUpdatingProfile(true);
                const updatedUserData = await updateUserProfile({
                  userId: userId,
                  profilePicture: manipulatedImage.base64,
                });
                
                console.log("[AccountManagement] Update response:", updatedUserData);
                console.log("[AccountManagement] New profile picture URL:", updatedUserData.profilePicture);
                
                // Refresh user data from backend to get the updated profile picture URL
                await refreshUser();
                
                // Clear the update image state after successful update
                setUpdateProfileImageBase64(null);
                setUpdateProfileImagePreviewUri(null);
                
                Alert.alert("Success", "Profile picture updated successfully");
              } catch (error) {
                console.error("Error auto-saving profile picture:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to update profile picture";
                console.error("Error details:", errorMessage);
                // Show error to user since auto-save failed
                Alert.alert("Error", errorMessage);
                // Reset the processed URI on error so user can retry
                setLastProcessedUpdateImageUri(null);
              } finally {
                setIsUpdatingProfile(false);
              }
            } else {
              console.error("Cannot auto-save: User ID not available");
              Alert.alert("Error", "Unable to find your account. Please try again.");
              setLastProcessedUpdateImageUri(null);
            }
          } else {
            throw new Error("Failed to generate base64 image");
          }
        } catch (error) {
          console.error("Update image processing error:", error);
          Alert.alert("Error", "Failed to process image");
          // Reset the processed URI on error so user can retry
          setLastProcessedUpdateImageUri(null);
        } finally {
          setIsProcessingUpdateImage(false);
          isProcessingUpdateImageRef.current = false;
        }
      }
    };
    processUpdateImage();
  }, [updateImage, lastProcessedUpdateImageUri]);

  const handleRenaissanceSignup = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      Alert.alert("Validation Error", validationError);
      return;
    }

    if (!profileImageBase64) {
      Alert.alert("Error", "Please upload a profile picture");
      return;
    }

    try {
      setIsLoading(true);
      
      // Get wallet address
      const wallet = await getWallet();
      const publicAddress = wallet.address;
      console.log("Creating account with:", { publicAddress, username, profilePictureLength: profileImageBase64?.length });

      // Create user account on backend
      const response = await fetch("https://people.builddetroit.xyz/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicAddress,
          username,
          profilePicture: profileImageBase64,
          farcasterId: null,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create account";
        const responseText = await response.text();
        console.error("Response status:", response.status, response.statusText);
        console.error("Response body:", responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.error("Backend error response:", errorData);
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      console.log("User created successfully:", userData);
      console.log("Backend user ID:", userData.id);

      // After successful backend creation, sign in locally
      // Store the profilePicture URL and backend user ID returned from the backend API
      if (!userData.id) {
        console.error("Warning: Backend did not return user ID");
        Alert.alert("Warning", "Account created but user ID not received");
      }
      
      await signInWithWallet({ 
        username, 
        pfpUrl: userData.profilePicture,
        backendUserId: userData.id
      });
      
      console.log("Account created and signed in with backendUserId:", userData.id);
      
      closeRenaissanceModal();
      Alert.alert("Success", "Renaissance account created successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Account creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create Renaissance account";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      Alert.alert("Success", "Signed in successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      await registerWithEmail({ email, password, name });
      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setMode("select");
        },
      },
    ]);
  };

  const getAccountTypeLabel = (user: AuthUser): string => {
    switch (user.type) {
      case "farcaster":
        return "Farcaster Account";
      case "local_wallet":
        return "Renaissance Account";
      case "local_email":
        return "Email Account";
      default:
        return "Account";
    }
  };

  const getAccountIcon = (user: AuthUser): string => {
    switch (user.type) {
      case "farcaster":
        return "logo-react";
      case "local_wallet":
        return "wallet-outline";
      case "local_email":
        return "mail-outline";
      default:
        return "person-outline";
    }
  };

  const handleUpdateProfilePicture = async () => {
    const userId = await getBackendUserId();
    if (!userId) {
      Alert.alert("Error", "Unable to find your account. Please try again.");
      return;
    }

    if (!updateProfileImageBase64) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      
      const updatedUserData = await updateUserProfile({
        userId: userId,
        profilePicture: updateProfileImageBase64,
      });

      // Update local auth state with new profile picture URL
      await refreshUser();
      
      // Clear update image state
      setUpdateProfileImageBase64(null);
      setUpdateProfileImagePreviewUri(null);
      setLastProcessedUpdateImageUri(null);

      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile picture";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Load Farcaster connection status from backend
  React.useEffect(() => {
    const loadFarcasterStatus = async () => {
      if (state.user?.type === "local_wallet") {
        const userId = await getBackendUserId();
        if (userId) {
          try {
            const userData = await getUserById(userId);
            setConnectedFarcasterId(userData.farcasterId || null);
          } catch (error) {
            console.error("Error loading Farcaster status:", error);
          }
        }
      }
    };
    loadFarcasterStatus();
  }, [state.user, showEditProfileModal]);

  const handleConnectFarcaster = async () => {
    try {
      setIsUpdatingProfile(true);
      
      // Initiate Farcaster sign-in
      await signInWithFarcaster();
      
      // Note: The current Farcaster sign-in flow changes user type to "farcaster"
      // This is a limitation - we would need a different flow to link Farcaster
      // to a local_wallet account without changing the user type
      // For now, this will initiate the sign-in flow
    } catch (error) {
      console.error("Error connecting Farcaster:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect Farcaster";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePickUpdateImage = async () => {
    await pickUpdateImage();
  };


  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
    setUpdateProfileImageBase64(null);
    setUpdateProfileImagePreviewUri(null);
    // Don't clear lastProcessedUpdateImageUri here - it should persist to prevent re-triggering
  };

  // Render authenticated state
  if (state.isAuthenticated && state.user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            {state.user.type === "local_wallet" && (
              <TouchableOpacity
                style={styles.editProfileButtonTopRight}
                onPress={() => setShowEditProfileModal(true)}
              >
                <Ionicons name="create-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
            
            <View style={styles.avatarContainer}>
              {state.user.pfpUrl ? (
                <Image
                  key={state.user.pfpUrl}
                  source={{ uri: state.user.pfpUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons
                    name={getAccountIcon(state.user) as any}
                    size={40}
                    color="#6366F1"
                  />
                </View>
              )}
            </View>

            {state.user.displayName && state.user.displayName !== state.user.username && (
              <Text style={styles.displayName}>
                {state.user.displayName}
              </Text>
            )}

            {state.user.username && (
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>@{state.user.username}</Text>
                {state.user.type === "local_wallet" && displayUserId && (
                  <Text style={styles.renaissanceId}>#{displayUserId}</Text>
                )}
              </View>
            )}
            
            {!state.user.username && (
              <Text style={styles.displayName}>Anonymous</Text>
            )}

            <View style={styles.accountTypeBadge}>
              <Ionicons
                name={getAccountIcon(state.user) as any}
                size={14}
                color="#6366F1"
              />
              <Text style={styles.accountTypeText}>
                {getAccountTypeLabel(state.user)}
              </Text>
            </View>

            {state.user.type === "farcaster" && (
              <Text style={styles.fidText}>FID: {state.user.fid}</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Info</Text>

            <View style={[styles.infoRow, styles.infoRowFirst]}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{getAccountTypeLabel(state.user)}</Text>
            </View>

            {state.user.local?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{state.user.local.email}</Text>
              </View>
            )}

            {state.user.local?.walletAddress && (
              <View style={[
                styles.infoRow,
                !state.user.farcaster?.custodyAddress && styles.infoRowLast
              ]}>
                <Text style={styles.infoLabel}>Wallet</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {`${state.user.local.walletAddress.slice(0, 10)}...${state.user.local.walletAddress.slice(-8)}`}
                </Text>
              </View>
            )}

            {state.user.farcaster?.custodyAddress && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Custody</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {`${state.user.farcaster.custodyAddress.slice(0, 10)}...${state.user.farcaster.custodyAddress.slice(-8)}`}
                </Text>
              </View>
            )}
          </View>


          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Edit Profile Modal - Only for Renaissance accounts */}
        {state.user.type === "local_wallet" && (
          <Modal
            visible={showEditProfileModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={closeEditProfileModal}
          >
            <SafeAreaView style={styles.modalContainer}>
              <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={closeEditProfileModal}
                  >
                    <Ionicons name="close" size={28} color={theme.text} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <View style={styles.modalCloseButton} />
                </View>

                <ScrollView contentContainerStyle={styles.modalScrollContent}>
                  {/* Profile Picture */}
                  <View style={styles.updateItem}>
                    <Text style={styles.updateLabel}>Profile Picture</Text>
                    <Text style={styles.updateHelperText}>
                      Tap the image to change your profile picture
                    </Text>
                    <View style={styles.modalProfilePictureContainer}>
                      <TouchableOpacity
                        style={styles.modalProfilePictureButton}
                        onPress={handlePickUpdateImage}
                        disabled={isProcessingUpdateImage || isUpdatingProfile}
                      >
                        {updateProfileImagePreviewUri ? (
                          <Image
                            source={{ uri: updateProfileImagePreviewUri }}
                            style={styles.modalProfilePicture}
                          />
                        ) : state.user.pfpUrl ? (
                          <Image
                            key={state.user.pfpUrl}
                            source={{ uri: state.user.pfpUrl }}
                            style={styles.modalProfilePicture}
                          />
                        ) : (
                          <View style={styles.modalProfilePicturePlaceholder}>
                            <Ionicons name="camera-outline" size={40} color="#6366F1" />
                          </View>
                        )}
                        {isProcessingUpdateImage && (
                          <View style={styles.modalProfilePictureOverlay}>
                            <ActivityIndicator size="large" color="#6366F1" />
                          </View>
                        )}
                        <View style={styles.modalProfilePictureEditBadge}>
                          <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Farcaster Connection */}
                  <View style={[styles.updateItem, styles.updateItemLast]}>
                    <Text style={styles.updateLabel}>Farcaster Account</Text>
                    <Text style={styles.updateHelperText}>
                      Connect your Farcaster account to link it with your Renaissance profile
                    </Text>
                    {connectedFarcasterId ? (
                      <View style={styles.farcasterConnected}>
                        <View style={styles.farcasterConnectedInfo}>
                          <View>
                            <Text style={styles.farcasterConnectedUsername}>
                              Farcaster ID: {connectedFarcasterId}
                            </Text>
                            <Text style={styles.farcasterConnectedFid}>
                              Connected
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.updateButton, styles.updateButtonPrimary, styles.updateButtonFull]}
                        onPress={handleConnectFarcaster}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="logo-react" size={18} color="#fff" />
                            <Text style={[styles.updateButtonText, styles.updateButtonTextPrimary]}>
                              Connect Farcaster
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    );
  }



  // Render login options
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={80} color="#6366F1" />
          <Text style={styles.headerTitle}>Welcome</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to use mini apps and access your account
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Create Renaissance Account - Primary */}
          <TouchableOpacity
            style={[styles.optionButton, styles.renaissanceButton]}
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Create Renaissance Account</Text>
              <Text style={[styles.optionSubtitle, styles.renaissanceSubtitle]}>
                Create a username and upload a profile picture
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Farcaster Login */}
          <TouchableOpacity
            style={[styles.optionButton, styles.farcasterButton]}
            onPress={handleFarcasterLogin}
            disabled={isLoading}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="logo-react" size={28} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Sign in with Warpcast</Text>
              <Text style={[styles.optionSubtitle, styles.farcasterSubtitle]}>
                Use your Farcaster account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your account is used to authenticate with mini apps. Farcaster users
            get full functionality, while Renaissance accounts can still use most features.
          </Text>
        </View>
      </ScrollView>

      {/* Renaissance Signup Modal */}
      <Modal
        visible={showRenaissanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRenaissanceModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeRenaissanceModal}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Renaissance Account</Text>
              <View style={styles.modalCloseButton} />
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.formHeader}>
                <Ionicons name="person-circle-outline" size={48} color="#6366F1" />
                <Text style={styles.formSubtitle}>
                  Choose a username and upload a profile picture to get started
                </Text>
              </View>

              {/* Profile Picture Upload */}
              <View style={styles.profilePictureSection}>
                <Text style={styles.sectionLabel}>Profile Picture *</Text>
                <TouchableOpacity
                  style={styles.profilePictureButton}
                  onPress={handleImagePick}
                  disabled={isProcessingImage}
                >
                  {profileImagePreviewUri ? (
                    <Image
                      source={{ uri: profileImagePreviewUri }}
                      style={styles.profilePicturePreview}
                    />
                  ) : image && image.length > 0 ? (
                    <Image
                      source={{ uri: image[0].uri }}
                      style={styles.profilePicturePreview}
                    />
                  ) : (
                    <View style={styles.profilePicturePlaceholder}>
                      <Ionicons name="camera-outline" size={32} color="#6366F1" />
                      <Text style={styles.profilePicturePlaceholderText}>
                        {isProcessingImage ? "Processing..." : "Tap to upload"}
                      </Text>
                    </View>
                  )}
                  {isProcessingImage && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Username Input */}
              <View>
                <Text style={styles.sectionLabel}>Username *</Text>
                <TextInput
                  style={[
                    styles.input,
                    usernameError ? styles.inputError : null,
                  ]}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                {usernameError ? (
                  <Text style={styles.errorText}>{usernameError}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    3-20 characters, letters, numbers, and underscores only
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || isProcessingImage || !username || !profileImageBase64 || !!usernameError) && styles.buttonDisabled,
                ]}
                onPress={handleRenaissanceSignup}
                disabled={isLoading || isProcessingImage || !username || !profileImageBase64 || !!usernameError}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.text,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 14,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  renaissanceButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOpacity: 0.3,
  },
  farcasterButton: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.3,
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 18,
  },
  renaissanceSubtitle: {
    color: "rgba(255,255,255,0.85)",
  },
  farcasterSubtitle: {
    color: "rgba(255,255,255,0.85)",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 32,
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: theme.textSecondary,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    padding: 18,
    borderRadius: 16,
    marginTop: 28,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  // Profile styles
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.border,
    position: "relative",
  },
  avatarContainer: {
    marginBottom: 12,
  },
  editProfileButtonTopRight: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF2FF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#6366F1",
  },
  displayName: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    justifyContent: "center",
  },
  username: {
    fontSize: 26,
    color: theme.text,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  renaissanceId: {
    fontSize: 18,
    color: theme.textSecondary,
    fontWeight: "600",
    marginLeft: 2,
    letterSpacing: -0.5,
  },
  accountTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  accountTypeText: {
    fontSize: 13,
    color: "#6366F1",
    marginLeft: 8,
    fontWeight: "600",
  },
  fidText: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 10,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoRowFirst: {
    paddingTop: 4,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface,
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 10,
  },
  // Form styles
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 8,
    fontWeight: "500",
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.text,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    color: theme.text,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  switchModeButton: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "500",
  },
  // Renaissance signup styles
  profilePictureSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 10,
  },
  profilePictureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: theme.border,
    overflow: "hidden",
  },
  profilePicturePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  profilePicturePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "500",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  modalScrollContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Update profile styles (for modal)
  updateItem: {
    marginBottom: 24,
  },
  updateItemLast: {
    marginBottom: 0,
  },
  updateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  updateHelperText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalProfilePictureContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  modalProfilePictureButton: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  modalProfilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.inputBackground,
    borderWidth: 3,
    borderColor: theme.border,
  },
  modalProfilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    borderWidth: 3,
    borderColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalProfilePictureOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalProfilePictureEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.surface,
    borderWidth: 1.5,
    borderColor: "#6366F1",
    gap: 8,
  },
  updateButtonPrimary: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  updateButtonFull: {
    width: "100%",
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
  updateButtonTextPrimary: {
    color: "#FFFFFF",
  },
  farcasterConnected: {
    padding: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  farcasterConnectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  farcasterConnectedPfp: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  farcasterConnectedUsername: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.text,
  },
  farcasterConnectedFid: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
});

export default AccountManagementScreen;

