import React, {useRef, useState} from "react";
import {Button, Flex, Input} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import DomTreeView from "@/components/DomTreeView";
import CommonSelector from "@/components/CommonSelector";

const WebParser = ({open, innerDoc}) => {
  const [tagSelected, setTagSelected] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [xpathOptions, setXpathOptions] = useState('');
  const [xpathSelected, setXpathSelected] = useState([]);
  const keywordRef = useRef(null);

  const handleLoadTags = (options) => {
    setTagOptions(options);
  };

  const handleLoadXpaths = (options) => {
    setXpathOptions(options);
  };

  const handleSearch = () => {
    setKeyword(keywordRef?.current?.value);
  };

  const handleAdd = () => {
  };

  return (<Flex position="relative" h="50vh" bottom="50vh">
      <SlideBox open={open} align="bottom" outerStyle={{
        backgroundColor: "var(--chakra-colors-gray-300)", borderTopRadius: "8px", opacity: 0.8
      }}>
        <Flex position="absolute" w="100%">
          <CommonSelector
            multiple={true}
            options={tagOptions.sort()}
            onSelected={(value) => setTagSelected(value)}
            selected={tagSelected}
            placeholder={'Please ignore tags here.'}
            outerStyle={{
              position: "relative", width: "33%"
            }}
          />
          <Input w="33%" placeholder={'Please input keywords here.'} ref={keywordRef}></Input>
          <Button w="60px" onClick={handleSearch}>Search</Button>
          <CommonSelector
            custom={true}
            options={xpathOptions}
            onSelected={(value) => setXpathSelected(value)}
            selected={xpathSelected}
            placeholder={'Please select xpath here.'}
            outerStyle={{
              position: "relative", width: "33%"
            }}
          />
          <Button w="60px" onClick={handleAdd}>Add</Button>
        </Flex>
        <DomTreeView
          html={innerDoc}
          outerStyle={{maxHeight: "90%", marginTop: "40px"}}
          onLoad={handleLoadTags}
          onRefresh={handleLoadXpaths}
          keyword={keyword}
          ignoredTags={tagSelected}/>
      </SlideBox>
    </Flex>);
};

export default WebParser;