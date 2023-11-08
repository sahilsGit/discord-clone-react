import { useEffect, useState } from "react";
import { ActionTooltip } from "../action-tooltip";
import { get } from "@/services/apiService";
import { handleError } from "@/services/responseHandler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

export const NavigationItem = ({ name, id, image }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
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
    <button
      onClick={() => {
        navigate(`/servers/${id}`);
      }}
      className="w-full flex items-center justify-center group relative"
    >
      <div
        className={cn(
          "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
          params?.id !== id && "group-hover:h-[20px]",
          params?.id === id ? "h-[36px]" : "h-[8px]"
        )}
      ></div>
      <ActionTooltip side="right" align="center" label={name}>
        <div
          className={cn(
            "flex h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.id === id && "rounded-[16px]"
          )}
        >
          <img className="" src={imageSrc} />
        </div>
      </ActionTooltip>
    </button>
  );
};

// relative flex h-[48px] w-[48px] rounded-[24px] bg-background dark:bg-nutral-700 overflow-hidden