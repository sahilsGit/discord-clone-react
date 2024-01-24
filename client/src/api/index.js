import { handleResponse } from "@/lib/response-handler";
import { get } from "@/services/api-service";

const fetchChannel = async ({ serverId, channelId, authDispatch }) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/channels/${serverId}/${channelId}`,
    access_token
  );
  return await handleResponse(response, authDispatch);
};

const fetchServer = async ({ user, serverId, authDispatch }) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(`/servers/${user}/${serverId}`, access_token);
  return await handleResponse(response, authDispatch);
};

const fetchChannelMessages = async ({ channelId, authDispatch }) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/messages/fetch?channelId=${channelId}`,
    access_token
  );
  return await handleResponse(response, authDispatch);
};

const fetchConversation = async ({
  memberProfileId,
  myProfileId,
  authDispatch,
}) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/conversations/${memberProfileId}/${myProfileId}`,
    access_token
  );
  return await handleResponse(response, authDispatch);
};

const fetchConversationMessages = async ({
  memberProfileId,
  myProfileId,
  authDispatch,
}) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/messages/fetch?memberProfileId=${memberProfileId}&myProfileId=${myProfileId}`,
    access_token
  );
  return await handleResponse(response, authDispatch);
};

const fetchAllConversations = async ({ profileId, authDispatch }) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(`/conversations/${profileId}`, access_token);
  return await handleResponse(response, authDispatch);
};

const fetchAllServers = async ({ user, authDispatch }) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(`/servers/${user}/getAll`, access_token);

  return await handleResponse(response, authDispatch);
};

const fetchMoreServerMessages = async ({
  myMembershipId,
  channelId,
  cursor,
  authDispatch,
}) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/messages/fetch?memberId=${myMembershipId}&channelId=${channelId}&cursor=${cursor}`,
    access_token
  );

  return await handleResponse(response, authDispatch);
};

const fetchMoreDirectMessages = async ({
  conversationId,
  cursor,
  authDispatch,
}) => {
  const access_token = JSON.parse(localStorage.getItem("access_token"));
  const response = await get(
    `/messages/fetch?conversationId=${conversationId}&cursor=${cursor}`,
    access_token
  );

  return await handleResponse(response, authDispatch);
};

export {
  fetchChannel,
  fetchServer,
  fetchChannelMessages,
  fetchConversation,
  fetchConversationMessages,
  fetchAllServers,
  fetchAllConversations,
  fetchMoreServerMessages,
  fetchMoreDirectMessages,
};
