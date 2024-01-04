import { useModal } from "@/hooks/useModals";
import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { UserAvatar } from "../userAvatar";
import useAuth from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scrollArea";
import { Pencil } from "lucide-react";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SettingsModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "settings";
  const username = useAuth("user");

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "Server name is required!",
    }),
    username: z.string(),
  });

  // react-hook-from setup with zod resolver
  const form = useForm({
    // resolver: zodResolver(formSchema),
    // defaultValues: {
    //   name: "",
    // },
  });

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-main07 text-black p-0 w-screen h-screen">
        <ScrollArea>
          <div className="flex">
            <div className="flex-1 grow"></div>
            <div className="flex-3 grow flex flex-col py-16 gap-y-4">
              <p className="text-xl font-semibold text-white">My Account</p>
              <div className="relative h-[100px] w-full bg-indigo-500 flex flex-col rounded-lg">
                <div className="absolute top-10 left-4">
                  <UserAvatar
                    subject={{ name: data.name, image: data.image }}
                    className="border-8 border-main07 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4"
                  />
                  <div className="flex items-center justify-center absolute top-[68px] left-[78px] rounded-full h-[40px] text-white border-8 border-main07 bg-main06 hover:bg-main05 w-[40px] transition">
                    <Pencil className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <Form {...form}>
                <form
                  className="flex mt-8 rounded-b-lg w-full p-4 gap-y-8"
                  action=""
                >
                  <div className="flex-1 flex flex-col p-2">
                    <div className="flex flex-col gap-y-3">
                      <div className="flex flex-col gap-y-2">
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Display Name
                        </p>
                        <input
                          type="text"
                          className="py-3 rounded-sm px-2 bg-main10 text-white text-sm"
                          value={data.name}
                        />
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Username
                        </p>
                        <input
                          type="text"
                          className="py-3 rounded-sm px-2 bg-main10 text-white text-sm"
                          value={username}
                        />
                      </div>
                    </div>
                    <Separator className="my-7 bg-main06 w-full h-[1px]" />
                    <div className="flex flex-col gap-y-2">
                      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                        Email
                      </p>
                      <input
                        type="text"
                        className="py-3 rounded-sm px-2 bg-main10 text-white text-sm"
                        value={data.name}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col p-2 flex-1 gap-y-2">
                    <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                      About Me
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      You can use markdowns and links if you'd like.
                    </p>
                    <div className="bg-main10 w-[300px] px-3 py-3 text-white h-[220px] w-[470px] rounded-sm break-all">
                      <textarea
                        className="w-full h-full resize-none bg-main10"
                        name=""
                        id=""
                        cols="30"
                        rows="10"
                      ></textarea>
                    </div>
                  </div>
                </form>
              </Form>

              <Separator className="my-7 bg-main06 w-full h-[1px]" />
              <div className="flex flex-col gap-y-6">
                <p className="text-xl font-semibold text-white">
                  Password and Session
                </p>
                <div>
                  <button className="text-white bg-indigo-500 rounded-sm px-3 text-sm h-[30px]">
                    Change Password
                  </button>
                </div>
                <div className="flex flex-col gap-y-3">
                  <p className="text-sm text-zinc-400">
                    Logged in on a public device? You can suspend all the active
                    sessions by pressing <br></br>the button below. This will
                    log you out of all the devices including this one.
                  </p>
                  <button className="max-w-fit text-white bg-indigo-500 rounded-sm px-3 text-sm h-[30px]">
                    Log Out all know devices
                  </button>
                </div>
              </div>
              <Separator className="my-7 bg-main06 w-full h-[1px]" />
              <div className="flex flex-col gap-y-3">
                <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                  Account Removal
                </p>
                <p className="text-sm text-zinc-400">
                  This will immediately log you out of your account and remove
                  your access completely.
                </p>
                <button className="max-w-fit text-white bg-red-600 rounded-sm px-3 text-sm h-[30px]">
                  Delete Account
                </button>
              </div>
            </div>
            <div className="flex-1"></div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
