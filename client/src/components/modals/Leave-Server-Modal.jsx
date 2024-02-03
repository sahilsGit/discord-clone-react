import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModals";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { leaveServer } from "@/lib/api";

// Main component for serving the server creation dialog box
const LeaveServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "leaveServer";
  const [isLoading, setIsLoading] = useState(false);
  const authDispatch = useAuth("dispatch");

  let activeServer;

  if (isModalOpen) {
    activeServer = data.activeServer;
  }

  const onClick = async () => {
    try {
      setIsLoading(true);

      await leaveServer({
        serverId: activeServer.id,
        memberId: activeServer.myMembership._id,
        authDispatch: authDispatch,
      });

      window.location.href = "/";
    } catch (error) {
      // ingulf
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col bg-white rounded-lg text-black max-w-[400px] pt-4 pb-0 pl-0 pr-0">
        <div className="flex flex-col gap-2 pt-4 pb-0 pl-4 pr-4">
          <p className="text-md font-semibold">Leave Server</p>
          <div className="flex flex-col gap-[10px] w-full">
            <p className="text-xs text-zinc-500 dark:text-secondary/70">
              Are you sure you want to leave{" "}
              <span className="font-semibold text-indigo-500">
                {activeServer?.name}
              </span>
            </p>
          </div>
        </div>
        <DialogFooter className="w-full rounded-lg">
          <div className="flex justify-between rounded-lg w-full bg-gray-100 px-5 py-3.5">
            <Button
              size="custom"
              className="bg-gray-100 hover:bg-gray-100 p-0"
              disabled={isLoading}
              type="button"
              onClick={onClose}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="custom"
              variant="primary"
              onClick={onClick}
              disabled={isLoading}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveServerModal;
