import ServerCreationModal from "@/components/modals/Server-Creation-Modal";
import InviteModal from "@/components/modals/Invite-Modal";
import EditServerModal from "@/components/modals/Edit-Server-Modal";
import MembersModal from "@/components/modals/Members-Modal";
import ChannelCreationModal from "@/components/modals/Channel-Creation-Modal";
import { MessageFileModal } from "@/components/modals/Message-File-Modal";
import SettingsModal from "../modals/Settings-Modal";
import LeaveServerModal from "../modals/Leave-Server-Modal";
import { DeleteMessageModal } from "../modals/Delete-Message-Modal";
import EmailVerificationModal from "../modals/Email-Verification-Modal";
import ChangePasswordModal from "../modals/Change-Password-Modal";

export const ModalProvider = () => {
  return (
    <>
      <ServerCreationModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <ChannelCreationModal />
      <MessageFileModal />
      <SettingsModal />
      <LeaveServerModal />
      <DeleteMessageModal />
      <EmailVerificationModal />
      <ChangePasswordModal />
    </>
  );
};
