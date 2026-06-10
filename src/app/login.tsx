import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Sparkles, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import {
  LoginFormData,
  loginSchema,
  RegisterFormData,
  registerSchema,
} from "../schemas/auth-schema";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const { login, register, themeColor } = useApp();

  // Setup login form
  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Setup register form
  const {
    control: registerControl,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = async (data: LoginFormData) => {
    setLoadingAction(true);
    try {
      // Mock validation - we extract name from email or use a default one
      const name = data.email.split("@")[0];
      const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
      await login(nameCapitalized, data.email);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setLoadingAction(true);
    try {
      await register(data.name, data.email);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetLoginForm();
    resetRegisterForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: themeColor + "15" },
              ]}
            >
              <Sparkles size={36} color={themeColor} />
            </View>
            <Text style={styles.title}>PlanCraft</Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Log in to manage your study planner"
                : "Create an account to get started"}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Custom Tab Switcher */}
            <View style={styles.tabContainer}>
              <Pressable
                style={[
                  styles.tab,
                  isLogin && [
                    styles.activeTab,
                    { borderBottomColor: themeColor },
                  ],
                ]}
                onPress={() => !isLogin && toggleAuthMode()}
              >
                <Text
                  style={[
                    styles.tabText,
                    isLogin
                      ? [styles.activeTabText, { color: themeColor }]
                      : null,
                  ]}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tab,
                  !isLogin && [
                    styles.activeTab,
                    { borderBottomColor: themeColor },
                  ],
                ]}
                onPress={() => isLogin && toggleAuthMode()}
              >
                <Text
                  style={[
                    styles.tabText,
                    !isLogin
                      ? [styles.activeTabText, { color: themeColor }]
                      : null,
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {isLogin ? (
              /* Login Form */
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      loginErrors.email && styles.inputWrapperError,
                    ]}
                  >
                    <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Controller
                      control={loginControl}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="example@student.edu"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {loginErrors.email && (
                    <Text style={styles.errorText}>
                      {loginErrors.email.message}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      loginErrors.password && styles.inputWrapperError,
                    ]}
                  >
                    <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Controller
                      control={loginControl}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {loginErrors.password && (
                    <Text style={styles.errorText}>
                      {loginErrors.password.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: themeColor },
                    pressed && styles.submitButtonPressed,
                  ]}
                  onPress={handleLoginSubmit(onLogin)}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Log In</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Register Form */
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      registerErrors.name && styles.inputWrapperError,
                    ]}
                  >
                    <User size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Controller
                      control={registerControl}
                      name="name"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Shahzaib"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="words"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {registerErrors.name && (
                    <Text style={styles.errorText}>
                      {registerErrors.name.message}
                    </Text>
                  )}
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      registerErrors.email && styles.inputWrapperError,
                    ]}
                  >
                    <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Controller
                      control={registerControl}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="example@student.edu"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {registerErrors.email && (
                    <Text style={styles.errorText}>
                      {registerErrors.email.message}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      registerErrors.password && styles.inputWrapperError,
                    ]}
                  >
                    <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Controller
                      control={registerControl}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                      )}
                    />
                  </View>
                  {registerErrors.password && (
                    <Text style={styles.errorText}>
                      {registerErrors.password.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: themeColor },
                    pressed && styles.submitButtonPressed,
                  ]}
                  onPress={handleRegisterSubmit(onRegister)}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Toggle Footer Link */}
          <Pressable style={styles.footerLink} onPress={toggleAuthMode}>
            <Text style={styles.footerLinkText}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text style={{ color: themeColor, fontWeight: "700" }}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    // borderBottomColor set dynamically
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    // color set dynamically
    fontWeight: "700",
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    height: 48,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    height: "100%",
    padding: 0,
  },
  errorText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 2,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerLink: {
    alignItems: "center",
    marginTop: 24,
  },
  footerLinkText: {
    fontSize: 14,
    color: "#4B5563",
  },
});
