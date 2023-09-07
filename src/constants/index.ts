export const webEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
};

export const serverEnv = {
  apiUrl: process.env.API_URL || "",
};

export const INFINITE_SCROLLING_PAGINATION_RESULTS = 2;

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
export const EXPIRY_THRESHOLD = 1000 * 60 * 60 * 24 * 1; // 1 day in milliseconds

// ! testing values
// export const SESSION_MAX_AGE = 30; // 30 seconds
// export const EXPIRY_THRESHOLD = 5000; // 5000 milliseconds
