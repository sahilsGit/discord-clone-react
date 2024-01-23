import { useEffect, useState } from "react";
import { ActionTooltip } from "../actionTooltip";
import { get } from "@/services/api-service";
import { handleError } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import useServer from "@/hooks/useServer";

const NavigationItem = ({ name, id, image, firstChannel, type }) => {
  const activeServer = useServer("activeServer");
  const [imageSrc, setImageSrc] = useState(null);
  const navigate = useNavigate();
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [clicked, setClicked] = useState(false);
  const params = useParams();

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await get(`/assets/getImage/${image}`, access_token);
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
    if (!activeServer) {
      setClicked(false);
    } else {
      if (
        (activeServer?.id !== id && id !== params.serverId) ||
        type === "conversation"
      ) {
        setClicked(false);
      } else setClicked(true);
    }
  }, [activeServer, type]);

  return (
    <button
      onClick={() => {
        setClicked(true);
        navigate(`/servers/${id}/${firstChannel}`);
      }}
      className={cn("w-full flex items-center justify-center group relative")}
    >
      <div
        className={cn(
          "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
          params.serverId !== id && "group-hover:h-[20px]",
          clicked && "h-[20px]",
          clicked && params.serverId === id ? "h-[36px]" : "h-[8px]"
        )}
      ></div>
      <ActionTooltip side="right" align="center" label={name}>
        <div
          className={cn(
            "flex h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            clicked && params.serverId === id && "rounded-[16px]",
            ((id === params.serverId && params.serverId !== activeServer?.id) ||
              (id !== activeServer?.id && clicked)) &&
              "translate-y-[1.5px]"
          )}
        >
          <img className="" src={imageSrc} />
        </div>
      </ActionTooltip>
    </button>
  );
};
export default NavigationItem;
