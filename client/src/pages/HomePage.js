import React, {useEffect, useState} from 'react';
import {Flex} from '@chakra-ui/react';
import InputBinder from "@/components/InputBinder";
import MessageList from "@/components/MessageList";
import {completions, get_messages} from "@/api/api";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const HomePage = () => {
  const [messages, setMessages] = useState([]);

  const getChatHistory = async () => {
    let result = await get_messages([{session_id: '123'}]);
    if (result) {
      setMessages(result);
    }
  };

  const handleSend = async (newMessage) => {
    let messageObj = {
      id: uuidv4(),
      session_id: '123',
      content: newMessage,
      type: 'user',
      created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    setMessages([...messages, messageObj]);
    let result = await completions(messageObj);
    if (result) {
      setMessages([...messages, messageObj, result]);
    }
  };

  useEffect(() => {
    getChatHistory().then();
  }, []);

  return (
    <Flex h="100vh" w="100wh" justify="center" align="center" direction="column">
      <MessageList data={messages}></MessageList>
      <InputBinder onSend={handleSend}></InputBinder>
    </Flex>
  );
}

export default HomePage;