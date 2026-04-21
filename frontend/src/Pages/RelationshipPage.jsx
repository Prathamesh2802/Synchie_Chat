import { useEffect, useState } from "react";
import { useRelationshipStore } from "../store/useRelationshipStore";

// Import useAuthStore for Socket

// import { useAuthStore } from "../store/useAuthStore";

function RelationshipPage() {
  const {
    searchedUsers,
    pendingRequests,
    sentRequests,
    friends,
    blockedUsers,
    blockUser,

    searchUsers,
    getPendingRequests,
    getSentRequests,
    getFriends,
    getBlockedUsers,

    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,

    unfriend,
    unblockUser,
    clearSearchedUsers,
  } = useRelationshipStore();

  const [query, setQuery] = useState("");

  /*
    INITIAL FETCH
  */
  useEffect(() => {
    getPendingRequests();
    getSentRequests();
    getFriends();
    getBlockedUsers();
  }, []);

  // Commented this part as this useeffect socket will only in the Relationship page not globally so shifted it to app.jsx
  //USEEFFECT FOR SOCKET TO DISPLAY LIVE FRIENDS

  // const socket = useAuthStore((state) => state.socket);

  // useEffect(() => {
  //   if (!socket) return;

  //   const { subscribeToRelationshipEvents, unsubscribeFromRelationshipEvents } =
  //     useRelationshipStore.getState();

  //   // ✅ subscribe when socket ready
  //   subscribeToRelationshipEvents();

  //   // ❌ cleanup when component unmounts OR socket changes
  //   return () => {
  //     unsubscribeFromRelationshipEvents();
  //   };
  // }, [socket]);

  /*
    SEARCH DEBOUNCE
  */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        clearSearchedUsers();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, searchUsers]);

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-7xl">
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Relationships</h1>

          <p className="text-sm text-base-content/70">
            Manage your friends, requests and blocked users
          </p>
        </div>

        {/* SEARCH USERS */}
        <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Search Users</h2>

          <input
            type="text"
            className="input input-bordered w-full mb-4"
            placeholder="Search username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="space-y-3">
            {searchedUsers.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center p-3 rounded-xl bg-base-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilepic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full"
                  />

                  <span className="font-medium">
                    {user.fullName} ({user.userName})
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => sendFriendRequest(user._id)}
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* REQUESTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOMING */}
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Incoming Requests</h2>

            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex justify-between items-center p-3 rounded-xl bg-base-200"
                >
                  <span>{req.requester.userName}</span>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => acceptFriendRequest(req._id)}
                    >
                      Accept
                    </button>

                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => rejectFriendRequest(req._id)}
                    >
                      Reject
                    </button>

                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => blockUser(req.requester._id)}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SENT */}
          <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Sent Requests</h2>

            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex justify-between items-center p-3 rounded-xl bg-base-200"
                >
                  <span>{req.recipient.userName}</span>
                  <div className="flex gap-3">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => cancelFriendRequest(req._id)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => blockUser(req.recipient._id)}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FRIENDS */}
        <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Friends</h2>

          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="flex justify-between items-center p-3 rounded-xl bg-base-200"
              >
                <span>{friend.userName}</span>
                <div className="flex gap-3">
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => blockUser(friend._id)}
                  >
                    Block
                  </button>

                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => unfriend(friend._id)}
                  >
                    Unfriend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCKED USERS */}
        <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Blocked Users</h2>

          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center p-3 rounded-xl bg-base-200"
              >
                <span>{user.userName}</span>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => unblockUser(user._id)}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelationshipPage;
