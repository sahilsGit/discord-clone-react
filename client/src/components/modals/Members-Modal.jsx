import React from "react";
import { useModal } from "@/hooks/useModals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import useServer from "@/hooks/useServer";
import MembersWrapper from "../channel/sidebar/dropdownMenu/modal/membersWrapper";

const MembersModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "members";
  const server = useServer("serverDetails");

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black w-[435px] max-w-[430px] gap-y-3 pt-7 pb-7 pl-4 pr-4">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Manage Members</p>
          {server?.totalMembersCount == 1 ? (
            <DialogDescription className="text-xs text-zinc-500">
              {server?.totalMembersCount} Member
            </DialogDescription>
          ) : (
            <DialogDescription className="text-xs text-zinc-500">
              {server?.totalMembersCount} Members
            </DialogDescription>
          )}
        </div>
        <MembersWrapper />
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
