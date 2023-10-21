import React, { useState, useEffect, useContext, setState } from "react";
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
import { AuthContext } from "@/context/authContext";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required!",
  }),
});

const InitialModal = () => {
  // For setting server image
  const [avatarImage, setAvatarImage] = useState(null);
  const [IUrl, setIUrl] = useState("");

  useEffect(() => {
    console.log("AvatarImage is being changed: ", avatarImage);
  }, [avatarImage]);

  // Validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const uploadImage = async () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("image", avatarImage);

      if (avatarImage) {
        fetch("http://localhost:4000/api/upload", {
          method: "POST",
          headers: {
            Origin: "http://localhost:5173",
          },
          body: formData,
          credentials: "include",
        })
          .then((response) => {
            if (response.ok) {
              console.log("Image uploaded successfully");
              return response.json();
            } else {
              throw new Error("Upload failed");
            }
          })
          .then((data) => {
            resolve(data.url); // Resolve the promise with the image URL
          })
          .catch((error) => {
            reject(error); // Reject the promise with an error if something goes wrong
          });
      } else {
        console.log("Avatar image not found!");
        reject(new Error("Avatar image not found")); // Reject the promise if avatarImage is not available
      }
    });
  };

  const isLoading = form.formState.isSubmitting;

  const context = useContext(AuthContext);
  const profileId = context.user.profileId;

  const onSubmit = async (data) => {
    const imageUrl = await uploadImage();

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Origin", "http://localhost:5173");

    const toBeSent = {
      name: data.name,
      imageUrl: imageUrl,
      inviteCode: v4(),
      profileId,
    };

    // Create request options
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify(toBeSent),
      credentials: "include",
    };

    try {
      fetch("http://localhost:4000/api/profile/servers/create", options).then(
        (response) => {
          if (response.ok) {
            console.log("Server has been created!");
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
    form.reset();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarImage(file);
    } else {
      handleDeleteImage();
    }
  };

  const handleAvatarClick = () => {
    const fileInput = document.querySelector(".imageField");
    fileInput.click();
  };

  const handleDeleteImage = () => {
    setAvatarImage("");
  };

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
          <Avatar className="relative bg-zinc-200" onClick={handleAvatarClick}>
            <AvatarImage src={IUrl} />
            <AvatarFallback className="flex flex-col">
              <Image strokeWidth="2" color="grey" size={24} />
            </AvatarFallback>
          </Avatar>
          {avatarImage ? (
            <button
              className="bg-rose-500 text-white p-1 rounded-full absolute top-100 right-40 shadow-sm"
              onClick={handleDeleteImage}
            >
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
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="hidden uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server image
                      </FormLabel>
                      <FormControl>
                        <input
                          type="file"
                          accept=".png, .jpeg, .jpg"
                          className="hidden imageField bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          onChange={handleAvatarChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
