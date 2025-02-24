import React, {useEffect, useState} from "react";
import {Flex, Icon} from "@chakra-ui/react";
import {TbBoxModel2} from "react-icons/tb";
import CommonSelector from "@/components/CommonSelector";

const modelOptions = [
  "gpt-3.5-turbo",
  "gpt-4o-mini",
  "qwen",
  "deepseek"
];

const SessionHeader = () => {
  const [selectedValue, setSelectedValue] = useState(modelOptions[0]);

  useEffect(() => {
    console.log(selectedValue);
  }, [selectedValue]);

  return (
    <Flex
      h="64px"
      minH="64px"
      w="100%"
      bgColor={"gray.100"}
      justify="flex-start"
      align="center"
      zIndex={777}>
      <Icon
        ml="12px"
        boxSize="36px">
        <TbBoxModel2/>
      </Icon>
      <CommonSelector
        options={modelOptions}
        onSelected={(value) => setSelectedValue(value)}
        selected={selectedValue}
        placeholder={modelOptions[0]}
        outerStyle={{
          size: "sm",
          width: "160px",
          marginLeft: "56px",
          top: "14px"
        }}
      />
    </Flex>
  );
};

export default SessionHeader;