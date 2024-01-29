import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { remove } from "@/services/api-service";
import { handleResponse } from "@/lib/response-handler";
import { useModal } from "@/hooks/useModals";
import { UserAvatar } from "../userAvatar";

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const access_token = useAuth("token");
  const isModalOpen = isOpen && type === "deleteMessage";
  const { url, sender, message } = data;
  const authDispatch = useAuth("dispatch");

  console.log(data);

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      const response = await remove(`${url}`, access_token);
      await handleResponse(response, authDispatch);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black max-w-[430px] gap-2 pb-0 pl-0 pr-0">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Are you sure you want delete this message? <br />
          </DialogDescription>
        </DialogHeader>
        <div className="shadow-message mx-6 mt-2 rounded-md">
          <div className="relative group flex items-center p-4 w-full">
            <div className="group flex gap-x-2 items-start w-full">
              <div className="cursor-pointer transition">
                <UserAvatar subject={sender?.profile} />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center">
                    <p className="font-semibold text-sm">
                      {sender?.profile?.name}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-700 dark:text-zinc-700">
                    {message?.createdAt}
                  </span>
                </div>
                <p className="text-sm ">{message?.content}</p>
              </div>
            </div>
          </div>
        </div>
        <DialogDescription className="text-zinc-500 px-6 py-3">
          Once you delete this message it's gone forever. Make sure this is what
          you want.
        </DialogDescription>
        <DialogFooter className="flex justify-between bg-gray-100 px-5 py-3.5 rounded-sm">
          <Button
            disabled={isLoading}
            onClick={onClose}
            variant="custom"
            className="bg-gray-100 hover:bg-gray-100 p-0 mr-3"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            className="px-8 bg-red-500 hover:bg-red-700 text-white"
            onClick={onClick}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
