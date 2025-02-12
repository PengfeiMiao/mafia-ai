import {Flex, Icon, Image, Text} from "@chakra-ui/react";
import {HiOutlineChatAlt} from "react-icons/hi";
import {TbInputSearch, TbTestPipe} from "react-icons/tb";
import {useState} from "react";

export const MenuBar = ({outerStyle}) => {
  const [selectedMenu, setSelectedMenu] = useState("");

  const handleSelect = (text) => {
    setSelectedMenu(text);
  };

  const rootStyle = {
    height: '100%',
    width: '64px',
    ...outerStyle
  };


  const renderMenu = (text, icon, onToggle, selected) => {
    return (
      <Flex mt="24px"
            align="center"
            direction="column"
            onClick={() => onToggle(text)}>
        <Icon
          p="6px"
          boxSize="40px"
          borderRadius="full"
          bgColor={selected === text ? 'purple.muted' : ''}
          color={'white'}>
          {icon}
        </Icon>
        <Text fontSize="xs" fontWeight="bold" color="white">{text}</Text>
      </Flex>
    );
  };

  return (
    <Flex
      style={rootStyle}
      zIndex="999"
      justify="flex-start"
      align="center"
      bgColor={'purple.300'}
      direction="column">
      <Image
        marginY="12px"
        boxSize="40px"
        borderRadius="full"
        bgColor={'purple.muted'}
        src="https://bit.ly/naruto-sage"/>

      <Flex
        mt="24px"
        justify="flex-start"
        align="center"
        direction="column">
        {renderMenu("Dialog", <HiOutlineChatAlt/>, handleSelect, selectedMenu)}
        {renderMenu("RAG", <TbInputSearch/>, handleSelect, selectedMenu)}
        {renderMenu("DEMO", <TbTestPipe/>, handleSelect, selectedMenu)}
      </Flex>
    </Flex>
  );
}