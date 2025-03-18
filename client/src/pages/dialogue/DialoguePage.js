import React, {useContext, useEffect, useState} from 'react';
import {Flex} from '@chakra-ui/react';
import InputBinder from "@/pages/dialogue/InputBinder";
import TipsHeader from "@/components/TipsHeader";
import MessageList from "@/pages/dialogue/MessageList";
import {getMessages} from "@/api/api";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {GlobalContext} from "@/store/GlobalProvider";
import SessionHeader from "@/pages/dialogue/SessionHeader";
import {useWebsocket} from "@/store/WsProvider";
import {useDelayToggle} from "@/store/Hook";


const DialoguePage = ({outerStyle}) => {
  const [messages, setMessages] = useState([]);
  const [pendingId, setPendingId] = useState('');
  const [ragId, setRagId] = useState('');
  const [modelName, setModelName] = useState('');
  const {message, sendMessage, interruptMessage} = useWebsocket();
  const {currentSession, currentMode} = useContext(GlobalContext);
  const {toggle, onToggle} = useDelayToggle();

  const getChatHistory = async () => {
    let result = await getMessages([{id: currentSession?.id}]);
    if (result) {
      setMessages(result);
    }
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
      attachments: attachments,
      rag_id: ragId,
      model: modelName,
      mode: currentMode
    };
    setMessages([...messages, messageObj]);
    setPendingId(answerId);
    sendMessage(messageObj);
  };

  const handleInterrupt = () => {
    interruptMessage();
    setPendingId('');
  };

  const handleSelectorChanged = (modelSelected, ragSelected) => {
    setModelName(modelSelected);
    setRagId(ragSelected);
  };

  useEffect(() => {
    getChatHistory().then();
  }, [currentSession]);

  useEffect(() => {
    if (!message?.content?.trim() || message?.id !== pendingId) return;
    let msgIndex = messages.findIndex(it => it.id === pendingId);
    if (msgIndex > -1) {
      let newMsgList = [...messages];
      newMsgList[msgIndex] = message;
      setMessages(newMsgList);
    } else {
      setMessages([...messages, message]);
    }
    if (message?.status === 'completed') {
      setPendingId('');
    }
  }, [message]);

  return (
    <Flex h="100%" w={`calc(100vw - 64px)`} justify="center" align="center" direction="column">
      <TipsHeader title={'Context has been cleaned.'} hidden={toggle}/>
      <SessionHeader onChange={handleSelectorChanged} outerStyle={outerStyle}/>
      <MessageList data={messages} outerStyle={outerStyle}/>
      <InputBinder
        onSend={handleSend}
        webOpen={!!(currentMode === 'web' && pendingId)}
        websites={message?.websites}
        onInterrupt={handleInterrupt}
        isPending={!!pendingId}
        outerStyle={outerStyle}
        onClean={onToggle}/>
    </Flex>
  );
}

export default DialoguePage;