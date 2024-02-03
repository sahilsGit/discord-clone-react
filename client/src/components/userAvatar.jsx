import { Avatar, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { get } from "@/services/api-service";
import { handleError } from "@/lib/response-handler";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const UserAvatar = ({ subject, className }) => {
  const [imageSrc, setImageSrc] = useState("/fallback/userFinal.jpg");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");

  const image = subject.image || null;

  const getImage = async () => {
    try {
      const response = await get(`/assets/getImage/${image}`, access_token);
      const imageData = await response.blob();
      const imageUrl = URL.createObjectURL(imageData);
      setImageSrc(imageUrl);
    } catch (error) {
      handleError(error, authDispatch);
    }
  };

  useEffect(() => {
    if (subject.image) {
      getImage();
    }
  }, [subject.image]);

  return (
    <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
      <AvatarImage src={imageSrc} alt="" />
    </Avatar>
  );
};
