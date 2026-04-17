// export const APIMAINURL = "https://8j8gfz7b-8000.inc1.devtunnels.ms/Chat/v1";
export const APIMAINURL = "http://localhost:8001/Chat/v1";

// export const APIMAINURLFORSOCKET = "https://8j8gfz7b-8000.inc1.devtunnels.ms";
export const APIMAINURLFORSOCKET = "http://localhost:8001";

export const endpoints = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GET_CHATROOMSLIST: '/chatroom',
  MESSAGES:'/messages',
  DELETE_MESSAGES:'/messages-delete',
  SEARCH_USERS:'/search-users',
  SIGNED_URL: '/signed-url',
  CLOUDINARY_DATA: '/cloudinary-data',
  CLOUDINARY_DATA_MANY: '/cloudinary-data-many',
  MARK_SEEN: '/mark-seen'
}