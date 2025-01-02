import ErrorMessage from "@/components/ErrorMessage";
import SubredditsList from "@/components/SubredditsList";
import { buttonVariants } from "@/components/ui/Button";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/constants";
import { toast } from "@/hooks/use-toast";
import { getAuthSession } from "@/lib/auth";
import { serverAxios } from "@/lib/server-axios";
import { TApiError, TApiRes } from "@/types/helpers";
import { SubredditListItem } from "@/types/model";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Fragment } from "react";

interface ICommunitiesPageProps {
  searchParams: { createdBy?: string };
}

const CommunitiesPage = async ({ searchParams: { createdBy } }: ICommunitiesPageProps) => {
  const session = await getAuthSession();

  const createdByQ = createdBy ? `&createdBy=${createdBy}` : "";

  let initialSubreddits: SubredditListItem[] = [];

  if ((session && createdBy === "self") || !createdBy) {
    const { data, status } = await serverAxios().get<TApiRes<SubredditListItem[]>>(
      `/subreddit/list?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=1${createdByQ}`
    );

    if (data.error) {
      return <ErrorMessage status={status} message={(data as TApiError).data.message} />;
    }

    initialSubreddits = data.data;
  }

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-3xl md:text-4xl">
          {createdBy === "self" ? "My Communities" : "All Communities"}
        </h1>

        {createdBy === "self" ? (
          <Link href="/r" className={buttonVariants({ variant: "subtle" })}>
            View all communities
          </Link>
        ) : (
          <Link href="/r?createdBy=self" className={buttonVariants({ variant: "subtle" })}>
            View my communities
          </Link>
        )}
      </div>

      {!session && createdBy === "self" ? (
        <div className="rounded-md bg-white shadow p-6 grid place-items-center">
          <ErrorMessage status={401} message="Please login to see your communities" />
        </div>
      ) : (
        <SubredditsList initialSubreddits={initialSubreddits} />
      )}
    </Fragment>
  );
};

export default CommunitiesPage;
