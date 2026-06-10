import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";
import {
  Bookmark,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DateFilter = "all" | "yesterday" | "today" | "tomorrow" | "week";
type PriorityFilter = "all" | "high" | "medium" | "low";

export default function DashboardScreen() {
  const router = useRouter();
  const {
    user,
    tasks,
    quickNotes,
    addQuickNote,
    deleteQuickNote,
    toggleTaskComplete,
    deleteTask,
    themeColor,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  // Quick Note Modal state
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteError, setNoteError] = useState("");

  // Time-based greeting helper
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ☀️";
    if (hour < 18) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  }, []);

  // Format date utility
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      return new Date(dateStr).toLocaleDateString("en-US", options);
    } catch {
      return dateStr;
    }
  };

  // Check if a date string matches yesterday, today, tomorrow, or next 7 days
  const matchDate = (taskDateStr: string, filter: DateFilter) => {
    const taskDate = new Date(taskDateStr);
    taskDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 0, 0, 0);

    if (filter === "today") {
      return taskDate.getTime() === today.getTime();
    }
    if (filter === "yesterday") {
      return taskDate.getTime() === yesterday.getTime();
    }
    if (filter === "tomorrow") {
      return taskDate.getTime() === tomorrow.getTime();
    }
    if (filter === "week") {
      return (
        taskDate.getTime() >= yesterday.getTime() &&
        taskDate.getTime() <= nextWeek.getTime()
      );
    }
    return true; // 'all'
  };

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.module.toLowerCase().includes(query) ||
        task.notes.toLowerCase().includes(query);

      // 2. Date Filter
      const matchesDate = matchDate(task.due_date, dateFilter);

      // 3. Priority Filter
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesDate && matchesPriority;
    });
  }, [tasks, searchQuery, dateFilter, priorityFilter]);

  // Priority color helper
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444"; // Red
      case "medium":
        return "#F59E0B"; // Orange
      case "low":
        return "#10B981"; // Green
      default:
        return "#6B7280";
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      setNoteError("Please enter a note title");
      return;
    }
    await addQuickNote(noteTitle, noteContent);
    setNoteTitle("");
    setNoteContent("");
    setNoteError("");
    setNoteModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Container */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top greeting bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingTitle}>
              Hello, {user?.name || "Student"}
            </Text>
            <Text style={styles.greetingSub}>{greeting}</Text>
          </View>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                "https://ui-avatars.com/api/?name=S&background=6366F1&color=fff",
            }}
            style={[styles.avatar, { borderColor: themeColor }]}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>

        {/* Quick Actions Card Row (Messy green/purple layout) */}
        <View style={styles.quickActionsRow}>
          {/* New Note Card (Green) */}
          <Pressable
            style={[
              styles.quickCard,
              { backgroundColor: "#10B98115", borderColor: "#10B98130" },
            ]}
            onPress={() => setNoteModalVisible(true)}
          >
            <View
              style={[styles.quickCardIcon, { backgroundColor: "#10B981" }]}
            >
              <Plus size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.quickCardTitle, { color: "#047857" }]}>
              New Note
            </Text>
            <View style={styles.quickCardIllustration}>
              <BookOpen
                size={48}
                color="#10B98125"
                style={styles.messyIllustration}
              />
            </View>
          </Pressable>

          {/* New Task Card (Theme Color) */}
          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor: themeColor + "15",
                borderColor: themeColor + "30",
              },
            ]}
            onPress={() => router.push("/add-task")}
          >
            <View
              style={[styles.quickCardIcon, { backgroundColor: themeColor }]}
            >
              <Plus size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.quickCardTitle, { color: themeColor }]}>
              New Task
            </Text>
            <View style={styles.quickCardIllustration}>
              <CheckCircle2
                size={48}
                color={themeColor + "25"}
                style={styles.messyIllustration}
              />
            </View>
          </Pressable>
        </View>

        {/* Date Filter Pills */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {(
            [
              { key: "yesterday", label: "Yesterday" },
              { key: "today", label: "Today" },
              { key: "tomorrow", label: "Tomorrow" },
              { key: "week", label: "Next 7 Days" },
              { key: "all", label: "All" },
            ] as const
          ).map((item) => {
            const isActive = dateFilter === item.key;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.pillButton,
                  isActive
                    ? [styles.pillButtonActive, { backgroundColor: themeColor }]
                    : styles.pillButtonInactive,
                ]}
                onPress={() => setDateFilter(item.key)}
              >
                <Text
                  style={[
                    styles.pillText,
                    isActive ? styles.pillTextActive : styles.pillTextInactive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Priority Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priorityFilterScroll}
        >
          {(
            [
              { key: "all", label: "All Priorities" },
              { key: "high", label: "🔴 High" },
              { key: "medium", label: "🟠 Medium" },
              { key: "low", label: "🟢 Low" },
            ] as const
          ).map((item) => {
            const isActive = priorityFilter === item.key;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.priorityPill,
                  isActive
                    ? [
                        styles.priorityPillActive,
                        {
                          borderColor: themeColor,
                          backgroundColor: themeColor + "08",
                        },
                      ]
                    : null,
                ]}
                onPress={() => setPriorityFilter(item.key)}
              >
                <Text
                  style={[
                    styles.priorityPillText,
                    isActive ? { color: themeColor, fontWeight: "700" } : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          /* Empty State */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: "#10B98108", borderColor: "#10B98115" },
            ]}
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/7486/7486744.png",
              }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>You don't have any tasks!</Text>
            <Text style={styles.emptySubtitle}>
              Press the "+ New Task" card above to add new tasks.
            </Text>
          </View>
        ) : (
          <View style={styles.taskListContainer}>
            {filteredTasks.map((item) => (
              <Pressable
                key={item.id}
                style={styles.taskCard}
                onPress={() => router.push(`/task/${item.id}`)}
              >
                <View style={styles.taskCardHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Pressable
                    hitSlop={8}
                    onPress={() => toggleTaskComplete(item.id)}
                  >
                    {item.completed ? (
                      <CheckCircle2
                        size={22}
                        color={themeColor}
                        fill={themeColor + "20"}
                      />
                    ) : (
                      <Circle size={22} color="#D1D5DB" />
                    )}
                  </Pressable>
                </View>

                {item.notes ? (
                  <Text style={styles.taskNotes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}

                <View style={styles.taskCardFooter}>
                  {/* Priority Tag */}
                  <View style={styles.tagWrapper}>
                    <View
                      style={[
                        styles.tagDot,
                        { backgroundColor: getPriorityColor(item.priority) },
                      ]}
                    />
                    <Text style={styles.tagText}>
                      {item.priority.charAt(0).toUpperCase() +
                        item.priority.slice(1)}
                    </Text>
                  </View>

                  {/* Module Tag */}
                  <View style={styles.moduleWrapper}>
                    <Bookmark size={12} color="#6B7280" />
                    <Text style={styles.moduleText}>{item.module}</Text>
                  </View>

                  {/* Deadline */}
                  <View style={styles.deadlineWrapper}>
                    <Calendar size={12} color="#6B7280" />
                    <Text style={styles.deadlineText}>
                      {formatDate(item.due_date)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Notes Section */}
        {quickNotes.length > 0 && (
          <View style={styles.notesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Notes</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.notesScroll}
            >
              {quickNotes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle} numberOfLines={1}>
                      {note.title}
                    </Text>
                    <Pressable
                      onPress={() => deleteQuickNote(note.id)}
                      hitSlop={6}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                  <Text style={styles.noteContent} numberOfLines={4}>
                    {note.content}
                  </Text>
                  <Text style={styles.noteTime}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom padding for tab bar safety */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Quick Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Quick Note</Text>
                <Pressable
                  onPress={() => setNoteModalVisible(false)}
                  hitSlop={10}
                >
                  <X size={20} color="#374151" />
                </Pressable>
              </View>

              <View style={styles.modalForm}>
                <TextInput
                  placeholder="Note Title"
                  placeholderTextColor="#9CA3AF"
                  style={styles.modalInputTitle}
                  value={noteTitle}
                  onChangeText={(text) => {
                    setNoteTitle(text);
                    setNoteError("");
                  }}
                  maxLength={50}
                />
                {noteError ? (
                  <Text style={styles.modalErrorText}>{noteError}</Text>
                ) : null}

                <TextInput
                  placeholder="Type your notes here..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.modalInputContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={noteContent}
                  onChangeText={setNoteContent}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.modalSaveButton,
                    { backgroundColor: themeColor },
                    pressed && styles.modalSaveButtonPressed,
                  ]}
                  onPress={handleSaveNote}
                >
                  <Text style={styles.modalSaveButtonText}>Save Note</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    height: "100%",
    padding: 0,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    height: 110,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  quickCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  quickCardIllustration: {
    position: "absolute",
    bottom: -10,
    right: -10,
  },
  messyIllustration: {
    transform: [{ rotate: "-15deg" }],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  pillButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillButtonActive: {
    borderColor: "transparent",
  },
  pillButtonInactive: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pillTextInactive: {
    color: "#4B5563",
  },
  priorityFilterScroll: {
    gap: 8,
    paddingTop: 4,
    paddingBottom: 16,
  },
  priorityPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  priorityPillActive: {
    // border and background injected dynamically
  },
  priorityPillText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  taskListContainer: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  taskCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  taskNotes: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
    lineHeight: 18,
  },
  taskCardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  tagWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  moduleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moduleText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  deadlineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  deadlineText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    marginTop: 12,
  },
  emptyImage: {
    width: 80,
    height: 80,
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  notesSection: {
    marginTop: 24,
  },
  notesScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  noteCard: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    width: 150,
    height: 140,
    justifyContent: "space-between",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F",
    flex: 1,
  },
  noteContent: {
    fontSize: 11,
    color: "#92400E",
    lineHeight: 15,
    flex: 1,
    marginTop: 4,
  },
  noteTime: {
    fontSize: 9,
    color: "#D97706",
    fontWeight: "500",
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
    maxHeight: Dimensions.get("window").height * 0.8,
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
  modalInputTitle: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "#F9FAFB",
  },
  modalInputContent: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "#F9FAFB",
    minHeight: 100,
  },
  modalErrorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
    marginTop: -10,
  },
  modalSaveButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
