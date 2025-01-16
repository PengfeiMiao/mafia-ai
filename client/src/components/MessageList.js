import React, {useEffect, useRef} from 'react';
import {Flex, Card, Text} from "@chakra-ui/react";

const MessageList = ({data, children}) => {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <Flex padding={'12px 32px'}
          bgColor={'gray.100'}
          boxShadow="sm"
          w="60vw"
          h="60vh"
          direction="column"
          overflowY="auto"
          ref={listRef}>
      {data.map((item) =>
        (<Card.Root
          key={item.id}
          marginY="8px"
          bg={item.type === "user" ? "purple.muted" : "white"}
          w={item.type === "user" ? "auto" : "100%"}
          ml={item.type === "user" ? "auto" : "0"}>
          <Card.Body padding="8px 12px">
            <Text>{item.content}</Text>
          </Card.Body>
        </Card.Root>)
      )}
      {children}
    </Flex>
  );
};

export default MessageList;