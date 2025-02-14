import React, {useEffect} from 'react';
import {Flex, Text} from '@chakra-ui/react';
import MenuBar from "@/pages/dialogue/MenuBar";

const DemoPage = () => {

  useEffect(() => {
  }, []);

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <Flex h="100vh" w="auto" bgColor={'gray.100'}></Flex>
    </Flex>
  );
}

export default DemoPage;