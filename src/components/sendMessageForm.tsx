import EmojiPicker from "emoji-picker-react";
import { FileIcon, Loader2, Play, Plus, Send, SmileIcon, X } from "lucide-react";
import socket from "../config/socket";
import { toast } from "sonner";
import axiosInstance from "../lib/axiosInstance";
import { endpoints } from "../config/apiendpoints";
import axios from "axios";

export const SendMessageForm = ({ message, setMessage, editmessageId, setEditMessageId, attachment, setAttachment, messageType, setReplytoMessageId, replytoMessageId, repliedMSG, setMessageType, setOpenEmoji, openEmoji, setOpenAttachment, openAttachment, uploadPercent, deleteAttachmentLoading, attachmentLoading, handleTyping, chatRoomData, chatRoomId, isImageDisabled, isVideoDisabled, imageInputRef, videoInputRef, fileInputRef, isFileDisabled, sendLoading, newMessageDividerIndexRef, newMessageDividerRef, setSendLoading, setMessageList, setLastMessage, bottomRef, setAttaachmentLoading, setUploadPercent, setLoading, setDeleteAttachmentLoading }: any) => {

  const handlesendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    newMessageDividerIndexRef.current = null;
    newMessageDividerRef.current = null;
    setOpenEmoji(false);
    if (((messageType !== "TEXT" && messageType !== "") && attachment.length === 0) || ((messageType === "TEXT" || messageType === "") && !message.trim())) {
      if (messageType === "TEXT" || messageType === "") { toast.error("Message is empty"); }
      if (messageType !== "TEXT" && messageType !== "") { toast.error("atleast one attachment is required"); }
      return;
    }
    setSendLoading(true);
    try {
      if (editmessageId) {
        const response = await axiosInstance.put(`${endpoints.MESSAGES}/${editmessageId}`, {
          message,
          chatRoomId
        });
        if (response.data.statusCode === 200) {
          setMessage('');
          setMessageList((prev: any) => { return prev.map((m: any) => m.id === editmessageId ? response.data.results : m) });
          setLastMessage(response.data.results);
          setReplytoMessageId('');
          setAttachment([]);
          setMessageType('');
          setEditMessageId('');
        }
      } else {
        const response = await axiosInstance.post(`${endpoints.MESSAGES}/${chatRoomId}`, {
          message,
          ...(replytoMessageId && { replytoMessageId }),
          ...(messageType && { messageType }),
          ...(attachment.length > 0 && { attachments: attachment }),
        });
        if (response.data.statusCode === 200) {
          setMessage('');
          setMessageList((prev: any) => [...prev, response.data.results]);
          setLastMessage(response.data.results);
          setReplytoMessageId('');
          setAttachment([]);
          setMessageType('');
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (error) {
      console.error("Error sending Message:", error);
    } finally {
      setSendLoading(false);
    }

  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No image selected");
      return;
    }
    setAttaachmentLoading(true);
    setUploadPercent(0);
    const { data: sign } = await axiosInstance.get(`${endpoints.SIGNED_URL}/IMG`);

    // 👉 call your function here
    // sendImage(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.results.apiKey);
    formData.append("timestamp", sign.results.timestamp);
    formData.append("signature", sign.results.signature);
    formData.append("folder", sign.results.folder);

    try {
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sign.results.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadPercent(percentCompleted);
          },
        }
      );
      if (attachment?.length === 0) setMessageType('IMAGE');


      const videourl = cloudRes.data.secure_url.replace(
        "/upload/",
        "/upload/q_auto:eco,f_auto/"
      );
      setAttachment((prev: any) => { return [...prev, { url: videourl, mimeType: cloudRes.data.format, size: cloudRes.data.bytes }] });
    } catch (error) {
      console.error("Error adding Image:", error);
      toast.error("Failed to add Image.");
    } finally {
      setLoading(false);
      setAttaachmentLoading(false);

    }

    // reset input so same image can be selected again
    e.target.value = "";
  };
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No video selected");
      return;
    }
    setAttaachmentLoading(true);
    setUploadPercent(0);
    const { data: sign } = await axiosInstance.get(`${endpoints.SIGNED_URL}/VID`);

    // 👉 call your function here
    // sendImage(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.results.apiKey);
    formData.append("timestamp", sign.results.timestamp);
    formData.append("signature", sign.results.signature);
    formData.append("folder", sign.results.folder);

    try {
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sign.results.cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadPercent(percentCompleted);
          },
        }
      );
      if (attachment?.length === 0) setMessageType('VIDEO');


      const videourl = cloudRes.data.secure_url.replace(
        "/upload/",
        "/upload/f_mp4,q_auto:good,vc_auto/"
      );

      // console.log({ url: videourl, mimeType: cloudRes.data.format, size: cloudRes.data.bytes });
      setAttachment((prev: any) => { return [...prev, { url: videourl, mimeType: cloudRes.data.format, size: cloudRes.data.bytes }] });
    } catch (error) {
      console.error("Error adding Video:", error);
      toast.error("Failed to add Video.");
    } finally {
      setAttaachmentLoading(false);

    }

    // reset input so same image can be selected again
    e.target.value = "";
  };
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    setAttaachmentLoading(true);
    setUploadPercent(0);
    const { data: sign } = await axiosInstance.get(`${endpoints.SIGNED_URL}/RAW`);

    // 👉 call your function here
    // sendImage(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.results.apiKey);
    formData.append("timestamp", sign.results.timestamp);
    formData.append("signature", sign.results.signature);
    formData.append("folder", sign.results.folder);

    try {
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sign.results.cloudName}/raw/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadPercent(percentCompleted);
          },
        }
      );
      if (attachment?.length === 0) setMessageType('FILE');

      const videourl = cloudRes.data.secure_url

      // console.log({ url: videourl, mimeType: cloudRes.data.format, size: cloudRes.data.bytes });
      setAttachment((prev: any) => { return [...prev, { url: videourl, mimeType: cloudRes.data.format, size: cloudRes.data.bytes }] });
    } catch (error) {
      console.error("Error adding File:", error);
      toast.error("Failed to add File.");
    } finally {
      setAttaachmentLoading(false);
    }

    // reset input so same image can be selected again
    e.target.value = "";
  };

  const handleDeleteattachment = async (file: any, messagetype: any) => {
    if (messagetype === "TEXT" || messagetype === "") {
      return;
    }

    setDeleteAttachmentLoading(file.url);
    try {
      const res = await axiosInstance.post(`${endpoints.CLOUDINARY_DATA}/${messagetype}`, {
        attachments: file
      })
      if (res.data.statusCode === 200) {
        setAttachment((prev: any) => { return prev.filter((attachment: any) => attachment.url !== file.url) });
      }
    } catch (error) {
      console.log(error)
    } finally {
      setDeleteAttachmentLoading('');
    }
  }

  const handleDeleteAllattachment = async (file: any, messagetype: any) => {
    if (messagetype === "TEXT" || messagetype === "") {
      return;
    }

    setDeleteAttachmentLoading('all');
    try {
      const res = await axiosInstance.post(`${endpoints.CLOUDINARY_DATA_MANY}/${messagetype}`, {
        attachments: file
      })
      if (res.data.statusCode === 200) {
        setAttachment([]);
        setReplytoMessageId('');
        setMessageType('');
      }
    } catch (error) {
      console.log(error)
    } finally {
      setDeleteAttachmentLoading('');
    }
  }

  return (
    <form className="sticky z-20 bottom-0 h-[60px] bg-gradient-to-t from-zinc-200 via-zinc-200/95 to-transparent text-black p-3 flex gap-4" onSubmit={handlesendMessage}>

      <div className="relative w-full">
        {editmessageId && <div className="absolute bottom-1/2 z-0 bg-green-950 w-full p-2 px-3 pb-5 rounded-t-3xl flex justify-between items-center">
          <div className="text-xs text-gray-300">edit message</div><X className="w-3 h-3 text-white hover:scale-105 active:scale-95 transition-all duration-300" onClick={() => {
            setEditMessageId('');
            setMessage('');
          }} />
        </div>}
        {(attachment?.length > 0 || replytoMessageId) && <div className="absolute bottom-1/2 z-0 bg-green-200 w-full p-2 px-3 pb-5 rounded-t-3xl">
          <X className="absolute top-4 right-0.5 w-3 h-3 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 text-gray-600" onClick={() => {
            if (attachment?.length === 0) {
              setReplytoMessageId('');
              setAttachment([]);
              setMessageType('');
            } else {
              handleDeleteAllattachment(attachment || [], messageType);
            }
          }} />
          {replytoMessageId && <div className="w-full bg-green-800/30 px-3 py-1 rounded-t-2xl font-bold text-sm text-green-950 truncate max-w-full">
            <p className="text-xs">{repliedMSG?.sender?.firstName} {repliedMSG?.sender?.lastName}:</p>
            {repliedMSG?.content}
            {repliedMSG?.attachments?.length > 0 && <div className="flex">
              {repliedMSG?.attachments?.map((attachment: any, index: number) => {
                return repliedMSG?.type === 'IMAGE' ? <img src={attachment.url} key={index} alt="attachment" className={`h-10 w-10 object-contain rounded-[10px]`} /> :
                  repliedMSG?.type === 'VIDEO' ?
                    <div className='relative'><Play className="h-2 w-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="rgba(2555,255,255,0.7)" />
                      <video src={attachment.url} key={index} className={`h-10 w-10 object-contain rounded-[10px]`} />
                    </div> :
                    <div className={`h-10 w-10 object-contain rounded-[10px]`}><FileIcon className="w-8 h-8 text-green-100 inline-block" />{attachment.fileName}
                    </div>
              })}
            </div>}
          </div>}
          {attachment?.length > 0 && <div className={`mt-2 h-[70px] flex gap-2 items-center ${deleteAttachmentLoading === 'all' && 'opacity-40'}`}>
            {attachment?.map((file: any, index: number) => (
              <div key={index} className={`relative rounded-lg overflow-hidden flex flex-col items-center ${deleteAttachmentLoading === file.url && 'opacity-40'} transition-all duration-300`}>
                {messageType === "IMAGE" ? <img src={file.url} alt={`img-${index + 1}`} className="h-[70px] object-cover" /> : messageType === "VIDEO" ? <div className="relative">
                  <Play className="h-2 w-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="rgba(2555,255,255,0.7)" />
                  <video src={file.url} className="h-[70px] object-cover" />
                </div> :
                  messageType === "FILE" && <div className="flex items-center gap-1">
                    <FileIcon className=" h-[70px] inline-block" />
                    file-{index + 1}
                  </div>}
                {!deleteAttachmentLoading && <X className="p-[2px] absolute top-1 right-1 bg-red-600 text-white h-4 w-4 rounded-full hover:scale-105 active:scale-90 transition-all duration-300 cursor-pointer" onClick={() => {
                  if (deleteAttachmentLoading) return;
                  handleDeleteattachment(file, messageType)
                }} />}
              </div>
            ))}
            {attachmentLoading && <div><Loader2 className="inline-block animate-spin text-black" />{uploadPercent}</div>}
          </div>}

        </div>}
        <div className="relative z-10 w-full h-full box-border border border-gray-800 rounded-full bg-gray-300 outline-none flex">
          <button type="button" className="rounded-l-full h-full min-w-[40px] p-1 flex items-center justify-center"
           onClick={() => setOpenEmoji((prev: any) => { return !prev })}
            disabled={sendLoading}
           ><SmileIcon /></button>
          <input
            type="text"
            className="relative z-10 w-full h-full p-4 bg-gray-300 outline-none"
            placeholder="Type a message..."
            onClick={() => setOpenEmoji(false)}
            value={message}
            onChange={(a) => {
              setMessage(a.target.value);
              handleTyping();
            }}
            disabled={sendLoading}
            onBlur={() => {
              socket.emit("typing:stop", {
                toUserId: chatRoomData?.chatRoomMembers?.[0]?.user?.id,
                chatRoomId
              })
            }}
          />
          <button type="button" className="rounded-r-full h-full min-w-[40px] p-1 flex items-center justify-center disabled:opacity-0" 
          onClick={() => setOpenAttachment((prev: any) => { return !prev })} disabled={sendLoading || !!editmessageId}><Plus /></button>
          {/* Emoji picker */}
          {openEmoji && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setMessage((prev: any) => prev + emoji.emoji);
                }}
              />
            </div>
          )}
          {openAttachment && (
            <div className="w-[200px] absolute bottom-12 right-0 z-50 bg-white/40  text-green-950 p-2 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <ul className="w-full space-y-2">
                <li className={`px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 ${isImageDisabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95"
                  }`}
                  tabIndex={isImageDisabled ? -1 : 0}
                  aria-disabled={isImageDisabled}
                  onClick={() => {
                    if (isImageDisabled) return;
                    setOpenAttachment(false);
                    imageInputRef.current?.click();
                  }}>Image
                </li>
                <li className={`px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 ${isVideoDisabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95"
                  }`}
                  tabIndex={isVideoDisabled ? -1 : 0}
                  aria-disabled={isVideoDisabled}
                  onClick={() => {
                    if (isVideoDisabled) return;
                    setOpenAttachment(false);
                    videoInputRef.current?.click();
                  }}>Video</li>
                <li className={`px-3 py-1 rounded-xl backdrop-blur-sm bg-white/50 hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 ${isFileDisabled
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-green-600/30 cursor-pointer hover:scale-102 active:scale-95"
                  }`}
                  tabIndex={isFileDisabled ? -1 : 0}
                  aria-disabled={isFileDisabled}
                  onClick={() => {
                    if (isFileDisabled) return;
                    setOpenAttachment(false);
                    fileInputRef.current?.click();
                  }}>File</li>
              </ul>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            className="hidden"
            onChange={handleVideoSelect}
          />
          <input
            type="file"
            accept="*/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>
      {(!!message || attachment.length > 0) && <button type='submit' className=" p-2 bg-green-900 text-white rounded-full hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-300 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={sendLoading || ((messageType !== "TEXT" && messageType !== "") && attachment.length === 0) || ((messageType === "TEXT" || messageType === "") && !message.trim())}
      >{sendLoading ? <Loader2 className="inline-block h-5 w-5 animate-spin" /> : <Send className="inline-block h-5 w-5" />}</button>}
    </form>
  )
}