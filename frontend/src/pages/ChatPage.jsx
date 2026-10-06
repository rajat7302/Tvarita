import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { ArrowLeft, Forward, ImagePlus, MessageCircle, MoreHorizontal, Plus, Search, Send, Users, UserRound, Ban } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import MediaAttachment from '../components/common/MediaAttachment';
import ImageLightbox from '../components/common/ImageLightbox';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const idOf = (item) => String(item?._id || item?.id || item || '');

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [blocked, setBlocked] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const selectedConversationRef = useRef(null);
  selectedConversationRef.current = selectedConversation;
  const [messages, setMessages] = useState([]);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [peopleResults, setPeopleResults] = useState([]);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [groupOpen, setGroupOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [addMemberIds, setAddMemberIds] = useState([]);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [forwardTargets, setForwardTargets] = useState([]);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const refreshSocial = async () => {
    const [friendsResult, requestResult, blockedResult, conversationResult] = await Promise.all([
      api.get('/social/friends'),
      api.get('/social/friend-requests'),
      api.get('/social/blocked'),
      api.get('/social/conversations')
    ]);
    setFriends(friendsResult.data || []);
    setRequests(requestResult.data || { received: [], sent: [] });
    setBlocked(blockedResult.data || []);
    setConversations(conversationResult.data || []);
  };

  useEffect(() => {
    refreshSocial().catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load friends and chats.'));
    const token = localStorage.getItem('tvarita_token');
    if (!token) return undefined;
    const connection = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    connection.on('connect_error', (connectError) => setError(connectError.message || 'Chat connection failed.'));
    connection.on('message:new', (message) => {
      if (idOf(message.conversationId) === idOf(selectedConversationRef.current)) {
        setMessages((current) => current.some((item) => idOf(item) === idOf(message)) ? current : [...current, message]);
      }
      refreshSocial().catch(() => {});
    });
    connection.on('message:updated', (updated) => setMessages((current) => current.map((item) => idOf(item) === idOf(updated) ? updated : item)));
    connection.on('message:deleted', ({ messageId, scope, userId }) => {
      if (scope === 'everyone') {
        setMessages((current) => current.map((item) => idOf(item) === String(messageId) ? { ...item, deletedForEveryone: true, text: '', mediaUrl: '' } : item));
      } else if (idOf(user) === String(userId)) {
        setMessages((current) => current.filter((item) => idOf(item) !== String(messageId)));
      }
    });
    setSocket(connection);
    return () => connection.disconnect();
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (!selectedConversation || !socket) return;
    const conversationId = idOf(selectedConversation);
    setMessages([]);
    socket.emit('conversation:join', conversationId, (result) => {
      if (!result?.ok) setError(result?.message || 'Could not join conversation.');
    });
    api.get(`/social/conversations/${conversationId}/messages`)
      .then((response) => setMessages(response.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Could not load messages.'));
    return () => socket.emit('conversation:leave', conversationId);
  }, [selectedConversation, socket]);

  useEffect(() => {
    if (peopleSearch.trim().length < 2) {
      setPeopleResults([]);
      return undefined;
    }
    const timeout = setTimeout(() => {
      api.get('/social/people', { params: { q: peopleSearch } })
        .then((response) => setPeopleResults(response.data || []))
        .catch(() => setPeopleResults([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [peopleSearch]);

  const selectedMembers = useMemo(() => new Set(groupMembers), [groupMembers]);

  const chooseConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMobileChatOpen(true);
    setError('');
  };

  const openDirect = async (personId) => {
    try {
      const response = await api.post(`/social/conversations/direct/${personId}`);
      await refreshSocial();
      chooseConversation(response.data);
      setPeopleSearch('');
      setPeopleResults([]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to open chat.');
    }
  };

  const sendFriendRequest = async (personId) => {
    try {
      await api.post(`/social/friend-requests/${personId}`);
      await refreshSocial();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send friend request.');
    }
  };

  const respondRequest = async (requestId, action) => {
    try {
      await api.patch(`/social/friend-requests/${requestId}`, { action });
      await refreshSocial();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update request.');
    }
  };

  const blockPerson = async (personId) => {
    try {
      await api.post(`/social/blocked/${personId}`);
      await refreshSocial();
      if (selectedConversation?.members?.some((member) => idOf(member) === String(personId))) {
        setSelectedConversation(null);
        setMobileChatOpen(false);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not block this person.');
    }
  };

  const createGroup = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', groupName);
    groupMembers.forEach((memberId) => formData.append('memberIds', memberId));
    if (groupAvatar) formData.append('avatar', groupAvatar);
    try {
      const response = await api.post('/social/conversations/group', formData);
      setGroupOpen(false);
      setGroupName('');
      setGroupMembers([]);
      setGroupAvatar(null);
      await refreshSocial();
      chooseConversation(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create group.');
    }
  };

  const addGroupMembers = async () => {
    if (!selectedConversation || !addMemberIds.length) return;
    try {
      const response = await api.post(`/social/conversations/${idOf(selectedConversation)}/members`, { memberIds: addMemberIds });
      setSelectedConversation(response.data);
      setAddMembersOpen(false);
      setAddMemberIds([]);
      await refreshSocial();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add group members.');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if ((!draft.trim() && !attachment) || !selectedConversation || sending) return;
    setSending(true);
    const payload = new FormData();
    payload.append('text', draft);
    if (attachment) payload.append('media', attachment);
    try {
      const response = await api.post(`/social/conversations/${idOf(selectedConversation)}/messages`, payload);
      setMessages((current) => current.some((message) => idOf(message) === idOf(response.data)) ? current : [...current, response.data]);
      setDraft('');
      setAttachment(null);
      await refreshSocial();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const editMessage = async (message) => {
    const text = window.prompt('Edit message:', message.text || '');
    if (text === null || !text.trim()) return;
    try {
      const response = await api.patch(`/social/conversations/${idOf(selectedConversation)}/messages/${idOf(message)}`, { text });
      setMessages((current) => current.map((item) => idOf(item) === idOf(message) ? response.data : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message edit failed.');
    }
  };

  const deleteMessage = async (message, scope) => {
    if (!window.confirm(scope === 'everyone' ? 'Delete this message for everyone?' : 'Remove this message from your chat?')) return;
    try {
      await api.delete(`/social/conversations/${idOf(selectedConversation)}/messages/${idOf(message)}`, { data: { scope } });
      if (scope === 'me') setMessages((current) => current.filter((item) => idOf(item) !== idOf(message)));
      else setMessages((current) => current.map((item) => idOf(item) === idOf(message) ? { ...item, deletedForEveryone: true, text: '', mediaUrl: '' } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message delete failed.');
    }
  };

  const forward = async () => {
    if (!forwardMessage || !forwardTargets.length) return;
    try {
      await api.post(`/social/conversations/${idOf(selectedConversation)}/messages/${idOf(forwardMessage)}/forward`, { conversationIds: forwardTargets });
      setForwardMessage(null);
      setForwardTargets([]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not forward message.');
    }
  };

  const conversationTitle = (conversation) => conversation.isGroup
    ? conversation.name
    : conversation.members?.find((member) => idOf(member) !== idOf(user))?.name || 'Direct message';

  const tabs = [
    ['chats', 'Chats'],
    ['friends', 'Friends'],
    ['requests', `Requests${requests.received?.length ? ` (${requests.received.length})` : ''}`],
    ['blocked', 'Blocked']
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-7xl p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><div><h1 className="text-2xl font-extrabold">Friends & Chat</h1><p className="text-xs text-gray-500">Private one-to-one and group conversations</p></div>{activeTab === 'friends' && <button onClick={() => setGroupOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><Users className="h-4 w-4" /> New group</button>}</div>
        {error && <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}<button onClick={() => setError('')} className="ml-2 font-bold underline">Dismiss</button></div>}
        <div className="grid h-[calc(100dvh-145px)] min-h-[480px] overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm md:grid-cols-[330px_1fr]">
          <aside className={`${mobileChatOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-col border-r border-amber-100`}>
            <div className="flex gap-1 overflow-x-auto border-b border-amber-100 p-2">
              {tabs.map(([key, label]) => <button key={key} onClick={() => setActiveTab(key)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${activeTab === key ? 'bg-amber-900 text-white' : 'text-amber-900 hover:bg-amber-50'}`}>{label}</button>)}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {activeTab === 'chats' && conversations.map((conversation) => (
                <button key={idOf(conversation)} onClick={() => chooseConversation(conversation)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-amber-50 ${idOf(selectedConversation) === idOf(conversation) ? 'bg-amber-50' : ''}`}>
                  {conversation.isGroup && conversation.avatarUrl ? <ImageLightbox src={conversation.avatarUrl} alt={`${conversation.name} group photo`} className="h-10 w-10 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" /> : !conversation.isGroup && conversation.members?.find((member) => idOf(member) !== idOf(user))?.profilePhotoUrl ? <ImageLightbox src={conversation.members.find((member) => idOf(member) !== idOf(user)).profilePhotoUrl} alt="Friend profile photo" className="h-10 w-10 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">{conversation.isGroup ? <Users className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}</div>}
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{conversationTitle(conversation)}</strong><small className="block truncate text-xs text-gray-500">{conversation.lastMessage?.text || (conversation.isGroup ? `${conversation.members?.length || 0} members` : 'Open chat')}</small></span>
                </button>
              ))}
              {activeTab === 'friends' && <>
                <label className="mb-2 flex items-center gap-2 rounded-xl border border-gray-200 px-3"><Search className="h-4 w-4 text-gray-400" /><input value={peopleSearch} onChange={(event) => setPeopleSearch(event.target.value)} placeholder="Find people by name" className="min-w-0 flex-1 py-2 text-sm outline-none" /></label>
                {peopleResults.map((person) => <div key={idOf(person)} className="mb-2 rounded-xl border border-amber-100 p-3"><a href={`/profile/${idOf(person)}`} className="font-bold text-sm text-amber-950">{person.name}</a><p className="line-clamp-2 text-xs text-gray-500">{person.bio}</p><button onClick={() => sendFriendRequest(idOf(person))} className="mt-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950">Add friend</button></div>)}
                {friends.map((friend) => <div key={idOf(friend)} className="mb-2 flex items-center gap-2 rounded-xl border border-amber-100 p-3">{friend.profilePhotoUrl ? <ImageLightbox src={friend.profilePhotoUrl} alt={`${friend.name} profile photo`} className="h-8 w-8 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" /> : <UserRound className="h-5 w-5 text-amber-800" />}<a href={`/profile/${idOf(friend)}`} className="min-w-0 flex-1 truncate text-sm font-bold text-amber-950">{friend.name}</a><button onClick={() => openDirect(idOf(friend))} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Chat</button><button onClick={() => blockPerson(idOf(friend))} title="Block" className="rounded-lg border border-red-200 p-2 text-red-700"><Ban className="h-4 w-4" /></button></div>)}
                {friends.length === 0 && peopleResults.length === 0 && <p className="p-3 text-xs text-gray-500">Search for people to send a friend request.</p>}
              </>}
              {activeTab === 'requests' && <>
                <h2 className="mb-2 px-2 text-xs font-bold uppercase text-gray-500">Received</h2>
                {requests.received?.map((request) => <div key={idOf(request)} className="mb-2 rounded-xl border border-amber-100 p-3"><a href={`/profile/${idOf(request.from)}`} className="text-sm font-bold text-amber-950">{request.from?.name}</a><p className="mt-2 flex gap-2"><button onClick={() => respondRequest(idOf(request), 'accept')} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Accept</button><button onClick={() => respondRequest(idOf(request), 'reject')} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Reject</button></p></div>)}
                <h2 className="mb-2 mt-4 px-2 text-xs font-bold uppercase text-gray-500">Sent</h2>
                {requests.sent?.map((request) => <p key={idOf(request)} className="rounded-xl p-3 text-sm text-gray-600">Waiting for {request.to?.name}</p>)}
              </>}
              {activeTab === 'blocked' && blocked.map((person) => <div key={idOf(person)} className="mb-2 flex items-center gap-2 rounded-xl border border-amber-100 p-3"><span className="min-w-0 flex-1 truncate text-sm font-bold">{person.name}</span><button onClick={async () => { await api.delete(`/social/blocked/${idOf(person)}`); await refreshSocial(); }} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Unblock</button></div>)}
            </div>
          </aside>

          <section className={`${mobileChatOpen ? 'flex' : 'hidden md:flex'} min-h-0 flex-col`}>
            {selectedConversation ? <>
              <header className="flex items-center gap-3 border-b border-amber-100 p-3 sm:p-4"><button onClick={() => setMobileChatOpen(false)} className="rounded-lg p-2 hover:bg-amber-50 md:hidden"><ArrowLeft className="h-5 w-5" /></button>{selectedConversation.avatarUrl && selectedConversation.isGroup ? <ImageLightbox src={selectedConversation.avatarUrl} alt={`${selectedConversation.name} group photo`} className="h-9 w-9 shrink-0 rounded-full" imageClassName="h-full w-full rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100"><MessageCircle className="h-4 w-4" /></div>}<div className="min-w-0 flex-1"><h2 className="truncate font-bold">{conversationTitle(selectedConversation)}</h2>{selectedConversation.isGroup && <p className="text-xs text-gray-500">{selectedConversation.members?.length} members</p>}</div>{selectedConversation.isGroup && selectedConversation.admins?.some((admin) => idOf(admin) === idOf(user)) && <button onClick={() => setAddMembersOpen(true)} className="rounded-lg border border-amber-200 px-2 py-1.5 text-xs font-bold text-amber-900"><Plus className="mr-1 inline h-3.5 w-3.5" />Add</button>}</header>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#FFFDF9] p-3 sm:p-5">
                {messages.map((message) => {
                  const own = idOf(message.senderId) === idOf(user);
                  return <article key={idOf(message)} className={`max-w-[88%] rounded-2xl border p-3 sm:max-w-[75%] ${own ? 'ml-auto border-emerald-200 bg-emerald-50' : 'border-amber-100 bg-white'}`}>
                    {selectedConversation.isGroup && !own && <p className="mb-1 text-[11px] font-bold text-amber-800">{message.senderId?.name}</p>}
                    {message.deletedForEveryone ? <p className="text-xs italic text-gray-500">Message deleted</p> : <>
                      {message.forwardedFrom && <p className="mb-1 text-[10px] italic text-gray-500">Forwarded</p>}
                      {message.text && <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>}
                      {message.mediaUrl && <MediaAttachment url={message.mediaUrl} type={message.mediaType} name={message.mediaFileName} className="mt-2" />}
                    </>}
                    <div className="mt-1 flex items-center justify-between gap-3"><small className="text-[10px] text-gray-400">{message.editedAt ? 'Edited · ' : ''}{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small><div className="flex gap-2 text-[10px] font-bold text-gray-500"><button onClick={() => { setForwardMessage(message); setForwardTargets([]); }} title="Forward"><Forward className="h-3.5 w-3.5" /></button>{own && !message.deletedForEveryone && <><button onClick={() => editMessage(message)}>Edit</button><button onClick={() => deleteMessage(message, 'me')}>Delete for me</button><button onClick={() => deleteMessage(message, 'everyone')}>Delete for everyone</button></>}</div></div>
                  </article>;
                })}
              </div>
              {forwardMessage && <div className="flex flex-wrap items-center gap-2 border-t border-amber-100 p-2"><span className="text-xs font-semibold">Forward to:</span><select multiple value={forwardTargets} onChange={(event) => setForwardTargets([...event.target.selectedOptions].map((option) => option.value))} className="min-w-0 flex-1 rounded-lg border p-2 text-xs">{conversations.filter((conversation) => idOf(conversation) !== idOf(selectedConversation)).map((conversation) => <option key={idOf(conversation)} value={idOf(conversation)}>{conversationTitle(conversation)}</option>)}</select><button onClick={forward} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Forward</button><button onClick={() => setForwardMessage(null)} className="px-2 text-xs">Cancel</button></div>}
              {attachment && <div className="border-t border-amber-100 p-2 text-xs">Attached: {attachment.name}<button onClick={() => setAttachment(null)} className="ml-2 font-bold text-red-700">Remove</button></div>}
              <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-amber-100 bg-white p-2 sm:p-3"><label className="cursor-pointer rounded-lg border border-amber-200 p-2 text-amber-900" title="Attach media"><ImagePlus className="h-5 w-5" /><input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf" className="hidden" onChange={(event) => setAttachment(event.target.files?.[0] || null)} /></label><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" /><button disabled={sending || (!draft.trim() && !attachment)} className="rounded-xl bg-emerald-700 p-2.5 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button></form>
            </> : <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400"><MessageCircle className="mb-3 h-10 w-10" /><p className="text-sm">Choose a conversation or find a friend.</p></div>}
          </section>
        </div>
      </main>

      {groupOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><form onSubmit={createGroup} className="max-h-[85vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Create group</h2><button type="button" onClick={() => setGroupOpen(false)} className="text-gray-500">Close</button></div><input value={groupName} onChange={(event) => setGroupName(event.target.value)} required placeholder="Group name" className="w-full rounded-xl border px-3 py-2 text-sm" /><label className="block text-xs font-semibold">Group photo<input type="file" accept="image/*" onChange={(event) => setGroupAvatar(event.target.files?.[0] || null)} className="mt-1 block w-full text-xs" /></label><div className="space-y-2"><p className="text-xs font-bold">Choose friends</p>{friends.map((friend) => <label key={idOf(friend)} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={selectedMembers.has(idOf(friend))} onChange={(event) => setGroupMembers((current) => event.target.checked ? [...current, idOf(friend)] : current.filter((id) => id !== idOf(friend)))} />{friend.name}</label>)}</div><button className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white">Create group</button></form></div>}
      {addMembersOpen && selectedConversation?.isGroup && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><section className="max-h-[80vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Add friends to group</h2><button onClick={() => setAddMembersOpen(false)} className="text-gray-500">Close</button></div>{friends.filter((friend) => !selectedConversation.members?.some((member) => idOf(member) === idOf(friend))).map((friend) => <label key={idOf(friend)} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={addMemberIds.includes(idOf(friend))} onChange={(event) => setAddMemberIds((current) => event.target.checked ? [...current, idOf(friend)] : current.filter((id) => id !== idOf(friend)))} />{friend.name}</label>)}<button onClick={addGroupMembers} className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-bold text-white">Add selected friends</button></section></div>}
    </div>
  );
}
