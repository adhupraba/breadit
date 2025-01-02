import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/constants";
import { serverAxios } from "@/lib/server-axios";
import { TApiError, TApiRes } from "@/types/helpers";
import { ExtendedPost } from "@/types/model";
import PostFeed from "./PostFeed";
import ErrorMessage from "./ErrorMessage";

interface IGeneralFeedProps {}

const GeneralFeed = async () => {
  const { data, status } = await serverAxios().get<TApiRes<ExtendedPost[]>>(
    `/post/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=1`
  );

  if (data.error) {
    return <ErrorMessage status={status} message={(data as TApiError).data.message} />;
  }

  return <PostFeed initialPosts={data.data} />;
};

export default GeneralFeed;
