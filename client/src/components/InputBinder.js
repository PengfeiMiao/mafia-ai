import React, {useState} from 'react';
import {Box, Button, Input} from "@chakra-ui/react";

const InputBinder = ({onSend, defaultValue, children}) => {
  const [message, setMessage] = useState(defaultValue ?? '');

  const handleSend = () => {
    onSend(message);
    setMessage('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Box padding={'12px 32px 2px 32px'} bgColor="white" boxShadow="sm" w="60vw">
      <Box display="flex" marginBottom="10px">
        <Input placeholder='Input your message.'
               mr="10px"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyDown={handleKeyDown}
        />
        <Button onClick={() => handleSend()}>Send</Button>
      </Box>
      {children}
    </Box>
  );
};

export default InputBinder;