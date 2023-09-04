import MiniCreatePost from "@/components/MiniCreatePost";
import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { notFound } from "next/navigation";
import { TSubredditData } from "./types";
import { TApiRes } from "@/types/helpers";
import PostFeed from "@/components/PostFeed";

interface ISubredditPageProps {
  params: { name: string };
}

const SubredditPage = async ({ params: { name } }: ISubredditPageProps) => {
  const session = await getAuthSession();
  const { data, status } = await serverAxios().get<TApiRes<TSubredditData>>(`/api/subreddit/${name}`, {
    validateStatus: () => true,
  });

  if ((status >= 400 && status < 600) || data.error) {
    console.log("error response =>", data);
    return notFound();
  }

  const subreddit = data.data;

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">r/{subreddit.name}</h1>
      <MiniCreatePost session={session} />

      {/* todo: show posts in user feed */}
      <PostFeed initialPosts={subreddit.posts} subredditName={name} />
    </>
  );
};

export default SubredditPage;
