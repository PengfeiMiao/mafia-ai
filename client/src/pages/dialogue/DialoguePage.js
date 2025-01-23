import React, {useEffect, useState} from 'react';
import {Flex} from '@chakra-ui/react';
import InputBinder from "@/components/InputBinder";
import MessageList from "@/components/MessageList";
import {get_messages} from "@/api/api";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {useMessages} from "@/store/MessageProvider";

const DialoguePage = ({outerStyle}) => {
  const [messages, setMessages] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const {messageMap, sendMessage} = useMessages();

  const getChatHistory = async () => {
    let result = await get_messages([{id: '123'}]);
    if (result) {
      setMessages(result);
    }
  };

  const handleSend = async (newMessage) => {
    let answerId = uuidv4();
    let createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    let messageObj = {
      id: uuidv4(),
      answer_id: answerId,
      session_id: '123',
      content: newMessage.replaceAll('\n', '\n\n'),
      type: 'user',
      created_at: createdAt
    };
    setMessages([...messages, messageObj]);
    setPendingQueue([...pendingQueue, answerId]);
    sendMessage(messageObj);
  };

  useEffect(() => {
    getChatHistory().then();
  }, []);

  useEffect(() => {
    for (let index = 0; index < pendingQueue.length; index++) {
      let latestMsg = messageMap.get(pendingQueue[index]);
      if (!latestMsg) continue;
      let msgIndex = messages.findIndex(it => it.id === pendingQueue[index]);
      if (msgIndex > -1) {
        let newMsgList = [...messages];
        newMsgList[msgIndex] = latestMsg;
        setMessages(newMsgList);
      } else {
        setMessages([...messages, latestMsg]);
      }
      if (latestMsg?.status === 'completed') {
        setTimeout(() => {
          setPendingQueue([...pendingQueue].slice(index, 1));
        }, 300);
      }
    }
  }, [messageMap]);

  return (
    <Flex h="100%" w="100%" justify="center" align="center" direction="column">
      <MessageList data={messages} outerStyle={outerStyle}></MessageList>
      <InputBinder onSend={handleSend} outerStyle={outerStyle}></InputBinder>
    </Flex>
  );
}

export default DialoguePage;