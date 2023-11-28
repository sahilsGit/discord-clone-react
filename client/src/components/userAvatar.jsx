import { Avatar, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import useServer from "@/hooks/useServer";
import { get } from "@/services/api-service";
import { handleError } from "@/lib/response-handler";
import { useState, useEffect } from "react";

export const UserAvatar = ({ member }) => {
  const [imageSrc, setImageSrc] = useState("../../assets/images/fallback.jpg");
  const access_token = useAuth("token");

  const getImage = async () => {
    try {
      const response = await get(`/getImage/${member.image}`, access_token);

      const imageData = await response.blob();
      const imageUrl = URL.createObjectURL(imageData);

      setImageSrc(imageUrl);
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if (member.image) {
      getImage();
    }
  }, [member.image]);

  useEffect(() => {
    console.log("RENDERING AVATAR IMAGE");
  });

  if (!imageSrc) {
    return <div>Loading...</div>;
  }

  return (
    <Avatar className="h-7 w-7 md:h-10 md:w-10">
      <AvatarImage src={imageSrc} alt="" />
    </Avatar>
  );
};
