import CommonProgress from "@/components/CommonProgress";
import React, {useEffect, useState} from "react";
import {Flex} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";

let state = {progress: 0, stride: 10};

const SearchProgress = ({open, count}) => {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [p3, setP3] = useState(0);

  const rootStyle = {
    marginLeft: "4px",
    marginRight: "4px"
  };

  const handleProgress = () => {
    if (state.progress <= 100) {
      setP1(state.progress);
    } else if (state.progress <= 200) {
      setP1(100);
      setP2(state.progress - 100);
    } else {
      setP1(100);
      setP2(100);
      setP3(Math.min(state.progress - 200, 100));
    }
  };

  useEffect(() => {
    console.log(open);
    let interval;
    if (!open) {
      state = {progress: 0, stride: 10};
      setP1(0);
      setP2(0);
      setP3(0);
    } else {
      interval = setInterval(() => {
        if (state.progress < 300) {
          state.progress += state.stride;
          handleProgress();
        }
      }, 200);
    }
    return () => {
      interval && clearInterval(interval);
    };
  }, [open]);

  useEffect(() => {
    if (count > 0) {
      state.stride *= 2;
    }
  }, [count]);

  return (
    <SlideBox open={open} outerStyle={{height: "auto", borderRadius: "8px", marginBottom: "8px"}}>
      <Flex
        w="100%"
        padding="8px"
        align="center"
        justify="space-between">
        <CommonProgress title={"Understand"} percent={p1} outerStyle={rootStyle}/>
        <CommonProgress title={"Search"} percent={p2} outerStyle={rootStyle}/>
        <CommonProgress title={"Analysis"} percent={p3} outerStyle={rootStyle}/>
      </Flex>
    </SlideBox>
  );
};

export default SearchProgress;