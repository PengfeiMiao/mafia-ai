import {
  createListCollection,
  Group,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@chakra-ui/react";
import React, {useEffect, useRef, useState} from "react";
import {RiEdit2Line} from "react-icons/ri";
import {GrDown} from "react-icons/gr";
import {InputGroup} from "@/components/ui/input-group";
import {LuCheck, LuX} from "react-icons/lu";
import _ from "lodash";

const getSelectOptions = (options) => createListCollection({
  items: _.uniq(options).map(item => ({label: item, value: item}))
});

const CommonSelector = ({options, placeholder, selected, onSelected, multiple, custom = false, outerStyle}) => {
  const [inEdit, setInEdit] = useState(false);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef(null);
  const [optionCollection, setOptionCollection] = useState(getSelectOptions(options));

  const rootStyle = {
    position: "absolute",
    ...outerStyle
  };

  useEffect(() => {
    setOptionCollection(getSelectOptions(options));
  }, [options]);

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

  const handleEditConfirm = (e) => {
    e.preventDefault();
    if (!String(editValue)?.trim()) {
      return;
    }
    if (editValue.includes(",")) {
      window.alert("Custom option cannot contains comma(,)");
      return;
    }
    let items = optionCollection.items.map(item => item.value);
    let newOptions = [editValue].concat(items);
    setOptionCollection(getSelectOptions(newOptions));
    setInEdit(false);
    setEditValue('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleEditConfirm(e);
    }
  };

  const handleDeleteOption = (value) => {
    let newOptions = optionCollection.items
      .map(item => item.value)
      .filter(item => item !== value);
    setOptionCollection(getSelectOptions(newOptions));
  };

  useEffect(() => {
    if (custom && inEdit) {
      editRef?.current.focus();
      setEditValue(selected instanceof Array && selected.length > 0 ? selected[0] : selected);
    }
  }, [inEdit]);

  return (
    <SelectRoot
      multiple={multiple ?? false}
      style={rootStyle}
      collection={optionCollection}
      defaultValue={selected}
      onClick={handleSelected}
      size={rootStyle?.size}
      variant="outline">
      {custom && inEdit ?
        <InputGroup
          flex="1"
          endElement={
            <Group>
              <LuCheck color="black" onClick={handleEditConfirm}/>
              <LuX color="black" onClick={(e) => {
                e.preventDefault();
                setInEdit(false);
              }}/>
            </Group>
          }>
          <Input
            style={{paddingRight: "60px"}}
            placeholder={placeholder}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            ref={editRef}
          />
        </InputGroup> :
        <SelectTrigger>
          <SelectValueText placeholder={placeholder}/>
          <Group>
            {custom ?
              <RiEdit2Line onClick={(e) => {
                e.preventDefault();
                setInEdit(true);
              }}/> : null
            }
            <GrDown/>
          </Group>
        </SelectTrigger>
      }
      <SelectContent maxH="40vh">
        {optionCollection.items.map((option) => (
          <SelectItem item={option} key={option.value}>
            {option.label}
            {!options.includes(option.value) ?
              <LuX color="gray" onClick={() => handleDeleteOption(option.value)}/>
              : null}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
    ;
};

export default CommonSelector;