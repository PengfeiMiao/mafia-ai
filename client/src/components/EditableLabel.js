import {Editable} from "@chakra-ui/react"

export const EditableLabel = ({isEditable, onSubmit, children}) => {
  return (
    <Editable.Root
      h="24px"
      mr="12px"
      defaultValue={children}
      disabled={!isEditable}
      defaultEdit={isEditable}
    >
      <Editable.Preview/>
      <Editable.Input onBlur={onSubmit}/>
    </Editable.Root>
  )
}
