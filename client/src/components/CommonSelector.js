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

const getSelectOptions = (options, simple) => createListCollection({
  items: simple ? _.uniq(options).map(item => ({label: item, value: item})) : options
});

const CommonSelector = (
  {
    options, placeholder, selected, onSelected, outerStyle,
    multiple, simple = true, custom = false
  }
) => {
  const [inEdit, setInEdit] = useState(false);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef(null);
  const [optionCollection, setOptionCollection] = useState(getSelectOptions(options, simple));

  const rootStyle = {
    position: "absolute",
    ...outerStyle
  };

  const handleSelected = (e) => {
    let elem = e.target;
    if (elem?.role === "option" && onSelected) {
      let value = elem?.dataset?.value;
      if (multiple) {
        let newSelected = new Set(selected);
        elem?.dataset?.state === "unchecked" ?
          newSelected.add(value) :
          newSelected.delete(value);
        onSelected(Array.from(newSelected));
      } else {
        onSelected(value);
      }
    }
  };

  const handleEditConfirm = (e) => {
    e.preventDefault();
    if (!String(editValue)?.trim()) {
      return;
    }
    let items = optionCollection.items.map(item => item.value);
    let newOptions = [simple ? editValue : {label: editValue, value: editValue}].concat(items);
    setOptionCollection(getSelectOptions(newOptions, simple));
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
    setOptionCollection(getSelectOptions(newOptions, simple));
  };

  const getSelectedLabel = (_selected) => {
    return _.filter(optionCollection.items,
      (item) => multiple ? _selected.includes(item.value) : _selected === item.value)
      ?.map(item => item.label)?.join(',');
  };

  const isSelected = (_selected, value) => {
    return multiple ? _selected.includes(value) : _selected === value;
  };

  useEffect(() => {
    if (custom && inEdit) {
      editRef?.current.focus();
      setEditValue(selected instanceof Array && selected.length > 0 ? selected[0] : selected);
    }
  }, [inEdit]);

  useEffect(() => {
    setOptionCollection(getSelectOptions(options, simple));
  }, [options]);

  return (
    <SelectRoot
      multiple={multiple ?? false}
      size={rootStyle?.size}
      style={rootStyle}
      collection={optionCollection}
      defaultValue={selected}
      onClick={handleSelected}
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
          <SelectValueText placeholder={placeholder}>{getSelectedLabel(selected)}</SelectValueText>
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
      <SelectContent maxH="40vh" bgColor="white">
        {optionCollection.items.map((option) => (
          <SelectItem
            item={option} key={option.value}
            bgColor={isSelected(selected, option.value) ? "gray.200" : ""}
          >
            {option.label}
            {!options.includes(simple ? option.value : option) ?
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