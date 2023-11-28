// imports
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModals";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/hooks/useOrigin";
import { useState } from "react";

// Main component for serving the server creation dialog box
const InviteModal = () => {
  const origin = useOrigin();

  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "invite";
  const inviteUrl = `${origin}/invite/${data.inviteCode}`;

  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  // Scadcn UI's Dialog box
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white text-black w-[435px] max-w-[430px] gap-3 pt-2 pb-4 pl-4 pr-4">
        <p className="text-md font-semibold">Invite Friends</p>
        <div className="flex flex-col gap-[10px] w-full">
          <p className="text-xs text-zinc-500 dark:text-secondary/70">
            Share this link with others to grant access to this server
          </p>
          <div className="flex h-[40px]">
            <Input
              className="pl-[8px] pr-[4px] bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 h-full rounded-l-sm rounded-r-none rounded-l-sm rounded-r-none"
              value={inviteUrl}
            />
            <div className="group flex p-1 bg-zinc-300/50 rounded-r-sm">
              {copied ? (
                <Button
                  className="bg-emerald-600 text-white text-xs m-0 w-full h-full rounded-[2px] group-hover:bg-emerald-600"
                  onClick={onCopy}
                >
                  Cop..
                </Button>
              ) : (
                <Button
                  className="bg-indigo-500 text-white text-xs m-0 w-full h-full rounded-[2px] group-hover:bg-indigo-600"
                  onClick={onCopy}
                >
                  Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
