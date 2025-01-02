import { ExtendedPost, TSubreddit } from "@/types/model";

export type TSubredditData = TSubreddit & {
  memberCount: number;
  posts: ExtendedPost[];
};
