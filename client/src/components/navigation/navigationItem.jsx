import { useEffect, useState } from "react";
import { ActionTooltip } from "../actionTooltip";
import { get } from "@/services/api-service";
import { handleError } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import useServer from "@/hooks/useServer";

export const NavigationItem = ({ name, id, image }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const serverDetails = useServer("serverDetails");

  const [clicked, setClicked] = useState(null);

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await get(`/getImage/${image}`, access_token);
        const imageData = await response.blob();
        const imageUrl = URL.createObjectURL(imageData);

        setImageSrc(imageUrl);
      } catch (err) {
        handleError(err, authDispatch);
      }
    };

    getImage();
  }, [image]);

  useEffect(() => {
    params.serverId ? setClicked(id) : setClicked(null);
  }, [params.serverId]);

  return (
    <button
      onClick={() => {
        id !== serverDetails?.id && navigate(`/servers/${id}`);
      }}
      className={cn("w-full flex items-center justify-center group relative")}
    >
      <div
        className={cn(
          "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
          serverDetails?.id !== id && "group-hover:h-[20px]",
          params.serverId && serverDetails?.id === id ? "h-[36px]" : "h-[8px]",
          params.serverId &&
            serverDetails?.id !== params.serverId &&
            params.serverId === clicked &&
            "h-[20px]"
        )}
      ></div>
      <ActionTooltip side="right" align="center" label={name}>
        <div
          className={cn(
            "flex h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            ((params.serverId && serverDetails?.id === id) ||
              params.serverId === clicked) &&
              "rounded-[16px]",
            params.serverId !== serverDetails?.id &&
              params.serverId === clicked &&
              "translate-y-[1px]"
          )}
        >
          <img className="" src={imageSrc} />
        </div>
      </ActionTooltip>
    </button>
  );
};

// relative flex h-[48px] w-[48px] rounded-[24px] bg-background dark:bg-nutral-700 overflow-hidden
