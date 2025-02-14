import {Flex, Icon, Image, Text} from "@chakra-ui/react";
import {HiOutlineChatAlt} from "react-icons/hi";
import {TbInputSearch, TbTestPipe} from "react-icons/tb";
import {useContext, useEffect} from "react";
import {GlobalContext} from "@/store/GlobalProvider";
import {useNavigate} from "react-router-dom";

const MenuBar = ({outerStyle}) => {
  const {currentMenu, setCurrentMenu} = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    let menu = location.pathname.replace('/', '')
    if (menu) {
      setCurrentMenu(menu);
    }
  }, []);

  const handleSelect = (text) => {
    let menu = text.toLowerCase();
    setCurrentMenu(menu);
    navigate(`/${menu}`, {replace: true});
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
          bgColor={selected === text.toLowerCase() ? 'purple.muted' : ''}
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
      zIndex={999}
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
        {renderMenu("Dialog", <HiOutlineChatAlt/>, handleSelect, currentMenu)}
        {renderMenu("RAG", <TbInputSearch/>, handleSelect, currentMenu)}
        {renderMenu("DEMO", <TbTestPipe/>, handleSelect, currentMenu)}
      </Flex>
    </Flex>
  );
}

export default MenuBar;