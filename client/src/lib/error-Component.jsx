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

const ErrorComponent = ({ error, setError, errorHeading = "Oops!" }) => {
  return (
    <Dialog
      open={error?.message}
      onOpenChange={() => setError({ status: "", message: "" })}
    >
      <DialogContent className="w-[500px] py-6 bg-zinc-700 pb-0 pl-0 pr-0">
        <DialogHeader className="pl-6 pr-6 rounded-sm">
          <DialogTitle className="mb-1">{errorHeading}</DialogTitle>
          <DialogDescription>{error?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-zinc-800/40 px-6 py-4">
          <Button
            className="min-w-[100px]"
            type="button"
            variant="primary"
            onClick={() => setError({ status: "", message: "" })}
          >
            Okay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorComponent;
