import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

// Importing useAuthStore and useChatStore for socket

import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

export const useRelationshipStore = create((set, get) => ({
  searchedUsers: [],
  pendingRequests: [],
  friends: [],
  blockedUsers: [],
  isLoading: false,
  sentRequests: [],

  /*
  SOCKET CODE For Live Friends status
  */

  subscribeToRelationshipEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    let isFetching = false;

    const safeFetch = async (fn) => {
      if (isFetching) return;
      isFetching = true;
      try {
        await fn();
      } finally {
        isFetching = false;
      }
    };

    socket.on("friendRequestReceived", () => {
      safeFetch(() => get().getPendingRequests());
    });

    socket.on("friendRequestAccepted", () => {
      safeFetch(async () => {
        await get().getFriends();
        await get().getSentRequests();
        await useChatStore.getState().getUsers();
      });
    });

    socket.on("friendRequestRejected", () => {
      safeFetch(() => get().getSentRequests());
    });

    socket.on("friendRequestCancelled", () => {
      safeFetch(() => get().getPendingRequests());
    });

    socket.on("userBlocked", () => {
      const { selectedUser } = useChatStore.getState();

      if (selectedUser) {
        useChatStore.setState({
          selectedUser: null,
          messages: [],
        });
      }

      safeFetch(async () => {
        await get().getFriends();
        await get().getPendingRequests();
        await get().getSentRequests();
        await get().getBlockedUsers();
        await useChatStore.getState().getUsers();
      });
    });

    socket.on("userUnblocked", () => {
      safeFetch(() => get().getBlockedUsers());
    });

    socket.on("userUnfriended", () => {
      const { selectedUser } = useChatStore.getState();

      if (selectedUser) {
        useChatStore.setState({
          selectedUser: null,
          messages: [],
        });
      }

      safeFetch(async () => {
        await get().getFriends();
        await get().getPendingRequests();
        await get().getSentRequests();
        await useChatStore.getState().getUsers();
      });
    });
  },

  /*
    ❌ CLEANUP
  */
  unsubscribeFromRelationshipEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("friendRequestReceived");
    socket.off("friendRequestAccepted");
    socket.off("friendRequestRejected");
    socket.off("friendRequestCancelled");
    socket.off("userBlocked");
    socket.off("userUnblocked");
    socket.off("userUnfriended");
  },

  /*
    SEARCH USERS
  */
  searchUsers: async (query) => {
    try {
      const res = await axiosInstance.get(`/auth/users/search?q=${query}`);

      set({
        searchedUsers: res.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    CANCEL SEARCH USERS
  */

  clearSearchedUsers: () => {
    set({
      searchedUsers: [],
    });
  },

  /*
    GET PENDING REQUESTS Incoming
  */
  getPendingRequests: async () => {
    try {
      const res = await axiosInstance.get(
        "/relationships/requests/pending/incoming",
      );

      set({
        pendingRequests: res.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    GET PENDING REQUESTS Sent
  */
  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get(
        "/relationships/requests/pending/sent",
      );

      set({
        sentRequests: res.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    GET FRIENDS
  */
  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/relationships/friends");

      set({
        friends: res.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    GET BLOCKED USERS
  */
  getBlockedUsers: async () => {
    try {
      const res = await axiosInstance.get("/relationships/blocks/blocked");
      set({
        blockedUsers: res.data,
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    SEND FRIEND REQUEST
  */
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/relationships/request/${userId}`);

      toast.success("Friend request sent");
      get().getPendingRequests();
      get().getSentRequests();
      get().clearSearchedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    ACCEPT FRIEND REQUEST
  */
  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.patch(`/relationships/request/${requestId}/accept`);

      toast.success("Friend request accepted");

      get().getPendingRequests();
      get().getFriends();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    REJECT FRIEND REQUEST
  */
  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/relationships/request/${requestId}/reject`);

      toast.success("Friend request rejected");

      get().getPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    CANCEL FRIEND REQUEST
  */
  cancelFriendRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/relationships/request/${requestId}/cancel`);

      toast.success("Friend request cancelled");

      get().getPendingRequests();
      get().getSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    UNFRIEND
  */
  unfriend: async (userId) => {
    try {
      await axiosInstance.delete(`/relationships/unfriend/${userId}`);

      toast.success("User unfriended");

      get().getFriends();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    BLOCK USER
  */
  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/relationships/block/${userId}`);

      toast.success("User blocked");

      get().getBlockedUsers();
      get().getFriends();
      get().getPendingRequests();
      get().getSentRequests();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  /*
    UNBLOCK USER
  */
  unblockUser: async (userId) => {
    try {
      await axiosInstance.delete(`/relationships/unblock/${userId}`);

      toast.success("User unblocked");

      get().getBlockedUsers();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },
}));
