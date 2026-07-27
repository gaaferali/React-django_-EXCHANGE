import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Message } from '../types';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError('');
      const result = await apiService.getAllConversations();
      setConversations(result.data || []);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (senderID: number) => {
    setSelectedConversation(senderID);
    try {
      const result = await apiService.getConversation(senderID);
      setMessages(result.data || []);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      await apiService.sendMessage(selectedConversation, newMessage);
      setNewMessage('');
      await handleSelectConversation(selectedConversation);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading messages..." />;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">{UI_CONSTANTS.PAGE_TITLES.MESSAGES}</h1>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="row" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <div className="col-md-4 border-end" style={{ overflowY: 'auto' }}>
          <h5 className="mb-3">Conversations</h5>
          {conversations.length === 0 ? (
            <div className="alert alert-info">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.messageID}
                className={`p-3 border-bottom cursor-pointer ${
                  selectedConversation === conv.senderID ? 'bg-light' : ''
                }`}
                onClick={() => handleSelectConversation(conv.senderID)}
                style={{ cursor: 'pointer' }}
              >
                <h6 className="mb-1">{conv.senderName}</h6>
                <small className="text-muted">{conv.content.substring(0, 50)}...</small>
              </div>
            ))
          )}
        </div>

        {/* Message Display */}
        <div className="col-md-8 d-flex flex-column">
          {selectedConversation ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.messageID}
                    className={`mb-2 ${msg.senderID === user?.userID ? 'text-end' : ''}`}
                  >
                    <div
                      className={`d-inline-block p-2 rounded ${
                        msg.senderID === user?.userID
                          ? 'bg-primary text-white'
                          : 'bg-light text-dark'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      {msg.content}
                    </div>
                    <div className="small text-muted">{new Date(msg.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={isSending}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <p className="text-muted">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
