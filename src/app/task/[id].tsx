import { useApp } from "@/context/AppContext";
import { TaskFormData, taskSchema } from "@/schemas/task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Edit,
  Share2,
  Trash2,
  X
} from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, editTask, deleteTask, toggleTaskComplete, themeColor } =
    useApp();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Find active task
  const task = tasks.find((t) => t.id === id);

  // Setup edit form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      module: task?.module || "",
      due_date: task?.due_date || "",
      priority: task?.priority || "medium",
      notes: task?.notes || "",
    },
  });

  if (!task) {
    return (
      <SafeAreaView style={styles.errorSafeArea}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Task Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The task you are trying to view does not exist or has been deleted.
          </Text>
          <Pressable
            style={[styles.backHomeButton, { backgroundColor: themeColor }]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backHomeButtonText}>Go Back Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const message = `📚 Smart Student Planner - Task: "${task.title}"\n📖 Module: ${task.module}\n📅 Due Date: ${task.due_date}\n⚠️ Priority: ${task.priority.toUpperCase()}\n📝 Notes: ${task.notes || "None"}`;
      await Share.share({ message });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to permanently delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTask(task.id);
            router.push("/");
          },
        },
      ],
    );
  };

  const onUpdateSubmit = async (data: TaskFormData) => {
    try {
      await editTask(task.id, data);
      setEditModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update task.");
    }
  };

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split("T")[0];
    setValue("due_date", dateStr, { shouldValidate: true });
  };

  // Format date utility
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      return new Date(dateStr).toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  // Priority badge styling helper
  const getPriorityDetails = (p: string) => {
    switch (p) {
      case "high":
        return { label: "High Priority", color: "#EF4444", bg: "#EF444410" };
      case "medium":
        return { label: "Medium Priority", color: "#F59E0B", bg: "#F59E0B10" };
      default:
        return { label: "Low Priority", color: "#10B981", bg: "#10B98110" };
    }
  };

  const priorityMeta = getPriorityDetails(task.priority);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <ArrowLeft size={22} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {task.module}
        </Text>
        <Pressable
          style={styles.headerButton}
          onPress={handleShare}
          hitSlop={10}
        >
          <Share2 size={20} color="#111827" />
        </Pressable>
      </View>

      {/* Main Details Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Priority Badge & Completion Status */}
        <View style={styles.metaRow}>
          <View
            style={[styles.priorityBadge, { backgroundColor: priorityMeta.bg }]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: priorityMeta.color },
              ]}
            />
            <Text style={[styles.priorityText, { color: priorityMeta.color }]}>
              {priorityMeta.label}
            </Text>
          </View>

          <Pressable
            style={[
              styles.completedBadge,
              task.completed
                ? { backgroundColor: "#10B98110" }
                : { backgroundColor: "#E5E7EB" },
            ]}
            onPress={() => toggleTaskComplete(task.id)}
          >
            {task.completed ? (
              <>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.completedText}>Completed</Text>
              </>
            ) : (
              <>
                <Circle size={14} color="#6B7280" />
                <Text style={styles.incompleteText}>Pending</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Task Title */}
        <Text
          style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted,
          ]}
        >
          {task.title}
        </Text>

        {/* Info Grid (Module & Deadline) */}
        <View style={styles.infoGrid}>
          {/* Module */}
          <View style={styles.gridItem}>
            <BookOpen size={16} color="#6B7280" />
            <View>
              <Text style={styles.gridItemLabel}>Module Name</Text>
              <Text style={styles.gridItemValue}>{task.module}</Text>
            </View>
          </View>

          {/* Deadline */}
          <View style={styles.gridItem}>
            <Calendar size={16} color="#6B7280" />
            <View>
              <Text style={styles.gridItemLabel}>Due Date</Text>
              <Text style={styles.gridItemValue}>
                {formatDate(task.due_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes/Description Section */}
        <Text style={styles.sectionTitle}>About this Task</Text>
        <View style={styles.notesCard}>
          {task.notes ? (
            <Text style={styles.notesText}>{task.notes}</Text>
          ) : (
            <Text style={styles.notesTextEmpty}>
              No additional notes provided for this task.
            </Text>
          )}
        </View>

        {/* Quick action buttons (Edit & Delete) */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              { borderColor: themeColor },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              // Set initial form state values
              setValue("title", task.title);
              setValue("module", task.module);
              setValue("due_date", task.due_date);
              setValue("priority", task.priority);
              setValue("notes", task.notes);
              setEditModalVisible(true);
            }}
          >
            <Edit size={18} color={themeColor} />
            <Text style={[styles.actionButtonText, { color: themeColor }]}>
              Edit Task
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleDelete}
          >
            <Trash2 size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete Task
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Task Details</Text>
                <Pressable
                  onPress={() => setEditModalVisible(false)}
                  hitSlop={10}
                >
                  <X size={20} color="#374151" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalForm}
                showsVerticalScrollIndicator={false}
              >
                {/* Title */}
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
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Title"
                        />
                      )}
                    />
                  </View>
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  )}
                </View>

                {/* Module */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Module / Course</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.module && styles.inputWrapperError,
                    ]}
                  >
                    <Controller
                      control={control}
                      name="module"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholder="Module"
                        />
                      )}
                    />
                  </View>
                  {errors.module && (
                    <Text style={styles.errorText}>
                      {errors.module.message}
                    </Text>
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
                    <Controller
                      control={control}
                      name="due_date"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          maxLength={10}
                        />
                      )}
                    />
                  </View>
                  {errors.due_date && (
                    <Text style={styles.errorText}>
                      {errors.due_date.message}
                    </Text>
                  )}

                  {/* Quick Dates */}
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

                {/* Priority */}
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
                            {
                              key: "medium",
                              label: "🟠 Medium",
                              color: "#F59E0B",
                            },
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
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Notes</Text>
                  <View
                    style={[
                      styles.notesWrapper,
                      errors.notes && styles.inputWrapperError,
                    ]}
                  >
                    <Controller
                      control={control}
                      name="notes"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.notesInput}
                          placeholder="Task details"
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
                </View>

                {/* Submit */}
                <Pressable
                  style={({ pressed }) => [
                    styles.modalSaveButton,
                    { backgroundColor: themeColor },
                    pressed && styles.modalSaveButtonPressed,
                  ]}
                  onPress={handleSubmit(onUpdateSubmit)}
                >
                  <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                </Pressable>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    maxWidth: "60%",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  incompleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  taskTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },
  gridItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gridItemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  gridItemValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  notesCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 36,
  },
  notesText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
  },
  notesTextEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  editButton: {
    backgroundColor: "#FFFFFF",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#EF444410",
    borderColor: "#EF444420",
  },
  deleteButtonText: {
    color: "#EF4444",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  errorSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  backHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  backHomeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalKeyboard: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 14,
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
    // dynamically applied style
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  notesWrapper: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    minHeight: 80,
  },
  notesInput: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    padding: 0,
  },
  modalSaveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modalSaveButtonPressed: {
    opacity: 0.9,
  },
  modalSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
