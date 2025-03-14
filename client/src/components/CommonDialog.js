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
} from "@/components/ui/dialog";
import React from "react";
import {Button} from "@chakra-ui/react";

const CommonDialog = ({outerStyle, title, tips, trigger, onOpen, onClose, closeRef, onConfirm, onCancel, children}) => {
  const rootStyle = {
    ...outerStyle
  };

  return (
    <DialogRoot size={rootStyle.size}>
      {tips ? tips : <></>}
      <DialogTrigger onClick={onOpen} asChild>
        {trigger ? trigger : <Button hidden/>}
      </DialogTrigger>
      <DialogContent h={rootStyle.height}>
        <DialogHeader p="8px 16px">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody h="100%" pt="0px">
          {children}
        </DialogBody>
        <DialogFooter>
          {onCancel ? <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger> : <></>}
          {onConfirm ? <Button onClick={onConfirm}>Save</Button> : <></>}
        </DialogFooter>
        <DialogCloseTrigger ref={closeRef} onClick={onClose}/>
      </DialogContent>
    </DialogRoot>
  );
};

export default CommonDialog;