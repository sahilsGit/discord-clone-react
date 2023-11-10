import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { get } from "@/services/apiService";
import useAuth from "@/hooks/useAuth";
import { handleResponse, handleError } from "@/services/responseHandler";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/server/sidebar/sidebar";

const ServerPage = () => {
  const user = useAuth("user");
  const access_token = useAuth("token");
  const dispatch = useAuth("dispatch");
  const navigate = useNavigate();

  const [servers, setServers] = useState([]);
  const [serversFetched, setServersFetched] = useState(false);
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`/servers/${user}/servers`, access_token);
        const data = await handleResponse(response, dispatch);

        setServers(data.servers);
        setProfileId(data.profileId);

        setServersFetched(true);
      } catch (err) {
        handleError(err);
        return navigate("/login");
      }
    };

    fetchData();
  }, [access_token, user, profileId, dispatch]);

  if (!user || !access_token) {
    return navigate("/login");
  }

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10">
        <NavigationSidebar servers={servers} />
      </div>
      <div className="h-full w-[240px] bg-main08">
        {serversFetched && (
          <Sidebar profileId={profileId} alreadyFetched={servers[0]} />
        )}
      </div>
    </main>
  );
};

export default ServerPage;
