import React, {useEffect, useState} from "react";
import {createListCollection, Flex, Icon} from "@chakra-ui/react";
import {TbBoxModel2} from "react-icons/tb";
import CommonSelector from "@/components/CommonSelector";

const models = createListCollection({
  items: [
    {label: "gpt-3.5-turbo", value: "gpt-3.5-turbo"},
    {label: "gpt-4o-mini", value: "gpt-4o-mini"},
    {label: "qwen", value: "qwen"},
    {label: "deepseek", value: "deepseek"},
  ],
});

const SessionHeader = () => {
  const [selectedValue, setSelectedValue] = useState(String(models.items[0].value));

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
        custom={true}
        options={models}
        onSelected={(value) => setSelectedValue(value)}
        selected={selectedValue}
        placeholder={models.items[0].value}
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