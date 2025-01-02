"use client";

import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/Command";
import { useCallback, useEffect, useRef, useState } from "react";
import { webAxios } from "@/lib/web-axios";
import { TApiRes } from "@/types/helpers";
import { SearchResult } from "@/types/model";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface ISearchBarProps {}

const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [input, setInput] = useState("");
  const commandRef = useRef<HTMLDivElement>(null);

  const {
    data: searchResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["search-query"],
    enabled: false,
    queryFn: async () => {
      if (!input) return [];

      const { data } = await webAxios.get<TApiRes<SearchResult[]>>(`/search?q=${input}`);

      return data.data as SearchResult[];
    },
  });

  const request = debounce(() => {
    refetch();
  }, 600);

  const debounceReq = useCallback(() => {
    request();
  }, []);

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command ref={commandRef} className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities..."
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceReq();
        }}
      />

      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
          {(searchResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {searchResults?.map((result, idx) => (
                <CommandItem
                  key={idx}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  value={result.subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${result.subreddit.name}`}>r/{result.subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
