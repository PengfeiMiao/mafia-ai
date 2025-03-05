import React, {useEffect, useState} from "react";
import {Button, Flex} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import RagCreator from "@/pages/rag/RagCreator";
import {getRags} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import {useDelayToggle} from "@/store/Hook";


const RagList = () => {
  const [ragList, setRagList] = new useState([]);
  const {toggle, onToggle} = useDelayToggle();

  const getRagList = async () => {
    let rags = await getRags();
    setRagList(rags);
  };

  const handleCreate = (newRag) => {
    setRagList([...ragList, newRag]);
    onToggle();
  };

  useEffect(() => {
    getRagList().then();
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <TipsHeader title={'Rag have been created.'} hidden={toggle}/>
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <RagCreator onChange={handleCreate}>
          <Button h="32px" marginY="8px">New</Button>
        </RagCreator>
      </Flex>
      <DataList
        dataList={ragList}
        headers={["title", "user_id", "resources"]}
        functions={[null, null, (it) => it?.length ?? 0]}
        operations={(_) => (
          <Flex align={'flex-end'}>
            <RiEdit2Line style={{marginLeft: 'auto'}}/>
            <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default RagList;