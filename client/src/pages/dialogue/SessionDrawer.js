import {
  Card,
  Text,
  Flex,
  Icon,
  Presence,
  Button,
  Center,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem, Box
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {SlArrowLeft, SlArrowRight, SlMenu} from "react-icons/sl";

export const SessionDrawer = ({open, onToggle}) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions([
      {id: '123', title: 'Test'},
      {id: '124', title: 'MPF'},
    ]);
  }, []);

  return (
    <Flex h="100%" justify="center" direction="row">
      <Presence
        h="100%"
        w="20vw"
        bgColor={'bg.panel'}
        present={open}
        animationName={{
          _open: "slide-from-left-full",
          _closed: "slide-to-left-full",
        }}
        animationDuration="slow"
      >
        <Center>
          <Button w="90%" mt="12px" borderRadius="xl">
            <Text>New Session</Text>
          </Button>
        </Center>
        {sessions.map((item) => (
          <Card.Root
            key={item.id}
            margin="12px">
            <Card.Body padding="8px 12px">
              <Flex w="100%" align="center" justify="space-between" direction="row">
                <Text>{item.title}</Text>
                <Box position="relative">
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <SlMenu />
                    </MenuTrigger>
                    <MenuContent position="absolute" left="100%" top={0} ml={2} zIndex={1}>
                      <MenuItem value="delete">Delete</MenuItem>
                      <MenuItem value="rename">Rename</MenuItem>
                    </MenuContent>
                  </MenuRoot>
                </Box>
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Presence>
      <Flex
        h="100%"
        justify="center"
        direction="column"
      >
        <Icon
          h="40px"
          w="20px"
          borderRightRadius="md"
          bgColor={'purple.muted'}
          onClick={onToggle}
        >
          {open ? <SlArrowLeft/> : <SlArrowRight/>}
        </Icon>
      </Flex>
    </Flex>
  );
}