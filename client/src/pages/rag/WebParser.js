import React, {useEffect, useRef, useState} from "react";
import {Button, Flex, Input} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import DomTreeView from "@/components/DomTreeView";
import CommonSelector from "@/components/CommonSelector";

const WebParser = ({open, innerDoc}) => {
  const [selectedValue, setSelectedValue] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [xpath, setXpath] = useState('');
  const keywordRef = useRef(null);

  useEffect(() => {
    console.log(selectedValue);
  }, [selectedValue]);

  const handleLoadOptions = (options) => {
    setTagOptions(options);
  };

  const handleSearch = () => {
    setKeyword(keywordRef?.current?.value);
  };

  const handleAdd = () => {
  };

  return (
    <Flex position="relative" h="50vh" bottom="50vh">
      <SlideBox open={open} align="bottom" outerStyle={{
        backgroundColor: "var(--chakra-colors-gray-300)", borderTopRadius: "8px", opacity: 0.8
      }}>
        <Flex position="absolute" w="100%">
          <CommonSelector
            custom={true}
            multiple={true}
            options={tagOptions}
            onSelected={(value) => setSelectedValue(value)}
            selected={selectedValue}
            placeholder={'Please ignore tags here.'}
            outerStyle={{
              position: "relative",
              width: "33%"
            }}
          />
          <Input w="33%" placeholder={'Please input keywords here.'} ref={keywordRef}></Input>
          <Button w="60px" onClick={handleSearch}>Search</Button>
          <Input w="33%" placeholder={'Please select xpath here.'}
                 value={xpath}
                 onChange={(e) => setXpath(e.target.value.trim())}/>
          <Button w="60px" onClick={handleAdd}>Add</Button>
        </Flex>
        <DomTreeView
          html={innerDoc}
          outerStyle={{maxHeight: "90%", marginTop: "40px"}}
          onLoad={handleLoadOptions}
          keyword={keyword}
          ignoredTags={selectedValue}/>
      </SlideBox>
    </Flex>
  );
};

export default WebParser;