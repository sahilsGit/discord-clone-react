import ServerCreationModal from "@/components/modals/serverCreationModal";
import InviteModal from "@/components/modals/inviteModal";
import EditServerModal from "@/components/modals/editServerModal";

export const ModalProvider = () => {
  return (
    <>
      <ServerCreationModal />
      <InviteModal />
      <EditServerModal />
    </>
  );
};
