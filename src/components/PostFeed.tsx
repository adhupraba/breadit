"use client";

import { ExtendedPost } from "@/types/model";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/constants";
import { webAxios } from "@/lib/web-axios";
import { TApiRes } from "@/types/helpers";
import { useSession } from "next-auth/react";
import Post from "./Post";

interface IPostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed: FC<IPostFeedProps> = ({ initialPosts, subredditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({ root: lastPostRef.current, threshold: 1 });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const subredditQ = subredditName ? `&subredditName=${subredditName}` : "";
      const url = `/api/post/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}${subredditQ}`;

      const { data } = await webAxios.get<TApiRes<ExtendedPost[]>>(url);
      return data.data as ExtendedPost[];
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (!allPages.at(-1)?.length) return undefined;

        return allPages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, idx) => {
        const voteCount = post.votes.reduce((prev, curr) => {
          if (curr.type === "UP") return prev + 1;
          if (curr.type === "DOWN") return prev - 1;
          return prev;
        }, 0);

        const currVote = post.votes.find((vote) => vote.userId === session?.user?.id);

        if (idx === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                subredditName={post.subreddit.name}
                post={post}
                commentCount={post.comments.length}
                voteCount={voteCount}
                userVote={currVote?.type}
              />
            </li>
          );
        }

        return (
          <Post
            key={post.id}
            subredditName={post.subreddit.name}
            post={post}
            commentCount={post.comments.length}
            voteCount={voteCount}
            userVote={currVote?.type}
          />
        );
      })}
    </ul>
  );
};

export default PostFeed;
