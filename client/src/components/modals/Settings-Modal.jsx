import { useModal } from "@/hooks/useModals";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { UserAvatar } from "../userAvatar";
import useAuth from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scrollArea";
import { Pencil } from "lucide-react";
import { Form, FormField } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleError, handleResponse } from "@/lib/response-handler";
import { Avatar, AvatarImage } from "../ui/avatar";
import { post, update } from "@/services/api-service";
import { cn } from "@/lib/utils";
import "../../App.css";
import { ActionTooltip } from "../actionTooltip";
import ErrorComponent from "@/lib/error-Component";
import useServer from "@/hooks/useServer";
import useChannels from "@/hooks/useChannels";

const SettingsModal = () => {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const isModalOpen =
    isOpen &&
    (type === "settings" ||
      type === "emailVerification" ||
      type === "changePassword");
  const username = useAuth("user");
  const [avatarImage, setAvatarImage] = useState(null);
  const authDispatch = useAuth("dispatch");
  const [imagePreview, setImagePreview] = useState(null);
  const access_token = useAuth("token");
  const [hasChanged, setHasChanged] = useState(true);
  const [loading, setLoading] = useState(false);
  const profileId = useAuth("id");
  const [apiError, setApiError] = useState({ status: "", message: "" });
  const serverDispatch = useServer("dispatch");

  useEffect(() => {
    if (isModalOpen && !hasChanged) {
      form.setValue("name", data.name);
      form.setValue("about", data.about);
      form.setValue("email", data.email.data);
      form.setValue("username", data.username);
      setAvatarImage(null);
      setImagePreview(null);
    }
  }, [isModalOpen, hasChanged]);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: "At least you had a name before!",
    }),
    username: z.string().min(1, {
      message: "We can't call you 'nothing' or can we?",
    }),
    about: z.string().max(60, {
      message: "Can't exceed 60 characters.",
    }),
    // email: z.string().email(),
  });

  // react-hook-from setup with zod resolver
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
      username: username,
      about: "",
      // email: "",
    },
  });

  // Error setter for standard error component
  const setError = ({ status, message }) => {
    setApiError({ status: status, message: message });
  };

  const handleVerifyClick = () => {
    (async () => {
      try {
        await update(
          `/profiles/verify/${profileId}`,
          {
            content: null,
          },
          access_token
        );
      } catch (error) {
        handleError(error, authDispatch);
      }
    })();
    onOpen("emailVerification", "");
  };

  const handleClose = () => {
    setHasChanged(false);
    onClose();
  };

  const handleInvalidateSessions = async () => {
    try {
      await update("/auth/revokeToken", { profileId: profileId }, access_token);
      localStorage.clear();
      authDispatch({ type: "RESET_STATE" });
      serverDispatch({ type: "RESET_STATE" });
      handleClose();
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      setApiError({ status: status, message: message });
    }
  };

  const handlePencilClick = () => {
    const fileInput = document.querySelector(".imageField");
    fileInput.click(); // From here onChange takes charge
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAvatarImage(file); // Set the AvatarImage state with the choose image
    }
  };

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

    isModalOpen ? setHasChanged(true) : setHasChanged(!hasChanged);
  }, [avatarImage]);

  const uploadImage = async () => {
    if (avatarImage) {
      const formData = new FormData();
      formData.append("image", avatarImage);

      try {
        const response = await post(
          "/assets/uploadFile",
          formData,
          access_token,
          {}
        );

        const data = await handleResponse(response, authDispatch); // Parse the res
        const { newFilename } = data; // Access the newFilename property

        return newFilename; // For DB storage
      } catch (error) {
        const { status, message } = handleError(error, authDispatch);
        setApiError({ status: status, message: message });
      }
    } else {
      return null;
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    const image = await uploadImage(); // Wait for image you get upon resolution

    const updatedValues = {};

    if (image) {
      updatedValues["image"] = image;
    }
    if (data.name !== values.name) {
      updatedValues["name"] = values.name;
    }
    if (data.username !== values.username) {
      updatedValues["username"] = values.username;
    }
    if (data.about !== values.about) {
      updatedValues["about"] = values.about;
    }

    if (Object.keys(updatedValues).length === 0) {
      return;
    }

    try {
      const response = await update(
        `/profiles/updateProfile`,
        updatedValues,
        access_token
      );

      const dataReceived = await handleResponse(response, authDispatch);

      authDispatch({ type: "SET_CUSTOM", payload: dataReceived.updatedData });
    } catch (error) {
      const { status, message } = handleError(error, authDispatch);
      setApiError({ status: status, message: message });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="dark:bg-main07 p-0 w-screen h-screen">
        <ScrollArea>
          <div className="flex px-4 items-center justify-center">
            {/* <div className="min-w-[20px] flex-1 grow"></div> */}
            <div className="flex w-full md:w-[850px] flex-col py-16 gap-y-4 shrink-0">
              <p className="text-xl font-semibold dark:text-white text-zinc-600">
                My Account
              </p>
              <div className="relative h-[100px] w-full bg-indigo-500 flex flex-col rounded-lg">
                <input
                  type="file"
                  accept=".png, .jpeg, .jpg"
                  className="hidden imageField"
                  onChange={handleAvatarChange}
                  disabled
                />
                <div className="absolute top-10 left-4">
                  {avatarImage ? (
                    <Avatar className="border-8 border-main07 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4">
                      <AvatarImage src={imagePreview} />
                    </Avatar>
                  ) : (
                    <UserAvatar
                      subject={{ name: data.name, image: data.image }}
                      className="border-8 border-main07 h-[90px] w-[90px] md:h-[90px] md:w-[90px] absolute top-4 left-4"
                    />
                  )}

                  <ActionTooltip
                    label={
                      "Uploading images has been disabled till I find a better place to save images!"
                    }
                    className="text-center max-w-[200px]"
                    side="center"
                  >
                    {" "}
                    <button
                      className="flex items-center justify-center absolute top-[68px] left-[78px] rounded-full h-[40px] hover:bg-zinc-200 hover:text-zinc-700 dark:text-primary border-8 border-main07 bg-main06 cursor-not-allowed hover:bg-main05 dark:hover:text-zinc-800 w-[40px] transition"
                      onClick={handlePencilClick}
                      type="button"
                      disabled
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </ActionTooltip>
                </div>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col mt-8 rounded-b-lg w-full p-4 pb-1"
                >
                  <div className="flex gap-x-4">
                    <div className="flex-1 flex flex-col p-2">
                      <div className="flex flex-col gap-y-3">
                        <div className="flex flex-col gap-y-2">
                          <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                            Display Name
                          </p>
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <Input
                                type="text"
                                className="py-3 rounded-sm px-2 bg-main10 text-primary text-sm"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setHasChanged(true);
                                }}
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-y-2">
                          <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                            Username
                          </p>
                          <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                              <Input
                                type="text"
                                className="py-3 rounded-sm px-2 bg-main10 text-primary text-sm"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setHasChanged(true);
                                }}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <Separator className="my-7 bg-main06 w-full h-[1px]" />
                      <div className="flex flex-col gap-y-2">
                        <div className="flex items-center">
                          <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                            Email
                          </p>{" "}
                          {!data?.email?.isEmailVerified && (
                            <Button
                              type="button"
                              variant="link"
                              className="ml-2 underline-offset-3 text-xs h-[10px] text-blue-500 p-0 max-w-[90px] box-content max-w-content"
                              onClick={handleVerifyClick}
                            >
                              Verify
                            </Button>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <Input
                              type="email"
                              className="py-3 rounded-sm px-2 bg-main10 text-primary text-sm"
                              {...field}
                              disabled={true}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col px-3 py-2 flex-1 gap-y-2">
                      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                        About Me
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        You can use markdowns and links if you'd like.
                      </p>
                      <FormField
                        control={form.control}
                        name="about"
                        render={({ field }) => (
                          <div className="bg-main10 w-full px-3 py-3 text-white h-full rounded-sm break-all">
                            <textarea
                              className="w-full h-full text-primary resize-none bg-main10 placeholder:text-sm"
                              name=""
                              id=""
                              placeholder="Write something for others to see..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setHasChanged(true);
                              }}
                            ></textarea>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "absolute w-full left-[50%] bg-main10 rounded-sm px-2 sm:px-3 py-2 transition-all min-w-[350px] w-auto md:w-[600px] lg:w-[800px] translate-x-[-50%] hidden bottom-[-100px]",
                      hasChanged && "block bottom-3 flyIn"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-xs lg:text-md text-primary pl-1">
                        Careful - You have unsaved changes!
                      </p>
                      <div className="flex items-center justify-center lg:block">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            setHasChanged(false);
                          }}
                          className="text-xs lg:text-md p-2 lg:p-3"
                        >
                          Reset
                        </Button>
                        <Button
                          size="custom"
                          disabled={loading}
                          className="text-xs lg:text-md px-2 lg:px-3"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>

              <Separator className="my-7 bg-main06 w-full h-[1px]" />
              <div className="flex flex-col gap-y-6">
                <p className="text-xl font-semibold dark:text-white text-zinc-600">
                  Password and Session
                </p>
                <div>
                  <Button
                    variant="primary"
                    className="max-w-fit text-white text-xs font-normal bg-indigo-500 rounded-sm px-4 text-sm h-[40px]"
                    onClick={() => {
                      onOpen("changePassword", {});
                    }}
                  >
                    Change Password
                  </Button>
                </div>
                <div className="flex flex-col items-start gap-y-3">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This lets you suspend all the active sessions by pressing{" "}
                    the button below.<br></br> You will be logged out of all the
                    devices including this one.
                  </p>
                  <ActionTooltip label={"Can take upto 5 minutes."}>
                    <Button
                      variant="primary"
                      className="max-w-fit text-white text-xs font-normal bg-indigo-500 rounded-sm px-4 text-sm h-[40px]"
                      onClick={handleInvalidateSessions}
                    >
                      Log-out of all known devices
                    </Button>
                  </ActionTooltip>
                </div>
              </div>
              <Separator className="my-7 bg-main06 w-full h-[1px]" />
              <div className="flex flex-col gap-y-3">
                <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                  Account Removal
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  This will immediately log you out of your account and remove
                  your access completely.
                </p>
                <Button
                  variant="primary"
                  className="max-w-fit text-white text-xs font-normal hover:bg-red-700 bg-red-600 rounded-sm px-4 text-sm h-[40px]"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        <ErrorComponent error={apiError} setError={setError} />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
