import MiniCreatePost from "@/components/MiniCreatePost";
import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { AxiosError } from "axios";
import { notFound } from "next/navigation";
import { TSubredditData } from "./types";
import { serverEnv } from "@/constants";

interface ISubredditPageProps {
  params: { name: string };
}

const SubredditPage = async ({ params: { name } }: ISubredditPageProps) => {
  const session = await getAuthSession();
  const { data: subreddit, status } = await serverAxios().get<TSubredditData>(`/api/subreddit/${name}`, {
    validateStatus: () => true,
  });

  if ((status >= 400 && status < 600) || !subreddit.id) {
    console.log("error response =>", subreddit);
    return notFound();
  }

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">r/{subreddit.name}</h1>
      <MiniCreatePost session={session} />

      {/* todo: show posts in user feed */}
    </>
  );
};

export default SubredditPage;
