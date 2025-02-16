import React, {createContext, useEffect, useState} from 'react';
import {WS_URL} from "@/api/api";

export const WsContext = createContext(null);

const WsProvider = ({ uri, onMessage, children }) => {
  const [socket, setSocket] = useState(null);
  const [reconnectInterval, setReconnectInterval] = useState(1000);

  const connectWebSocket = ()=> {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${wsProtocol}://${WS_URL}${uri}`;
    const newSocket = new WebSocket(url);

    newSocket.onopen = () => {
      console.log("[open] Connection established");
      setReconnectInterval(1000);
      setSocket(newSocket);
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    newSocket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.log('[close] Connection died, attempting to reconnect...');
        attemptReconnect();
      }
    };

    newSocket.onerror = (error) => {
      console.log(`[error] ${error.message}`);
    };
  }

  const attemptReconnect = () => {
    console.log(`Attempting to reconnect in ${reconnectInterval / 1000} seconds...`);
    const timeoutId = setTimeout(() => {
      connectWebSocket();
      setReconnectInterval((prevInterval) => Math.min(prevInterval * 2, 30000));
    }, reconnectInterval);

    return () => clearTimeout(timeoutId);
  }


  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <WsContext.Provider value={{ socket, connectWebSocket }}>
      {children}
    </WsContext.Provider>
  );
};

export default WsProvider;