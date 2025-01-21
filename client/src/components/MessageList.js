import React, {useEffect, useRef} from 'react';
import {Card, Flex} from "@chakra-ui/react";
import {MarkdownView} from "@/components/MarkdownView";

const MessageList = ({data, outerStyle, children}) => {
  const listRef = useRef(null);

  const rootStyle = {
    height: '100%',
    width: '60vw',
    padding: '12px 32px',
    ...outerStyle
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <Flex
      style={rootStyle}
      bgColor={'gray.100'}
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
            <MarkdownView markdown={item.content}/>
          </Card.Body>
        </Card.Root>)
      )}
      {children}
    </Flex>
  );
};

export default MessageList;