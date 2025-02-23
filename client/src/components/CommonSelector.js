import {
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@chakra-ui/react";
import React, {useRef, useState} from "react";
import {RiEdit2Line} from "react-icons/ri";
import {GrDown} from "react-icons/gr";
import {InputGroup} from "@/components/ui/input-group";

const CommonSelector = ({options, placeholder, selected, onSelected, multiple, custom, outerStyle}) => {
  const [inEdit, setInEdit] = useState(false);
  const customRef = useRef(null);

  const rootStyle = {
    position: "absolute",
    ...outerStyle
  };

  const handleSelected = (e) => {
    let elem = e.target;
    if (elem?.role === "option" && onSelected) {
      if (multiple) {
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
      {custom && inEdit ?
        <InputGroup flex="1" endElement={
          <GrDown onClick={(e) => {
            e.preventDefault();
            setInEdit(false);
          }}/>
        }>
          <Input placeholder={placeholder} ref={customRef} onBlur={() => {
            // setInEdit(false);
            console.log(customRef?.current.value);
          }}/>
        </InputGroup> :
        <SelectTrigger>
          <SelectValueText placeholder={placeholder}/>
          <RiEdit2Line onClick={(e) => {
            e.preventDefault();
            setInEdit(true);
          }}/>
        </SelectTrigger>
      }
      <SelectContent maxH="40vh">
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