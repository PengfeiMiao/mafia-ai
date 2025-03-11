import React, {useContext, useEffect, useState} from "react";
import {Flex, Icon} from "@chakra-ui/react";
import {TbBoxModel2, TbDeviceDesktopSearch} from "react-icons/tb";
import CommonSelector from "@/components/CommonSelector";
import {getRags} from "@/api/api";
import {getHash, setHash} from "@/store/CacheStore";
import {GlobalContext} from "@/store/GlobalProvider";

const modelOptions = [
  "gpt-3.5-turbo",
  "gpt-4o-mini",
  "qwen2.5:7b",
  "deepseek-chat"
];

const emptyOption = {label: 'empty', value: ''};

const SessionHeader = ({onChange}) => {
  const [modelSelected, setModelSelected] = useState(modelOptions[0]);
  const [ragOptions, setRagOptions] = useState([]);
  const [ragSelected, setRagSelected] = useState('');
  const {currentSession} = useContext(GlobalContext);

  const getRagList = async () => {
    let rags = await getRags("completed") ?? [];
    let options = rags.map(item => ({label: item.title, value: item.id}));
    setRagOptions([emptyOption, ...options]);
  };

  useEffect(() => {
    if (onChange) onChange(modelSelected, ragSelected);
  }, [modelSelected, ragSelected]);

  useEffect(() => {
    getRagList().then();
  }, []);

  useEffect(() => {
    if(currentSession) {
      let model = getHash("mafia-ai-model", currentSession.id);
      setModelSelected(model ?? modelOptions[0]);
    }
  }, [currentSession]);

  return (
    <Flex
      h="64px"
      minH="64px"
      w="100%"
      bgColor={"gray.100"}
      justify="space-between"
      align="center"
      zIndex={777}>
      <Flex ml="12px" w="224px">
        <Icon
          boxSize="36px">
          <TbBoxModel2/>
        </Icon>
        <CommonSelector
          options={modelOptions}
          onSelected={(value) => {
            setModelSelected(value);
            setHash("mafia-ai-model", currentSession?.id, value);
          }}
          selected={modelSelected}
          placeholder={modelOptions[0]}
          outerStyle={{
            size: "sm",
            width: "160px",
            marginLeft: "48px",
            top: "14px"
          }}
        />
      </Flex>
      <Flex w="224px">
        <Icon boxSize="28px">
          <TbDeviceDesktopSearch/>
        </Icon>
        <CommonSelector
          simple={false}
          options={ragOptions}
          onSelected={(value) => setRagSelected(value)}
          selected={ragSelected}
          outerStyle={{
            size: "sm",
            width: "160px",
            right: "20px",
            top: "14px"
          }}
        />
      </Flex>
    </Flex>
  );
};

export default SessionHeader;