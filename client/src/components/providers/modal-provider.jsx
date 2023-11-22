import ServerCreationModal from "@/components/modals/serverCreationModal";
import InviteModal from "@/components/modals/inviteModal";
import EditServerModal from "@/components/modals/editServerModal";
import MembersModal from "@/components/modals/membersModal";

export const ModalProvider = () => {
  return (
    <>
      <ServerCreationModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
    </>
  );
};
