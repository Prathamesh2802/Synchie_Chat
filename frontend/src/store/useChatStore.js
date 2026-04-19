import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesSending: false,
  isMessagesLoading: false,
  getUsers: async () => {
    try {
      set({ isUsersLoading: true });
      // const usersList = await axiosInstance.get("/message/users");
      const usersList = await axiosInstance.get("/relationships/friends");
      set({ users: usersList.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userid) => {
    set({ isMessagesLoading: true });
    try {
      const messagesList = await axiosInstance.get(`/message/${userid}`);
      set({ messages: messagesList.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Subscribe to messages realtime message fetch

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      const { messages } = get();
      set({ messages: [...messages, newMessage] });
    });
  },

  // Unsubscribe to Messages realtime

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    set({ isMessagesSending: true });
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });

      toast.success("Message Sent successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesSending: false });
    }
  },

  clearMessages: async () => {
    try {
      const { selectedUser } = get();
      const clearRecords = await axiosInstance.delete(
        `/message/clear/${selectedUser._id}`,
      );
      toast.success(clearRecords?.data?.message);
      set({ messages: [] });
    } catch (error) {
      console.error(error.message);
      toast.error(error?.response?.data?.message);
    }
  },
}));
