import {Alert} from '@chakra-ui/react';

const TipsHeader = ({title, cleaned}) => {
  return (
    <Alert.Root w="auto" hidden={!cleaned} position="fixed" top={2} zIndex={999}>
      <Alert.Indicator/>
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
      </Alert.Content>
    </Alert.Root>
  );
};

export default TipsHeader;