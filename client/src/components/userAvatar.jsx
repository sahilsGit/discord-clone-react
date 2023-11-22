import { Avatar, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { get } from "@/services/apiService";
import { handleError } from "@/services/responseHandler";
import { useState, useEffect } from "react";

export const UserAvatar = ({ member }) => {
  console.log("member....", member);
  const [imageSrc, setImageSrc] = useState(null);
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
    } else {
      setImageSrc("../../assets/images/fallback.jpg");
    }
  }, [member.image]);

  if (!imageSrc) {
    return <div>Loading...</div>;
  }

  return (
    <Avatar className="h-7 w-7 md:h-10 md:w-10">
      <AvatarImage src={imageSrc} alt="" />
    </Avatar>
  );
};
