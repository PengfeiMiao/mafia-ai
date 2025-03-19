import React, {useContext, useEffect, useRef, useState} from 'react';
import {Box, Button, Flex, Icon, Separator, Textarea, useDisclosure} from "@chakra-ui/react";
import {RiAttachmentLine, RiPauseCircleFill, RiSendPlaneFill, RiSendPlaneLine} from "react-icons/ri";
import {cleanSession, uploadAttachment} from "@/api/api";
import {GlobalContext} from "@/store/GlobalProvider";
import {MdCleaningServices} from "react-icons/md";
import FileUploader from "@/components/FileUploader";
import {BiBrain, BiSearchAlt} from "react-icons/bi";
import ClickableTag from "@/components/ClickableTag";
import SearchProgress from "@/pages/dialogue/SearchProgress";

const InputBinder = (
  {
    onSend,
    webOpen,
    status,
    websites,
    onInterrupt,
    onClean,
    isPending,
    defaultValue,
    outerStyle
  }) => {
  const [message, setMessage] = useState(defaultValue ?? '');
  const [attachments, setAttachments] = useState(new Map());
  const clearRef = useRef(null);
  const textRef = useRef(null);
  const {open, onOpen, onToggle} = useDisclosure();
  const {currentSession, currentMode, setCurrentMode} = useContext(GlobalContext);

  const rootStyle = {
    width: '60%',
    padding: '12px 12px 2px 12px',
    ...outerStyle
  };

  const isEmpty = () => {
    return message === null || message.trim().length === 0;
  }

  const handleClean = async () => {
    let result = await cleanSession(currentSession?.id);
    if (result) {
      onClean();
    }
  };

  const handleSend = () => {
    if (isEmpty()) {
      return;
    }
    onSend(message, Array.from(attachments.values()));
    setMessage('');
    setAttachments(new Map());
    clearRef.current.click();
  };

  const handleInterrupt = () => {
    if (isPending) {
      onInterrupt();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const getRowHeight = (text, element) => {
    if (!element) {
      return "2lh";
    }

    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const textareaPadding = 16;
    const maxCharsPerLine = Math.floor((element.clientWidth - textareaPadding) / 8);

    const lines = text.split('\n').map(line => Math.ceil(Math.max(line.length, 1) / maxCharsPerLine));
    const maxLines = 6;
    const totalLines = Math.min(lines.reduce((acc, curr) => acc + curr, 0) + 1, maxLines);

    return `${lineHeight * totalLines}px`;
  };

  useEffect(() => {
    if (currentMode.includes('web')) {
      onOpen();
    }
  }, []);

  useEffect(() => {
    if (open) setCurrentMode('web');
  }, [open]);

  return (
    <Box
      style={rootStyle}
      bgColor={'gray.100'}>
      <SearchProgress open={webOpen} status={status} count={websites?.length ?? 0}/>
      <Flex direction="row" mb="8px">
        <ClickableTag startEl={<BiSearchAlt/>} onClick={() => {
          onToggle();
        }}>
          Web Search
        </ClickableTag>
        <ClickableTag startEl={<BiBrain/>} onClick={() => {
        }} outerStyle={{marginLeft: "8px"}}>
          Deep Thinking
        </ClickableTag>
      </Flex>
      <Flex padding="12px" bgColor="white" boxShadow="sm" direction="row">
        <FileUploader
          onUpload={(newFiles) => uploadAttachment(currentSession?.id, newFiles)}
          onChange={(newAttachments) => {
            setAttachments(newAttachments);
          }}
          clearRef={clearRef}
          preElements={<>
            <Button
              w="24px"
              borderRadius="md"
              bgColor={!isPending ? 'purple.muted' : 'gray.muted'}
              onClick={handleClean}
            >
              <Icon h="auto">
                <MdCleaningServices/>
              </Icon>
            </Button>
            <Separator marginX="8px" orientation="vertical" height="auto"/>
            <Textarea
              ref={textRef}
              placeholder='Input message here.'
              mr="4px"
              h={getRowHeight(message, textRef?.current)}
              resize="none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </>}
          postElements={
            <Button
              w="24px"
              borderRadius="full"
              bgColor={(!isEmpty() || isPending) ? 'purple.muted' : 'gray.muted'}
              onClick={isPending ? handleInterrupt : handleSend}
            >
              <Icon h="auto">
                {isPending ? <RiPauseCircleFill/> : (isEmpty() ? <RiSendPlaneLine/> : <RiSendPlaneFill/>)}
              </Icon>
            </Button>
          }
        >
          <Icon
            w="20px"
            h="100%"
            maxH="40px"
            mr="12px"
            borderRadius="sm"
            bgColor={'purple.muted'}
            color={'white'}>
            <RiAttachmentLine/>
          </Icon>
        </FileUploader>
      </Flex>
    </Box>
  );
};

export default InputBinder;