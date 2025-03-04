import React, {useEffect, useState} from "react";
import {Button, EmptyState, Flex, ProgressCircle, VStack} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line} from "react-icons/ri";
import {GrView} from "react-icons/gr";
import FileCreator from "@/pages/rag/FileCreator";
import {deleteFiles, getFiles} from "@/api/api";
import {TbFileSad} from "react-icons/tb";
import {useWebsocket} from "@/store/WsProvider";
import _ from "lodash";
import ConfirmPopover from "@/components/ConfirmPopover";
import CommonDialog from "@/components/CommonDialog";
import {MarkdownView} from "@/components/MarkdownView";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileList = () => {
  const [fileList, setFileList] = new useState([]);
  const [pendingMaps, setPendingMaps] = new useState(new Map());
  const {message, sendMessage} = useWebsocket();

  const getAllFiles = async () => {
    let files = await getFiles("") ?? [];
    setFileList(files);
  }

  useEffect(() => {
    getAllFiles().then();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage({});
      let newMaps = new Map(pendingMaps);
      newMaps.forEach((value, key, newMaps) => {
        newMaps.set(key, {...value, progress: value['progress'] + value['stride']});
        if (newMaps.get(key)['progress'] > 10) {
          newMaps.delete(key);
        }
      });
      setPendingMaps(newMaps);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [pendingMaps]);

  useEffect(() => {
    if (!message) return;
    const unionArray = _.unionBy(message, fileList, 'id');
    if (unionArray.length > 0) {
      const newFilelist = fileList.map(item => {
        const matchingItem = unionArray.find(unionItem => unionItem.id === item.id);
        return matchingItem ? matchingItem : item;
      });
      let newMaps = new Map(pendingMaps);
      newMaps.forEach((value, key, newMaps) => {
        if (unionArray.find(it => newMaps.has(it.id))) {
          newMaps.set(key, {progress: value['progress'] + 1, stride: value['stride'] + 1});
        }
      });
      setPendingMaps(newMaps);
      setFileList(newFilelist);
    }
  }, [message]);

  const handleChange = (files) => {
    setPendingMaps(new Map(files.map(it => [it.id, {progress: 0, stride: 1}])));
    getAllFiles().then();
  };

  const handleDelete = async (id) => {
    await deleteFiles(id);
    getAllFiles().then();
  };

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <FileCreator onChange={handleChange}>
          <Button h="32px" marginY="8px">New</Button>
        </FileCreator>
      </Flex>
      {fileList.length === 0 ?
        (<EmptyState.Root size={"md"}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <TbFileSad/>
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Your file is empty</EmptyState.Title>
              <EmptyState.Description>
                Upload new files to full you database.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>)
        :
        (<DataList
          dataList={fileList}
          headers={["file_name", "created_at", "file_size"]}
          functions={[null, null, formatBytes]}
          operations={(item) => (
            <Flex align={'flex-end'}>
              {pendingMaps.has(item?.id) ? (
                <ProgressCircle.Root value={pendingMaps.get(item?.id)['progress'] * 10} style={{marginLeft: 'auto'}}>
                  <ProgressCircle.Circle css={{"--thickness": "2px", "--size": "16px"}}>
                    <ProgressCircle.Track/>
                    <ProgressCircle.Range/>
                  </ProgressCircle.Circle>
                </ProgressCircle.Root>
              ) : (
                <CommonDialog
                  title={"Content"}
                  trigger={<GrView style={{marginLeft: 'auto'}}/>}
                  outerStyle={{size: "xl"}}
                >
                  <VStack maxH="60vh" align="flex-start" overflowY="auto" bgColor="gray.100" p="8px">
                    <MarkdownView markdown={item?.preview ?? 'No Content'}/>
                  </VStack>
                </CommonDialog>
              )}
              <ConfirmPopover onConfirm={() => handleDelete(item?.id)}>
                <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
              </ConfirmPopover>
            </Flex>
          )}
        />)}
    </Flex>
  );
};

export default FileList;