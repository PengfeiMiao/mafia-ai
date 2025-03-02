import React, {useRef, useState, useEffect} from "react";
import {Text} from "@chakra-ui/react";
import {Tooltip} from "@/components/ui/tooltip";

const OverflowText = ({content, outerStyle}) => {
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const rootStyle = {
    maxWidth: "100%",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    placement: "left-start",
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
          positioning={{placement: rootStyle.placement}}
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

export default OverflowText;