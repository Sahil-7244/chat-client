export const TypingMessageBubble = () => {
  return (
    <div className="max-w-[50%] h-[30px] w-[50px] border border-[#ccc] rounded-[15px] rounded-tl-[5px] bg-green-950/85 flex justify-center items-center gap-1"
    >
      <div
        className="h-[7px] w-[7px] bg-[#ccc] border border-[#ccc] rounded-full typingAnimation"
      ></div>
      <div
        className="h-[7px] w-[7px] bg-[#ccc] border border-[#ccc] rounded-full typingAnimation"
      ></div>
      <div
        className="h-[7px] w-[7px] bg-[#ccc] border border-[#ccc] rounded-full typingAnimation"
      ></div>
    </div>
  );
};