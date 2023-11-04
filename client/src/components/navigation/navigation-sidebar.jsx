import { useState, useEffect } from "react";
import { get } from "@/services/apiService";
import useAuth from "@/hooks/useAuth";
import { handleResponse, handleError } from "@/services/responseHandler";
import { NavigationAction } from "@/components/navigation/navigation-action";
import { DirectMessages } from "@/components/navigation/navigation-messages";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";

const NavigationSidebar = () => {
  const profile = useAuth("user");
  const [servers, setServers] = useState([]);
  const access_token = useAuth("token");
  const dispatch = useAuth("dispatch");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        };

        const response = await get(
          `/profile/${profile.profileId}/servers`,
          headers,
          {
            credentials: "include",
          }
        );

        const data = await handleResponse(response, dispatch);
        setServers(data.servers);
      } catch (err) {
        handleError(err);
      }
    };

    fetchData();
  }, [access_token, profile.profileId, dispatch]);

  return (
    <div className="flex flex-col items-center h-full text-primary gap-1.5 pt-[5px]">
      <DirectMessages />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-7" />
      <ScrollArea className="w-full flex pt-[2px]">
        <div className="flex flex-col items-center justify-center space-y-1.5">
          {servers.map((server) => (
            <NavigationItem
              key={server.id}
              // className="items-center" for button inside button
              id={server.id}
              name={server.name}
              image={server.image}
            />
          ))}
        </div>
      </ScrollArea>
      <NavigationAction />
    </div>
  );
};

export default NavigationSidebar;
