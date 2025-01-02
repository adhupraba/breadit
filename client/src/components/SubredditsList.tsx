"use client";

import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/constants";
import { webAxios } from "@/lib/web-axios";
import { TApiRes } from "@/types/helpers";
import { SubredditListItem } from "@/types/model";
import { useIntersection, usePrevious } from "@mantine/hooks";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FC, useEffect, useRef, useState } from "react";
import SubredditCard from "./SubredditCard";
import { useSearchParams } from "next/navigation";

interface ISubredditsList {
  initialSubreddits: SubredditListItem[];
}

const queryKey = ["subreddits-infinite-query"];

const SubredditsList: FC<ISubredditsList> = ({ initialSubreddits }) => {
  const searchParams = useSearchParams();
  const [createdBy, setCreatedBy] = useState(searchParams.get("createdBy"));
  const queryClient = useQueryClient();
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({ root: lastPostRef.current, threshold: 1 });
  const prevCreatedBy = usePrevious(createdBy);

  const { data: session } = useSession();

  const { data, fetchNextPage, refetch } = useInfiniteQuery(
    queryKey,
    async ({ pageParam = 1 }) => {
      const cq = searchParams.get("createdBy");
      console.log("infinite query page param =>", pageParam, cq);

      const q = cq ? `&createdBy=${cq}` : "";
      const url = `/subreddit/list?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}${q}`;

      const { data: axiosData } = await webAxios.get<TApiRes<SubredditListItem[]>>(url);
      return axiosData.data as SubredditListItem[];
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (!allPages.at(-1)?.length) return undefined;

        return allPages.length + 1;
      },
      initialData: { pages: [initialSubreddits], pageParams: [1] },
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    setCreatedBy(searchParams.get("createdBy"));
  }, [searchParams]);

  useEffect(() => {
    if (prevCreatedBy === undefined || prevCreatedBy === createdBy) return;

    queryClient.setQueryData(queryKey, { pages: [initialSubreddits], pageParams: [1] });
    refetch({ queryKey, refetchPage: () => true });
  }, [prevCreatedBy, createdBy, initialSubreddits, queryClient]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const subreddits = data?.pages.flatMap((page) => page) ?? initialSubreddits;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {subreddits.map((item, idx) => {
        if (idx === subreddits.length - 1) {
          return (
            <div key={idx} ref={ref}>
              <SubredditCard subredditItem={item} isCreator={item.subreddit.creatorId === session?.user?.id} />
            </div>
          );
        }

        return (
          <SubredditCard key={idx} subredditItem={item} isCreator={item.subreddit.creatorId === session?.user?.id} />
        );
      })}
    </div>
  );
};

export default SubredditsList;
