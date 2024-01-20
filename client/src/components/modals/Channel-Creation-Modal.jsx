// imports
import React, { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { post } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import { useModal } from "@/hooks/useModals";
import useServer from "@/hooks/useServer";

// zod form schema for validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Channel name is required!",
    })
    .refine((name) => name != "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"], {
    message: "Channel type must be provided",
  }),
});

// Main component for serving the server creation dialog box
const ChannelCreationModal = () => {
  // For conditionally rendering the dialog
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "createChannel";

  let serverId;
  let channelType;

  if (isModalOpen) {
    serverId = data.activeServer.id;
    channelType = data.channelType;
  }

  // For setting server image
  const authDispatch = useAuth("dispatch"); //Auth-Context if response brings in a new access_token
  const access_token = useAuth("token"); // For authorization

  // react-hook-from setup with zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (channelType) {
      form.setValue("type", channelType);
    }
  }, [channelType]);

  const isLoading = form.formState.isSubmitting; // For disabling buttons on submission

  const onSubmit = async (data) => {
    // console.log("dataaaaa", data);
    const dataToSend = {
      name: data.name,
      type: data.type,
    };
    try {
      const response = await post(
        `/channels/create/${serverId}`,
        JSON.stringify(dataToSend),
        access_token
      );
      await handleResponse(response, authDispatch);
    } catch (err) {
      handleError(err, authDispatch);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Scadcn UI's Dialog box
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 max-w-sm overflow-hidden">
        <DialogHeader className="pt-6 px-7 space-y-2">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 px-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Channel Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter channel name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Type</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="bg-zinc-300/50 border-0
                            focus:ring-0 text-black ring-offset-0
                            focus-ring-offset-0 outline-none"
                          >
                            <SelectValue placeholder="Select a channel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="AUDIO">Audio</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-left text-zinc-500 text-xxs">
                  By creating a server, you agree to our Community <br></br>{" "}
                  Guidelines
                </div>
              </div>
            </div>
            <div className="flex justify-between bg-gray-100 px-5 py-3.5">
              <Button
                size="custom"
                className="bg-gray-100 hover:bg-gray-100 p-0"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="custom"
                variant="primary"
                disabled={isLoading}
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelCreationModal;
