import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import RagCreator from "@/pages/rag/RagCreator";


const RagList = () => {
  const [ragList, setRagList] = new useState([]);

  useEffect(() => {
    setRagList([
      {
        id: 1,
        name: 'test1',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        count: 10
      },
      {
        id: 2,
        name: 'test2',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        count: 8
      },
      {
        id: 3,
        name: 'test3',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        count: 6
      }
    ]);
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <RagCreator>
          <Button h="32px" marginY="8px">New</Button>
        </RagCreator>
      </Flex>
      <DataList
        dataList={ragList}
        headers={["name", "created_by", "count"]}
        operations={(_) => (
          <Flex align={'flex-end'}>
            <RiEdit2Line style={{marginLeft: 'auto'}}/>
            <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default RagList;