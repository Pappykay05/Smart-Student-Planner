import { useApp } from "@/context/AppContext";
import {
  BookOpen,
  Check,
  CheckCircle,
  Clock,
  Edit2,
  LogOut,
  Palette,
  ShieldAlert,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const THEME_ACCENTS = [
  { name: "Lavender", hex: "#6366F1", bg: "#6366F110" },
  { name: "Emerald", hex: "#10B981", bg: "#10B98110" },
  { name: "Royal Blue", hex: "#3B82F6", bg: "#3B82F610" },
  { name: "Warm Amber", hex: "#D97706", bg: "#D9770610" },
  { name: "Rose Pink", hex: "#EC4899", bg: "#EC489910" },
];

export default function ProfileScreen() {
  const { user, tasks, login, logout, resetApp, themeColor, setThemeColor } =
    useApp();

  // Name edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    await login(editedName, user?.email || "");
    setIsEditingName(false);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Application",
      "This will delete ALL tasks, notes, user profile data, and theme preferences. This operation cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => await resetApp(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                "https://ui-avatars.com/api/?name=S&background=6366F1&color=fff",
            }}
            style={[styles.avatar, { borderColor: themeColor }]}
          />

          <View style={styles.profileInfo}>
            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  maxLength={25}
                />
                <Pressable
                  style={[
                    styles.saveNameButton,
                    { backgroundColor: themeColor },
                  ]}
                  onPress={handleSaveName}
                >
                  <Check size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || "Student"}</Text>
                <Pressable onPress={() => setIsEditingName(true)} hitSlop={8}>
                  <Edit2 size={16} color="#9CA3AF" />
                </Pressable>
              </View>
            )}
            <Text style={styles.userEmail}>
              {user?.email || "student@planner.edu"}
            </Text>
          </View>
        </View>

        {/* Task Statistics */}
        <Text style={styles.sectionTitle}>Task Statistics</Text>
        <View style={styles.statsCard}>
          {/* Progress bar container */}
          <View style={styles.progressSection}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Completion Rate</Text>
              <Text style={[styles.progressPercent, { color: themeColor }]}>
                {stats.completionRate}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${stats.completionRate}%`,
                    backgroundColor: themeColor,
                  },
                ]}
              />
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.gridItem}>
              <View
                style={[styles.statIconWrapper, { backgroundColor: "#F3F4F6" }]}
              >
                <BookOpen size={20} color="#4B5563" />
              </View>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>

            <View style={styles.gridItem}>
              <View
                style={[styles.statIconWrapper, { backgroundColor: "#E8F5E9" }]}
              >
                <CheckCircle size={20} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.gridItem}>
              <View
                style={[styles.statIconWrapper, { backgroundColor: "#FEF3C7" }]}
              >
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Theme Settings Accent Selection */}
        <Text style={styles.sectionTitle}>Theme Settings</Text>
        <View style={styles.themeCard}>
          <View style={styles.themeInfoRow}>
            <Palette size={20} color={themeColor} />
            <Text style={styles.themeLabel}>Accent Color</Text>
          </View>
          <Text style={styles.themeSubtitle}>
            Select your preferred primary theme color accent
          </Text>

          <View style={styles.colorsWrapper}>
            {THEME_ACCENTS.map((accent) => {
              const isSelected = themeColor === accent.hex;
              return (
                <Pressable
                  key={accent.name}
                  style={[
                    styles.colorPill,
                    isSelected
                      ? [styles.colorPillSelected, { borderColor: accent.hex }]
                      : null,
                  ]}
                  onPress={async () => await setThemeColor(accent.hex)}
                >
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: accent.hex },
                    ]}
                  />
                  <Text
                    style={[
                      styles.colorPillText,
                      isSelected
                        ? { color: accent.hex, fontWeight: "700" }
                        : null,
                    ]}
                  >
                    {accent.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.optionsCard}>
          {/* Reset App */}
          <Pressable style={styles.optionRow} onPress={handleReset}>
            <View
              style={[
                styles.optionIconWrapper,
                { backgroundColor: "#EF444415" },
              ]}
            >
              <ShieldAlert size={18} color="#EF4444" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitleRed}>Reset Application</Text>
              <Text style={styles.optionSubtitle}>
                Clear all local storage database entries
              </Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          {/* Logout */}
          <Pressable style={styles.optionRow} onPress={handleLogout}>
            <View
              style={[
                styles.optionIconWrapper,
                { backgroundColor: "#EF444415" },
              ]}
            >
              <LogOut size={18} color="#EF4444" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitleRed}>Log Out</Text>
              <Text style={styles.optionSubtitle}>
                Securely sign out of PlanCraft
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Version Details */}
        <Text style={styles.versionText}>
          Smart Student Planner • Version 1.0.0 (Expo SDK 56)
        </Text>

        {/* Bottom tab height margin */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    borderBottomWidth: 1.5,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 2,
    flex: 1,
  },
  saveNameButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
    gap: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 99,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  themeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
    gap: 6,
  },
  themeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  themeSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 12,
  },
  colorsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  colorPillSelected: {
    backgroundColor: "#FFFFFF",
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  optionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  optionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitleRed: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  optionSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
});
