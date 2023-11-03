import NavigationSidebar from "@/components/navigation/navigation-sidebar";

const ServerPage = () => {
  return (
    <main className="h-screen flex flex-col">
      <div className="h-full w-[72px] pt-2 dark:bg-[#1E1F22]">
        <NavigationSidebar />
      </div>
    </main>
  );
};

export default ServerPage;
