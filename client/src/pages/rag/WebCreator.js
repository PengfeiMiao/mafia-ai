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
import WebForm from "@/pages/rag/WebForm";


const WebCreator = ({children}) => {
  const [tipsHidden, setTipsHidden] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const closeRef = useRef(null);

  const handleNext = () => {
    setPreviewOpen(false);
    setFormOpen(true);
    setParseOpen(false);
  };

  const handleToNext = (uri, xpaths) => {
    setFormData((prev) => {
      return {...prev, uri, xpaths};
    });
  };

  const handleToSubmit = (scheduled, cron) => {
    setFormData((prev) => {
      return {...prev, scheduled, cron};
    });
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
    console.log(formData);
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
            <WebPreview open={parseOpen} onChange={handleToNext}>
              {!parseOpen ?
                <Button ml="8px" w="60px" onClick={handleParse}>Parse</Button>
                :
                <>
                  <Button ml="8px" w="60px" onClick={handleCancel}>Cancel</Button>
                  <Button ml="8px" w="60px" onClick={handleNext}>Next</Button>
                </>
              }
            </WebPreview>
          </SlideBox>
          <SlideBox open={formOpen} align="right">
            <Flex h="auto" w="100%" p="8px" justify="space-between">
              <Button w="60px" onClick={handleBack}>Back</Button>
              <Button ml="8px" w="60px" onClick={handleSubmit}>Submit</Button>
            </Flex>
            <WebForm data={formData} onChange={handleToSubmit}/>
          </SlideBox>
        </DialogBody>
        <DialogFooter/>
        <DialogCloseTrigger ref={closeRef}/>
      </DialogContent>
    </DialogRoot>
  );
};

export default WebCreator;