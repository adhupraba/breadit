import Editor from "@/components/Editor";
import { Button } from "@/components/ui/Button";
import { serverAxios } from "@/lib/server-axios";
import { TSubredditData } from "../types";
import { notFound } from "next/navigation";
import { TApiRes } from "@/types/helpers";

interface IPostCreatePageProps {
  params: { name: string };
}

const PostCreatePage = async ({ params }: IPostCreatePageProps) => {
  const { data, status } = await serverAxios().get<TApiRes<TSubredditData>>(`/api/subreddit/${params.name}`, {
    validateStatus: () => true,
  });

  if ((status >= 400 && status < 600) || data.error) {
    console.error("error response =>", data);
    return notFound();
  }

  const subreddit = data.data;

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap place-items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">Create Post</h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">in r/{params.name}</p>
        </div>
      </div>

      {/* form */}
      <Editor subredditId={subreddit.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="subreddit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default PostCreatePage;
