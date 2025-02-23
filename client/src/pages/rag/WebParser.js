import {
  Button,
  createListCollection,
  Flex,
  Input, ListCollection,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import DomTreeView from "@/components/DomTreeView";

import React, {useEffect, useState} from "react";

const getSelectOptions = (options) => createListCollection({
  items: Array.from(options).sort().map(item => ({label: item, value: item}))
})

const WebParser = ({open, innerDoc}) => {
  const [selectedValue, setSelectedValue] = useState([]);
  const [tagOptions, setTagOptions] = useState(getSelectOptions([]));

  useEffect(() => {
    console.log(selectedValue);
  }, [selectedValue]);

  const handleSelected = (e) => {
    let elem = e.target;
    if (elem?.role === "option") {
      setSelectedValue((prev) => {
        let selected = new Set(prev);
        elem?.dataset?.state === "unchecked" ?
          selected.add(elem?.innerText) :
          selected.delete(elem?.innerText);
        return Array.from(selected);
      });
    }
  };

  const handleLoadOptions = (options) => {
    setTagOptions(getSelectOptions(options));
  };

  return (
    <Flex position="relative" h="50vh" bottom="50vh">
      <SlideBox open={open} align="bottom" outerStyle={{
        backgroundColor: "var(--chakra-colors-gray-300)", borderTopRadius: "8px", opacity: 0.8
      }}>
        <Flex position="absolute" w="100%">
          <SelectRoot
            w="50%"
            multiple={true}
            collection={tagOptions}
            defaultValue={selectedValue}
            onClick={handleSelected}
          >
            <SelectTrigger>
              <SelectValueText placeholder={'Please ignore tags here.'}/>
            </SelectTrigger>
            <SelectContent position="relative">
              {tagOptions.items.map((option) => (
                <SelectItem item={option} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
          <Input w="50%" placeholder={'Please select xpath here.'}></Input>
          <Button w="80px">Add</Button>
        </Flex>
        <DomTreeView
          html={innerDoc}
          outerStyle={{maxHeight: "90%", marginTop: "40px"}}
          onLoad={handleLoadOptions}
          ignoredTags={selectedValue}/>
      </SlideBox>
    </Flex>
  );
};

export default WebParser;