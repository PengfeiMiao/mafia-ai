import React, {useRef, useState} from 'react';
import {Box, Button, Flex, Textarea, Icon} from "@chakra-ui/react";
import {RiSendPlaneFill, RiSendPlaneLine, RiPauseCircleFill} from "react-icons/ri";

const InputBinder = ({onSend, onInterrupt, isPending, defaultValue, outerStyle, children}) => {
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
      <Flex padding="12px" bgColor="white" boxShadow="sm">
        <Textarea
          ref={textRef}
          placeholder='Input message here.'
          mr="10px"
          h={getRowHeight(message, textRef?.current)}
          resize="none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          w="40px"
          borderRadius="4xl"
          bgColor={(!isEmpty() || isPending) ? 'purple.muted' : 'gray.muted'}
          onClick={isPending ? handleInterrupt : handleSend}
        >
          <Icon h="auto">
            {isPending ? <RiPauseCircleFill/> : (isEmpty() ? <RiSendPlaneLine/> : <RiSendPlaneFill/>)}
          </Icon>
        </Button>
      </Flex>
      {children}
    </Box>
  );
};

export default InputBinder;