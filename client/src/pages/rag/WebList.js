import React, {useEffect, useRef, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import WebCreator from "@/pages/rag/WebCreator";
import {VscDebugRerun} from "react-icons/vsc";
import {deleteWebsite, getWebsites, previewWebsite} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import ConfirmPopover from "@/components/ConfirmPopover";
import _ from "lodash";
import {useDelayToggle} from "@/store/Hook";
import WebProvider from "@/store/WebProvider";
import OverflowText from "@/components/OverflowText";
import CommonDialog from "@/components/CommonDialog";
import WebContent from "@/pages/rag/WebContent";


const WebList = () => {
  const [webList, setWebList] = new useState([]);
  const [currContent, setCurrContent] = new useState([]);
  const {toggle, onToggle} = useDelayToggle();
  const closeRef = useRef(null);

  const getWebsiteList = async () => {
    let websites = await getWebsites();
    setWebList(websites);
  };

  const handleCallback = (newWeb) => {
    let newList = Array.from(webList);
    const index = _.findIndex(newList, (item) => item?.id === newWeb?.id)
    if (index > -1) {
      newList[index] = newWeb;
    } else {
      newList = [...webList, newWeb];
    }
    setWebList(newList);
  };

  const handleDelete = async (websiteId) => {
    let res = await deleteWebsite(websiteId);
    if (res) {
      const newList = _.reject(webList, (item) => item.id === websiteId);
      setWebList(newList);
      onToggle();
    }
  };

  const handleRerun = async (website) => {
    setCurrContent(website);
    let data = await previewWebsite(website?.id);
    if (data) {
      setCurrContent(data);
    }
  };

  const renderString = (str, maxW="16vw") => {
    return (
      <Flex key={str} align="center" maxW={maxW}>
        <OverflowText content={str} outerStyle={{placement: "right-start"}}/>
      </Flex>
    );
  }

  const renderXpaths = (values) => {
    return (<>
      {values.map((item) => renderString(item, "24vw"))}
    </>);
  };

  useEffect(() => {
    getWebsiteList().then();
  }, []);

  return (
    <WebProvider>
      <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
        <TipsHeader title={'Website have been deleted.'} hidden={toggle}/>
        <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
          <WebCreator onChange={handleCallback}>
            <Button h="32px" marginY="8px">New</Button>
          </WebCreator>
        </Flex>
        <DataList
          dataList={webList}
          headers={["title", "uri", "xpaths", "scheduled", "cron"]}
          functions={[renderString, renderString, renderXpaths, null, null]}
          operations={(item) => (
            <Flex align={'flex-end'} w="100%">
              <CommonDialog
                outerStyle={{size: "xl"}}
                title={"Content"}
                trigger={
                  <VscDebugRerun style={{marginLeft: 'auto'}} onClick={() => handleRerun(item)}/>
                }
                closeRef={closeRef}>
                <WebContent headers={currContent?.xpaths ?? []} data={currContent?.preview ?? []}/>
              </CommonDialog>
              <WebCreator onChange={handleCallback} data={item}>
                <RiEdit2Line style={{marginLeft: '12px'}}/>
              </WebCreator>
              <ConfirmPopover onConfirm={() => handleDelete(item?.id)}>
                <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
              </ConfirmPopover>
            </Flex>
          )}
        />
      </Flex>
    </WebProvider>
  );
};

export default WebList;