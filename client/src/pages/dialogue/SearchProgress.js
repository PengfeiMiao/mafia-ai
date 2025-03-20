import CommonProgress from "@/components/CommonProgress";
import React, {useEffect, useState} from "react";
import {Flex} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";
import moment from "moment";

let progress = 0;

const SearchProgress = ({open, status, count}) => {
  const initState = [
    {progress: 0, stride: 10},
    {progress: 0, stride: 2},
    {progress: 0, stride: 10}
  ];
  const [progressArr, setProgressArr] = useState(initState);
  const [lastUpd, setLastUpd] = useState(0);
  const [isOpen, setIsOpen] = useState(open);

  const rootStyle = {
    marginLeft: "4px",
    marginRight: "4px"
  };

  const handleProgress = (_progress, _lastUpd) => {
    setProgressArr((prev) => {
      let curr = Array.from(prev);
      curr[0] = {progress: Math.min(_progress, 100), stride: initState[0].stride};
      curr[1] = {progress: Math.min(_progress - 100, 100), stride: initState[1].stride};
      curr[2] = {progress: Math.min(_progress - 200, 100), stride: initState[2].stride};
      return curr;
    });
  };

  useEffect(() => {
    setIsOpen(open || (progress > 0 && progress < 300));
    let interval;
    if (!open) {
      progress = 0;
      setProgressArr(initState);
    } else {
      interval = setInterval(() => {
        if (progress < 300) {
          let index = Math.floor(progress / 100);
          let stride = status === 'pending' ? 50 : (
            index === 1 && count > 0 && moment().valueOf() - lastUpd > 2000 ? 10 : initState[index].stride
          );
          progress += stride;
        } else {
          progress = 300;
        }
        handleProgress(progress, lastUpd);
      }, 100);
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [open, lastUpd, status]);

  useEffect(() => {
    setLastUpd(moment().valueOf());
  }, [count]);

  useEffect(() => {
    if (progressArr[2].progress === 100) {
      setTimeout(() => setIsOpen(false), 300);
    }
  }, [progressArr]);

  return (
    <SlideBox
      open={isOpen}
      outerStyle={{height: "auto", borderRadius: "8px", marginBottom: "8px"}}>
      <Flex
        w="100%"
        padding="8px"
        align="center"
        justify="space-between">
        <CommonProgress title={"Understand"} percent={progressArr[0].progress} outerStyle={rootStyle}/>
        <CommonProgress
          title={"Search"}
          content={count > 0 ? `Collected ${count} resources` : ''}
          percent={progressArr[1].progress}
          outerStyle={rootStyle}/>
        <CommonProgress title={"Analysis"} percent={progressArr[2].progress} outerStyle={rootStyle}/>
      </Flex>
    </SlideBox>
  );
};

export default SearchProgress;