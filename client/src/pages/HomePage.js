import React, {useEffect, useState} from 'react';
import {Flex, useDisclosure} from '@chakra-ui/react';
import DialoguePage from "@/pages/dialogue/DialoguePage";
import SessionDrawer from "@/pages/dialogue/SessionDrawer";
import MenuBar from "@/pages/dialogue/MenuBar";

const HomePage = () => {
  const {open, onToggle} = useDisclosure();
  const [dialogWidth, setDialogWidth] = useState(75);

  useEffect(() => {
    onToggle();
  }, []);

  const handleToggle = () => {
    onToggle();
    if (!open) {
      setDialogWidth(75);
    } else {
      setTimeout(() => {
        setDialogWidth(90);
      }, 350);
    }
  };

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <SessionDrawer open={open} onToggle={handleToggle} outerStyle={{width: '16vw', minWidth: '132px'}}/>
      <DialoguePage outerStyle={{width: `${dialogWidth}vw`, paddingLeft: '10%', paddingRight: '10%'}}/>
    </Flex>
  );
}

export default HomePage;