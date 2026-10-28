import { ArrowLeft, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { apiError, websocketUrl } from '../api/apiService';
import placeholder from '../assets/furniture-placeholder.svg';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { Conversation, Message } from '../types';

export default function MessagesPage() {
  const { conversationId } = useParams(); const navigate = useNavigate(); const { user } = useAuth(); const selectedId = conversationId ? Number(conversationId) : null;
  const [conversations, setConversations] = useState<Conversation[]>([]); const [messages, setMessages] = useState<Message[]>([]); const [text, setText] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [connection, setConnection] = useState<'connecting' | 'online' | 'offline'>('offline');
  const socketRef = useRef<WebSocket | null>(null); const retryRef = useRef<number | undefined>(undefined); const attemptsRef = useRef(0);
  const loadConversations = useCallback(() => api.conversations().then((response) => setConversations(response.results)).catch((reason) => setError(apiError(reason))).finally(() => setLoading(false)), []);
  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => { if (!selectedId) { setMessages([]); return; } api.messages(selectedId).then((response) => { setMessages(response.results); void api.markConversationRead(selectedId); }).catch((reason) => setError(apiError(reason))); }, [selectedId]);
  useEffect(() => {
    if (!selectedId) return;
    let disposed = false;
    const connect = () => {
      if (disposed) return;
      setConnection('connecting');
      const socket = new WebSocket(websocketUrl(selectedId)); socketRef.current = socket;
      socket.onopen = () => { attemptsRef.current = 0; setConnection('online'); };
      socket.onmessage = (event) => { const payload = JSON.parse(event.data) as { type: string; message?: Message; detail?: string }; if (payload.type === 'message' && payload.message) { setMessages((current) => current.some((item) => item.id === payload.message!.id) ? current : [...current, payload.message!]); void loadConversations(); } if (payload.type === 'error') setError(payload.detail || 'Message could not be sent.'); };
      socket.onerror = () => setConnection('offline');
      socket.onclose = () => { socketRef.current = null; setConnection('offline'); if (!disposed && attemptsRef.current < 5) { const delay = Math.min(1000 * 2 ** attemptsRef.current, 10_000); attemptsRef.current += 1; retryRef.current = window.setTimeout(connect, delay); } };
    };
    connect();
    return () => { disposed = true; if (retryRef.current) window.clearTimeout(retryRef.current); socketRef.current?.close(); socketRef.current = null; };
  }, [selectedId, loadConversations]);
  const send = async (event: FormEvent) => { event.preventDefault(); const body = text.trim(); if (!body || !selectedId) return; setText(''); if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify({ body })); else { try { const message = await api.sendMessage(selectedId, body); setMessages((current) => [...current, message]); } catch (reason) { setError(apiError(reason)); setText(body); } } };
  const selected = conversations.find((item) => item.id === selectedId);
  if (loading) return <LoadingSpinner fullScreen message="Loading conversations" />;
  return <div className="container page-section message-page"><header className="page-header compact"><div><span className="eyebrow">Private conversations</span><h1>Messages</h1></div></header>{error && <Alert message={error} onClose={() => setError('')} />}<div className={`message-layout${selected ? ' has-selection' : ''}`}><aside className="conversation-list"><h2>Conversations</h2>{conversations.length ? conversations.map((item) => <button type="button" key={item.id} className={selectedId === item.id ? 'active' : ''} onClick={() => navigate(`/messages/${item.id}`)}><div className="avatar">{item.other_participant.name.charAt(0)}</div><div><strong>{item.other_participant.name}</strong><span>{item.last_message?.body || item.listing?.title || 'New conversation'}</span></div>{item.unread_count > 0 && <b>{item.unread_count}</b>}</button>) : <p className="muted">No conversations yet.</p>}</aside><section className="chat-panel">{selected ? <><header className="chat-header"><button type="button" onClick={() => navigate('/messages')} aria-label="Back to conversations"><ArrowLeft /></button><div><strong>{selected.other_participant.name}</strong><span className={`connection ${connection}`}>{connection}</span></div>{selected.listing && <Link to={`/listings/${selected.listing.id}`}><img src={selected.listing.cover_image_url || placeholder} alt="" /><span>{selected.listing.title}</span></Link>}</header><div className="message-thread" aria-live="polite">{messages.map((message) => <div key={message.id} className={`message-bubble${message.sender.id === user?.id ? ' mine' : ''}`}><p>{message.body}</p><time>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>)}</div><form className="message-composer" onSubmit={send}><label className="sr-only" htmlFor="new-message">Message</label><input id="new-message" maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message" autoComplete="off" /><button type="submit" disabled={!text.trim()} aria-label="Send message"><Send size={19} /></button></form></> : <EmptyState title="Select a conversation" description="Choose a conversation to view its message history." />}</section></div></div>;
}
