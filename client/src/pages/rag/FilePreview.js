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
import React from "react";
import {MarkdownView} from "@/components/MarkdownView";

const FilePreview = ({preview, children}) => {
  return (
    <DialogRoot size="xl">
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Preview</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <MarkdownView markdown={preview}/>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button>OK</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger/>
      </DialogContent>
    </DialogRoot>
  );
};

export default FilePreview;