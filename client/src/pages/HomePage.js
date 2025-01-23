import React, {useEffect} from 'react';
import {Flex, useDisclosure} from '@chakra-ui/react';
import DialoguePage from "@/pages/dialogue/DialoguePage";
import {SessionDrawer} from "@/pages/dialogue/SessionDrawer";

const HomePage = () => {
  const { open, onToggle } = useDisclosure();

  useEffect(() => {
    onToggle();
  }, []);

  return (
    <Flex h="100vh" w="100vw" justify="center" align="center" direction="row">
      <SessionDrawer open={open} onToggle={onToggle} outerStyle={{width: '16vw'}}/>
      <DialoguePage outerStyle={{width: '80vw', paddingLeft: '10%', paddingRight: '10%'}}/>
    </Flex>
  );
}

export default HomePage;