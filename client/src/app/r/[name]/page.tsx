import MiniCreatePost from "@/components/MiniCreatePost";
import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { notFound } from "next/navigation";
import { TSubredditData } from "./types";
import { TApiError, TApiRes } from "@/types/helpers";
import PostFeed from "@/components/PostFeed";
import ErrorMessage from "@/components/ErrorMessage";

interface ISubredditPageProps {
  params: { name: string };
}

const SubredditPage = async ({ params: { name } }: ISubredditPageProps) => {
  const session = await getAuthSession();
  const { data, status } = await serverAxios().get<TApiRes<TSubredditData>>(`/subreddit/${name}`);

  if (status === 404) return notFound();

  if (data.error) {
    return <ErrorMessage status={status} message={(data as TApiError).data.message} />;
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
