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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Plus, Image } from "lucide-react";
import { v4 } from "uuid";
import { get, post } from "@/services/api-service";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/lib/response-handler";
import { useModal } from "@/hooks/useModals";
import useServer from "@/hooks/useServer";
import { ActionTooltip } from "../actionTooltip";

// zod form schema for validation
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required!",
  }),
});

// Main component for serving the server creation dialog box
const ServerCreationModal = () => {
  // For conditionally rendering the dialog
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "createServer";

  // For setting server image
  const authDispatch = useAuth("dispatch"); //Auth-Context if response brings in a new access_token
  const serverDispatch = useServer("dispatch");

  const [avatarImage, setAvatarImage] = useState(null); // To hold the choosen image before uploading

  const [imagePreview, setImagePreview] = useState(null); // To preview the choosen image
  const access_token = useAuth("token"); // For authorization

  const user = useAuth("user"); // For Server creation

  // react-hook-from setup with zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const isLoading = form.formState.isSubmitting; // For disabling buttons on submission

  // Use effect to display selected-image preview
  useEffect(() => {
    if (avatarImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result); // Set avatar preview
      };
      reader.readAsDataURL(avatarImage);
    } else {
      setImagePreview(null);
    }
  }, [avatarImage]);

  // Function for handling Multer image update | Returns image url on resolution
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", avatarImage);

    // Upload image and save it in designated place
    if (avatarImage) {
      try {
        const response = await post(
          "/assets/uploadFile",
          formData,
          access_token,
          {}
        );

        // Parse the response as JSON
        const data = await handleResponse(
          response,
          authDispatch,
          serverDispatch
        );

        // Access the newFilename property from the parsed JSON
        const { newFilename } = data;

        return newFilename; // For DB storage
      } catch (error) {
        handleError(error, authDispatch);
      }
    } else {
      // Ingulf this error for now
      // throw new Error("Avatar image not found"); Reject the promise if avatarImage is not available
    }
  };

  // Since original input tag for uploading image is hidden, this is used to simulate click
  const handleAvatarClick = () => {
    const fileInput = document.querySelector(".imageField");
    fileInput.click(); // From here onChange takes charge
  };

  const handleDeleteImage = () => {
    setAvatarImage(""); // Reset avatarImage state (Important for X button implementation)
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarImage(file); // Set the AvatarImage state with the choose image
    } else {
      handleDeleteImage(); // call delete image
    }
  };

  const onSubmit = async (data) => {
    const image = await uploadImage(); // Wait for image you get upon resolution

    // Request pre-requisites
    const toBeSent = {
      name: data.name,
      image: image, // Store the name
      inviteCode: v4(),
      username: user, // profileId from global context
    };

    try {
      const response = await post(
        "/servers/create",
        JSON.stringify(toBeSent),
        access_token
      );

      // await handleResponse(response, authDispatch);

      // Now fetching all the servers once again
      const res = await get(`/servers/${user}/getAll`, access_token);
      const data = await handleResponse(res, authDispatch);

      serverDispatch({ type: "SET_SERVERS", payload: data.servers });
      serverDispatch({ type: "SET_ACTIVE_SERVER", payload: data.servers[0] });
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      // ingulf

      console.log(status, message);
    }
    onClose();
    form.reset();
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
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full items-center pt-1">
          {/*Transfer click to <input> tag to initiate the image uploading process*/}
          <ActionTooltip
            label={
              "Uploading images has been disabled till I find a better place to save images!"
            }
            className="text-center max-w-[200px]"
          >
            <Avatar
              className="relative bg-zinc-200 cursor-not-allowed"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={imagePreview} />
              <AvatarFallback className="flex flex-col">
                <Image strokeWidth="2" color="grey" size={24} />
              </AvatarFallback>
            </Avatar>
          </ActionTooltip>
          {/* Conditionally render either X or Plus comp. based on avatarImage's state */}
          {avatarImage ? (
            <button
              className="bg-rose-500 text-white p-1 rounded-full absolute top-100 right-40 shadow-sm cursor-not-allowed"
              onClick={handleDeleteImage}
              disabled
            >
              {/* Remove image on user's request */}
              <X className="h-3 w-3" />
            </button>
          ) : (
            <button
              className="bg-indigo-500 text-white p-1 rounded-full absolute top-100 right-40 shadow-sm cursor-not-allowed"
              onClick={handleAvatarClick}
              disabled
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2 px-4">
              <div className="space-y-2">
                {/* Actual input tag that does the input job while staying hidden */}
                <input
                  type="file"
                  accept=".png, .jpeg, .jpg"
                  className="hidden imageField bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  onChange={handleAvatarChange}
                  disabled
                />
                {/* onChange to handle the imageChange */}

                {/* Rest of the form */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          placeholder="Enter server name"
                          {...field}
                        />
                      </FormControl>
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

export default ServerCreationModal;
