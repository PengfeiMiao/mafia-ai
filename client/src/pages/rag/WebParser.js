import React, {useEffect, useState} from "react";
import {Button, createListCollection, Flex, Input} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import DomTreeView from "@/components/DomTreeView";
import CommonSelector from "@/components/CommonSelector";


const getSelectOptions = (options) => createListCollection({
  items: Array.from(options).sort().map(item => ({label: item, value: item}))
})

const WebParser = ({open, innerDoc}) => {
  const [selectedValue, setSelectedValue] = useState([]);
  const [tagOptions, setTagOptions] = useState(getSelectOptions([]));

  useEffect(() => {
    console.log(selectedValue);
  }, [selectedValue]);

  const handleLoadOptions = (options) => {
    setTagOptions(getSelectOptions(options));
  };

  return (
    <Flex position="relative" h="50vh" bottom="50vh">
      <SlideBox open={open} align="bottom" outerStyle={{
        backgroundColor: "var(--chakra-colors-gray-300)", borderTopRadius: "8px", opacity: 0.8
      }}>
        <Flex position="absolute" w="100%">
          <CommonSelector
            multiple={true}
            options={tagOptions}
            onSelected={(value) => setSelectedValue(value)}
            selected={selectedValue}
            placeholder={'Please ignore tags here.'}
            outerStyle={{
              position: "relative",
              width: "50%"
            }}
          />
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