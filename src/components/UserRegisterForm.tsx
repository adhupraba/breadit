"use client";
import { FC, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/Form";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { webAxios } from "@/lib/web-axios";

interface IUserAuthFormProps {}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be atleast 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(4, { message: "Password must be atleast 4 characters." }),
});

type FormSchema = z.infer<typeof formSchema>;

const UserRegisterForm: FC<IUserAuthFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signup = async (values: FormSchema) => {
    setIsLoading(true);

    try {
      await webAxios.post("/api/auth/sign-up", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      await signIn("credentials", { email: values.email, password: values.password });
    } catch (err) {
      // toast notification
      toast({
        title: "There was a problem.",
        description: "There was an error logging in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(signup)} className="space-y-3 py-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  placeholder="name"
                  className={cn(fieldState.error ? "ring-2 ring-red-300 ring-offset-2" : "")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email"
                  className={cn(fieldState.error ? "ring-2 ring-red-300 ring-offset-2" : "")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="password"
                  className={cn(fieldState.error ? "ring-2 ring-red-300 ring-offset-2" : "")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-left" />
            </FormItem>
          )}
        />
        <Button type="submit" isLoading={isLoading} size="lg" className="w-full" disabled={isLoading}>
          Sign Up
        </Button>
      </form>
    </Form>
  );
};

export default UserRegisterForm;
