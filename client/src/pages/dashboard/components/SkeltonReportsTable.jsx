import React from 'react';
import { Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Divider } from '@mui/material';

const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <Stack>
      {/* Placeholder for RowSelection */}

      {/* Skeleton for Table */}
      <TableContainer>
        <Table sx={{ minWidth: 750, tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {[...Array(columns)].map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" width="100%" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      {/* Placeholder for TablePagination */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width={300} height={40} />
      </Box>
    </Stack>
  );
};

export default TableSkeleton;
