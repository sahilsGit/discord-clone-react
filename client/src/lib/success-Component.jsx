import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

const SuccessComponent = ({
  success,
  setSuccess,
  successHeading = "Alright!",
}) => {
  console.log(success.message);
  return (
    <Dialog
      open={success?.message?.length}
      onOpenChange={() => setSuccess({ status: "", message: "" })}
    >
      <DialogContent className="max-w-[500px] py-6 dark:bg-zinc-700 pb-0 pl-0 pr-0">
        <DialogHeader className="pl-6 pr-6 rounded-sm">
          <DialogTitle className="mb-1">{successHeading}</DialogTitle>
          <DialogDescription className="text-zinc-500">
            {success?.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="dark:bg-zinc-800/40 bg-gray-100 px-6 py-4">
          <Button
            className="min-w-[100px]"
            type="button"
            variant="primary"
            onClick={() => setSuccess({ status: "", message: "" })}
          >
            Okay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessComponent;
