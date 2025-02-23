import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@chakra-ui/react";
import React from "react";

const CommonSelector = ({options, placeholder, selected, onSelected, multiple, outerStyle}) => {
  const rootStyle = {
    position: "absolute",
    ...outerStyle
  };

  const handleSelected = (e) => {
    let elem = e.target;
    if (elem?.role === "option" && onSelected) {
      if(multiple) {
        let newSelected = new Set(selected);
        elem?.dataset?.state === "unchecked" ?
          newSelected.add(elem?.innerText) :
          newSelected.delete(elem?.innerText);
        onSelected(Array.from(newSelected));
      } else {
        onSelected(elem?.innerText);
      }
    }
  };

  return (
    <SelectRoot
      multiple={multiple ?? false}
      style={rootStyle}
      collection={options}
      defaultValue={selected}
      onClick={handleSelected}
      size={rootStyle?.size}
      variant="outline">
      <SelectTrigger>
        <SelectValueText placeholder={placeholder}/>
      </SelectTrigger>
      <SelectContent>
        {options.items.map((option) => (
          <SelectItem item={option} key={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default CommonSelector;