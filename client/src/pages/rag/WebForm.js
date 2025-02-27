import {Flex, GridItem, Input, SimpleGrid, Text} from "@chakra-ui/react";
import {Radio, RadioGroup} from "@/components/ui/radio";
import React, {useContext, useEffect, useRef, useState} from "react";
import {WebContext} from "@/store/WebProvider";

const WebForm = () => {
  const [newTitle, setNewTitle] = useState("");
  const [scheduled, setScheduled] = useState("1");
  const [cron, setCron] = useState("* * * * ? *");
  const titleRef = useRef(null);
  const {formData, setFormData} = useContext(WebContext);

  const checkCron = (cronExpression) => {
    const regex = /^(([*?]|(\d+(-\d+)?(,\d+(-\d+)?)*(\/\d+)?))\s+){4}[*?]\s+(\*|(\d{4}(,\d{4})*))$/;
    return regex.test(cronExpression);
  };

  useEffect(() => {
    const isScheduled = scheduled === "1";
    setFormData({
      ...formData,
      title: newTitle,
      scheduled: isScheduled,
      cron: isScheduled ? cron : ""
    });
  }, [newTitle, scheduled, cron]);

  useEffect(() => {
    console.log(`'${cron}'`, checkCron(cron));
  }, [cron]);

  return (
    <Flex w="100%" p="8px 16px" direction="column">
      <SimpleGrid columns={{base: 2, md: 4}} gap={{base: "8px", md: "16px"}}>
        <GridItem colSpan={{base: 1, md: 1}}>
          <Flex h="100%" align="center">
            <Text>Title</Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 3}}>
          <Input
            w="50%" minW="128px"
            defaultValue={formData?.title}
            onChange={() => setNewTitle(titleRef?.current.value)}
            ref={titleRef}/>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 1}}>
          <Text>Url</Text>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 3}}>
          <Text>{formData?.uri}</Text>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 1}}>
          <Text>Xpaths</Text>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 3}}>
          <Flex direction="column">
            {(formData?.xpaths?.length > 0 ? formData.xpaths : ["empty"]).map(item => (
              <Text key={item} maxW="80vw">{item}</Text>
            ))}
          </Flex>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 1}}>
          <Text>IsScheduled</Text>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 3}}>
          <RadioGroup value={scheduled} onChange={(e) => setScheduled(e.target.value)}>
            <Flex w="160px" justify="space-between">
              <Radio value="1">True</Radio>
              <Radio value="0">False</Radio>
            </Flex>
          </RadioGroup>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 1}}>
          <Flex h="100%" align="center">
            <Text>Cron</Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={{base: 1, md: 3}}>
          <Input w="50%" minW="128px" value={cron} onChange={(e) => setCron(e.target.value)}/>
        </GridItem>
      </SimpleGrid>
    </Flex>
  );
};

export default WebForm;