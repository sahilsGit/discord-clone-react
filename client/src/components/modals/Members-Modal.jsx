import React from "react";
import { useModal } from "@/hooks/useModals";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import MembersWrapper from "../server/sidebar/dropdownMenu/member/memberWrapper";

const MembersModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "members";

  let activeServer;

  if (isModalOpen) {
    activeServer = data.activeServer;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black w-[435px] max-w-[430px] gap-y-3 pt-7 pb-7 pl-4 pr-4">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Manage Members</p>
          {activeServer?.totalMembersCount == 1 ? (
            <DialogDescription className="text-xs text-zinc-500">
              {activeServer?.totalMembersCount} Member
            </DialogDescription>
          ) : (
            <DialogDescription className="text-xs text-zinc-500">
              {activeServer?.totalMembersCount} Members
            </DialogDescription>
          )}
        </div>
        <MembersWrapper />
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
