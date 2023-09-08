import { SubredditListItem } from "@/types/model";
import { UserCheck2 } from "lucide-react";
import { FC, Fragment } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/Tooltip";

interface ISubredditCardProps {
  subredditItem: SubredditListItem;
  isCreator: boolean;
}

const SubredditCard: FC<ISubredditCardProps> = ({ subredditItem, isCreator }) => {
  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4">
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <a
              href={`/r/${subredditItem.subreddit.name}`}
              className="underline text-zinc-900 text-md underline-offset-2"
            >
              r/{subredditItem.subreddit.name}
            </a>
            {isCreator && (
              <Fragment>
                <span className="px-2">•</span>
                <span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <UserCheck2 className="w-5 h-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Creator</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Fragment>
            )}
          </div>

          <p className="mt-3">{subredditItem.subCount} members</p>
          <p>{subredditItem.postCount} posts</p>
        </div>
      </div>
    </div>
  );
};

export default SubredditCard;
