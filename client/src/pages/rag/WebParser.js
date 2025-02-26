import React, {useEffect, useRef, useState} from "react";
import {Button, Flex, Input, Text} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import DomTreeView from "@/components/DomTreeView";
import CommonSelector from "@/components/CommonSelector";
import _ from "lodash";
import {LuX} from "react-icons/lu";
import OverflowText from "@/components/OverflowText";

const WebParser = ({open, innerDoc}) => {
  const [tagSelected, setTagSelected] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [xpathOptions, setXpathOptions] = useState('');
  const [xpathSelected, setXpathSelected] = useState([]);
  const [xpathCandidate, setXpathCandidate] = useState([]);
  const keywordRef = useRef(null);
  const candidateRef = useRef(null);

  const maxCandidate = 5;

  const handleLoadTags = (options) => {
    setTagOptions(options);
  };

  const handleLoadXpaths = (options) => {
    setXpathOptions(options);
  };

  const handleSearch = () => {
    setKeyword(keywordRef?.current?.value);
  };

  const handleAdd = (newItem) => {
    setXpathCandidate((prev) => {
      prev.push(newItem);
      return _.uniq(prev);
    })
  };

  const handleDelete = (deprecated) => {
    setXpathCandidate((prev) => {
      return _.without(prev, deprecated);
    })
  };

  useEffect(() => {
    if (candidateRef.current) {
      candidateRef.current.scrollTop = candidateRef.current.scrollHeight;
    }
  }, [xpathCandidate]);

  return (
    <Flex position="relative" h="50vh" bottom="50vh">
      <SlideBox open={open} align="bottom" outerStyle={{
        backgroundColor: "var(--chakra-colors-gray-300)", borderTopRadius: "8px", opacity: 0.8
      }}>
        <Flex
          position="absolute"
          w="100%"
          top={`-${38 * Math.min(xpathCandidate.length, maxCandidate)}px`}
          direction="column"
          overflowY="auto"
          maxH={`${38 * maxCandidate}px`}
          ref={candidateRef}
        >
          {xpathCandidate.map(item => (
            <Flex
              key={item}
              align="center"
              justify="flex-end"
              maxW="50vw"
              bgColor="white"
              boxShadow="4px 2px 4px 2px rgba(0,0,0,0.1)"
              borderColor="gray.300"
              borderWidth="1px"
              borderRadius="sm"
              margin="4px 60px 4px auto"
              p="4px"
            >
              <OverflowText content={item}/>
              <LuX style={{marginLeft: "8px"}} color="black" onClick={(e) => {
                e.preventDefault();
                handleDelete(item);
              }}/>
            </Flex>
          ))}
        </Flex>
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
          <Button w="60px" onClick={() => handleAdd(xpathSelected)}>Add</Button>
        </Flex>
        <DomTreeView
          html={innerDoc}
          outerStyle={{maxHeight: "90%", marginTop: "40px"}}
          onLoad={handleLoadTags}
          onRefresh={handleLoadXpaths}
          keyword={keyword}
          ignoredTags={tagSelected}/>
      </SlideBox>
    </Flex>
  );
};

export default WebParser;