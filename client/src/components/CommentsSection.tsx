import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { TApiError, TApiRes } from "@/types/helpers";
import { CommentWithReplies, TCommentVote } from "@/types/model";
import { notFound } from "next/navigation";
import ErrorMessage from "./ErrorMessage";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface ICommentsSectionProps {
  postId: number;
}

const CommentsSection = async ({ postId }: ICommentsSectionProps) => {
  const session = await getAuthSession();

  const { data, status } = await serverAxios().get<TApiRes<CommentWithReplies[]>>(`/comment/post/${postId}`);

  if (status === 404) return notFound();

  if (data.error) {
    return <ErrorMessage status={status} message={(data as TApiError).data.message} />;
  }

  const getVoteCountAndCurrVote = (votes: TCommentVote[]) => {
    const voteCount = votes.reduce((prev, curr) => {
      if (curr.type === "UP") return prev + 1;
      if (curr.type === "DOWN") return prev - 1;
      return prev;
    }, 0);
    const currVote = votes.find((vote) => vote.userId === session?.user?.id)?.type;

    return { voteCount, currVote };
  };

  const comments = data.data;

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments.map((comment) => {
          const { voteCount: cmntVoteCount, currVote: cmntVote } = getVoteCountAndCurrVote(comment.votes);

          return (
            <div key={comment.id} className="flex flex-col">
              <div className="mb-2">
                <PostComment comment={comment} initialVoteCount={cmntVoteCount} initialVote={cmntVote} />
              </div>

              {comment.replies.map((reply) => {
                const { voteCount: replyVoteCount, currVote: replyVote } = getVoteCountAndCurrVote(reply.votes);

                return (
                  <div key={reply.id} className="ml-2 py-2 pl-4 border-l-2 border-zinc-200">
                    <PostComment comment={reply} initialVoteCount={replyVoteCount} initialVote={replyVote} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;
