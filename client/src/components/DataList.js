import React, {useState} from "react";
import {EmptyState, Flex, HStack, Table, VStack} from "@chakra-ui/react";

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import {TbFileSad} from "react-icons/tb";


const DataList = ({dataList, tips, headers, functions, operations}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  return (dataList.length === 0 ?
      <EmptyState.Root size={"md"}>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <TbFileSad/>
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Data is empty</EmptyState.Title>
            <EmptyState.Description>{tips}</EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
      :
      <Flex h="100%" w="100%" align="center" jusify="flex-end" direction="column">
        <Table.ScrollArea w="100%">
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
              {dataList?.slice((page - 1) * pageSize, page * pageSize)?.map((item) => (
                <Table.Row key={item?.id ?? JSON.stringify(item)}>
                  {headers.map((field, index) => (
                    <Table.Cell key={field}>
                      {functions && functions[index] ? functions[index](item[field]) : String(item[field])}
                    </Table.Cell>
                  ))}
                  <Table.Cell>
                    {operations && operations(item)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>

        <PaginationRoot count={dataList?.length} pageSize={pageSize} page={page} mt="auto">
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