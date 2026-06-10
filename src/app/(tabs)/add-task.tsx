import { useApp } from "@/context/AppContext";
import { TaskFormData, taskSchema } from "@/schemas/task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  Check,
  FileText
} from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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

export default function AddTaskScreen() {
  const router = useRouter();
  const { addTask, themeColor } = useApp();
  const [successVisible, setSuccessVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      module: "",
      due_date: new Date().toISOString().split("T")[0], // Default to today
      priority: "medium",
      notes: "",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await addTask(data);
      setSuccessVisible(true);
      reset();

      // Auto-hide success modal and redirect
      setTimeout(() => {
        setSuccessVisible(false);
        router.push("/");
      }, 1500);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to create task. Please try again.");
    }
  };

  // Helper to set quick date
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split("T")[0];
    setValue("due_date", dateStr, { shouldValidate: true });
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
            <Text style={styles.title}>Create New Task</Text>
            <Text style={styles.subtitle}>
              Add details to organize your homework, exams, or projects
            </Text>
          </View>

          {/* Success Banner Overlay */}
          {successVisible && (
            <View
              style={[styles.successBanner, { backgroundColor: themeColor }]}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.successText}>Task Created Successfully!</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formCard}>
            {/* Task Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Task Title</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.title && styles.inputWrapperError,
                ]}
              >
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Physics Assignment 2"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            {/* Course Module */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Module / Course</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.module && styles.inputWrapperError,
                ]}
              >
                <BookOpen size={18} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="module"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. PHY101 or Calculus"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.module && (
                <Text style={styles.errorText}>{errors.module.message}</Text>
              )}
            </View>

            {/* Due Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.due_date && styles.inputWrapperError,
                ]}
              >
                <Calendar size={18} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="due_date"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      maxLength={10}
                    />
                  )}
                />
              </View>
              {errors.due_date && (
                <Text style={styles.errorText}>{errors.due_date.message}</Text>
              )}

              {/* Quick Date Selectors */}
              <View style={styles.quickDateRow}>
                <Pressable
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(0)}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </Pressable>
                <Pressable
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(1)}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </Pressable>
                <Pressable
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(7)}
                >
                  <Text style={styles.quickDateText}>Next Week</Text>
                </Pressable>
              </View>
            </View>

            {/* Priority Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.priorityRow}>
                    {(
                      [
                        { key: "low", label: "🟢 Low", color: "#10B981" },
                        { key: "medium", label: "🟠 Medium", color: "#F59E0B" },
                        { key: "high", label: "🔴 High", color: "#EF4444" },
                      ] as const
                    ).map((item) => {
                      const isSelected = value === item.key;
                      return (
                        <Pressable
                          key={item.key}
                          style={[
                            styles.priorityButton,
                            isSelected
                              ? [
                                  styles.priorityButtonActive,
                                  {
                                    borderColor: item.color,
                                    backgroundColor: item.color + "10",
                                  },
                                ]
                              : null,
                          ]}
                          onPress={() => onChange(item.key)}
                        >
                          <Text
                            style={[
                              styles.priorityButtonText,
                              isSelected
                                ? { color: item.color, fontWeight: "700" }
                                : null,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
              {errors.priority && (
                <Text style={styles.errorText}>{errors.priority.message}</Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes / Description</Text>
              <View
                style={[
                  styles.notesWrapper,
                  errors.notes && styles.inputWrapperError,
                ]}
              >
                <FileText size={18} color="#9CA3AF" style={styles.notesIcon} />
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.notesInput}
                      placeholder="e.g. Read chapters 4 and 5, solve exercises at the end..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.notes && (
                <Text style={styles.errorText}>{errors.notes.message}</Text>
              )}
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: themeColor },
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.submitButtonText}>Create Task</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  },
  quickDateRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  quickDateButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  priorityButtonActive: {
    // border and bg handled dynamically
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  notesWrapper: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    minHeight: 90,
  },
  notesIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notesInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
  },
  notesIconEmpty: {},
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
});
