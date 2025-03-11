import {Tag} from "@chakra-ui/react";
import React, {useState} from "react";

const ClickableTag = ({startEl, onClick, children, outerStyle}) => {
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
    if (onClick) onClick();
  };

  return (
    <Tag.Root
      p="8px" borderRadius="xl"
      style={{...getStyle(isSelected), ...rootStyle}}
      bgColor={getStyle(isSelected).bgColor}
      _hover={{ bgColor: "purple.muted" }}
      transition="all 0.3s"
      onClick={handleClick}
    >
      {startEl && <Tag.StartElement>
        {startEl}
      </Tag.StartElement>}
      <Tag.Label>{children}</Tag.Label>
    </Tag.Root>
  );
};

export default ClickableTag;