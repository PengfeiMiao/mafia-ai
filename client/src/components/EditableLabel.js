import {Editable} from "@chakra-ui/react"

export const EditableLabel = ({isEditable, onSelect, onSubmit, children}) => {
  return (
    <Editable.Root
      h="24px"
      mr="12px"
      defaultValue={children}
      readOnly={!isEditable}
      defaultEdit={isEditable}
    >
      <Editable.Preview w="100%" onClick={onSelect}/>
      <Editable.Input onBlur={onSubmit}/>
    </Editable.Root>
  )
}
