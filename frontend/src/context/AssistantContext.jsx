import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { useLocationContext } from './LocationContext';

const AssistantContext = createContext(null);

export const AssistantProvider = ({ children }) => {
  const { selectedCity, userCoords } = useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am CineMate AI, your personal cinema concierge. How can I help you find the perfect movie experience today?",
      suggestedChips: [
        'Show Tamil movies near me tonight',
        'Find a thriller after 7 PM',
        'Show movies with recliner seats',
        'Find the cheapest available show nearby',
        'Which theatre is closest to me?',
      ],
      timestamp: new Date(),
    },
  ]);

  const sendMessage = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.post('/assistant/ask', {
        query: queryText.trim(),
        city: selectedCity,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
      });

      const { message, actionCards, reasoning, isAiGenerated } = res.data;

      const assistantMsg = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: message,
        actionCards: actionCards || [],
        reasoning,
        isAiGenerated,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'Apologies, I encountered a temporary connection issue. Please try asking again!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        text: "Chat cleared! How can I assist your movie plans today?",
        suggestedChips: [
          'Show Tamil movies near me tonight',
          'Find a family movie under ₹500 for two people',
          'Show movies with recliner seats',
        ],
        timestamp: new Date(),
      },
    ]);
  };

  const value = {
    isOpen,
    openAssistant: () => setIsOpen(true),
    closeAssistant: () => setIsOpen(false),
    toggleAssistant: () => setIsOpen((prev) => !prev),
    messages,
    sendMessage,
    isLoading,
    clearChat,
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
