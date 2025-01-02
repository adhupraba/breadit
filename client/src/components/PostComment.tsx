"use client";
import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { CommentWithVotesAndAuthor, TVoteType } from "@/types/model";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreateComment from "./CreateComment";

interface IPostCommentProps {
  comment: CommentWithVotesAndAuthor;
  initialVoteCount: number;
  initialVote?: TVoteType | null;
}

const PostComment: FC<IPostCommentProps> = ({ comment, initialVoteCount, initialVote }) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [isReplying, setIsReplying] = useState(false);

  const commentRef = useRef<HTMLDivElement>(null);

  const handleReplyBtnClick = () => {
    if (!session) return router.push("/sign-in");

    setIsReplying((prev) => !prev);
  };

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar className="h-6 w-6" user={{ image: comment.author.image, name: comment.author.name }} />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">u/{comment.author.username}</p>
          <p className="max-h-40 truncate text-xs text-zinc-500">{formatTimeToNow(new Date(comment.createdAt))}</p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes commentId={comment.id} initialVoteCount={initialVoteCount} initialVote={initialVote} />

        <Button variant="ghost" size="xs" onClick={handleReplyBtnClick}>
          <MessageSquare className="h-4 w-4 mr-1.5" /> Reply
        </Button>

        {isReplying ? (
          <CreateComment
            postId={comment.postId}
            replyToId={comment.replyToId ?? comment.id}
            replyCancelHandler={() => setIsReplying(false)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
