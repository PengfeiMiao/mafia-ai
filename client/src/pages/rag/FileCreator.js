import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@chakra-ui/react";
import {HiUpload} from "react-icons/hi"
import React, {useRef, useState} from "react";
import FileUploader from "@/components/FileUploader";
import {uploadAttachment} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";

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
      await uploadAttachment("default", attachments.keys());
      closeRef.current.click();
      handleTipsHidden();
      onChange();
    }
  };

  return (
    <DialogRoot>
      <TipsHeader outerStyle={{marginLeft: "32vw"}} title={'Files have been uploaded.'} hidden={tipsHidden}/>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Upload</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <FileUploader
            onChange={(attachments) => setAttachments(attachments)}
          >
            <Button variant="outline" size="sm">
              <HiUpload/> Upload
            </Button>
          </FileUploader>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
        <DialogCloseTrigger ref={closeRef}/>
      </DialogContent>
    </DialogRoot>
  );
};

export default FileCreator;