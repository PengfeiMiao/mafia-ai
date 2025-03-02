import {Button} from "@chakra-ui/react";
import {HiUpload} from "react-icons/hi"
import React, {useRef, useState} from "react";
import FileUploader from "@/components/FileUploader";
import {uploadAttachment} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import CommonDialog from "@/components/CommonDialog";

const FileCreator = ({onChange, children}) => {
  const [attachments, setAttachments] = useState(new Map());
  const [tipsHidden, setTipsHidden] = useState(true);
  const closeRef = useRef(null);

  const handleTipsHidden = () => {
    setTipsHidden(false);
    setTimeout(() => {
      setTipsHidden(true);
    }, 1200);
  };

  const handleSave = async () => {
    if (attachments.size > 0) {
      let files = await uploadAttachment("default", attachments.keys());
      closeRef.current.click();
      handleTipsHidden();
      onChange(files);
    }
  };

  return (
    <CommonDialog
      tips={<TipsHeader outerStyle={{marginLeft: "32vw"}} title={'Files have been uploaded.'} hidden={tipsHidden}/>}
      trigger={children}
      title="File Upload"
      closeRef={closeRef}
      onConfirm={handleSave}
      onCancel={() => {}}
    >
      <FileUploader
        onChange={(attachments) => setAttachments(attachments)}
      >
        <Button variant="outline" size="sm">
          <HiUpload/> Upload
        </Button>
      </FileUploader>
    </CommonDialog>
  );
};

export default FileCreator;