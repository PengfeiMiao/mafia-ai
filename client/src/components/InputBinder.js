import React, {useRef, useState} from 'react';
import {Box, Button, Flex, Textarea} from "@chakra-ui/react";

const InputBinder = ({onSend, defaultValue, outerStyle, children}) => {
  const [message, setMessage] = useState(defaultValue ?? '');
  const textRef = useRef(null);

  const rootStyle = {
    width: '60vw',
    padding: '12px 12px 2px 12px',
    ...outerStyle
  };

  const handleSend = () => {
    if (message === null || message.trim().length === 0) {
      return;
    }
    onSend(message);
    setMessage('');
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
        <Button onClick={() => handleSend()}>Send</Button>
      </Flex>
      {children}
    </Box>
  );
};

export default InputBinder;