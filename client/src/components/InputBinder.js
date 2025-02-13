import React, {useContext, useRef, useState} from 'react';
import {Box, Button, FileUploadClearTrigger, Flex, Icon, Separator, Textarea} from "@chakra-ui/react";
import {RiAttachmentLine, RiPauseCircleFill, RiSendPlaneFill, RiSendPlaneLine} from "react-icons/ri";
import {FileUploadList, FileUploadRoot, FileUploadTrigger, handleDuplicateFiles,} from "@/components/ui/file-upload"
import _ from "lodash";
import {uploadAttachment} from "@/api/api";
import {GlobalContext} from "@/store/GlobalProvider";
import {MdCleaningServices} from "react-icons/md";

const InputBinder = ({onSend, onInterrupt, isPending, defaultValue, outerStyle}) => {
  const [message, setMessage] = useState(defaultValue ?? '');
  const [attachments, setAttachments] = useState(new Map());
  const [fileList, setFileList] = useState([]);
  const textRef = useRef(null);
  const clearRef = useRef(null);
  const {currentSession} = useContext(GlobalContext);

  const rootStyle = {
    width: '60%',
    padding: '12px 12px 2px 12px',
    ...outerStyle
  };

  const isEmpty = () => {
    return message === null || message.trim().length === 0;
  }

  const handleClear = () => {};

  const handleSend = () => {
    if (isEmpty()) {
      return;
    }
    onSend(message, Array.from(attachments.values()));
    setMessage('');
    setAttachments(new Map());
    clearRef.current.click();
    setFileList([]);
  };

  const handleInterrupt = () => {
    if (isPending) {
      onInterrupt();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleUpload = async (params) => {
    let files = params.acceptedFiles;
    let renamedFiles = handleDuplicateFiles(files);

    let cachedFiles = Array.from(attachments.keys());
    let newFiles = _.difference(renamedFiles, cachedFiles);
    let deprecatedFiles = _.difference(cachedFiles, renamedFiles);
    if (newFiles.length > 0) {
      let result = await uploadAttachment(currentSession?.id, newFiles);
      if (result) {
        let newMap = new Map(attachments);
        for (let file of newFiles) {
          newMap.set(file, result.find(({file_name}) => file_name === file.name))
        }
        setAttachments(newMap);
      }
    }
    if (deprecatedFiles.length > 0) {
      let newMap = new Map(attachments);
      deprecatedFiles.forEach(item => newMap.delete(item))
      setAttachments(newMap);
    }
    setFileList(files);
  };

  const getRowHeight = (text, element) => {
    if (!element) {
      return "2lh";
    }

    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const textareaPadding = 16;
    const maxCharsPerLine = Math.floor((element.clientWidth - textareaPadding) / 8);

    const lines = text.split('\n').map(line => Math.ceil(Math.max(line.length, 1) / maxCharsPerLine));
    const maxLines = 6;
    const totalLines = Math.min(lines.reduce((acc, curr) => acc + curr, 0) + 1, maxLines);

    return `${lineHeight * totalLines}px`;
  };

  return (
    <Box
      style={rootStyle}
      bgColor={'gray.100'}>
      <Flex padding="12px" bgColor="white" boxShadow="sm" direction="row">
        <FileUploadRoot maxFiles={3} onFileChange={handleUpload}>
          <Flex w="100%">
            <Button
              w="24px"
              borderRadius="md"
              bgColor={!isPending ? 'purple.muted' : 'gray.muted'}
              onClick={handleClear}
            >
              <Icon h="auto">
                <MdCleaningServices />
              </Icon>
            </Button>
            <Separator marginX="8px" orientation="vertical" height="auto" />
            <Textarea
              ref={textRef}
              placeholder='Input message here.'
              mr="4px"
              h={getRowHeight(message, textRef?.current)}
              resize="none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <FileUploadTrigger
              w="20px"
              h="auto"
              mr="12px"
              borderRadius="sm"
              bgColor={'purple.muted'}
              asChild>
              <Icon h="100%" w="16px" color={'white'}>
                <RiAttachmentLine/>
              </Icon>
            </FileUploadTrigger>

            <Button
              w="24px"
              borderRadius="full"
              bgColor={(!isEmpty() || isPending) ? 'purple.muted' : 'gray.muted'}
              onClick={isPending ? handleInterrupt : handleSend}
            >
              <Icon h="auto">
                {isPending ? <RiPauseCircleFill/> : (isEmpty() ? <RiSendPlaneLine/> : <RiSendPlaneFill/>)}
              </Icon>
            </Button>
          </Flex>
          <FileUploadList lineHeight="24px" showSize clearable files={fileList}/>
          <FileUploadClearTrigger ref={clearRef} hidden/>
        </FileUploadRoot>
      </Flex>
    </Box>
  );
};

export default InputBinder;