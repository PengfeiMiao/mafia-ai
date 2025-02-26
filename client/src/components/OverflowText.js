import React, {useRef, useState, useEffect} from "react";
import {Text} from "@chakra-ui/react";
import {Tooltip} from "@/components/ui/tooltip";

function OverflowTooltip({content, outerStyle}) {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const rootStyle = {
    maxWidth: "100%",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    ...outerStyle
  };

  useEffect(() => {
    if (textRef.current) {
      const isOverflow =
        textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, [content]); // 当 item 变化时重新检测

  return (
    <>
      {isOverflowing ? (
        <Tooltip
          content={content}
          positioning={{placement: "left-start"}}
          showArrow
          interactive>
          <Text ref={textRef} style={rootStyle}>{content}</Text>
        </Tooltip>
      ) : (
        <Text ref={textRef} style={rootStyle}>{content}</Text>
      )}
    </>
  );
}

export default OverflowTooltip;