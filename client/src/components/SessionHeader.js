import {
  createListCollection,
  Flex,
  Icon
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";
import {TbBoxModel2} from "react-icons/tb";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@/components/ui/select";

const models = createListCollection({
  items: [
    {label: "gpt-3.5-turbo", value: "gpt-3.5-turbo"},
    {label: "gpt-4o-mini", value: "gpt-4o-mini"},
    {label: "qwen", value: "qwen"},
    {label: "deepseek", value: "deepseek"},
  ],
})

const SessionHeader = () => {
  const [selectedValue, setSelectedValue] = useState(String(models.items[0].value));
  const modelRef = useRef(null);

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
      <SelectRoot
        collection={models}
        defaultValue={selectedValue}
        onChange={() => {
          setSelectedValue(modelRef.current?.innerText);
        }}
        size="sm"
        w="160px"
        variant="outline"
        position="absolute"
        ml="56px"
        top="14px">
        <SelectTrigger>
          <SelectValueText placeholder={models.items[0].label} ref={modelRef}/>
        </SelectTrigger>
        <SelectContent>
          {models.items.map((model) => (
            <SelectItem item={model} key={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </Flex>
  );
}

export default SessionHeader;