import { useEffect, useState } from "react";
import { ActionTooltip } from "../actionTooltip";
import { get } from "@/services/api-service";
import { handleError } from "@/lib/response-handler";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import useServer from "@/hooks/useServer";
import { getChannelAndServer } from "@/lib/context-helper";
import useChannels from "@/hooks/useChannels";

const NavigationItem = ({ name, id, image, firstChannel, type }) => {
  const activeServer = useServer("activeServer");
  const [imageSrc, setImageSrc] = useState("/fallback/other.png");
  // const navigate = useNavigate();
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const [clicked, setClicked] = useState(false);
  const params = useParams();
  const user = useAuth("user");
  const serverDispatch = useServer("dispatch");
  const channelsDispatch = useChannels("dispatch");
  const serverCache = useServer("cache");
  const channelCache = useChannels("cache");

  useEffect(() => {
    const getImage = async () => {
      try {
        const response = await get(`/assets/getImage/${image}`, access_token);
        const imageData = await response.blob();

        console.log(response.status);

        if (response.ok) {
          const imageUrl = URL.createObjectURL(imageData);
          setImageSrc(imageUrl);
        }
      } catch (error) {
        handleError(error, authDispatch);
      }
    };

    getImage();
  }, [image]);

  console.log(imageSrc);

  useEffect(() => {
    if (!activeServer) {
      setClicked(false);
    } else {
      if (activeServer?.id !== id || type === "conversation") {
        setClicked(false);
      } else setClicked(true);
    }
  }, [activeServer, type]);

  return (
    <button
      onClick={() => {
        setClicked(true);

        if (serverCache && channelCache && id === serverCache.activeServer.id) {
          channelsDispatch({ type: "USE_CACHE" });
          serverDispatch({ type: "USE_CACHE" });
          return;
        }
        getChannelAndServer(
          user,
          id,
          firstChannel,
          authDispatch,
          serverDispatch,
          channelsDispatch
        );
      }}
      className={cn("w-full flex items-center justify-center group relative")}
    >
      <div
        className={cn(
          "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
          params.serverId !== id && "group-hover:h-[20px]",
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
