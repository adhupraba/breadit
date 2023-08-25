"use client";
import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { webAxios } from "@/lib/web-axios";
import { TSubscription } from "@/types/model";
import { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ISubscribeLeaveToggleProps {
  subredditId: number;
  subredditName: string;
  isSubscribed: boolean;
}

type SubscribeToSubredditPayload = { subredditId: number };

const SubscribeLeaveToggle: FC<ISubscribeLeaveToggleProps> = ({ subredditId, subredditName, isSubscribed }) => {
  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = { subredditId };
      const { data } = await webAxios.post(`/api/subscription/subscribe`, payload);
      return data as boolean;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        if (err.response?.status === 409) {
          return toast({
            title: "Already subscribed.",
            description: "You are already subscribed to this subreddit",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was a problem.",
        description: "Something went wrong please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // refresh page without losing state
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed",
        description: `You are now subscribed to ${subredditName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = { subredditId };
      const { data } = await webAxios.post(`/api/subscription/unsubscribe`, payload);
      return data as boolean;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        if (err.response?.status === 409) {
          return toast({
            title: "Unable to unsubscribe.",
            description: "You have to be subscribed inorder to unsubscribe.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was a problem.",
        description: "Something went wrong please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // refresh page without losing state
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed",
        description: `You are now unsubscribed from ${subredditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button className="w-full mt-1 mb-4" isLoading={isUnsubLoading} onClick={() => unsubscribe()}>
      Leave community
    </Button>
  ) : (
    <Button className="w-full mt-1 mb-4" isLoading={isSubLoading} onClick={() => subscribe()}>
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
