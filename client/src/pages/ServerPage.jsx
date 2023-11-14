import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/server/sidebar/sidebar";
import useServer from "@/hooks/useServer";
import { get } from "@/services/apiService";
import useAuth from "@/hooks/useAuth";
import { handleError, handleResponse } from "@/services/responseHandler";
import { useEffect } from "react";

const ServerPage = () => {
  console.log("SERVER PAGE");

  const params = useParams();
  const serverDispatch = useServer("dispatch");
  const activeServer = useServer("activeServer");
  const user = useAuth("user");
  const access_token = useAuth("token");
  const authDispatch = useAuth("dispatch");
  const serverDetails = useServer("serverDetails");

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

  //       console.log("Dipatching from serverPage");
  //       serverDispatch({ type: "SET_CUSTOM", payload: customPayload });
  //     } catch (err) {
  //       handleError(err);
  //     }
  //   };

  //   if (activeServer !== params.id) {
  //     fetchData();
  //   }
  // }, []);

  console.log("serverpage", activeServer);

  useEffect(() => {
    console.log("dispatching new active server");
    serverDispatch({ type: "SET_ACTIVE_SERVER", payload: params.id });
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
        <Sidebar />
      </div>
    </main>
  );
};

export default ServerPage;
