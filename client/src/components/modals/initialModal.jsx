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
import { post } from "@/services/apiService";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/services/responseHandler";

// zod form schema for validation
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required!",
  }),
});

// Main component for serving the server creation dialog box
const InitialModal = () => {
  // For setting server image

  const dispatch = useAuth("dispatch"); // Dispatch authContext if response brings in a new access_token

  const [avatarImage, setAvatarImage] = useState(null); // To hold the choosen image before uploading

  const [imagePreview, setImagePreview] = useState(null); // To preview the choosen image
  const access_token = useAuth("token"); // For authorization
  const username = useAuth("user"); // For Server creation

  // react-hook-form setup with zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const isLoading = form.formState.isSubmitting; // For disabling buttons on submission

  // Use effect to display selected-image preview
  useEffect(() => {
    console.log("AvatarImage is being changed: ", avatarImage);

    if (avatarImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result); // Set preview
      };
      reader.readAsDataURL(avatarImage);
    } else {
      setImagePreview(null);
    }
  }, [avatarImage]);

  // Function for handling Multer image update | Returns image name upon resolution
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", avatarImage); // Send the image as form data

    // Upload image and save it in designated place
    if (avatarImage) {
      try {
        const response = await post("/upload", formData, access_token);

        // Parse the response as JSON
        const data = await handleResponse(response, dispatch);

        // Access the newFilename property from the parsed JSON
        const { newFilename } = data;

        return newFilename; // For DB storage
      } catch (err) {
        handleError(err);
      }
    } else {
      console.log("Avatar image not found!");
      throw new Error("Avatar image not found"); // Reject the promise if avatarImage is not available
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
    const image = await uploadImage(); // Wait for image name you get upon resolution

    // Request pre-requisites
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
    };

    const toBeSent = {
      name: data.name,
      image: image, // Store the name
      inviteCode: v4(),
      username, // profileId from global context
    };

    try {
      post("/servers/create", JSON.stringify(toBeSent), access_token);
    } catch (err) {
      console.log(err); // Being lazy
    }
    form.reset();
  };
  {
  }
  // Scadcn UI's Dialog box
  return (
    <Dialog open>
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
          <Avatar className="relative bg-zinc-200" onClick={handleAvatarClick}>
            <AvatarImage src={imagePreview} />
            <AvatarFallback className="flex flex-col">
              <Image strokeWidth="2" color="grey" size={24} />
            </AvatarFallback>
          </Avatar>
          {/* Conditionally render either X or Plus comp. based on avatarImage's state */}
          {avatarImage ? (
            <button
              className="bg-rose-500 text-white p-1 rounded-full absolute top-100 right-40 shadow-sm"
              onClick={handleDeleteImage}
            >
              {/* Remove image on user's request */}
              <X className="h-3 w-3" />
            </button>
          ) : (
            <button
              className="bg-indigo-500 text-white p-1 rounded-full absolute top-100 right-40 shadow-sm"
              onClick={handleAvatarClick}
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

export default InitialModal;
