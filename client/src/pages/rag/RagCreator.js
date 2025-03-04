import {Button, CheckboxGroup, Flex, Input, VStack} from "@chakra-ui/react";
import CommonDialog from "@/components/CommonDialog";
import React, {useEffect, useRef, useState} from "react";
import CommonSelector from "@/components/CommonSelector";
import {InputGroup} from "@/components/ui/input-group";
import {LuSearch} from "react-icons/lu";
import SlideBox from "@/components/SlideBox";
import {createRag, getFiles, getWebsites} from "@/api/api";
import _ from "lodash";
import {CheckboxCard} from "@/components/ui/checkbox-card";
import DataList from "@/components/DataList";
import {GrView} from "react-icons/gr";
import {MarkdownView} from "@/components/MarkdownView";
import ConfirmPopover from "@/components/ConfirmPopover";
import {RiDeleteBin5Line} from "react-icons/ri";
import WebContent from "@/pages/rag/WebContent";

const typeOptions = ["File", "Website"];

const RagCreator = ({children}) => {
  const [selectedType, setSelectedType] = useState(typeOptions[0]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [resourceList, setResourceList] = useState([]);
  const closeRef = useRef(null);
  const searchRef = useRef(null);
  const filterRef = useRef(null);

  const getWebsiteList = async (keyword) => {
    let websites = await getWebsites(keyword) ?? [];
    return _.uniq(websites.map(item => ({label: `${item.title}[${item.uri}]`, value: item.id, data: item})));
  };

  const getFileList = async (keyword) => {
    let files = await getFiles(keyword) ?? [];
    return _.uniq(files.map(item => ({label: item['file_name'], value: item.id, data: item})));
  }

  const handleResourceChange = async () => {
    let keyword_ = searchRef?.current?.value ?? "";
    if (selectedType === typeOptions[0]) {
      let res = await getFileList(keyword_);
      setResources(res);
    } else if (selectedType === typeOptions[1]) {
      let res = await getWebsiteList(keyword_);
      setResources(res);
    }
  };

  const handleSearch = async () => {
    await handleResourceChange();
    setFilterOpen(true);
  };

  const handleKeywordEnter = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSearch().then();
    }
  };

  const handleFilterHidden = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setFilterOpen(false);
    }
  };

  const handleCheckboxChange = (event) => {
    let elem = event.target;
    if (elem?.checked !== undefined) {
      let id = String(elem?.id).split(":")[1];
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
      setResourceList(_.uniq([...resourceList, ...selectedResources]));
      setSelectedResources([]);
      setFilterOpen(false);
    }
  };

  const handleSave = () => {
    createRag({
      title: "test",
      resources: resourceList
    }).then();
  };

  useEffect(() => {
    handleResourceChange().then();
  }, [selectedType]);

  return (
    <CommonDialog
      outerStyle={{size: "xl"}}
      title="RAG Editor"
      trigger={children}
      closeRef={closeRef}
      onConfirm={handleSave}
    >
      <Flex h="60vh" w="100%" onClick={handleFilterHidden}>
        <Flex position="absolute" w="100%" ref={filterRef}>
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
              <LuSearch onClick={handleSearch}/>
            }
          >
            <Input
              ref={searchRef}
              onKeyDown={handleKeywordEnter}/>
          </InputGroup>
          <SlideBox
            open={filterOpen}
            outerStyle={{
              position: "absolute",
              maxHeight: "44vh",
              height: "auto",
              width: "416px",
              marginTop: "44px",
              padding: "8px",
              borderWidth: "1px",
              borderRadius: "4px",
              boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.1)"
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
        <Flex w="100%" mt="64px">
          <DataList
            dataList={resourceList}
            headers={["resource_id", "title", "type"]}
            operations={(item) => (
              <Flex align={'flex-end'}>
                <CommonDialog
                  title={"Content"}
                  trigger={<GrView style={{marginLeft: 'auto'}}/>}
                  outerStyle={{size: "xl"}}
                >
                  <VStack maxH="64vh" align="flex-start" overflowY="auto" bgColor="gray.100" p="8px">
                    {item?.type === typeOptions[0].toLowerCase() ?
                      <MarkdownView markdown={item?.data?.preview ?? 'No Content'}/>
                      : <WebContent headers={item?.data?.xpaths ?? []} data={item?.data?.preview ?? []}/>}
                  </VStack>
                </CommonDialog>
                <ConfirmPopover onConfirm={() => {
                }}>
                  <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
                </ConfirmPopover>
              </Flex>
            )}
          />
        </Flex>
      </Flex>
    </CommonDialog>
  );
};

export default RagCreator;