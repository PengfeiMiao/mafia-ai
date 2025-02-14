import React, {useEffect} from 'react';
import {Flex, Text} from '@chakra-ui/react';
import MenuBar from "@/pages/dialogue/MenuBar";

const DialogPage = () => {

  useEffect(() => {
  }, []);

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <Text>Empty Page</Text>
    </Flex>
  );
}

export default DialogPage;