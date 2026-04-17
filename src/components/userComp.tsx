import { Loader2 } from "lucide-react";
import { PROFILEIMG } from "../constant/pagepaths";

export const FriendComp = ({friend, setOpen, createRoom, roomLoading}:any) => {
  return (
    <div key={friend.id} className="p-4 h-[70px] border-b border-gray-300 flex items-center gap-3 cursor-pointer hover:bg-slate-700" onClick={() => {
      setOpen('');
      createRoom(friend.id);
    }}>
      <div className="h-10 w-10 bg-gray-500 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={friend?.profileImage || PROFILEIMG}
          alt="Avatar"
          onError={(e) => (e.currentTarget.src = PROFILEIMG)}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate max-w-[80%]">{`${friend?.firstName} ${friend?.lastName}`}</p>
          <p className="text-gray-400 text-sm truncate max-w-[80%]">
            {friend?.email}
          </p>
        </div>

      </div>
      <div>
        {roomLoading.includes(friend.id) && <Loader2 className="animate-spin text-gray-400" />}
      </div>
    </div>
  )
}