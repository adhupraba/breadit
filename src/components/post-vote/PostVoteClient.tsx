"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { TVoteType } from "@/types/model";
import { usePrevious } from "@mantine/hooks";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { webAxios } from "@/lib/web-axios";
import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

interface IPostVoteClientProps {
  postId: number;
  initialVoteCount: number;
  initialVote?: TVoteType | null;
}

type CreatePostVotePayload = { postId: number; voteType: TVoteType };

const PostVoteClient: FC<IPostVoteClientProps> = ({ postId, initialVoteCount, initialVote }) => {
  const { loginToast } = useCustomToast();

  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [currVote, setCurrVote] = useState(initialVote);
  const prevVote = usePrevious(currVote);

  const { mutate: votePost } = useMutation({
    mutationFn: async (type: TVoteType) => {
      const payload: CreatePostVotePayload = { postId, voteType: type };
      await webAxios.patch("/api/post/vote", payload);
    },
    onError: (err, voteType) => {
      // reset vote count
      if (voteType === "UP") setVoteCount((prev) => prev - 1);
      else setVoteCount((prev) => prev + 1);

      // reset vote icon
      setCurrVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        if (err.response?.status === 404) {
          return toast({
            title: "Post does not exist.",
            description: "Cannot vote since this post does not exist.",
            variant: "destructive",
          });
        }

        if (err.response?.status === 422) {
          return toast({
            title: "Invalid vote.",
            description: "Unable to vote because of incorrect vote type.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was an error.",
        description: "Your vote was not registered, please try again later.",
        variant: "destructive",
      });
    },
    onMutate: (voteType) => {
      if (currVote === voteType) {
        setCurrVote(undefined);

        if (voteType === "UP") setVoteCount((prev) => prev - 1);
        else setVoteCount((prev) => prev + 1);
      } else {
        setCurrVote(voteType);

        if (voteType === "UP") setVoteCount((prev) => prev + (currVote ? 2 : 1));
        else setVoteCount((prev) => prev - (currVote ? 2 : 1));
      }
    },
  });

  useEffect(() => {
    setCurrVote(initialVote);
  }, [initialVote]);

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button size="sm" variant="ghost" aria-label="upvote" onClick={() => votePost("UP")}>
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">{voteCount}</p>

      <Button size="sm" variant="ghost" aria-label="upvote" onClick={() => votePost("DOWN")}>
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
