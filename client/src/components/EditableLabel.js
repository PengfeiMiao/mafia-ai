import {Editable} from "@chakra-ui/react"

export const EditableLabel = ({isEditable, onSelect, onSubmit, outerStyle, children}) => {
  const rootStyle = {
    height: "24px",
    marginRight: "12px",
    sessionMaxWidth: "160px",
    ...outerStyle
  };

  return (
    <Editable.Root
      style={rootStyle}
      defaultValue={children}
      readOnly={!isEditable}
      defaultEdit={isEditable}
    >
      <Editable.Preview
        w="100%" bgColor={rootStyle.bgColor} maxW={rootStyle.sessionMaxWidth} cursor="pointer" onClick={onSelect}/>
      <Editable.Input onBlur={onSubmit}/>
    </Editable.Root>
  )
}
