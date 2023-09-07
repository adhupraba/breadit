"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/Form";
import { UserData } from "@/types/next-auth";
import { Input } from "./ui/Input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Label } from "./ui/Label";
import { useMutation } from "@tanstack/react-query";
import { webAxios } from "@/lib/web-axios";
import { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface IUsernameFormProps {
  user: UserData;
}

const formSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username must be characters between 2 and 33 characters" }),
});

type FormSchema = z.infer<typeof formSchema>;

const UsernameForm: FC<IUsernameFormProps> = ({ user }) => {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
    },
  });

  const { mutate: updateUsername } = useMutation({
    mutationFn: async (payload: FormSchema) => {
      const { data } = await webAxios.patch("/api/auth/username", payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please choose a different username.",
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
      toast({
        description: "Your username has been updated.",
      });

      router.refresh();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(({ username }) => updateUsername({ username }))}>
        <Card>
          <CardHeader>
            <CardTitle>Your username</CardTitle>
            <CardDescription>Please enter a display name you are comfortable with.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="relative grid gap-1">
              <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
                <span className="text-sm text-zinc-400">u/</span>
              </div>

              <Label className="sr-only" htmlFor="username">
                Username
              </Label>

              <FormField
                control={form.control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="username"
                        className={cn("pl-6 w-[400px]", fieldState.error ? "ring-2 ring-red-300 ring-offset-2" : "")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg">
              Update username
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default UsernameForm;
