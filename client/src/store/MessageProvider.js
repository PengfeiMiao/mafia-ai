import React, { createContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  let socket;

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  };

  useEffect(() => {
    function connectWebSocket() {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      socket = new WebSocket(`${wsProtocol}://${window.location.host}/ws/stream`);

      socket.onopen = () => {
        console.log("[open] Connection established");
      };

      socket.onmessage = (event) => {
        console.log(`[message] Data received from server: ${event.data}`);
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };

      socket.onclose = (event) => {
        if (event.wasClean) {
          console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          console.log('[close] Connection died');
        }
      };

      socket.onerror = (error) => {
        console.log(`[error] ${error.message}`);
      };
    }

    connectWebSocket();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <MessagesContext.Provider value={{ messages, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = React.useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};