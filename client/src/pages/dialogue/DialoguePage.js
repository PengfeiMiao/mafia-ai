import React, {useContext, useEffect, useState} from 'react';
import {Flex, Text} from '@chakra-ui/react';
import InputBinder from "@/components/InputBinder";
import TipsHeader from "@/components/TipsHeader";
import MessageList from "@/components/MessageList";
import {getMessages} from "@/api/api";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {useMessages} from "@/store/MessagesProvider";
import {GlobalContext} from "@/store/GlobalProvider";
import SessionHeader from "@/components/SessionHeader";

const DialoguePage = ({outerStyle}) => {
  const [messages, setMessages] = useState([]);
  const [pendingId, setPendingId] = useState('');
  const [cleaned, setCleaned] = useState(false);
  const {messageMap, sendMessage, interruptMessage} = useMessages();
  const {currentSession} = useContext(GlobalContext);

  const getChatHistory = async () => {
    let result = await getMessages([{id: currentSession?.id}]);
    if (result) {
      setMessages(result);
    }
  };

  const handleClean = () => {
    setCleaned(true);
    setTimeout(() => {
      setCleaned(false);
    }, 1000);
  };

  const handleSend = (newMessage, attachments) => {
    let answerId = uuidv4();
    let createdAt = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    let messageObj = {
      id: uuidv4(),
      answer_id: answerId,
      session_id: currentSession?.id,
      content: newMessage.replaceAll('\n', '\n\n'),
      type: 'user',
      created_at: createdAt,
      attachments: attachments
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
  }, [currentSession]);

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
      <TipsHeader title={'Context has been cleaned.'} hidden={!cleaned}/>
      <SessionHeader/>
      <MessageList data={messages} outerStyle={outerStyle}/>
      <InputBinder
        onSend={handleSend}
        onInterrupt={handleInterrupt}
        isPending={!!pendingId}
        outerStyle={outerStyle}
        onClean={handleClean}/>
    </Flex>
  );
}

export default DialoguePage;