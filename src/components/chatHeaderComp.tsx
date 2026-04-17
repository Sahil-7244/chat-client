import { ChevronLeft, Loader2, Trash2, X } from "lucide-react";
import { GROUPPROFILEIMG, PROFILEIMG } from "../constant/pagepaths";
import { Strings } from "../constant/string";

export const ChatHeaderComp = ({ setChatRoomId, chatRoomData, onlineUsers, lastSeenText, isSelectMode, deleteMessageIds, deleteMessageLoading, handleDeleteMessages, setSelectMode, setDeleteMessageIds }: any) => {
  return (
    <div className="sticky z-20 flex items-center top-0 h-[70px] bg-green-950 text-white p-2 gap-2">
      <ChevronLeft className="w-7 h-7 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300" onClick={() => {
        localStorage.removeItem("chatRoomId");
        setChatRoomId(null)
      }} />
      <div className="h-12 w-12 bg-gray-500 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={chatRoomData?.isgroup ? chatRoomData?.image || GROUPPROFILEIMG : chatRoomData?.chatRoomMembers?.[0]?.user?.profileImage || PROFILEIMG}
          alt="Avatar"
          onError={(e) => (e.currentTarget.src = chatRoomData?.isgroup ? GROUPPROFILEIMG : PROFILEIMG)}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="font-bold">{chatRoomData?.isgroup ? chatRoomData?.title : `${chatRoomData?.chatRoomMembers?.[0]?.user?.firstName} ${chatRoomData?.chatRoomMembers?.[0]?.user?.lastName}`}</p>
        {(!chatRoomData?.isgroup && (onlineUsers?.has(chatRoomData?.chatRoomMembers?.[0]?.user?.id) || chatRoomData?.lastseenAt)) && <p className="text-sm text-gray-400">{onlineUsers?.has(chatRoomData?.chatRoomMembers?.[0]?.user?.id) ? Strings?.ONLINE : `${Strings?.LAST_SEEN} ${lastSeenText}`}</p>}
      </div>
      {isSelectMode && <div className="absolute right-4 flex justify-center items-center gap-4">
        <p className="text-xs">{deleteMessageIds.length} {deleteMessageIds.length > 1 ? Strings?.MSGS_SELECTED : Strings?.MSG_SELECTED}</p>
        {deleteMessageLoading ? <Loader2 className="w-7 h-7 animate-spin text-red-400" /> : <Trash2 className="w-7 h-7 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 text-red-600" onClick={handleDeleteMessages} />}
        <X className="w-7 h-7 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300" onClick={() => {
          setSelectMode(false);
          setDeleteMessageIds([]);
        }} />
      </div>}
    </div>
  )
}