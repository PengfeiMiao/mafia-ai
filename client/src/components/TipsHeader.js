import {Alert} from '@chakra-ui/react';

const TipsHeader = ({title, hidden, outerStyle}) => {
  const rootStyle = {
    width: "auto",
    position: "fixed",
    ...outerStyle
  };

  return (
    <Alert.Root style={rootStyle} top={2} zIndex={999} hidden={hidden}>
      <Alert.Indicator/>
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
      </Alert.Content>
    </Alert.Root>
  );
};

export default TipsHeader;