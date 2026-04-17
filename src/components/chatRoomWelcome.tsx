import { MessageCircle } from "lucide-react"
import { Strings } from "../constant/string"

export const ChatRoomWelcome = ({ chatRoomId }: { chatRoomId: any }) => {
  return (<div className={`relative h-full flex items-center justify-center flex-1 p-3 bg-[url('https://img.freepik.com/premium-vector/dialogue-balloon-chat-bubble-icons-seamless-pattern-textile-pattern-wrapping-paper-linear-vector-print-fabric-seamless-background-wallpaper-backdrop-with-speak-bubbles-chat-message-frame_8071-58894.jpg?semt=ais_hybrid&w=740&q=80')] bg-center bg-no-repeat bg-cover ${!chatRoomId && "hidden lg:block"}`}>
    <div className="absolute inset-0 bg-zinc-200/95 z-0"></div>
    <div className="relative z-1 text-center text-gray-700 flex flex-col items-center gap-4">
      <MessageCircle className="w-20 h-20 text-green-950" />
      <p className="text-2xl">{Strings?.WELCOME_TO_CHATROOM}</p>
    </div>
  </div>)
}