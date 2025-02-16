import {FileUploadClearTrigger, Flex} from "@chakra-ui/react";
import {FileUploadList, FileUploadRoot, FileUploadTrigger, handleDuplicateFiles} from "@/components/ui/file-upload";
import React, {useEffect, useRef, useState} from "react";
import _ from "lodash";

const FileUploader = ({onUpload, onChange, clearRef, maxFiles=3, preElements, postElements, children}) => {
  const [attachments, setAttachments] = useState(new Map());
  const [fileList, setFileList] = useState([]);
  const innerClearRef = clearRef ?? useRef(null);

  useEffect(() => {
    if(onChange) {
      onChange(attachments);
    }
  }, [attachments]);

  const handleClear = () => {
    setAttachments(new Map());
    setFileList([]);
  };

  const handleUpload = async (params) => {
    let files = params.acceptedFiles;
    let renamedFiles = handleDuplicateFiles(files);

    let cachedFiles = Array.from(attachments.keys());
    let newFiles = _.difference(renamedFiles, cachedFiles);
    let deprecatedFiles = _.difference(cachedFiles, renamedFiles);
    if (newFiles.length > 0) {
      let result = onUpload ? await onUpload(newFiles) : [];
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

  return (
    <FileUploadRoot maxFiles={maxFiles} onFileChange={handleUpload}>
      <Flex w="100%">
        {preElements}
        <FileUploadTrigger
          asChild>
          {children}
        </FileUploadTrigger>
        {postElements}
      </Flex>
      <FileUploadList lineHeight="24px" showSize clearable files={fileList}/>
      <FileUploadClearTrigger ref={innerClearRef} onClick={handleClear} hidden/>
    </FileUploadRoot>
  );
};

export default FileUploader;