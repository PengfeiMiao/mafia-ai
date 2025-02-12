import React, {useEffect} from 'react';
import {Flex, useDisclosure} from '@chakra-ui/react';
import DialoguePage from "@/pages/dialogue/DialoguePage";
import {SessionDrawer} from "@/pages/dialogue/SessionDrawer";
import {MenuBar} from "@/pages/dialogue/MenuBar";

const HomePage = () => {
  const { open, onToggle } = useDisclosure();

  useEffect(() => {
    onToggle();
  }, []);

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px' }}/>
      <SessionDrawer open={open} onToggle={onToggle} outerStyle={{width: '16vw', minWidth: '132px' }}/>
      <DialoguePage outerStyle={{width: open ? '75vw' : '90vw', paddingLeft: '10%', paddingRight: '10%'}}/>
    </Flex>
  );
}

export default HomePage;