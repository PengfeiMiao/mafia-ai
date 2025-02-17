import React, {useState} from "react";
import {Flex, HStack, Table} from "@chakra-ui/react";

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"


const DataList = ({dateList, headers, functions, operations}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  return (
    <Flex h="100%" w="100%" align="center" jusify="flex-end" direction="column">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            {headers.map(item => (
              <Table.ColumnHeader key={item}>{item}</Table.ColumnHeader>
            ))}
            <Table.ColumnHeader textAlign="end">Operations</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {dateList.slice((page - 1) * pageSize, page * pageSize).map((item) => (
            <Table.Row key={item.id}>
              {headers.map((field, index) => (
                <Table.Cell key={field}>
                  {functions && functions[index] ? functions[index](item[field]) : item[field]}
                </Table.Cell>
              ))}
              <Table.Cell>
                {operations(item)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <PaginationRoot count={dateList.length} pageSize={pageSize} page={page} mt="auto">
        <HStack wrap="wrap">
          <PaginationPrevTrigger onClick={() => setPage((prev) => prev - 1)}/>
          <PaginationItems onClick={(e) => setPage(Number(e.target.innerText))}/>
          <PaginationNextTrigger onClick={() => setPage((prev) => prev + 1)}/>
        </HStack>
      </PaginationRoot>
    </Flex>
  );
};

export default DataList;