export const ChatHeaderSkeleton = () => {
  return (
    <div className="sticky top-0 z-20 flex items-center h-[70px] bg-green-950 p-2 gap-3">
      {/* Back icon */}
      <div className="w-7 h-7 bg-green-800 rounded-full animate-pulse" />

      {/* Avatar */}
      <div className="h-12 w-12 bg-green-800 rounded-full animate-pulse" />

      {/* Title + status */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-36 bg-green-800 rounded animate-pulse" />
        <div className="h-3 w-24 bg-green-800/70 rounded animate-pulse" />
      </div>

      {/* Right actions placeholder */}
      <div className="absolute right-4 flex gap-3">
        <div className="w-7 h-7 bg-green-800 rounded-full animate-pulse" />
        <div className="w-7 h-7 bg-green-800 rounded-full animate-pulse" />
      </div>
    </div>
  );
};
