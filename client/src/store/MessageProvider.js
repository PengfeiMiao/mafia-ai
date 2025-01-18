import React, { createContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const [messageMap, setMessageMap] = useState(new Map());
  const [socket, setSocket] = useState(null);

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    function connectWebSocket() {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${wsProtocol}://localhost:8000/ws/stream`;
      const newSocket = new WebSocket(url);

      newSocket.onopen = () => {
        console.log("[open] Connection established");
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessageMap(new Map(messageMap).set(data?.id, data));
      };

      newSocket.onclose = (event) => {
        if (event.wasClean) {
          console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          console.log('[close] Connection died');
        }
        setSocket(null);
      };

      newSocket.onerror = (error) => {
        console.log(`[error] ${error.message}`);
      };

      setSocket(newSocket);
    }

    connectWebSocket();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <MessagesContext.Provider value={{ messageMap, sendMessage }}>
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