import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import WebCreator from "@/pages/rag/WebCreator";
import {GrView} from "react-icons/gr";
import {VscDebugRerun} from "react-icons/vsc";


const WebList = () => {
  const [webList, setWebList] = new useState([]);

  useEffect(() => {
    setWebList([
      {
        id: 1,
        title: 'test1',
        url: 'http://www.baidu.com',
        xpaths: '//*[id=test]',
        scheduled: true,
        cron: '* 0 * * ? *',
        preview: 'test1',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
      },
      {
        id: 2,
        title: 'test2',
        url: 'http://weibo.cn/pub',
        xpaths: '//*[id=test]',
        scheduled: true,
        cron: '* 12 * * ? *',
        preview: 'test1',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
      },
      {
        id: 3,
        title: 'test3',
        url: 'http://localhost:3000',
        xpaths: '//*[id=test]',
        scheduled: false,
        cron: null,
        preview: 'test1',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
      }
    ]);
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <WebCreator>
          <Button h="32px" marginY="8px">New</Button>
        </WebCreator>
      </Flex>
      <DataList
        dateList={webList}
        headers={["title", "url", "xpaths", "scheduled", "cron"]}
        operations={(_) => (
          <Flex align={'flex-end'}>
            <VscDebugRerun style={{marginLeft: 'auto'}}/>
            <GrView style={{marginLeft: '12px'}}/>
            <RiEdit2Line style={{marginLeft: '12px'}}/>
            <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default WebList;