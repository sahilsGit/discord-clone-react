import { Edit, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { ActionTooltip } from "../actionTooltip";
import { UserAvatar } from "../userAvatar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import useAuth from "@/hooks/useAuth";
import { update } from "@/services/api-service";
import { handleError, handleResponse } from "@/lib/response-handler";
import { useModal } from "@/hooks/useModals";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

const MessageItem = ({
  message,
  myDetails,
  sender,
  apiRoute,
  isEditing,
  setIsEditing,
  timeStamp,
}) => {
  // const [isEditing, setIsEditing] = useState(false);
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const { onOpen } = useModal();

  useEffect(() => {
    const pressEsc = (e) => {
      if (e.key === "Escape" && e.ctrlKey) {
        e.preventDefault();
        setIsEditing([false, ""]);
      }
    };

    document.addEventListener("keydown", pressEsc);

    return () => document.removeEventListener("keydown", pressEsc);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: message.content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    const updatedData = { content: values.content };

    try {
      const response = await update(
        `${apiRoute}/update/${message._id}/${myDetails._id}`,
        updatedData,
        access_token
      );

      await handleResponse(response, authDispatch);
      form.reset();
      setIsEditing([false], "");
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    form.reset({
      content: message.content,
    });
  }, [message.content]);

  const isAdmin = sender?.role === "ADMIN";
  const isModerator = sender?.role === "MODERATOR";
  const isOwner = sender?._id === myDetails._id;
  const canDeleteMessage =
    !message.deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !message.deleted && isOwner;

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div className="cursor-pointer drop-shadow-md transition">
          <UserAvatar subject={sender?.profile} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm hover:underline cursor-pointer">
                {sender.profile.name}
              </p>
              {sender?.role && (
                <ActionTooltip label={sender?.role}>
                  {roleIconMap[sender.role]}
                </ActionTooltip>
              )}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timeStamp}
            </span>
          </div>

          {!isEditing[1] !== message._id && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                message.deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {message.content}
              {message.updatedAt !== message.createdAt && !message.deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {isEditing[0] && isEditing[1] === message._id && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press enter to save, or ctrl + escape to cancel
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && !isEditing[0] && isEditing[1] !== message._id && (
        <div className="hidden group-hover:flex absolute items-center gap-x-2 p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing([true, message._id])}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  url: `${apiRoute}/delete/${message._id}/${myDetails._id}`,
                  sender: sender,
                  message: message,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
