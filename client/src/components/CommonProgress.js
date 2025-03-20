import {Flex, Progress, Text} from "@chakra-ui/react";
import React from "react";

const CommonProgress = ({title, content, percent, outerStyle}) => {
  return (
    <Flex w="100%" style={outerStyle} direction="column">
      <Flex justify="space-between">
        <Text fontSize="sm">{title}</Text>
        <Text fontSize="xs" color="gray">{content}</Text>
      </Flex>
      <Progress.Root marginTop="4px" size="xs" w="100%" value={percent}>
        <Progress.Track>
          <Progress.Range/>
        </Progress.Track>
      </Progress.Root>
    </Flex>
  );
};

export default CommonProgress;
