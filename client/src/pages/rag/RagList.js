import React, {useEffect, useState} from "react";
import {Button, Flex, HStack, Table} from "@chakra-ui/react";

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import {TbEdit} from "react-icons/tb";


const RagList = () => {
  const [ragList, setRagList] = new useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setRagList([
      {
        id: 1,
        name: 'test1',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        size: 10
      },
      {
        id: 2,
        name: 'test2',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        size: 8
      },
      {
        id: 3,
        name: 'test3',
        created_by: 'unknown',
        created_at: '2024-01-01 00:00:00',
        size: 6
      }
    ]);
  }, []);

  return (
    <Flex h="100%" paddingX="20px" align="center" jusify="flex-end" direction="column">
      <Flex h="auto" w="100%" align="flex-start" jusify="flex-end">
        <Button h="32px" marginY="8px">New</Button>
      </Flex>
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Owner</Table.ColumnHeader>
            <Table.ColumnHeader>Size</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Operations</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ragList.slice((page - 1) * pageSize, page * pageSize).map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.created_by}</Table.Cell>
              <Table.Cell>{item.size}</Table.Cell>
              <Table.Cell textAlign="end">
                <TbEdit />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <PaginationRoot count={ragList.length} pageSize={pageSize} page={page} mt="auto">
        <HStack wrap="wrap">
          <PaginationPrevTrigger onClick={() => setPage((prev) => prev - 1)}/>
          <PaginationItems onClick={(e) => setPage(Number(e.target.innerText))}/>
          <PaginationNextTrigger onClick={() => setPage((prev) => prev + 1)}/>
        </HStack>
      </PaginationRoot>
    </Flex>
  );
};

export default RagList;