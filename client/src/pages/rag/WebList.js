import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import WebCreator from "@/pages/rag/WebCreator";
import {GrView} from "react-icons/gr";
import {VscDebugRerun} from "react-icons/vsc";
import {deleteWebsite, getWebsites} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import ConfirmPopover from "@/components/ConfirmPopover";
import _ from "lodash";
import {useDelayToggle} from "@/store/Hook";
import WebProvider from "@/store/WebProvider";


const WebList = () => {
  const [webList, setWebList] = new useState([]);
  const {toggle, onToggle} = useDelayToggle();

  const getWebsiteList = async () => {
    let websites = await getWebsites();
    setWebList(websites);
  };

  const handleCallback = (newWeb) => {
    setWebList((prev) => {
      prev.push(newWeb);
      return Array.from(prev);
    });
  };

  const handleDelete = async (websiteId) => {
    let res = await deleteWebsite(websiteId);
    if (res) {
      const newList = _.reject(webList, (item) => item.id === websiteId);
      setWebList(newList);
      onToggle();
    }
  };

  useEffect(() => {
    getWebsiteList().then();
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <TipsHeader title={'Website have been deleted.'} hidden={toggle}/>
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <WebProvider>
          <WebCreator onChange={handleCallback}>
            <Button h="32px" marginY="8px">New</Button>
          </WebCreator>
        </WebProvider>
      </Flex>
      <DataList
        dateList={webList}
        headers={["title", "uri", "xpaths", "scheduled", "cron"]}
        operations={(item) => (
          <Flex align={'flex-end'}>
            <VscDebugRerun style={{marginLeft: 'auto'}}/>
            <GrView style={{marginLeft: '12px'}}/>
            <RiEdit2Line style={{marginLeft: '12px'}}/>
            <ConfirmPopover onConfirm={() => handleDelete(item?.id)}>
              <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
            </ConfirmPopover>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default WebList;