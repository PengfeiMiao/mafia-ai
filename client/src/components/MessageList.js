import React, {useEffect, useRef} from 'react';
import {Card, Flex} from "@chakra-ui/react";
import {MarkdownView} from "@/components/MarkdownView";
import {Tag} from "@/components/ui/tag"
import {RiFile2Line} from "react-icons/ri";

const MessageList = ({data, outerStyle}) => {
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
        <Flex direction="column" key={item.id} marginY="8px">
          <Card.Root
            bg={item.type === "user" ? "purple.muted" : "white"}
            w={item.type === "user" ? "auto" : "100%"}
            ml={item.type === "user" ? "auto" : "0"}>
            <Card.Body padding="8px 12px">
              <MarkdownView markdown={item.content}/>
            </Card.Body>
          </Card.Root>
          <Flex direction="row" ml={item.type === "user" ? "auto" : "0"} mt="4px">
            {item.attachments ?
              item.attachments.map(({file_name, id}) =>
                <Tag key={id} size="md" ml="4px" bgColor="gray.solid" variant="solid" startElement={<RiFile2Line/>}>
                  {file_name}
                </Tag>
              )
              : <></>}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default MessageList;