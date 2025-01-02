"use client";

import { FC, useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentCreationRequest } from "@/lib/validators/comment";
import { webAxios } from "@/lib/web-axios";
import { TApiRes } from "@/types/helpers";
import { TComment } from "@/types/model";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ICreateCommentProps {
  postId: number;
  replyToId?: number;
  replyCancelHandler?: () => void;
}

const CreateComment: FC<ICreateCommentProps> = ({ postId, replyToId, replyCancelHandler }) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const [input, setInput] = useState("");

  const { mutate: createComment, isLoading } = useMutation({
    mutationFn: async (payload: CommentCreationRequest) => {
      const { data } = await webAxios.post<TApiRes<TComment>>(`/comment/create`, payload);

      return data.data as TComment;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: "There was a problem.",
        description: "Something went wrong please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      replyCancelHandler?.();
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>

      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />

        <div className="mt-2 flex justify-end gap-2">
          {replyToId ? (
            <Button tabIndex={-1} variant="subtle" onClick={replyCancelHandler}>
              Cancel
            </Button>
          ) : null}
          <Button
            disabled={!input}
            isLoading={isLoading}
            onClick={() => createComment({ postId, text: input, replyToId })}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
