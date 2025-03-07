import {Flex, Input, Text, useDisclosure, VStack} from "@chakra-ui/react";
import CommonDialog from "@/components/CommonDialog";
import React, {useEffect, useRef, useState} from "react";
import {createRag, getFiles, getWebsites, updateRag} from "@/api/api";
import _ from "lodash";
import DataList from "@/components/DataList";
import {GrView} from "react-icons/gr";
import {MarkdownView} from "@/components/MarkdownView";
import {RiDeleteBin5Line} from "react-icons/ri";
import WebContent from "@/pages/rag/WebContent";
import moment from "moment/moment";
import RagFilter from "@/pages/rag/RagFilter";
import ConfirmPopover from "@/components/ConfirmPopover";

const typeOptions = ["File", "Website"];

const RagCreator = ({data, onChange, children}) => {
  const [resourceList, setResourceList] = useState([]);
  const [ragTitle, setRagTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeRef = useRef(null);
  const filterRef = useRef(null);
  const {open, onOpen, onClose} = useDisclosure();

  const getDataList = async (resources) => {
    let dict = _.groupBy(resources, 'type');
    let fileIds = dict[typeOptions[0].toLowerCase()]?.map(item => item?.resource_id) ?? [];
    let websiteIds = dict[typeOptions[1].toLowerCase()]?.map(item => item?.resource_id) ?? [];
    let files = await getFiles("", fileIds.join(',')) ?? [];
    let websites = await getWebsites("", websiteIds.join(',')) ?? [];
    let combinedDict = _.assign(
      {}, _.groupBy(files, 'id'), _.groupBy(websites, 'id'));
    return resources.map(item => ({
      ...item,
      data: combinedDict[item.resource_id]?.[0]
    }));
  };

  const handleFilterHidden = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      onClose();
    }
  };

  const handleConfirm = (selected) => {
    setResourceList(_.uniqBy([...resourceList, ...selected], 'resource_id'));
    if (!ragTitle) {
      let subTitle = selected[0].title.slice(0, 10);
      setRagTitle(`#${subTitle}-${moment.utc().format('YYMMDDHHmmss')}`);
    }
    onClose();
  };

  const handleSave = async () => {
    let res = !data ? await createRag({
      title: ragTitle,
      resources: resourceList
    }) : await updateRag({
      id: data?.id,
      title: ragTitle,
      state: 'initial',
      resources: resourceList
    });
    if (res && onChange) {
      onChange(res);
      closeRef?.current.click();
    }
  };

  const handleRemove = (deprecated) => {
    let newList = Array.from(resourceList);
    newList = _.reject(newList, (item) => item.resource_id === deprecated.resource_id);
    setResourceList(newList);
  };

  useEffect(() => {
    if (data) {
      setResourceList(data?.resources);
      setRagTitle(data?.title);
    }
  }, [data]);

  useEffect(() => {
    if (dialogOpen) {
      if (resourceList.length > 0 && !resourceList[0]?.data) {
        getDataList(data?.resources).then(res => setResourceList(res));
      }
    }
  }, [dialogOpen]);

  return (
    <CommonDialog
      outerStyle={{size: "xl"}}
      title="RAG Editor"
      trigger={children}
      closeRef={closeRef}
      onOpen={() => setDialogOpen(true)}
      onClose={() => setDialogOpen(false)}
      onConfirm={handleSave}
    >
      <Flex h="60vh" w="100%" onClick={handleFilterHidden}>
        <RagFilter
          types={typeOptions}
          ref={filterRef}
          isOpen={open}
          onOpen={onOpen}
          onConfirm={handleConfirm}/>
        <Flex w="100%" mt="56px" direction="column">
          <Flex w="416px" mb="16px" align="center">
            <Text fontSize="md" fontWeight="bold" mr="8px">Title:</Text>
            <Input value={ragTitle} onChange={e => setRagTitle(e.target.value)}/>
          </Flex>
          <DataList
            tips={'Please select resources to fill the RAG.'}
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
                <ConfirmPopover onConfirm={() => handleRemove(item)}>
                  <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
                </ConfirmPopover>
              </Flex>
            )}
          />
        </Flex>
      </Flex>
    </CommonDialog>
  )
    ;
};

export default RagCreator;