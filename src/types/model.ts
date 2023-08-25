export type GenericObject<T = any> = { [key: string]: T };

export type TVoteType = "UP" | "DOWN";

export type TComment = {
  id: number;
  text: string;
  postId: number;
  authorId: number;
  replyToId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TCommentVote = {
  id: number;
  commentId: number;
  userId: number;
  type: TVoteType;
  createdAt: string;
  updatedAt: string;
};

export type TPost = {
  id: number;
  title: string;
  content: GenericObject;
  subredditId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

export type TSubreddit = {
  id: number;
  name: string;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
};

export type TSubscription = {
  id: number;
  userId: number;
  subredditId: number;
  createdAt: string;
  updatedAt: string;
};

export type TUser = {
  id: number;
  name: string;
  email: string;
  username: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TVote = {
  id: number;
  postId: number;
  userId: number;
  type: TVoteType;
  createdAt: string;
  updatedAt: string;
};
