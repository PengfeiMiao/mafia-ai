import {Flex, HStack} from "@chakra-ui/react";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import {useState} from "react";
import CommonSyntaxHighlighter from "@/components/CommonSyntaxHighlighter";

const WebContent = ({data}) => {
  const [page, setPage] = useState(1);
  const pageSize = 1;

  return (
    <Flex h="60vh" w="100%" jusify="flex-end" direction="column">
      {data.slice((page - 1) * pageSize, page * pageSize).map((item) => (
        <CommonSyntaxHighlighter key={item} lang={"json"} content={item}/>
      ))}
      <PaginationRoot marginX="auto" mt="auto" pt="8px" count={data.length} pageSize={pageSize} page={page}>
        <HStack wrap="wrap">
          <PaginationPrevTrigger onClick={() => setPage((prev) => prev - 1)}/>
          <PaginationItems onClick={(e) => setPage(Number(e.target.innerText))}/>
          <PaginationNextTrigger onClick={() => setPage((prev) => prev + 1)}/>
        </HStack>
      </PaginationRoot>
    </Flex>
  );
};

export default WebContent;