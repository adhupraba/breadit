import { getAuthSession } from "@/lib/auth";
import { DBPost, TVoteType } from "@/types/model";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

interface IPostVoteServerProps {
  postId: number;
  initialPost?: DBPost | null;
  getData?: () => Promise<DBPost | null>;
}

const PostVoteServer = async ({ postId, initialPost, getData }: IPostVoteServerProps) => {
  const session = await getAuthSession();

  let _voteCount = 0;
  let _currVote: TVoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();

    if (!post) return notFound();

    _voteCount = post.votes.reduce((prev, curr) => {
      if (curr.type === "UP") return prev + 1;
      if (curr.type === "DOWN") return prev - 1;
      return prev;
    }, 0);

    _currVote = post.votes.find((vote) => vote.userId === session?.user?.id)?.type;
  } else {
    _voteCount = initialPost!.votes.reduce((prev, curr) => {
      if (curr.type === "UP") return prev + 1;
      if (curr.type === "DOWN") return prev - 1;
      return prev;
    }, 0);

    _currVote = initialPost!.votes.find((vote) => vote.userId === session?.user?.id)?.type;
  }

  return <PostVoteClient initialVoteCount={_voteCount} initialVote={_currVote} postId={postId} />;
};

export default PostVoteServer;
