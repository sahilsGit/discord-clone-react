// import { get } from "@/services/apiService";
// import useAuth from "@/hooks/useAuth";
// import { handleResponse, handleError } from "@/services/responseHandler";
// import useServer from "@/hooks/useServer";
import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import MeSidebar from "@/components/me/sidebar/meSidebar";

const InitialProfile = () => {
  // const serverDispatch = useServer("dispatch");
  // const authDispatch = useAuth("dispatch");
  // const user = useAuth("user");
  // const access_token = useAuth("token");
  // const servers = useServer("servers");

  // useEffect(() => {
  //   const fetchServers = async () => {
  //     try {
  //       const response = await get(`/servers/${user}/getAll`, access_token);
  //       const data = await handleResponse(response, authDispatch);

  //       const serverIds = Object.keys(data.servers);

  //       if (serverIds.length > 0) {
  //         serverDispatch({ type: "SET_SERVERS", payload: data.servers });
  //       }
  //     } catch (err) {
  //       handleError(err);
  //     }
  //   };

  //   if (!servers) {
  //     fetchServers();
  //   }
  // });

  // if (!servers) {
  //   return <div>Loading...</div>;
  // }

  return (
    <main className="h-screen flex">
      <div className="h-full w-[72px] bg-main10">
        <NavigationSidebar />
      </div>
      <div className="h-full w-[240px] bg-main08">
        <MeSidebar />
      </div>
    </main>
  );
};

export default InitialProfile;
