import { X, Menu } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useRelationshipStore } from "../store/useRelationshipStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearMessages, getUsers } =
    useChatStore();
  const { blockUser } = useRelationshipStore();
  const { onlineUsers } = useAuthStore();

  async function blockUsers(id) {
    await blockUser(id);
    await setSelectedUser(null);
    await getUsers();
  }

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilepic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">
              {selectedUser.fullName} ({selectedUser.userName})
            </h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost rounded-field"
            >
              <Menu />
            </div>
            <ul
              tabIndex="-1"
              className="menu dropdown-content bg-base-200 rounded-box z-1 mt-4 w-30 p-2 shadow-sm"
            >
              <li>
                <a
                  onClick={() => {
                    clearMessages();
                    document.activeElement.blur();
                  }}
                >
                  Clear All
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    blockUsers(selectedUser._id);
                    document.activeElement.blur();
                  }}
                >
                  Block User
                </a>
              </li>
            </ul>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
