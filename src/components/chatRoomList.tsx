import { useEffect, useRef, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { endpoints } from "../config/apiendpoints";
import { ChatRoomSkeleton } from "./skeletons/chatRoomSkeleton";
import { newMessageBadgesUpdateSocket, newMessageFromNewRoom, seenMessageBadgeUpdateSocket } from "../config/socketFunctions";
import { Strings } from "../constant/string";
import { RoomComp } from "./roomComponent";
import { FriendComp } from "./userComp";

export const ChatRoomList = ({ chatRoomId, setChatRoomId, setNextCursor, setHasMoreMessages, lastMessage, setOpen, onlineUsers }: any) => {
  const [chatRoomlist, setChatRoomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userlist, setUserList] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userListCursor, setUserListCursor] = useState(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [roomLoading, setRoomLoading] = useState<string[]>([]);
  const userListBottomRef = useRef<HTMLDivElement>(null);

  const fetchUserList = async () => {
    
    if (searchQuery.trim().length === 0) {
      setUserList([]);
      return;
    }
    if(!hasMoreUsers){
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.SEARCH_USERS, {
        params: {
          search: searchQuery,
          limit: 10,
          cursor: userListCursor
        }
      });

      if (response.data.statusCode === 200) {
        setUserListCursor(response.data.results.nextCursor);
        setHasMoreUsers(response.data.results.hasMore);
        setUserList((prev: any) => {
          const map = new Map<string, any>();
          [...prev, ...response.data.results.users].forEach(msg => {
            map.set(msg.id, msg);
          });

          return Array.from(map.values());
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }
  const createRoom = async (friendId: string) => {
    setRoomLoading([friendId]);
    try {
      const response = await axiosInstance.post(endpoints.GET_CHATROOMSLIST, {
        isGroup: false,
        members: [friendId]
      });
      if (response.data.statusCode === 200) {
        setNextCursor(null);
        setHasMoreMessages(true);
        localStorage.setItem("chatRoomId", response.data.results.id);
        setChatRoomId(response.data.results.id);
      }
    } catch (error) {
      console.error("Error fetching room:", error);
    } finally {
      setRoomLoading([]);
    }
  }

  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      // Fetch chat rooms from the server
      const response = await axiosInstance.get(endpoints.GET_CHATROOMSLIST);
      if (response.data.statusCode === 200) {
        setChatRoomList(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetchUserList();
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  useEffect(() => {
    setChatRoomList((prevRooms: any) => {
      return prevRooms.map((room: any) => {
        if (room.id === lastMessage?.chatRoomId) {
          return {
            ...room,
            message: [lastMessage],
            lastMessageAt: lastMessage.createdAt,
          };
        }
        return room;
      });
    });
  }, [lastMessage]);

  //socket 
  newMessageFromNewRoom(chatRoomlist, fetchChatRooms);
  newMessageBadgesUpdateSocket(chatRoomId, chatRoomlist, setChatRoomList);
  seenMessageBadgeUpdateSocket(chatRoomId, setChatRoomList);
  return (
    <div className={`bg-slate-600 h-full w-[450px] lg:w-[450px] overflow-y-auto ${chatRoomId ? "hidden lg:block" : "w-full"}`}>
      <form className="p-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setUserListCursor(null);
            setHasMoreUsers(true);
            setTimeout(() => setUserList([]), 500);
          }}
          placeholder={Strings?.SEARCH_USERS}
          className="w-full px-4 py-2 rounded-full bg-slate-500 text-white outline-none"
        />
      </form>
      {
        searchQuery?.trim()?.length === 0 && loading ? (<ChatRoomSkeleton />) : searchQuery?.trim()?.length === 0 ? (
          <>
            {chatRoomlist.length === 0 ? (
              <div className="text-white text-center mt-10">{Strings?.START_CHAT}</div>
            ) : (
              chatRoomlist.map((room: any,index: number) => (
                <RoomComp key={index} room={room} setOpen={setOpen} setNextCursor={setNextCursor} setHasMoreMessages={setHasMoreMessages} setChatRoomId={setChatRoomId} onlineUsers={onlineUsers} />
              ))
            )}
          </>
        ) : (
          <>
            {userlist?.length === 0 ? (
              <div className="text-white text-center mt-10">{Strings?.NO_USER_FOUND}</div>
            ) : (<>
              {userlist.map((friend: any) => (
                <FriendComp friend={friend} setOpen={setOpen} createRoom={createRoom} roomLoading={roomLoading} />
              ))}
              <div ref={userListBottomRef}>{loading && <ChatRoomSkeleton />}</div>
            </>
            )}
          </>
        )
      }
    </div>
  );
}