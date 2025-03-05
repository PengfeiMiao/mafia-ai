import {Editable} from "@chakra-ui/react"

export const EditableLabel = ({isEditable, onSelect, onSubmit, outerStyle, children}) => {
  const rootStyle = {
    height: "24px",
    marginRight: "12px",
    ...outerStyle
  };

  return (
    <Editable.Root
      style={rootStyle}
      defaultValue={children}
      readOnly={!isEditable}
      defaultEdit={isEditable}
    >
      <Editable.Preview bgColor={rootStyle.bgColor} w="100%" cursor="pointer" onClick={onSelect}/>
      <Editable.Input onBlur={onSubmit}/>
    </Editable.Root>
  )
}
