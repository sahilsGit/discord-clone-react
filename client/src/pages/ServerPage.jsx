import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { useNavigate, useParams } from "react-router-dom";
import ServerSidebar from "@/components/server/sidebar/serverSidebar";
import useServer from "@/hooks/useServer";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
// import { get } from "@/services/apiService";
// import { handleError, handleResponse } from "@/services/responseHandler";

const ServerPage = () => {
  console.log("INSIDE SERVER PAGE");
  const params = useParams();
  const navigate = useNavigate();
  const serverDispatch = useServer("dispatch");
  const user = useAuth("user");
  const access_token = useAuth("token");
  const serverDetails = useServer("serverDetails");
  const servers = useServer("servers");
  // const activeServer = useServer("activeServer");
  // const authDispatch = useAuth("dispatch");

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await get(
  //         `/servers/${user}/${params.id}`,
  //         access_token
  //       );
  //       const data = await handleResponse(response, authDispatch);

  //       const customPayload = {
  //         serverDetails: data.server,
  //         activeServer: params.id,
  //       };

  //       serverDispatch({ type: "SET_CUSTOM", payload: customPayload });
  //     } catch (err) {
  //       handleError(err);
  //     }
  //   };

  //   fetchData();
  // }, [params.id]);

  useEffect(() => {
    serverDispatch({ type: "SET_ACTIVE_SERVER", payload: params.id });

    if (!servers || !user || !access_token) {
      navigate("/");
    }
  }, [params.id]);

  if (!serverDetails) {
    return <div>Loading server details...</div>;
  }

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10">
        <NavigationSidebar />
      </div>
      <div className="h-full w-[240px] bg-main08">
        <ServerSidebar />
      </div>
    </main>
  );
};

export default ServerPage;
