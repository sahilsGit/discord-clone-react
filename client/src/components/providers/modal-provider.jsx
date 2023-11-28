import ServerCreationModal from "@/components/modals/Server-Creation-Modal";
import InviteModal from "@/components/modals/Invite-Modal";
import EditServerModal from "@/components/modals/Edit-Server-Modal";
import MembersModal from "@/components/modals/Members-Modal";

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
