import React, {useEffect, useState} from 'react';
import {Flex} from '@chakra-ui/react';
import InputBinder from "@/components/InputBinder";
import MessageList from "@/components/MessageList";

const HomePage = () => {
  const [messages, setMessages] = useState([]);

  const getChatHistory = async () => {
    setMessages([
      {
        'id': '1',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '2',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      },
      {
        'id': '3',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '4',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      },
      {
        'id': '5',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '6',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      },
      {
        'id': '7',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '8',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      },
      {
        'id': '9',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '10',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      },
      {
        'id': '11',
        'content': 'Hi, welcome to mafia ai!',
        'time': '2024-01-01 00:00:00',
        'type': 'system'
      },
      {
        'id': '12',
        'content': 'I\'m MPF.',
        'time': '2024-01-01 00:00:00',
        'type': 'user'
      }
    ]);
  };

  useEffect(() => {
    getChatHistory().then();
  }, []);

  return (
    <Flex h="100vh" w="100wh" justify="center" align="center" direction="column">
      <MessageList data={messages}></MessageList>
      <InputBinder onSearch={()=>{}}></InputBinder>
    </Flex>
  );
}

export default HomePage;