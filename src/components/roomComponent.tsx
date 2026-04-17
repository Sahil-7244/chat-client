import { GROUPPROFILEIMG, PROFILEIMG } from "../constant/pagepaths";
import { formatDate } from "../utills/time";
import RollingNumber from "./rollingNumber";

export const RoomComp = ({room, setOpen, setNextCursor, setHasMoreMessages, setChatRoomId, onlineUsers}:any) => {
  return (
    <div key={room.id} className="relative p-4 h-[70px] border-b border-gray-300 flex items-center gap-3 cursor-pointer hover:bg-slate-700" onClick={() => {
      setOpen('');
      setNextCursor(null);
      setHasMoreMessages(true);
      setChatRoomId(room.id);
      localStorage.setItem("chatRoomId", room.id);
    }}>
      {<div className={`absolute  right-4 bottom-4 flex items-center justify-center h-5 ${room?._count?.message > 99 ? 'w-6 text-[10px]' : 'w-5 text-[12px]'} rounded-full bg-green-500 text-green-900 scale-0 opacity-0 ${room?._count?.message > 0 && 'scale-100 opacity-100'} transition-all duration-200 ease-in overflow-hidden`}>
        <RollingNumber number={room?._count?.message > 99 ? '99+' : room?._count?.message} />
      </div>}
      <div className={`h-10 w-10 bg-gray-500 rounded-full overflow-hidden flex-shrink-0 ${(!room?.isgroup && onlineUsers?.has(room?.chatRoomMembers?.[0]?.user?.id)) ? 'border-2 border-green-500' : ''} `}>
        <img
          src={room.isgroup ? room?.image || GROUPPROFILEIMG : room.chatRoomMembers?.[0]?.user?.profileImage || PROFILEIMG}
          alt="Avatar"
          onError={(e) => (e.currentTarget.src = room.isgroup ? GROUPPROFILEIMG : PROFILEIMG)}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate max-w-[80%]">{room.isgroup ? room.title : `${room?.chatRoomMembers?.[0]?.user?.firstName} ${room?.chatRoomMembers?.[0]?.user?.lastName}`}</p>
          {room?.message?.length > 0 && (<p className="text-gray-400 text-sm truncate max-w-[80%]">
            {room?.message?.[0]?.type === "TEXT" ?
              room?.message?.[0]?.content : room?.message?.[0]?.type === "FILE" ?
                "📎 File" :
                `📷 ${room?.message?.[0]?.type.charAt(0).toUpperCase() + room?.message?.[0]?.type.slice(1).toLowerCase()}`
            }
          </p>)
          }
        </div>
        <p className="text-gray-400 text-xs">{formatDate(room?.lastMessageAt)}</p>
      </div>
    </div>
  )
}