import CommentsSection from "@/components/CommentsSection";
import EditorOutput from "@/components/EditorOutput";
import ErrorMessage from "@/components/ErrorMessage";
import PostVoteServer from "@/components/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { formatTimeToNow } from "@/lib/utils";
import { TApiError, TApiRes } from "@/types/helpers";
import { CachedPost, DBPost, TVoteType } from "@/types/model";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface IPostPageProps {
  params: { postId: string };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type PostResponse = { cachedPost: CachedPost | null; post: DBPost | null };

const PostPage = async ({ params: { postId } }: IPostPageProps) => {
  const { data, status } = await serverAxios().get<TApiRes<PostResponse>>(`/post/${postId}`);

  if (status === 404) return notFound();

  if (data.error) {
    return <ErrorMessage status={status} message={(data as TApiError).data.message} />;
  }

  const { cachedPost, post } = data.data;

  if (!cachedPost && !post) return notFound();

  const getPostData = async (): Promise<DBPost | null> => {
    console.log("making api call to force fetch data....");
    const { data } = await serverAxios().get<TApiRes<PostResponse>>(`/post/${postId}?force=true`);

    if (data.error) {
      return null;
    }

    return data.data.post;
  };

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-ignore server component */}
          <PostVoteServer
            postId={(post?.id ?? cachedPost?.id)!}
            getData={cachedPost?.id ? getPostData : undefined}
            initialPost={post}
          />
        </Suspense>

        <div className="w-full sm:w-0 flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{post?.author.username ?? cachedPost?.authorUsername}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost!.createdAt))}
          </p>

          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">{post?.title ?? cachedPost?.title}</h1>

          <EditorOutput content={post?.content ?? cachedPost?.content} />

          <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin text-zinc-500" />}>
            {/* @ts-ignore server component */}
            <CommentsSection postId={post?.id ?? cachedPost!.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default PostPage;
