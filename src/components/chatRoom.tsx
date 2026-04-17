import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { endpoints } from "../config/apiendpoints";
import socket from "../config/socket";
import { deleteMessageSocket, editMessageSocket, lastSeenSocket, newMessageUpdateinMessageList, seenMessageSocket, typingSocket } from "../config/socketFunctions";
import axiosInstance from "../lib/axiosInstance";
import { lastSeenOfUser } from "../utills/time";
import { Chat } from "./chat";
import { ChatHeaderComp } from "./chatHeaderComp";
import { SendMessageForm } from "./sendMessageForm";
import { ChatHeaderSkeleton } from "./skeletons/chatheaderSkeleton";

export const ChatRoom = ({ chatRoomId, setChatRoomId, userId, nextCursor, setNextCursor, hasMoremessages, setHasMoreMessages, setLastMessage, onlineUsers, open, setOpen }: { chatRoomId: string, setChatRoomId: any, userId: string, nextCursor: string | null, setNextCursor: any, hasMoremessages: boolean, setHasMoreMessages: any, setLastMessage: any, onlineUsers: any, open: any, setOpen: any }) => {
  const [isSelectMode, setSelectMode] = useState(false);
  const [deleteMessageIds, setDeleteMessageIds] = useState<any>([]);
  const [deleteMessageLoading, setDeleteMessageLoading] = useState(false);
  const [messageList, setMessageList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState('');
  const [chatRoomData, setChatRoomData] = useState<any>(null);
  const [chatRoomLoading, setChatRoomLoading] = useState(false);
  const [attachmentLoading, setAttaachmentLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [lastSeenText, setLastSeenText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replytoMessageId, setReplytoMessageId] = useState('');
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openAttachment, setOpenAttachment] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [attachment, setAttachment] = useState<any>([]);
  const [messageType, setMessageType] = useState('');
  const [deleteAttachmentLoading, setDeleteAttachmentLoading] = useState('');
  const [editmessageId, setEditMessageId] = useState('');


  const repliedMSG = messageList?.filter((message: any) => message.id === replytoMessageId)?.[0];

  const isImageDisabled = messageType !== "" && messageType !== "IMAGE";
  const isVideoDisabled = messageType !== "" && messageType !== "VIDEO";
  const isFileDisabled = messageType !== "" && messageType !== "FILE";

  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const isRoomChangeRef = useRef(true);
  const typingTimeoutRef = useRef<any>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const seenQueueRef = useRef<Set<string>>(new Set())
  const seenTimeoutRef = useRef<any>(null);
  const newMessageDividerIndexRef = useRef<number | null>(null);
  const newMessageDividerRef = useRef<HTMLDivElement | null>(null);
  const didInitialRoomScrollRef = useRef(false);
  const timerRef = useRef<any>(null);

  const handlePressStart = () => {
    timerRef.current = setTimeout(() => {
      setSelectMode(true);
    }, 500); // 500ms
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMessageSeen = (messageId: string) => {
    const msg = messageList.find((m: any) => m.id === messageId)

    if (!msg) return
    if (msg.senderId === userId) return
    if (msg.isSeen) return

    seenQueueRef.current.add(messageId)

    // debounce API call
    clearTimeout(seenTimeoutRef.current)
    seenTimeoutRef.current = setTimeout(sendSeenToBackend, 500)
  }

  const sendSeenToBackend = async () => {
    const messageIds = Array.from(seenQueueRef.current)
    if (messageIds.length === 0) return

    try {
      await axiosInstance.post(endpoints.MARK_SEEN, {
        messageIds,
        chatRoomId,
      })

      // optimistically update UI
      setMessageList((prev: any) =>
        prev.map((msg: any) =>
          messageIds.includes(msg.id)
            ? { ...msg, isSeen: true }
            : msg
        )
      )

      seenQueueRef.current.clear()
    } catch (err) {
      console.error(err)
    }
  }

  const handleTyping = () => {
    socket.emit("typing:start", {
      toUserId: chatRoomData?.chatRoomMembers?.[0]?.user?.id,
      chatRoomId,
    });

    // debounce stop
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        toUserId: chatRoomData?.chatRoomMembers?.[0]?.user?.id,
        chatRoomId,
      });
    }, 1500);
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 50; // px
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isAtBottomRef.current = atBottom;
    didInitialRoomScrollRef.current = false;
  };

  const handleDeleteMessages = async (e: any) => {
    e.preventDefault();
    setDeleteMessageLoading(true)
    try {
      const res = await axiosInstance.post(endpoints.DELETE_MESSAGES, {
        chatRoomId: chatRoomId,
        messageIds: deleteMessageIds
      });
      if (res.data.statusCode === 200) {
        setMessageList((prev: any) => prev.filter((message: any) => !deleteMessageIds.includes(message.id)));
        setSelectMode(false);
        setDeleteMessageIds([]);
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete messages");
    } finally {
      setDeleteMessageLoading(false);
    }
  }


  const FetchMessages = async (inbuiltchatRoomId: string) => {
    if (loading || !hasMoremessages) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoints.MESSAGES}/${inbuiltchatRoomId ?? chatRoomId}`, {
        params: {
          limit: 30,
          cursor: nextCursor,
        }
      });
      if (response.data.statusCode === 200) {
        setNextCursor(response.data.results.nextCursor);
        setHasMoreMessages(response.data.results.hasMore);
        setMessageList((prev: any) => {
          const map = new Map<string, any>();

          // older messages first
          [...response.data.results.messages, ...prev].forEach(msg => {
            map.set(msg.id, msg);
          });

          return Array.from(map.values());
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }

  };

  const FetchSingleChatRoom = async (inbuiltchatRoomId: string) => {
    setChatRoomLoading(true);
    try {
      const response = await axiosInstance.get(`${endpoints.GET_CHATROOMSLIST}/${inbuiltchatRoomId ?? chatRoomId}`);
      if (response.data.statusCode === 200) {
        setChatRoomData(response.data.results);
        setLastSeen(response.data.results.lastseenAt);
      }
    } catch (error) {
      console.error("Error fetching SingleChatRoom:", error);
    } finally {
      setChatRoomLoading(false);
    }

  };

  useEffect(() => {
    if (!chatRoomId) return;

    isRoomChangeRef.current = true;

    newMessageDividerIndexRef.current = null;
    newMessageDividerRef.current = null;
    didInitialRoomScrollRef.current = false;
    setIsTyping(false);
    setEditMessageId('');
    setMessageList([]);
    setNextCursor(null);
    setHasMoreMessages(true);
    setReplytoMessageId('');
    setAttachment([]);
    setMessageType('');
    FetchSingleChatRoom(chatRoomId);
    FetchMessages(chatRoomId);
    setSelectMode(false);
    setDeleteMessageIds([]);
    setEditMessageId('');
    setMessage('');
  }, [chatRoomId]);

  useEffect(() => {
    if (newMessageDividerIndexRef.current !== null) return

    const index = messageList.findIndex(
      (msg: any) => !msg.isSeen && msg.senderId !== userId
    )

    if (index !== -1) {
      newMessageDividerIndexRef.current = index
    }
  }, [messageList, userId])

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (didInitialRoomScrollRef.current) return;
    // 🟢 CASE 1: room changed → jump to bottom
    if (isRoomChangeRef.current) {
      if (messageList.length === 0) return;
      if (newMessageDividerIndexRef.current !== null) {
        newMessageDividerRef.current?.scrollIntoView({
          behavior: "auto",
          block: "center",
        })
        didInitialRoomScrollRef.current = true;
      } else {
        bottomRef.current?.scrollIntoView({ behavior: "auto" })
      }

      isRoomChangeRef.current = false;
      return;
    }

    // 🟡 CASE 2: older messages loaded → maintain position
    if (prevScrollHeightRef.current !== null) {
      const diff =
        container.scrollHeight - prevScrollHeightRef.current;

      container.scrollTop += diff;
      prevScrollHeightRef.current = null;
      return;
    }

    // 🟢 CASE 3: new message + user already at bottom
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageList, isTyping]);



  useEffect(() => {
    const el = topRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasMoremessages &&
          !loading &&
          chatRoomId
        ) {
          prevScrollHeightRef.current = containerRef.current?.scrollHeight || null;
          FetchMessages(chatRoomId);
          newMessageDividerIndexRef.current = null;
          newMessageDividerRef.current = null;
          // console.log("Intersecting:", entry.isIntersecting, hasMoremessages, loading, chatRoomId);
        }
      },
      {
        root: containerRef.current, // 👈 important (chat scroll container)
        threshold: 0.1,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [chatRoomId, hasMoremessages, loading, nextCursor]);


  useEffect(() => {
    if (!lastSeen) return;

    const update = () => {
      setLastSeenText(lastSeenOfUser(lastSeen));
    };

    update(); // immediate render
    const interval = setInterval(update, 5000);

    return () => clearInterval(interval);
  }, [lastSeen]);


  useEffect(() => {
    attachment?.length === 0 && setMessageType('');
  }, [attachment])

  useEffect(() => {
    if (isAtBottomRef.current) {
      messageList.forEach((msg: any) => {
        if (msg.senderId !== userId && !msg.isSeen) {
          seenQueueRef.current.add(msg.id)
        }
      })

      sendSeenToBackend()
    }
  }, [messageList]);

  useEffect(() => {
    if (deleteMessageIds.length === 0) {
      setSelectMode(false);
    };
  }, [deleteMessageIds])




  //socket
  newMessageUpdateinMessageList(chatRoomId, setMessageList, setLastMessage);
  lastSeenSocket(chatRoomId, chatRoomData?.chatRoomMembers?.[0]?.user?.id, setLastSeen);
  typingSocket(chatRoomId, setIsTyping)
  deleteMessageSocket(chatRoomId, setMessageList);
  seenMessageSocket(chatRoomId, setMessageList);
  editMessageSocket(chatRoomId, setMessageList)

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto"
    >
      {chatRoomLoading ? <ChatHeaderSkeleton /> : <ChatHeaderComp setChatRoomId={setChatRoomId} chatRoomData={chatRoomData} onlineUsers={onlineUsers} lastSeenText={lastSeenText} isSelectMode={isSelectMode} deleteMessageIds={deleteMessageIds} deleteMessageLoading={deleteMessageLoading} handleDeleteMessages={handleDeleteMessages} setSelectMode={setSelectMode} setDeleteMessageIds={setDeleteMessageIds} />}
      
     <Chat topRef={topRef} newMessageDividerRef={newMessageDividerRef} newMessageDividerIndexRef={newMessageDividerIndexRef} messageList={messageList} loading={loading} handlePressStart={handlePressStart} handlePressEnd={handlePressEnd} isSelectMode={isSelectMode} setDeleteMessageIds={setDeleteMessageIds} userId={userId} deleteMessageIds={deleteMessageIds} deleteMessageLoading={deleteMessageLoading} show={show} setShow={setShow} open={open} setOpen={setOpen} setMessageList={setMessageList} setReplytoMessageId={setReplytoMessageId} bottomRef={bottomRef} isAtBottomRef={isAtBottomRef} containerRef={containerRef} setEditMessageId={setEditMessageId} setMessage={setMessage} handleMessageSeen={handleMessageSeen} isTyping={isTyping} />

      <SendMessageForm message={message} setMessage={setMessage} editmessageId={editmessageId} setEditMessageId={setEditMessageId} attachment={attachment} setAttachment={setAttachment} messageType={messageType} setReplytoMessageId={setReplytoMessageId} replytoMessageId={replytoMessageId} repliedMSG={repliedMSG} setMessageType={setMessageType} setOpenEmoji={setOpenEmoji} openEmoji={openEmoji} setOpenAttachment={setOpenAttachment} openAttachment={openAttachment} uploadPercent={uploadPercent} deleteAttachmentLoading={deleteAttachmentLoading} attachmentLoading={attachmentLoading} handleTyping={handleTyping} chatRoomData={chatRoomData} chatRoomId={chatRoomId} isImageDisabled={isImageDisabled} isVideoDisabled={isVideoDisabled} imageInputRef={imageInputRef} videoInputRef={videoInputRef} fileInputRef={fileInputRef} isFileDisabled={isFileDisabled} sendLoading={sendLoading} newMessageDividerIndexRef={newMessageDividerIndexRef} newMessageDividerRef={newMessageDividerRef} setSendLoading={setSendLoading} setMessageList={setMessageList} setLastMessage={setLastMessage} bottomRef={bottomRef} setAttaachmentLoading={setAttaachmentLoading} setUploadPercent={setUploadPercent} setLoading={setLoading} setDeleteAttachmentLoading={setDeleteAttachmentLoading}  />
    </div>
  );
}