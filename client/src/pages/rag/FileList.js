import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line} from "react-icons/ri";
import {GrView} from "react-icons/gr";


const FileList = () => {
  const [fileList, setFileList] = new useState([]);

  useEffect(() => {
    setFileList([
      {
        id: 1,
        name: 'test1',
        preview: '123456',
        size: 10,
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 2,
        name: 'test2',
        preview: '123456',
        size: 8,
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00'
      },
      {
        id: 3,
        name: 'test3',
        preview: '123456',
        size: 6,
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
      }
    ]);
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <Button h="32px" marginY="8px">New</Button>
      </Flex>
      <DataList
        dateList={fileList}
        headers={["name", "created_by", "size"]}
        operations={
          <Flex align={'flex-end'}>
            <GrView style={{marginLeft: 'auto'}}/>
            <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
          </Flex>
        }
      />
    </Flex>
  );
};

export default FileList;