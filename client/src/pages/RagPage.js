import React, {useEffect} from 'react';
import {Center, Flex, Tabs} from '@chakra-ui/react';
import MenuBar from "@/pages/dialogue/MenuBar";
import {LuFolder, LuSquareCheck} from "react-icons/lu"
import RagList from "@/pages/rag/RagList";
import FileList from "@/pages/rag/FileList";
import {PiPlanetBold} from "react-icons/pi";

const RagPage = () => {
  useEffect(() => {
  }, []);

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <Center h="100%" w="100%" padding="20px" bgColor={'gray.100'}>
        <Flex h="100%" w="100%" bgColor={'white'}>
          <Tabs.Root w="100%" defaultValue="files">
            <Tabs.List>
              <Tabs.Trigger value="rags">
                <LuFolder />
                RAGs
              </Tabs.Trigger>
              <Tabs.Trigger value="files">
                <LuSquareCheck />
                Files
              </Tabs.Trigger>
              <Tabs.Trigger value="websites">
                <PiPlanetBold />
                Websites
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content h="90%" paddingY="0" value="rags">
              <RagList/>
            </Tabs.Content>
            <Tabs.Content h="90%" paddingY="0" value="files">
              <FileList/>
            </Tabs.Content>
            <Tabs.Content h="90%" paddingY="0" value="websites">
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Center>
    </Flex>
  );
}

export default RagPage;