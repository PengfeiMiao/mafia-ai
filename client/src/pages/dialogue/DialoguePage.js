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
  const [pendingId, setPendingId] = useState('');
  const {messageMap, sendMessage, interruptMessage} = useMessages();

  const getChatHistory = async () => {
    let result = await get_messages([{id: '123'}]);
    if (result) {
      setMessages(result);
    }
  };

  const handleSend = (newMessage) => {
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
    setPendingId(answerId);
    sendMessage(messageObj);
  };

  const handleInterrupt = () => {
    interruptMessage();
    setPendingId('');
  };

  useEffect(() => {
    getChatHistory().then();
  }, []);

  useEffect(() => {
    let latestMsg = messageMap.get(pendingId);
    if (!latestMsg) return;
    let msgIndex = messages.findIndex(it => it.id === pendingId);
    if (msgIndex > -1) {
      let newMsgList = [...messages];
      newMsgList[msgIndex] = latestMsg;
      setMessages(newMsgList);
    } else {
      setMessages([...messages, latestMsg]);
    }
    if (latestMsg?.status === 'completed') {
      setPendingId('');
    }
  }, [messageMap]);

  return (
    <Flex h="100%" w="100%" justify="center" align="center" direction="column">
      <MessageList data={messages} outerStyle={outerStyle} />
      <InputBinder
        onSend={handleSend}
        onInterrupt={handleInterrupt}
        isPending={!!pendingId}
        outerStyle={outerStyle} />
    </Flex>
  );
}

export default DialoguePage;