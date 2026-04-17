export const ChatRoomSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <div className="p-4 border-b border-gray-300 animate-pulse" key={index}>
          <div className="h-6 bg-gray-500 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-500 rounded w-1/2"></div>
        </div>
      ))}
    </>
  );
}