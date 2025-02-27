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
import {createWebsite} from "@/api/api";
import {useDelayToggle} from "@/store/GlobalProvider";


const WebCreator = ({onChange, children}) => {
  const [previewOpen, setPreviewOpen] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const closeRef = useRef(null);
  const {toggle, onToggle} = useDelayToggle();

  const handleNext = () => {
    setPreviewOpen(false);
    setFormOpen(true);
    setParseOpen(false);
  };

  const handleToNext = (title, uri, xpaths) => {
    setFormData((prev) => {
      return {...prev, title, uri, xpaths};
    });
  };

  const handleToSubmit = (title, scheduled, cron) => {
    setFormData((prev) => {
      return {...prev, title, scheduled, cron};
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

  const handleSubmit = async () => {
    let res = await createWebsite(formData);
    if(res) {
      if(onChange) onChange(res);
      setPreviewOpen(false);
      setFormOpen(false);
      setParseOpen(false);
      setFormData({});
      closeRef.current.click();
      onToggle();
    }
  };

  return (
    <DialogRoot size="full">
      <TipsHeader outerStyle={{marginLeft: "32vw"}} title={'Website have been created.'} hidden={toggle}/>
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