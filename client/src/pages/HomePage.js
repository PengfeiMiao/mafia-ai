import React from 'react';
import {Flex} from '@chakra-ui/react';
import DialoguePage from "@/pages/DialoguePage";

const HomePage = () => {
  // TODO: use https://www.chakra-ui.com/docs/components/presence

  return (
    <Flex h="100vh" w="100wh" justify="center" align="center" direction="column">
      <DialoguePage></DialoguePage>
    </Flex>
  );
}

export default HomePage;