import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, {useRef, useState} from "react";
import TipsHeader from "@/components/TipsHeader";
import WebPreview from "@/pages/rag/WebPreview";
import {Button, Flex} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";


const WebCreator = ({children}) => {
  const [tipsHidden, setTipsHidden] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const closeRef = useRef(null);

  const handleNext = () => {
    setPreviewOpen(false);
    setFormOpen(true);
    setParseOpen(false);
  };

  const handleBack = () => {
    setFormOpen(false);
    setPreviewOpen(true);
  };

  const handleParse = () => {
    setParseOpen(true);
  };

  const handleCancel = () => {
    setParseOpen(false);
  };

  const handleSubmit = () => {
  };

  return (
    <DialogRoot size="full">
      <TipsHeader outerStyle={{marginLeft: "32vw"}} title={'Files have been uploaded.'} hidden={tipsHidden}/>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent h="100%">
        <DialogHeader p="8px 16px">
          <DialogTitle>Web Preview</DialogTitle>
        </DialogHeader>
        <DialogBody h="100%" pt="0px">
          <SlideBox open={previewOpen} align="left">
            <WebPreview parseOpen={parseOpen}>
              {!parseOpen ?
                <Button ml="8px" onClick={handleParse}>Parse</Button>
                :
                <>
                  <Button ml="8px" onClick={handleCancel}>Cancel</Button>
                  <Button ml="8px" onClick={handleNext}>Next</Button>
                </>
              }
            </WebPreview>
          </SlideBox>
          <SlideBox open={formOpen} align="right">
            <Flex h="100%" w="100%" p="8px" justify="space-between">
              <Button ml="8px" onClick={handleBack}>Back</Button>
              <Button ml="8px" onClick={handleSubmit}>Submit</Button>
            </Flex>
          </SlideBox>
        </DialogBody>
        <DialogFooter/>
        <DialogCloseTrigger ref={closeRef}/>
      </DialogContent>
    </DialogRoot>
  );
};

export default WebCreator;