import CommonProgress from "@/components/CommonProgress";
import React from "react";
import {Flex} from "@chakra-ui/react";
import SlideBox from "@/components/SlideBox";

const SearchProgress = ({open, progress1, progress2, progress3}) => {
  const rootStyle = {
    marginLeft: "4px",
    marginRight: "4px"
  };
  return (
    <SlideBox open={open} outerStyle={{height: "auto", borderRadius: "8px", marginBottom: "8px"}}>
      <Flex
        w="100%"
        padding="8px"
        align="center"
        justify="space-between">
        <CommonProgress title={"Understand"} percent={progress1} outerStyle={rootStyle}/>
        <CommonProgress title={"Search"} percent={progress2} outerStyle={rootStyle}/>
        <CommonProgress title={"Analysis"} percent={progress3} outerStyle={rootStyle}/>
      </Flex>
    </SlideBox>
  );
};

export default SearchProgress;