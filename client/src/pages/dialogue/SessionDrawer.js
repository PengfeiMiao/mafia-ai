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
import React, {useContext, useEffect, useState} from "react";
import {SlArrowLeft, SlArrowRight, SlMenu} from "react-icons/sl";
import {createSession, getSessions, updateSession} from "@/api/api";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import {GlobalContext} from "@/store/GlobalProvider";
import {EditableLabel} from "@/components/EditableLabel";
import {useNavigate} from "react-router-dom";

const SessionDrawer = ({open, onToggle, outerStyle}) => {
  const {currentSession, setCurrentSession} = useContext(GlobalContext);
  const [sessions, setSessions] = useState([]);
  const [editedId, setEditedId] = useState('');
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentSessionId = searchParams.get('sessionId');

  useEffect(() => {
    getAllSessions().then();
  }, []);

  const rootStyle = {
    height: '100%',
    width: '20vw',
    drawerPosition: 'relative',
    drawerMarginLeft: '0px',
    ...outerStyle
  };

  const getAllSessions = async () => {
    let result = await getSessions();
    if (result) {
      setSessions(result);
      let curr = currentSessionId && currentSessionId !== 'undefined' ?
        result.find(it => it.id === currentSessionId) : result[0];
      handleSelect(curr);
    }
  };

  const handleSelect = (item) => {
    setCurrentSession(item);
    navigate(`/dialog?sessionId=${item?.id}`, {replace: true});
  }

  const handleCreate = async () => {
    let session = await createSession({title: 'untitled'});
    if (session?.id) {
      setSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
    }
  };

  const handleEdit = (id) => {
    setEditedId(id);
  };

  const handleDelete = async (id) => {
    if (id === currentSession?.id) {
      let index = sessions.findIndex(it => it.id !== currentSession?.id);
      if (index > -1) {
        setCurrentSession(sessions[index]);
      }
    }
    await updateSession({id, status: 'inactive'});
    setSessions((prev) => prev.filter(it => it.id !== id));
  };

  const handleSubmit = async (id, title) => {
    await updateSession({id, title});
    setEditedId('');
  };

  const renderMenu = (key) => {
    return <Box position="relative">
      <MenuRoot>
        <MenuTrigger asChild>
          <SlMenu/>
        </MenuTrigger>
        <MenuContent position="absolute" left="100%" top={0} ml={2} zIndex={1}>
          <MenuItem value="rename" onClick={() => handleEdit(key)}>
            <RiEdit2Line/>
            <Text>Rename</Text>
          </MenuItem>
          <MenuItem value="delete" onClick={() => handleDelete(key)}>
            <RiDeleteBin5Line/>
            <Text>Delete</Text>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Box>;
  }

  return (
    <Flex
      h="100%" direction="row" justify="flex-end"
      position={rootStyle.drawerPosition}
      ml={rootStyle.drawerMarginLeft}
      zIndex={888}>
      <Presence
        style={rootStyle}
        bgColor={'bg.panel'}
        boxShadow="4px 0px 4px 2px rgba(0,0,0,0.1)"
        present={open}
        animationName={{
          _open: "slide-from-left",
          _closed: "slide-to-left",
        }}
        animationDuration="slow"
      >
        <Center>
          <Button w="90%" mt="12px" borderRadius="xl" onClick={handleCreate}>
            <Text>New Session</Text>
          </Button>
        </Center>
        {sessions.map((item) => (
          <Card.Root
            key={item.id}
            margin="12px"
            bgColor={item.id === currentSession?.id ? 'purple.muted' : 'white'}
          >
            <Card.Body padding="8px 12px">
              <Flex w="100%" align="center" justify="space-between" direction="row">
                <EditableLabel
                  onSubmit={(e) => handleSubmit(item.id, e.target.value)}
                  isEditable={item.id === editedId}
                  onSelect={() => handleSelect(item)}
                  outerStyle={{sessionMaxWidth: outerStyle.sessionMaxWidth}}
                >
                  {item.title}
                </EditableLabel>
                {renderMenu(item.id)}
              </Flex>
            </Card.Body>
          </Card.Root>
        ))}
      </Presence>
      <Flex
        h="100%"
        justify="center"
        direction="column"
        position="absolute"
        right="-20px"
      >
        <Icon
          h="40px"
          w="20px"
          borderRightRadius="md"
          bgColor={'purple.muted'}
          boxShadow="4px 0px 4px 2px rgba(0,0,0,0.1)"
          onClick={onToggle}
        >
          {open ? <SlArrowLeft/> : <SlArrowRight/>}
        </Icon>
      </Flex>
    </Flex>
  );
}

export default SessionDrawer;