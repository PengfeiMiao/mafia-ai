import React, {useEffect, useState} from "react";
import {Button, Flex, Spinner} from "@chakra-ui/react";
import DataList from "@/components/DataList";
import {RiDeleteBin5Line, RiEdit2Line} from "react-icons/ri";
import RagCreator from "@/pages/rag/RagCreator";
import {deleteRag, getRags, loadRag} from "@/api/api";
import TipsHeader from "@/components/TipsHeader";
import {useDelayToggle} from "@/store/Hook";
import _ from "lodash";
import ConfirmPopover from "@/components/ConfirmPopover";
import {VscDebugRerun} from "react-icons/vsc";


const tips = [
  'Rag have been created.',
  'Rag have been updated.',
  'Rag have been deleted.',
  'Rag have been loaded.'
];

const RagList = () => {
  const [ragList, setRagList] = new useState([]);
  const [tipMsg, setTipMsg] = new useState(tips[0]);
  const [spinnerPt, setSpinnerPt] = new useState(null);
  const {toggle, onToggle} = useDelayToggle();

  const getRagList = async () => {
    let rags = await getRags("");
    setRagList(rags);
  };

  const handleCreate = (newRag) => {
    setRagList([...ragList, newRag]);
    setTipMsg(tips[0]);
    onToggle();
  };

  const handleUpdate = (newRag) => {
    let newList = Array.from(ragList);
    const index = _.findIndex(newList, (item) => item?.id === newRag?.id)
    if (index > -1) {
      newList[index] = newRag;
      setRagList(newList);
      setTipMsg(tips[1]);
      onToggle();
    }
  };

  const handleRemove = (deprecated) => {
    deleteRag(deprecated.id).then(res => {
      if (res) {
        let newList = Array.from(ragList);
        newList = _.reject(newList, (item) => item.id === deprecated.id);
        setRagList(newList);
        setTipMsg(tips[2]);
        onToggle();
      }
    });
  };

  const handleRerun = (rag_id) => {
    setSpinnerPt(rag_id);
    loadRag(rag_id).then(res => {
      let newList = Array.from(ragList);
      const index = _.findIndex(newList, (item) => item?.id === res?.id)
      if (index > -1) {
        newList[index] = res;
        setRagList(newList);
        setSpinnerPt(null);
        setTipMsg(tips[3]);
        onToggle();
      }
    });
  };

  useEffect(() => {
    getRagList().then();
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <TipsHeader title={tipMsg} hidden={toggle}/>
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <RagCreator onChange={handleCreate}>
          <Button h="32px" marginY="8px">New</Button>
        </RagCreator>
      </Flex>
      <DataList
        dataList={ragList}
        headers={["title", "created_at", "resources", "state"]}
        functions={[null, null, (it) => it?.length ?? 0, null]}
        operations={(item) => (
          <Flex align={'flex-end'}>
            {spinnerPt === item?.id ?
              <Spinner ml={'auto'} size="sm"/>
              : <VscDebugRerun style={{marginLeft: 'auto'}} onClick={() => handleRerun(item?.id)}/>}
            <RagCreator data={item} onChange={handleUpdate}>
              <RiEdit2Line style={{marginLeft: '12px'}}/>
            </RagCreator>
            <ConfirmPopover onConfirm={() => handleRemove(item)}>
              <RiDeleteBin5Line style={{marginLeft: '12px'}}/>
            </ConfirmPopover>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default RagList;