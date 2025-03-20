import {Tag} from "@chakra-ui/react";
import React, {useState} from "react";

const ClickableTag = ({startEl, onClick, children, outerStyle, disabled=false}) => {
  const [isSelected, setIsSelected] = useState(false);

  const rootStyle = {
    ...outerStyle
  };

  const getStyle = (_selected) => {
    return _selected ? {
      bgColor: "purple.muted",
      color: "purple",
    } : {
      bgColor: "white",
      color: "black",
    }
  };

  const handleClick = () => {
    setIsSelected(!isSelected);
    onClick();
  };

  return (
    <Tag.Root
      p="8px" borderRadius="xl"
      style={{...getStyle(isSelected), ...rootStyle}}
      bgColor={getStyle(isSelected).bgColor}
      _hover={{ bgColor: "purple.muted" }}
      transition="all 0.3s"
      onClick={!disabled && onClick ? handleClick : () => {}}
    >
      {startEl && <Tag.StartElement>
        {startEl}
      </Tag.StartElement>}
      <Tag.Label>{children}</Tag.Label>
    </Tag.Root>
  );
};

export default ClickableTag;