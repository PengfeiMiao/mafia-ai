import React, {useRef} from "react";
import {
  PopoverArrow,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverFooter,
  PopoverRoot,
  PopoverTrigger
} from "@/components/ui/popover";
import {Button, Group} from "@chakra-ui/react";
import {LuCheck, LuX} from "react-icons/lu";

const ConfirmPopover = ({onConfirm, children}) => {
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
              onConfirm();
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

export default ConfirmPopover;