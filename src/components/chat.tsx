import { Loader2 } from "lucide-react";
import { getChatDateLabel } from "../utills/time";
import { MessageBubble } from "./messageBubble";
import { TypingMessageBubble } from "./typingMsgBubble";

export const Chat = ({ topRef, newMessageDividerRef, newMessageDividerIndexRef, messageList, loading, handlePressStart, handlePressEnd, isSelectMode, setDeleteMessageIds, userId, deleteMessageIds, deleteMessageLoading, show, setShow, open, setOpen, setMessageList, setReplytoMessageId, bottomRef, isAtBottomRef, containerRef, setEditMessageId, setMessage, handleMessageSeen, isTyping }: any) => {
  return (
    <div className="flex flex-col justify-end min-h-full p-3">
      <div ref={topRef} className="text-center">{loading && <Loader2 className="inline-block animate-spin" />}</div>
      {messageList?.length > 0 && messageList.map((message: any, index: number) => {
        const prevMessage = messageList[index - 1]
        const isLastMessage = index === messageList.length - 1;
        const showDateLabel =
          !prevMessage ||
          new Date(prevMessage.createdAt).toDateString() !==
          new Date(message.createdAt).toDateString()
        return (
          <div key={message.id} className="mb-2">
            {showDateLabel && (
              <div className="my-3 flex justify-center">
                <span className="px-3 py-1 text-xs rounded-full bg-gray-300 text-gray-700">
                  {getChatDateLabel(message.createdAt)}
                </span>
              </div>
            )}
            {index === newMessageDividerIndexRef.current && (
              <div ref={newMessageDividerRef} className="flex items-center my-3">
                <div className="flex-1 h-px bg-gray-400" />
                <span className="px-3 text-xs text-gray-600 bg-gray-200 rounded-full">
                  New messages
                </span>
                <div className="flex-1 h-px bg-gray-400" />
              </div>
            )}
            <div
              onPointerDown={() => {
                if (message.senderId !== userId) return;
                handlePressStart();
              }}
              onPointerUp={() => {
                if (message.senderId !== userId) return;
                handlePressEnd();
              }}
              onPointerLeave={() => {
                if (message.senderId !== userId) return;
                handlePressEnd();
              }}
              onPointerCancel={() => {
                if (message.senderId !== userId) return;
                handlePressEnd();
              }}
              onClick={() => {
                if (message.senderId !== userId) return;
                if (isSelectMode) {
                  setDeleteMessageIds((prev: any) => {
                    if (!prev.includes(message.id)) {
                      return [...prev, message.id]
                    } else {
                      return prev.filter((id: any) => id !== message.id);
                    }
                  })
                }
              }}
              className={message.senderId === userId ? `${deleteMessageIds.includes(message.id) && 'bg-green-800/20 rounded-2xl'} ${isSelectMode && !deleteMessageIds.includes(message.id) ? 'active:scale-100 ' : 'active:scale-95 active:bg-green-800/20'} transition-all duration-300 ${(deleteMessageLoading && deleteMessageIds.includes(message.id)) && 'opacity-50'}` : ''}
            >
              <MessageBubble message={message} userId={userId} show={show} setShow={setShow} open={open} setOpen={setOpen} setMessageList={setMessageList} setReplytoMessageId={setReplytoMessageId} bottomRef={bottomRef} isAtBottomRef={isAtBottomRef} containerRef={containerRef} onSeen={handleMessageSeen} setEditMessageId={setEditMessageId} setMessage={setMessage} isLastMessage={isLastMessage} />
            </div>
          </div>
        )
      })}
      {isTyping && <TypingMessageBubble />}
      <div ref={bottomRef} />
    </div>
  )
}