import {Flex, Input, Text} from "@chakra-ui/react";
import CommonDialog from "@/components/CommonDialog";
import React, {useRef, useState} from "react";
import CommonSelector from "@/components/CommonSelector";
import {InputGroup} from "@/components/ui/input-group";
import {LuSearch} from "react-icons/lu";
import SlideBox from "@/components/SlideBox";

const typeOptions = ["File", "Website"];

const RagCreator = ({children}) => {
  const [selectedType, setSelectedType] = useState(typeOptions[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const closeRef = useRef(null);
  const searchRef = useRef(null);

  return (
    <CommonDialog
      outerStyle={{size: "xl"}}
      title="RAG Editor"
      trigger={children}
      closeRef={closeRef}
      onConfirm={() => {
      }}
    >
      <Flex h="60vh" w="100%">
        <Flex position="absolute" w="100%">
          <CommonSelector
            options={typeOptions}
            onSelected={(value) => setSelectedType(value)}
            selected={selectedType}
            placeholder={typeOptions[0]}
            outerStyle={{position: "relative", width: "112px"}}
          />
          <InputGroup
            ml="116px" w="300px"
            position="absolute"
            endElement={
              <LuSearch onClick={() => {
                setFilterOpen(true);
                searchRef?.current.focus();
              }}/>
            }
          >
            <Input ref={searchRef} onBlur={() => setFilterOpen(false)}/>
          </InputGroup>
          <SlideBox
            open={filterOpen}
            outerStyle={{
              position: "absolute",
              maxHeight: "30vh",
              width: "416px",
              marginTop: "44px",
              borderWidth: "1px",
              borderRadius: "4px",
              boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.1)"
            }}
          >
            <Flex h="100%" w="100%" p="8px">
              <Text color={"black"}>Test</Text>
            </Flex>
          </SlideBox>
        </Flex>
      </Flex>
    </CommonDialog>
  );
};

export default RagCreator;