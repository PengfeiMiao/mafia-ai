import React, {useEffect, useState} from 'react';
import {Flex, useBreakpointValue, useDisclosure} from '@chakra-ui/react';
import DialoguePage from "@/pages/dialogue/DialoguePage";
import SessionDrawer from "@/pages/dialogue/SessionDrawer";
import MenuBar from "@/pages/dialogue/MenuBar";
import WsProvider from "@/store/WsProvider";

const DialogPage = () => {
  const {open, onToggle, onOpen} = useDisclosure();
  const [dialogWidth, setDialogWidth] = useState('96%');
  const [dialogInit, setDialogInit] = useState(false);
  const dialogStyle = useBreakpointValue({
    base: {
      flag: 0,
      open: false,
      width: `calc(100vw - 64px)`,
      smWidth: `calc(100vw - 64px)`,
      selectorWidth: '120px',
      pendingX: '24px',
      drawerPosition: 'absolute',
      drawerMarginLeft: '64px',
      sessionMaxWidth: '56px'
    },
    md: {
      flag: 1,
      open: false,
      width: `calc(100vw - 64px)`,
      smWidth: `calc(100vw - 64px)`,
      pendingX: '24px',
      selectorWidth: '120px',
      drawerPosition: 'absolute',
      drawerMarginLeft: '64px',
      sessionMaxWidth: '96px'
    },
    lg: {
      flag: 2,
      open: true,
      width: '90vw',
      smWidth: '75vw',
      pendingX: '4%',
      selectorWidth: '160px',
      drawerPosition: 'relative',
      drawerMarginLeft: '0px',
      sessionMaxWidth: '160px'
    }
  }, {ssr: false});

  useEffect(() => {
    if (dialogStyle.open === true && !dialogInit) {
      onOpen();
      setDialogInit(true);
    }
  }, [dialogStyle]);

  const handleToggle = () => {
    onToggle();
    if (!open) {
      setDialogWidth(dialogStyle.smWidth);
    } else {
      setTimeout(() => {
        setDialogWidth(dialogStyle.width);
      }, 350);
    }
  };

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <MenuBar outerStyle={{width: '64px', minWidth: '64px'}}/>
      <SessionDrawer
        open={open}
        onToggle={handleToggle}
        outerStyle={{
          width: '16vw',
          minWidth: '132px',
          drawerPosition: dialogStyle.drawerPosition,
          drawerMarginLeft: dialogStyle.drawerMarginLeft,
          sessionMaxWidth: dialogStyle.sessionMaxWidth
      }}/>
      <WsProvider uri={"/ws/stream"}>
        <DialoguePage
          outerStyle={{
            paddingLeft: dialogStyle.pendingX,
            paddingRight: dialogStyle.pendingX,
            width: dialogWidth,
            selectorWidth: dialogStyle.selectorWidth
          }}/>
      </WsProvider>
    </Flex>
  );
}

export default DialogPage;