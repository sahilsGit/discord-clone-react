import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { get } from "@/services/apiService";
import useAuth from "@/hooks/useAuth";
import { handleResponse, handleError } from "@/services/responseHandler";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/server/sidebar/sidebar";

const ServerPage = () => {
  const profile = useAuth("user");
  const access_token = useAuth("token");
  const dispatch = useAuth("dispatch");
  const navigate = useNavigate();

  const [servers, setServers] = useState([]);
  const [serversFetched, setServersFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        };

        const response = await get(`/profile/${profile}/servers`, headers, {
          credentials: "include",
        });

        const data = await handleResponse(response, dispatch);
        setServers(data.servers);
        setServersFetched(true);
      } catch (err) {
        handleError(err);
        return navigate("/login");
      }
    };

    fetchData();
  }, [access_token, profile.profileId, dispatch]);

  if (!profile || !access_token) {
    return navigate("/login");
  }

  // Extract messages for the first server if available
  // const messagesForFirstServer = servers.length > 0 ? servers[0].messages : [];

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10">
        <NavigationSidebar servers={servers} />
      </div>
      <div className="h-full w-[240px] bg-main08">
        {serversFetched && <Sidebar alreadyFetched={servers[0]} />}
      </div>
    </main>
  );
};

export default ServerPage;
