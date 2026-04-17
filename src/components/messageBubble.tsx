import { Check, CheckCheck, Edit2, FileIcon, Loader2, Play, Reply, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { endpoints } from "../config/apiendpoints";

export const MessageBubble = ({ message, userId, show, setShow, open, setOpen, setMessageList, setReplytoMessageId, bottomRef, isAtBottomRef, containerRef, onSeen, setEditMessageId, setMessage, isLastMessage }: { message: any, userId: string, show: string, setShow: any, open: string, setOpen: any, setMessageList: any, setReplytoMessageId: any, bottomRef: any, isAtBottomRef: any, containerRef: any, onSeen: any, setEditMessageId: any, setMessage: any, isLastMessage: any }) => {
  const [CanEdit, setCanEdit] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<any>(0);
  const EDIT_LIMIT = 2 * 60 * 1000; // 2 minutes
  const isCurrentUser = message.senderId === userId;
  const isText = message.type === 'TEXT';
  const isVideo = message.type === 'VIDEO';
  const isImage = message.type === 'IMAGE';
  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const createdAt = new Date(message.createdAt).getTime()

      const elapsed = now - createdAt
      const remaining = EDIT_LIMIT - elapsed

      if (remaining <= 0) {
        setCanEdit(false)
        setTimeLeft(0)
        return
      }

      setCanEdit(true)
      setTimeLeft(remaining)
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [message.createdAt])

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const textRef = useRef<HTMLParagraphElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [loading, setLoading] = useState(false);

  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onSeen(message.id)
        }
      },
      {
        root: containerRef.current,
        threshold: 0.6, // WhatsApp-like
      }
    )

    observer.observe(messageRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!textRef.current) return;

    const el = textRef.current;

    // Temporarily remove clamp to measure full height
    const previousClass = el.className;
    el.classList.remove("showellipsis");

    const fullHeight = el.scrollHeight;

    // Restore clamp
    el.className = previousClass;

    const clampedHeight = el.clientHeight;

    setShowButton(fullHeight > clampedHeight);
  }, [message.content]);


  const handleDeleteMsg = async (messageId: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`${endpoints.MESSAGES}/${messageId}`, {
        params: {
          chatRoomId: message.chatRoomId
        }
      });
      if (res.status === 200) {
        setOpen('');
        setMessageList((prev: any) => { return prev.filter((msg: any) => msg.id !== messageId) });
      }
    } catch (err) {
      console.log(err)
    } finally {
      setTimeout(() => { setLoading(false), 5000 })
    }
  }

  return (
    <div className={` flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
      // onClick={()=>{!loading && setOpen('')}}
      ref={messageRef}
    >
      {open === message.id && isCurrentUser && <div className="relative z-10">
        <div className={`absolute right-[100%] ${isLastMessage && "bottom-0"} bg-green-600/40  text-green-950 p-2 rounded-2xl backdrop-blur-sm flex items-center justify-center`}>
          {loading ? <Loader2 className="text-white animate-spin" /> : <ul className="space-y-2">
            <li className="px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2" onClick={() => {
              setReplytoMessageId(message.id);
              setEditMessageId('');
              setMessage('');
              setOpen('');
            }}><Reply className="  w-5 h-5" />Reply</li>
            {(isText && CanEdit) && <li className="relative px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2" onClick={() => {
              setOpen('');
              setEditMessageId(message.id);
              setMessage(message.content);
            }}><Edit2 className="  w-5 h-5" />Edit
              <div className="text-xs">{formatCountdown(timeLeft)}</div>
            </li>}
            {message.senderId === userId && <li className="px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 text-red-900 flex justify-center items-center gap-2" onClick={() => handleDeleteMsg(message.id)}><Trash2 className="  w-5 h-5" />Unsend</li>}
          </ul>}
        </div>
      </div>
      }
      {isText ?
        <div className={`relative max-w-[50%] px-1 py-1 border border-[#ccc] rounded-[15px] ${isCurrentUser ? 'rounded-tr-[5px] bg-green-600/70' : 'rounded-tl-[5px] bg-green-950/90'}`}
          onContextMenu={
            (e) => {
              e.preventDefault();
              setOpen((prev: any) => { return prev === message.id ? "" : message.id });
            }
          }
        >
          {message?.replyOf &&
            <div className={`w-full bg-green-800/30 px-3 py-1 rounded-t-[10px] font-bold text-sm  ${isCurrentUser ? "text-green-200 rounded-tr-[3px]" : "text-green-100 rounded-tl-[3px]"} truncate max-w-full`}>
              <p className={`text-xs ${isCurrentUser ? "text-green-900" : "text-green-200"}`}>{message?.replyOf?.sender?.firstName} {message?.replyOf?.sender?.lastName}:</p>
              {message?.replyOf?.content}
              {message?.replyOf?.attachments?.length > 0 && <div className="flex">
                {message?.replyOf?.attachments?.map((attachment: any, index: number) => {
                  return message?.replyOf?.type === 'IMAGE' ? <img src={attachment.url} key={index} alt="attachment" className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /> : message?.replyOf?.type === 'VIDEO' ? <div className='relative'><Play className="h-2 w-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="rgba(2555,255,255,0.7)" /><video src={attachment.url} key={index} className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /></div> : <div className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`}><FileIcon className="w-8 h-8 text-green-100 inline-block" />{attachment.fileName}</div>
                })}
              </div>}
            </div>
          }
          <p ref={textRef} className={`px-3 inline-block text-white ${show === message.id ? "" : "showellipsis"}`}>{message.content}</p>
          {showButton && <button
            onClick={() => setShow(show === message.id ? "" : message.id)}
            className={`mt-1 text-xs ${isCurrentUser ? "text-blue-700 hover:text-blue-600" : "text-blue-300 hover:text-blue-500"} focus:outline-none hover:scale-105 active:scale-95 transition-all duration-300`}
          >
            {show === message.id ? "Show less" : "Show more"}
          </button>}
          <div className="relative z-1 p-0 text-[10px] text-right text-gray-100 flex justify-between items-center">
            {isCurrentUser ? <div>
              {message?.isSeen ? <CheckCheck className="w-4 h-4 inline-block text-green-900" /> :
                <Check className="w-3 h-3 inline-block" />}
            </div> : <div></div>}
            <div className={isCurrentUser ? "text-right" : " w-full text-left pl-2"}>
              {new Date(message?.createdAt)?.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}
            </div>
          </div>
        </div>
        :
        <div className="max-w-[30%]">
          {message?.attachments?.map((attachment: any) => {
            return <div key={attachment.id} className={`max-w-full mb-2 px-1 py-1 border border-[#ccc] rounded-[15px] ${isCurrentUser ? 'rounded-tr-[5px] bg-green-600/70' : 'rounded-tl-[5px] bg-green-950/90'}`}
              onContextMenu={
                (e) => {
                  e.preventDefault();
                  setOpen((prev: any) => { return prev === message.id ? "" : message.id });
                }
              }
            >
              {message?.replyOf &&
                <div className={`w-full bg-green-800/30 px-3 py-1 rounded-t-[10px] font-bold text-sm  ${isCurrentUser ? "text-green-200 rounded-tr-[3px]" : "text-green-100 rounded-tl-[3px]"} truncate max-w-full`}>
                  <p className={`text-xs ${isCurrentUser ? "text-green-900" : "text-green-200"}`}>{message?.replyOf?.sender?.firstName} {message?.replyOf?.sender?.lastName}:</p>
                  {message?.replyOf?.content}
                  {message?.replyOf?.attachments?.length > 0 && <div className="flex">
                    {message?.replyOf?.attachments?.map((attachment: any, index: number) => {
                      return message?.replyOf?.type === 'IMAGE' ? <img src={attachment.url} key={index} alt="attachment" className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /> : message?.replyOf?.type === 'VIDEO' ? <video src={attachment.url} key={index} className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /> : <div className={`h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`}><FileIcon className="w-8 h-8 text-green-100 inline-block" />{attachment.fileName}</div>
                    })}
                  </div>}
                </div>
              }
              <a href={attachment.url} target="_blank">
                {isImage ? <img src={attachment.url} alt="attachment" onLoad={() => {
                  if (isAtBottomRef.current) {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  }
                }} className={`max-w-full h-auto object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /> : isVideo ? <div className='relative'><Play className="h-10 w-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="rgba(2555,255,255,0.7)" stroke="rgba(2555,255,255,0.7)" /><video src={attachment.url}
                  onLoadedMetadata={() => {
                    if (isAtBottomRef.current) {
                      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className={`max-w-full h-auto object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`} /></div> : <div className={`max-w-full h-10 w-10 object-contain rounded-[10px] ${isCurrentUser ? 'rounded-tr-[3px]' : 'rounded-tl-[3px]'}`}><FileIcon className="w-8 h-8 text-green-100 inline-block" />{attachment.fileName}</div>}
              </a>
              <div className="relative z-1 p-0 text-[10px] text-right text-gray-100 flex justify-between items-center">
                {isCurrentUser ? <div>
                  {message?.isSeen ? <CheckCheck className="w-4 h-4 inline-block text-green-900" /> :
                    <Check className="w-3 h-3 inline-block" />}
                </div> : <div></div>}
                <div className={isCurrentUser ? "text-right" : "text-left"}>
                  {new Date(message?.createdAt)?.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          })}
          {message?.content && <div className={`max-w-[50%] px-4 py-1 border border-[#ccc] rounded-[15px] ${isCurrentUser ? 'rounded-tr-[5px] bg-green-600/70' : 'rounded-tl-[5px] bg-green-950/90'}`}
          >
            <p className={`inline-block text-white ${show === message.id ? "" : "showellipsis"}`}>{message.content}</p>
            <button
              onClick={() => setShow(show === message.id ? "" : message.id)}
              className="mt-1 text-xs text-blue-500 hover:text-blue-700 focus:outline-none transition-all duration-300"
            >
              {show === message.id ? "Show less" : "Show more"}
            </button>
            <div className="relative z-1 p-0 text-[10px] text-right text-gray-100 flex justify-between items-center">
              {isCurrentUser ? <div>
                {message?.isSeen ? <CheckCheck className="w-4 h-4 inline-block text-green-900" /> :
                  <Check className="w-3 h-3 inline-block" />}
              </div> : <div></div>}
              <div className={isCurrentUser ? "text-right" : "text-left"}>
                {new Date(message?.createdAt)?.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })}
              </div>
            </div>
          </div>}
        </div>
      }
      {open === message.id && !isCurrentUser && <div className="relative"><div className="absolute left-[100%] bg-green-600/40  text-green-950 p-2 rounded-2xl backdrop-blur-sm flex items-center justify-center">
        {loading ? <Loader2 className="text-white animate-spin" /> : <ul className="space-y-2">
          <li className="px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2" onClick={() => {
            setReplytoMessageId(message.id);
            setEditMessageId('');
            setMessage('');
            setOpen('');
          }}><Reply className="  w-5 h-5" />Reply</li>
        </ul>}
      </div></div>}
    </div>
  )
}