import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { GraduationCap, Home, PlusSquare, User } from "lucide-react-native";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={Home}>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="add-task" href="/add-task" asChild>
            <TabButton icon={PlusSquare}>Add Task</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={User}>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface CustomTabButtonProps extends TabTriggerSlotProps {
  icon: React.ComponentType<{ size: number; color: string }>;
}

export function TabButton({
  children,
  isFocused,
  icon: Icon,
  ...props
}: CustomTabButtonProps) {
  const { themeColor } = useApp();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? "backgroundSelected" : "backgroundElement"}
        style={styles.tabButtonView}
      >
        <View style={styles.tabButtonContent}>
          <Icon
            size={16}
            color={isFocused ? themeColor : colors.textSecondary}
          />
          <ThemedText
            type="smallBold"
            style={{ color: isFocused ? themeColor : colors.textSecondary }}
          >
            {children}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { themeColor } = useApp();

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <View style={styles.brandContainer}>
          <GraduationCap size={20} color={themeColor} />
          <ThemedText
            type="smallBold"
            style={[styles.brandText, { color: themeColor }]}
          >
            PlanCraft
          </ThemedText>
        </View>

        <View style={styles.tabsWrapper}>{props.children}</View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    width: "100%",
    padding: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  brandText: {
    fontSize: 16,
    fontWeight: "800",
  },
  tabsWrapper: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
