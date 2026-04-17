import { useState } from "react";
import { ChatRoom } from "../components/chatRoom";
import { ChatRoomList } from "../components/chatRoomList";
import { ChatRoomWelcome } from "../components/chatRoomWelcome";
import { isOnlineUpdateSocket, useSocketSetup } from "../config/socketFunctions";
import { Strings } from "../constant/string";

const Home = (user: any) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [chatRoomId, setChatRoomId] = useState(localStorage.getItem("chatRoomId") || null);
  const [hasMoremessages, setHasMoreMessages] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState('');


  //socket setup
  useSocketSetup(user?.user?.id);
  isOnlineUpdateSocket(chatRoomId ?? '', setOnlineUsers);
  return (
    <div className=" h-screen flex flex-col">
      <div className={`relative bg-green-900 text-white p-3 text-center font-bold text-2xl`}>
        <p>{Strings.APP_NAME}</p>
        <span className="lg:absolute lg:bottom-2 lg:left-4 text-sm">{Strings.WELCOME}, {user?.user?.firstName} {user?.user?.lastName}</span>
        <button className="absolute right-4 top-3 bg-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-700 active:bg-red-800" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("chatRoomId");
          window.location.reload();
        }}>{Strings.LOGOUT}</button>
      </div>
      <div className="bg-zinc-200 flex flex-1 min-h-0">
        <ChatRoomList chatRoomId={chatRoomId} setChatRoomId={setChatRoomId} setNextCursor={setNextCursor} setHasMoreMessages={setHasMoreMessages} lastMessage={lastMessage} setOpen={setOpen} onlineUsers={onlineUsers} />
        {chatRoomId ? (
          <ChatRoom chatRoomId={chatRoomId} setChatRoomId={setChatRoomId} userId={user?.user?.id} nextCursor={nextCursor} setNextCursor={setNextCursor} hasMoremessages={hasMoremessages} setHasMoreMessages={setHasMoreMessages} setLastMessage={setLastMessage} onlineUsers={onlineUsers} open={open} setOpen={setOpen} />
        ) :
          (<ChatRoomWelcome chatRoomId={chatRoomId} />)
        }
      </div>
    </div>
  );
}
export default Home;