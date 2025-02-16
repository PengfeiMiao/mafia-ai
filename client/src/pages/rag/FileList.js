import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line} from "react-icons/ri";
import {GrView} from "react-icons/gr";
import FileCreator from "@/pages/rag/FileCreator";
import {getFiles} from "@/api/api";
import FilePreview from "@/pages/rag/FilePreview";


const FileList = () => {
  const [fileList, setFileList] = new useState([]);

  const getAllFiles = async () => {
    let files = await getFiles() || [];
    setFileList(files);
  };

  useEffect(() => {
    getAllFiles().then();
  }, []);

  const handleChange = () => {
    getAllFiles().then();
  };

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <FileCreator onChange={handleChange}>
          <Button h="32px" marginY="8px">New</Button>
        </FileCreator>
      </Flex>
      <DataList
        dateList={fileList}
        headers={["file_name", "created_at", "file_size"]}
        operations={(item) => (
          <Flex align={'flex-end'}>
            <FilePreview preview={item?.preview ?? 'No Content'}>
              <GrView style={{marginLeft: 'auto'}}/>
            </FilePreview>
            <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default FileList;