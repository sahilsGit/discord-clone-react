import { useEffect, useState } from "react";
import { ActionTooltip } from "../action-tooltip";
import { get } from "@/services/apiService";
import { handleError } from "@/services/responseHandler";
import useAuth from "@/hooks/useAuth";

export const NavigationItem = ({ name, id, image }) => {
  const [imageSrc, setImageSrc] = useState(null);
  // make request here

  const dispatch = useAuth("dispatch");
  const access_token = useAuth("token");

  const headers = {
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
    Origin: "http://localhost:5173",
  };

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await get(`/getImage/${image}`, headers, {
          credentials: "include",
        });

        const responseClone = response.clone();
        const imageData = await responseClone.blob();
        const imageUrl = URL.createObjectURL(imageData);
        setImageSrc(imageUrl);
      } catch (err) {
        handleError(err);
      }
    };

    getImage();
  }, [image, dispatch]);

  return (
    <ActionTooltip side="right" align="center" label={name}>
      {/* <button> */}
      <div className="h-[48px] w-[48px] rounded-[24px] bg-background dark:bg-nutral-700 overflow-hidden">
        <img className="h-[48px] w-[48px]" src={imageSrc} alt="" />
      </div>
      {/* </button> */}
    </ActionTooltip>
  );
};
