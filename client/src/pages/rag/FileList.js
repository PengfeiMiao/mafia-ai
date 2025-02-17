import React, {useEffect, useRef, useState} from "react";
import {Button, EmptyState, Flex, Group, ProgressCircle, VStack} from "@chakra-ui/react";
import {
  PopoverArrow,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverFooter,
  PopoverRoot,
  PopoverTrigger
} from "@/components/ui/popover"
import DataList from "@/components/DataList";
import {RiDeleteBin5Line} from "react-icons/ri";
import {GrView} from "react-icons/gr";
import FileCreator from "@/pages/rag/FileCreator";
import {deleteFiles, getFiles} from "@/api/api";
import FilePreview from "@/pages/rag/FilePreview";
import {TbFileSad} from "react-icons/tb";
import {useWebsocket} from "@/store/WsProvider";
import _ from "lodash";
import {LuCheck, LuX} from "react-icons/lu";

const DeletePopover = ({onDelete, children}) => {
  const closeRef = useRef(null);
  const confirmRef = useRef(null);

  return (
    <PopoverRoot size="xs" initialFocusEl={() => confirmRef.current}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent w="auto">
        <PopoverArrow/>
        <PopoverFooter pt={"12px"}>
          <Group>
            <Button boxSize="24px" size="xs" bgColor="white" ref={confirmRef} onClick={() => {
              onDelete();
              closeRef.current.click();
            }}>
              <LuCheck color="black"/>
            </Button>
            <Button boxSize="24px" size="xs" bgColor="white" onClick={() => {
              closeRef.current.click();
            }}>
              <LuX color="black"/>
            </Button>
          </Group>
        </PopoverFooter>
        <PopoverCloseTrigger ref={closeRef} hidden/>
      </PopoverContent>
    </PopoverRoot>
  );
};

const FileList = () => {
  const [fileList, setFileList] = new useState([]);
  const [pendingMaps, setPendingMaps] = new useState(new Map());
  const {message} = useWebsocket();

  const getAllFiles = async () => {
    let files = await getFiles() ?? [];
    setFileList(files);
  }

  useEffect(() => {
    getAllFiles().then();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
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
          dateList={fileList}
          headers={["file_name", "created_at", "file_size"]}
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
                <FilePreview preview={item?.preview ?? 'No Content'}>
                  <GrView style={{marginLeft: 'auto'}}/>
                </FilePreview>
              )}
              <DeletePopover onDelete={() => handleDelete(item?.id)}>
                <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
              </DeletePopover>
            </Flex>
          )}
        />)}
    </Flex>
  );
};

export default FileList;