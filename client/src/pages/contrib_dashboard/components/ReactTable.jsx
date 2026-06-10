// ReactTable.jsx - Extract the ReactTable component from your original code
import React, { useEffect, useState } from 'react';
import { Stack, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import { HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';
import CustomTooltip from 'components/@extended/Tooltip';
import { fuzzyFilter } from 'pages/dashboard/components/Users';
// import { fuzzyFilter } from './Users'; // Or define this locally

function ReactTable({ data, columns, enableRowSelection = false, selectedRowsCount, setSelectedRowsCount, setSelectedCourseIds }) {
  const [sorting, setSorting] = useState([{ id: columns[0]?.accessorKey || 'id', desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)?.length;
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key] === true);

    setSelectedRowsCount?.(selectedRows);
    setSelectedCourseIds?.(selectedIds);
  }, [rowSelection, setSelectedRowsCount, setSelectedCourseIds]);

  return (
    <ScrollX>
      <Stack>
        {enableRowSelection && <RowSelection selected={Object.keys(rowSelection)?.length} />}
        <TableContainer>
          <Table sx={{ minWidth: 750, tableLayout: 'fixed' }}>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      style={{ width: header.column.columnDef.size || 'auto' }}
                      {...header.column.columnDef.meta}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TablePagination
            {...{
              setPageSize: table.setPageSize,
              setPageIndex: table.setPageIndex,
              getState: table.getState,
              getPageCount: table.getPageCount,
              initialPageSize: 5
            }}
          />
        </Box>
      </Stack>
    </ScrollX>
  );
}

export default ReactTable;
