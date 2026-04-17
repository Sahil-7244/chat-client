import { useEffect } from "react";
import socket from "./socket";
import { toast } from "sonner";

export const useSocketSetup = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;
    // Connect and join room
    socket.connect();
    socket.emit("join", userId);

    return () => {
      socket.disconnect();
    };
  }, [userId]);
};

export const newMessageUpdateinMessageList = (chatRoomId: string, setMessageList: React.Dispatch<React.SetStateAction<any>>, setLastMessage: React.Dispatch<React.SetStateAction<any>>) => {
  useEffect(() => {
    // ✅ Listen for new leave event
    socket.on("new_Message", (newMessage: any) => {
      // console.log(newMessage.chatRoomId, chatRoomId, newMessage.chatRoomId === chatRoomId);
      if (newMessage.chatRoomId === chatRoomId) {
        setMessageList((prev: any) => [...prev, newMessage]);
      }
      setLastMessage(newMessage);
      if (newMessage.chatRoomId !== chatRoomId) {
        toast.success(`New message from ${newMessage.sender.firstName} ${newMessage.sender.lastName}`);
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(`💬 ${newMessage.sender.firstName} ${newMessage.sender.lastName} sent you a message!`, {
              body: `${newMessage.type === "TEXT" ? `Message:${newMessage.content}` : newMessage.type === "IMAGE" ? "Image" : "File"}`,
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification(`💬 ${newMessage.sender.firstName} ${newMessage.sender.lastName} sent you a message!`, {
                  body: `${newMessage.type === "TEXT" ? `Message:${newMessage.content}` : newMessage.type === "IMAGE" ? "Image" : "File"}`,
                });
              }
            });
          }
        }
      }
    });

    // cleanup on unmount
    return () => {
      socket.off("new_Message");
    };
  }, [chatRoomId]);
}

export const newMessageFromNewRoom = (chatRoomList: any, fetchChatRooms: any) => {
  useEffect(() => {
    socket.on("new_Message_chatRoom", (newMessage: any) => {

      // console.log(chatRoomList)
      const roomExists = chatRoomList.find((room: any) => room.id === newMessage.chatRoomId);
      // console.log(roomExists)
      // console.log(!roomExists)
      if (!roomExists) {
        fetchChatRooms();
      }
    });
    return () => {
      socket.off("new_Message_chatRoom");
    };
  }, [chatRoomList]);
}

export const newMessageBadgesUpdateSocket = (chatRoomId: any, chatRoomList: any, setChatRoomList: any) => {
  useEffect(() => {
    socket.on("new_Message_chatRoomBadge", (newMessage: any) => {

      // console.log(chatRoomList)
      const roomExists = chatRoomList.find((room: any) => room.id === newMessage.chatRoomId);
      // console.log(roomExists)
      // console.log(!roomExists)
      if (roomExists) {
        if (newMessage.chatRoomId !== chatRoomId) {
          setChatRoomList((prev: any) => {
            return prev.map((room: any) => {
              return room.id === newMessage.chatRoomId ? { ...room, _count: { message: room._count.message + 1 } } : room
            })
          });
        }
      }
    });
    return () => {
      socket.off("new_Message_chatRoomBadge");
    };
  }, [chatRoomId, chatRoomList]);
}


export const isOnlineUpdateSocket = (_chatRoomId: string, setOnlineUsers: React.Dispatch<React.SetStateAction<any>>) => {
  useEffect(() => {
    // ✅ Listen for new leave event
    socket.on("online:users", (users: string[]) => {
      setOnlineUsers(new Set(users));
    })

    socket.on("user:online", (userId: string) => {
      setOnlineUsers((prev: any) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    socket.on("user:offline", (userId: string) => {
      setOnlineUsers((prev: any) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      })
    })
    // cleanup on unmount
    return () => {
      socket.off("online:users");
      socket.off("user:online");
      socket.off("user:offline");
    };
  }, []);
}


export const lastSeenSocket = (chatRoomId: string, friendId: any, setLastSeen: any) => {
  useEffect(() => {
    if (!chatRoomId || !friendId) return;
    socket.on("user:offline:lastseen", (offlineuser: { lastSeen: Date, userId: string }) => {
      if (offlineuser.userId === friendId) {
        setLastSeen(offlineuser.lastSeen);
      }
    });
    return () => {
      socket.off("user:offline:lastseen");
    };
  }, [chatRoomId, friendId]);
}

export const typingSocket = (chatRoomId: string, setIsTyping: React.Dispatch<React.SetStateAction<any>>) => {
  useEffect(() => {
    socket.on("typing:status", ({ chatRoomId: roomId, isTyping }) => {
      if (roomId === chatRoomId) {
        setIsTyping(isTyping);
      }
    });

    return () => {
      socket.off("typing:status");
    };
  }, [chatRoomId]);
}
export const deleteMessageSocket = (chatRoomId: string, setMessageList: any) => {
  useEffect(() => {
    socket.on("delete_Message", (message: any) => {
      if (Array.isArray(message)) {
        // it's an array
        const messageIds = message.map((msg: any) => msg.id);

        if (message?.[0]?.chatRoomId === chatRoomId) {
          setMessageList((prev: any) => { return prev.filter((msg: any) => !messageIds.includes(msg.id)) });
        }
      } else {
        if (message?.chatRoomId === chatRoomId) {
          setMessageList((prev: any) => { return prev.filter((msg: any) => msg.id !== message.id) });
        }
      }
    });

    return () => {
      socket.off("delete_Message");
    };
  }, [chatRoomId]);
}

export const editMessageSocket = (chatRoomId: string, setMessageList: any) => {
  useEffect(() => {
    socket.on("edit_Message", (message: any) => {
        if (message?.chatRoomId === chatRoomId) {
          setMessageList((prev: any) => {return prev.map((m: any) => m.id === message.id ? message : m)});
        }
    });

    return () => {
      socket.off("delete_Message");
    };
  }, [chatRoomId]);
}

export const seenMessageSocket = (chatRoomId: string, setMessageList: any) => {
  useEffect(() => {
    socket.on("messages:seen", (message: any) => {
      if (message?.chatRoomId === chatRoomId) {
        setMessageList((prev: any) => {
          return prev.map((msg: any) => {
            return message?.messageIds.includes(msg.id) ? { ...msg, isSeen: true } : msg
          })
        });
      }
    });

    return () => {
      socket.off("messages:seen");
    };
  }, [chatRoomId]);
}

export const seenMessageBadgeUpdateSocket = (chatRoomId: string, setChatRoomList: any) => {
  useEffect(() => {
    socket.on("messages:seen:badgeupdate", (message: any) => {

      setChatRoomList((prev: any) => {
        return prev.map((room: any) => {
          return room.id === message.chatRoomId ? { ...room, _count: { message: Math.max((room._count.message - message.seenmessagesLength), 0) } } : room
        })
      });

    });

    return () => {
      socket.off("messages:seen:badgeupdate");
    };
  }, [chatRoomId]);
}