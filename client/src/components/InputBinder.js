import React, {useRef, useState} from 'react';
import {Box, Button, Flex, Textarea, Icon, Center} from "@chakra-ui/react";
import {RiSendPlaneFill, RiSendPlaneLine, RiPauseCircleFill, RiAttachmentLine} from "react-icons/ri";
import {
  FileUploadList,
  FileUploadRoot,
  FileUploadTrigger,
} from "@/components/ui/file-upload"

const InputBinder = ({onSend, onInterrupt, isPending, defaultValue, outerStyle}) => {
  const [message, setMessage] = useState(defaultValue ?? '');
  const textRef = useRef(null);

  const rootStyle = {
    width: '60vw',
    padding: '12px 12px 2px 12px',
    ...outerStyle
  };

  const isEmpty = () => {
    return message === null || message.trim().length === 0;
  }

  const handleSend = () => {
    if (isEmpty()) {
      return;
    }
    onSend(message);
    setMessage('');
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

  const handleUpload = () => {

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

  return (
    <Box
      style={rootStyle}
      bgColor={'gray.100'}>
      <Flex padding="12px" bgColor="white" boxShadow="sm" direction="row">
        <FileUploadRoot maxFiles={3}>
          <Flex w="100%">
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
            <FileUploadTrigger
              w="20px"
              h="auto"
              mr="12px"
              borderRadius="sm"
              bgColor={'purple.muted'}
              onClick={handleUpload}
              asChild>
              <Icon h="100%" w="16px" color={'white'}>
                <RiAttachmentLine/>
              </Icon>
            </FileUploadTrigger>

            <Button
              w="24px"
              borderRadius="4xl"
              bgColor={(!isEmpty() || isPending) ? 'purple.muted' : 'gray.muted'}
              onClick={isPending ? handleInterrupt : handleSend}
            >
              <Icon h="auto">
                {isPending ? <RiPauseCircleFill/> : (isEmpty() ? <RiSendPlaneLine/> : <RiSendPlaneFill/>)}
              </Icon>
            </Button>
          </Flex>
          <FileUploadList lineHeight="24px" showSize clearable/>
        </FileUploadRoot>
      </Flex>
    </Box>
  );
};

export default InputBinder;