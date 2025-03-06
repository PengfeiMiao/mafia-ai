import CommonSelector from "@/components/CommonSelector";
import {InputGroup} from "@/components/ui/input-group";
import {LuSearch} from "react-icons/lu";
import {Button, CheckboxGroup, Flex, Input} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import {CheckboxCard} from "@/components/ui/checkbox-card";
import _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import {getFiles, getWebsites} from "@/api/api";

const RagFilter = ({types, ref, isOpen, onOpen, onConfirm}) => {
  const [selectedType, setSelectedType] = useState(types[0]);
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const searchRef = useRef(null);
  
  const getWebsiteList = async (keyword) => {
    let websites = await getWebsites(keyword, "") ?? [];
    return _.uniq(websites.map(item => ({label: `${item.title}[${item.uri}]`, value: item.id, data: item})));
  };

  const getFileList = async (keyword) => {
    let files = await getFiles(keyword, "") ?? [];
    return _.uniq(files.map(item => ({label: item['file_name'], value: item.id, data: item})));
  }

  const handleResourceChange = async () => {
    let keyword_ = searchRef?.current?.value ?? "";
    if (selectedType === types[0]) {
      let res = await getFileList(keyword_);
      setResources(res);
    } else if (selectedType === types[1]) {
      let res = await getWebsiteList(keyword_);
      setResources(res);
    }
  };

  const handleSearch = async () => {
    await handleResourceChange();
    onOpen();
  };

  const handleKeywordEnter = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSearch().then();
    }
  };

  const handleCheckboxChange = (event) => {
    let elem = event.target;
    if (elem?.checked !== undefined) {
      let id = String(elem?.id).split(":")?.[1];
      let checked = elem?.checked;
      let target = _.find(resources, (item) => item.value === id);
      let newResources = Array.from(selectedResources);
      if (checked) {
        newResources = [...newResources, {
          resource_id: id,
          title: target?.label,
          type: selectedType.toLowerCase(),
          data: target?.data
        }];
      } else {
        newResources = _.reject(newResources, (item) => item?.resource_id === id);
      }
      setSelectedResources(newResources);
    }
  };

  const handleConfirm = () => {
    if (selectedResources.length > 0) {
      onConfirm(selectedResources);
      setSelectedResources([]);
    }
  };

  useEffect(() => {
    handleResourceChange().then();
  }, [selectedType]);

  return (
    <Flex position="absolute" w="100%" ref={ref}>
      <CommonSelector
        options={types}
        onSelected={(value) => setSelectedType(value)}
        selected={selectedType}
        placeholder={types[0]}
        outerStyle={{position: "relative", width: "112px"}}
      />
      <InputGroup
        ml="116px" w="300px"
        position="absolute"
        endElement={
          <LuSearch onClick={handleSearch}/>
        }
      >
        <Input
          ref={searchRef}
          onKeyDown={handleKeywordEnter}/>
      </InputGroup>
      <SlideBox
        open={isOpen}
        outerStyle={{
          position: "absolute",
          maxHeight: "44vh",
          height: "auto",
          width: "416px",
          marginTop: "44px",
          padding: "8px",
          borderWidth: "1px",
          borderRadius: "4px",
          boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.1)",
          zIndex: 999
        }}
      >
        <Flex maxH="32vh" h="100%" w="100%" overflowY="auto">
          <CheckboxGroup w="100%">
            {resources.map((item) => (
              <CheckboxCard
                key={item.value}
                id={item.value}
                size="sm"
                variant="subtle"
                label={item?.label}
                checked={!!_.find(selectedResources, (it) => it.resource_id === item.value)}
                onClick={handleCheckboxChange}
              />
            ))}
          </CheckboxGroup>
        </Flex>
        <Flex w="100%" mt="8px" justify="space-between">
          <Button h="32px" w="32%">Unselect All</Button>
          <Button h="32px" w="32%">Select All</Button>
          <Button h="32px" w="32%" onClick={handleConfirm}>Confirm</Button>
        </Flex>
      </SlideBox>
    </Flex>
  );
};

export default RagFilter;