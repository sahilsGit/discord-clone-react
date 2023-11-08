import ServerCreationModal from "@/components/modals/serverCreationModal";
import InviteModal from "@/components/modals/inviteModal";

export const ModalProvider = () => {
  return (
    <>
      <ServerCreationModal />
      <InviteModal />
    </>
  );
};
