import {Flex, Progress, Text} from "@chakra-ui/react";
import React from "react";

const CommonProgress = ({title, percent, outerStyle}) => {
  return (
    <Flex w="100%" style={outerStyle} direction="column">
      <Text fontSize="sm">{title}</Text>
      <Progress.Root marginTop="4px" size="xs" w="100%" defaultValue={percent}>
        <Progress.Track>
          <Progress.Range/>
        </Progress.Track>
      </Progress.Root>
    </Flex>
  );
};

export default CommonProgress;
