import React from 'react';
import {Flex, useDisclosure} from '@chakra-ui/react';
import DialoguePage from "@/pages/dialogue/DialoguePage";
import {SessionDrawer} from "@/pages/dialogue/SessionDrawer";

const HomePage = () => {
  const { open, onToggle } = useDisclosure();
  return (
    <Flex h="100vh" w="100wh" justify="center" align="center" direction="row">
      <SessionDrawer open={open} onToggle={onToggle}/>
      <DialoguePage outerStyle={{width: '80%'}}/>
    </Flex>
  );
}

export default HomePage;