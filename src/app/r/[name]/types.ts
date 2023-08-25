import { TComment, TPost, TSubreddit, TUser, TVote } from "@/types/model";

export type TSubredditData = TSubreddit & {
  memberCount: number;
  posts: TPost & {
    author: TUser;
    votes: TVote[];
    comments: TComment[];
  };
};
