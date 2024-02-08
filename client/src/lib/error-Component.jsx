import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { memo } from "react";
import { useNavigate } from "react-router-dom";

const ErrorComponent = memo(({ apiError, resetError }) => {
  const navigate = useNavigate();

  const navigationMap = {
    toHomepage: () => navigate("/"),
    toLoginPage: () => navigate("/login"),
    refresh: () => window.location.reload(),
  };

  const onAction = () => {
    if (resetError) resetError();

    if (apiError?.action) {
      // Check if string action is provided
      if (typeof apiError.action === "string") {
        const action = apiError?.action;
        navigationMap[action]();
      }
      // check if a function action is provided
      else if (typeof apiError.action === "function") {
        apiError.action();
      }
    }
  };

  return (
    <Dialog open={apiError?.message} onOpenChange={onAction}>
      <DialogContent className="max-w-[500px] py-6 dark:bg-zinc-700 pb-0 pl-0 pr-0">
        <DialogHeader className="pl-6 pr-6 rounded-sm">
          <DialogTitle className="mb-1 ">{apiError?.heading}</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            {apiError?.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="dark:bg-zinc-800/40 bg-gray-100 px-6 py-4">
          <Button
            className="min-w-[100px]"
            type="button"
            variant="primary"
            onClick={onAction}
          >
            Okay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ErrorComponent;
