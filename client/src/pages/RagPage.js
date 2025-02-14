import React, {useEffect} from 'react';
import {Flex, Center, Tabs} from '@chakra-ui/react';
import MenuBar from "@/pages/dialogue/MenuBar";
import { LuFolder, LuSquareCheck } from "react-icons/lu"
import RagList from "@/pages/rag/RagList";

const RagPage = () => {
  useEffect(() => {
  }, []);

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <Center h="100%" w="100%" padding="20px" bgColor={'gray.100'}>
        <Flex h="100%" w="100%" bgColor={'white'}>
          <Tabs.Root defaultValue="rags" w="100%">
            <Tabs.List>
              <Tabs.Trigger value="rags">
                <LuFolder />
                RAGs
              </Tabs.Trigger>
              <Tabs.Trigger value="files">
                <LuSquareCheck />
                Files
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content h="90%" paddingY="0" value="rags">
              <RagList/>
            </Tabs.Content>
            <Tabs.Content value="files">
              Manage your Files
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Center>
    </Flex>
  );
}

export default RagPage;