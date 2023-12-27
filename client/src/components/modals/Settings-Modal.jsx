import { useModal } from "@/hooks/useModals";
import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { UserAvatar } from "../userAvatar";
import useAuth from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scrollArea";
import { Pencil } from "lucide-react";

const SettingsModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "settings";
  const username = useAuth("user");

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-main07 text-black p-0 w-screen h-screen rounded-lg">
        <ScrollArea>
          <div className="flex">
            <div className="flex-1 shrink"></div>
            <div className="flex-3 flex flex-col h-screen pt-16 gap-y-4">
              <p className="text-xl font-semibold text-white">My Account</p>
              <div className="relative rounded-md flex bg-indigo-500 h-[440px] flex-col w-[650px]">
                <div className="h-[450px] w-full bg-indigo-500 flex flex-col rounded-md"></div>
                <div className="absolute top-[53px] left-0">
                  <UserAvatar
                    subject={{ name: data.name, image: data.image }}
                    className="border-8 border-main09 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4"
                  />
                  <div className="flex items-center justify-center absolute top-[68px] left-[78px] rounded-full h-[40px] text-white border-8 border-main09 bg-main06 hover:bg-main05 w-[40px] transition">
                    <Pencil className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-col rounded-b-md w-full p-4 gap-y-8 bg-main09">
                  <div className="pl-[108px] flex justify-between items-start">
                    <p className="text-white w-[230px] p-0 m-0 items-center truncate">
                      {data.name}
                    </p>

                    <button className="text-white bg-indigo-500 rounded-sm px-3 text-sm h-[30px]">
                      Edit User Profile
                    </button>
                  </div>
                  <div className="flex flex-col gap-y-3 p-4 bg-main08 rounded-md gap-y-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Display Name
                        </p>
                        <p className="text-white text-sm">{data.name}</p>
                      </div>
                      <button className="text-white px-4 rounded-sm h-[35px] bg-main06">
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Username
                        </p>
                        <p className="text-white text-sm">{username}</p>
                      </div>
                      <button className="text-white px-4 rounded-sm h-[35px] bg-main06">
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Email
                        </p>
                        <p className="text-white text-sm">Name</p>
                      </div>
                      <button className="text-white px-4 rounded-sm h-[35px] bg-main06">
                        Edit
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                          Phone Number
                        </p>
                        <p className="text-white text-sm">
                          You haven't added a phone number yet.
                        </p>
                      </div>
                      <button className="text-white px-4 rounded-sm h-[35px] bg-main06">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-7 bg-main06 w-full h-[1px]" />
              <p className="text-xl font-semibold text-white">
                Password and Session
              </p>
              <div>
                <button className="text-white bg-indigo-500 rounded-sm px-3 text-sm h-[30px]">
                  Change Password
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
