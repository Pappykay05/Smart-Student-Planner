import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding, themeColor } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await completeOnboarding();
      router.replace("/login");
    }
  };

  const slides = [
    {
      id: 1,
      title: "Studying shouldn't feel this heavy",
      subtitle:
        "You're not lazy. You're overloaded. Organize your semester without the stress.",
      icon: GraduationCap,
      illustration: (
        <View style={styles.illustrationWrapper}>
          <View
            style={[styles.circleBg, { backgroundColor: themeColor + "15" }]}
          />
          {/* Overlapping messy cards */}
          <View style={[styles.floatingCard, styles.messyCard1]}>
            <BookOpen size={16} color="#EF4444" />
            <Text style={styles.cardText}>Physics Exam (Tomorrow!)</Text>
          </View>
          <View style={[styles.floatingCard, styles.messyCard2]}>
            <BookOpen size={16} color="#F59E0B" />
            <Text style={styles.cardText}>Math Lab 4 (Due: 8h ago)</Text>
          </View>
          <View style={[styles.floatingCard, styles.messyCard3]}>
            <BookOpen size={16} color="#3B82F6" />
            <Text style={styles.cardText}>Literature Essay</Text>
          </View>
        </View>
      ),
    },
    {
      id: 2,
      title: "PlanCraft turns stress into a clear plan",
      subtitle:
        "Group tasks by module, filter by priority, and schedule your due dates easily.",
      icon: Sparkles,
      illustration: (
        <View style={styles.illustrationWrapper}>
          <View
            style={[styles.circleBg, { backgroundColor: themeColor + "15" }]}
          />
          {/* Neatly organized calendar & tasks layout */}
          <View
            style={[
              styles.floatingCard,
              styles.neatCard1,
              {
                borderColor: themeColor + "30",
                borderLeftWidth: 4,
                borderLeftColor: themeColor,
              },
            ]}
          >
            <CheckCircle size={16} color={themeColor} />
            <View>
              <Text style={styles.cardTextBold}>Database Project</Text>
              <Text style={styles.cardSubText}>High Priority • CS302</Text>
            </View>
          </View>
          <View
            style={[
              styles.floatingCard,
              styles.neatCard2,
              { borderLeftWidth: 4, borderLeftColor: "#10B981" },
            ]}
          >
            <CheckCircle size={16} color="#10B981" />
            <View>
              <Text style={styles.cardTextBold}>Report Submission</Text>
              <Text style={styles.cardSubText}>Done • ENG101</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      id: 3,
      title: "Your ultimate smart academic assistant",
      subtitle:
        "Persist your data locally and switch color themes dynamically. Ready to ace your grades?",
      icon: Calendar,
      illustration: (
        <View style={styles.illustrationWrapper}>
          <View
            style={[styles.circleBg, { backgroundColor: themeColor + "15" }]}
          />
          <View style={[styles.statRing, { borderColor: themeColor }]}>
            <Sparkles size={32} color={themeColor} />
          </View>
          <View style={[styles.floatingCard, styles.statsCard]}>
            <Text style={[styles.statsTitle, { color: themeColor }]}>
              86% Completed
            </Text>
            <Text style={styles.statsSubtitle}>
              12 Tasks completed this week
            </Text>
          </View>
        </View>
      ),
    },
  ];

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.brandText, { color: themeColor }]}>PlanCraft</Text>
        <View style={styles.langBadge}>
          <Text style={styles.langText}>English</Text>
        </View>
      </View>

      {/* Slide Content */}
      <View style={styles.contentContainer}>
        {/* Animated illustration area */}
        <Animated.View
          key={`illustration-${currentSlide}`}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(400)}
          style={styles.illustrationContainer}
        >
          {slide.illustration}
        </Animated.View>

        {/* Text Area */}
        <Animated.View
          key={`text-${currentSlide}`}
          entering={FadeIn.duration(400)}
          style={styles.textContainer}
        >
          <View
            style={[styles.iconBadge, { backgroundColor: themeColor + "20" }]}
          >
            <IconComponent size={24} color={themeColor} />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </Animated.View>
      </View>

      {/* Bottom controls */}
      <View style={styles.footer}>
        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide
                  ? [
                      styles.activeDot,
                      { backgroundColor: themeColor, width: 24 },
                    ]
                  : { backgroundColor: "#D1D5DB" },
              ]}
            />
          ))}
        </View>

        {/* Primary Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: themeColor },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? "Create My Plan" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  langBadge: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  illustrationWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBg: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  floatingCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  cardTextBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  // Messy positioning for Slide 1
  messyCard1: {
    top: 30,
    left: "10%",
    transform: [{ rotate: "-8deg" }],
  },
  messyCard2: {
    bottom: 40,
    left: "15%",
    transform: [{ rotate: "5deg" }],
  },
  messyCard3: {
    top: 90,
    right: "10%",
    transform: [{ rotate: "-12deg" }],
  },
  // Neat positioning for Slide 2
  neatCard1: {
    top: 40,
    width: "75%",
  },
  neatCard2: {
    bottom: 50,
    width: "70%",
  },
  // Stats slide positioning
  statsCard: {
    bottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "column",
    gap: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  statRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  textContainer: {
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  iconBadge: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
