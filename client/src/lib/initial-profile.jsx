import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import MeSidebar from "@/components/me/sidebar/meSidebar";

const InitialProfile = () => {
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
