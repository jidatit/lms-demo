// import PropTypes from 'prop-types';
// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router';

// // material-ui
// import { useTheme } from '@mui/material/styles';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import Box from '@mui/material/Box';
// import Chip from '@mui/material/Chip';
// import Divider from '@mui/material/Divider';
// import Grid from '@mui/material/Grid';
// import Stack from '@mui/material/Stack';
// import Tab from '@mui/material/Tab';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Tabs from '@mui/material/Tabs';
// import Tooltip from '@mui/material/Tooltip';
// import Typography from '@mui/material/Typography';
// import LinearProgress from '@mui/material/LinearProgress';

// // third-party
// import {
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   useReactTable
// } from '@tanstack/react-table';
// import { rankItem } from '@tanstack/match-sorter-utils';

// // project-import
// import ScrollX from 'components/ScrollX';
// import MainCard from 'components/MainCard';
// import Avatar from 'components/@extended/Avatar';
// import IconButton from 'components/@extended/IconButton';
// import Breadcrumbs from 'components/@extended/Breadcrumbs';
// import InvoiceCard from 'components/cards/invoice/InvoiceCard';
// import InvoiceChart from 'components/cards/invoice/InvoiceChart';
// import EmptyReactTable from 'pages/tables/react-table/empty';
// import AlertProductDelete from 'sections/apps/invoice/AlertProductDelete';

// import { APP_DEFAULT_PATH } from 'config';
// import { openSnackbar } from 'api/snackbar';
// import { handlerDelete, deleteInvoice, useGetInvoice, useGetInvoiceMaster } from 'api/invoice';
// import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// import {
//   CSVExport,
//   DebouncedInput,
//   HeaderSort,
//   IndeterminateCheckbox,
//   RowSelection,
//   SelectColumnSorting,
//   TablePagination
// } from 'components/third-party/react-table';

// // assets
// import { AddCircle, Edit, Eye, InfoCircle, ProfileTick, Trash } from 'iconsax-react';
// import { useAllInvoices, useBundlePurchaseDetails } from 'api/queries/bundlepurchases';
// import { useBundleById } from 'api/queries/bundles';
// import { Button } from '@mui/material';

// export const fuzzyFilter = (row, columnId, value, addMeta) => {
//   // rank the item
//   const itemRank = rankItem(row.getValue(columnId), value);

//   // store the ranking info
//   addMeta(itemRank);

//   // return if the item should be filtered in/out
//   return itemRank.passed;
// };

// function ReactTable({ data, columns, pagination, setPagination, paginationInfo, activeTab, setActiveTab }) {
//   const groups = ['All', 'paid', 'unpaid', 'pending'];
//   // console.log('groups: ' + JSON.stringify(groups));
//   console.log('data in table:', data);

//   const countGroup = data?.map((item) => item.status) || [];
//   const counts = countGroup.reduce(
//     (acc, value) => ({
//       ...acc,
//       [value]: (acc[value] || 0) + 1
//     }),
//     {}
//   );

//   const [sorting, setSorting] = useState([{ id: 'customer_name', desc: false }]);
//   const [columnFilters, setColumnFilters] = useState([]);
//   const [rowSelection, setRowSelection] = useState({});
//   const [globalFilter, setGlobalFilter] = useState('');
//   const navigation = useNavigate();

//   const table = useReactTable({
//     data: data || [],
//     columns,
//     state: {
//       columnFilters,
//       sorting,
//       rowSelection,
//       globalFilter,
//       pagination: {
//         pageIndex: pagination.page - 1, // Convert to zero-based for react-table
//         pageSize: pagination.limit
//       }
//     },
//     enableRowSelection: true,
//     onSortingChange: setSorting,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setGlobalFilter,
//     onColumnFiltersChange: setColumnFilters,
//     onPaginationChange: (updater) => {
//       const newPagination =
//         typeof updater === 'function' ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit }) : updater;

//       // Update parent pagination state
//       setPagination({
//         page: newPagination.pageIndex + 1, // Convert back to one-based
//         limit: newPagination.pageSize
//       });
//     },
//     getRowCanExpand: () => true,
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     globalFilterFn: fuzzyFilter,
//     debugTable: true,
//     manualPagination: true, // Crucial for server-side pagination
//     pageCount: paginationInfo.totalPages || 1 // Use totalPages from API
//   });

//   let headers = [];
//   columns.map(
//     (columns) =>
//       // @ts-ignore
//       columns.accessorKey &&
//       headers.push({
//         label: typeof columns.header === 'string' ? columns.header : '#',
//         // @ts-ignore
//         key: columns.accessorKey
//       })
//   );

//   return (
//     <MainCard content={false}>
//       <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
//         <Stack
//           direction="row"
//           spacing={2}
//           alignItems="center"
//           justifyContent="space-between"
//           sx={{ borderBottom: 1, borderColor: 'divider' }}
//         >
//           <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} sx={{}}>
//             {groups.map((status, index) => (
//               <Tab key={index} label={status} value={status} iconPosition="end" />
//             ))}
//           </Tabs>

//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<AddCircle />}
//             onClick={() => {
//               console.log('clicked');
//               navigation('/contrib_dashboard/invoices/create');
//             }}
//           >
//             {'Create Invoice'}
//           </Button>
//         </Stack>
//       </Box>
//       <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 2.5 }}>
//         <DebouncedInput
//           value={globalFilter ?? ''}
//           onFilterChange={(value) => setGlobalFilter(String(value))}
//           placeholder={`Search from records...`}
//         />

//         <Stack direction="row" alignItems="center" spacing={2}>
//           <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
//           <CSVExport
//             {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'customer-list.csv' }}
//           />
//         </Stack>
//       </Stack>
//       <ScrollX>
//         <Stack>
//           <RowSelection selected={Object.keys(rowSelection).length} />
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 {table.getHeaderGroups().map((headerGroup) => (
//                   <TableRow key={headerGroup.id}>
//                     {headerGroup.headers.map((header) => {
//                       if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
//                         Object.assign(header.column.columnDef.meta, {
//                           className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
//                         });
//                       }

//                       return (
//                         <TableCell
//                           key={header.id}
//                           {...header.column.columnDef.meta}
//                           onClick={header.column.getToggleSortingHandler()}
//                           {...(header.column.getCanSort() &&
//                             header.column.columnDef.meta === undefined && {
//                               className: 'cursor-pointer prevent-select'
//                             })}
//                         >
//                           {header.isPlaceholder ? null : (
//                             <Stack direction="row" spacing={1} alignItems="center">
//                               <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
//                               {header.column.getCanSort() && <HeaderSort column={header.column} />}
//                             </Stack>
//                           )}
//                         </TableCell>
//                       );
//                     })}
//                   </TableRow>
//                 ))}
//               </TableHead>
//               <TableBody>
//                 {table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.id}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id} {...cell.column.columnDef.meta}>
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <>
//             <Divider />
//             <Box sx={{ p: 2 }}>
//               <TablePagination
//                 {...{
//                   setPageSize: table.setPageSize,
//                   setPageIndex: table.setPageIndex,
//                   getState: table.getState,
//                   getPageCount: table.getPageCount,
//                   initialPageSize: pagination.limit,
//                   pageSizeOptions: [5, 10, 20, 30, 50, 100]
//                 }}
//               />
//             </Box>
//           </>
//         </Stack>
//       </ScrollX>
//     </MainCard>
//   );
// }

// export default function InvoiceList() {
//   const { invoice: lodlist } = useGetInvoice();
//   const [selectedBundlePurchaseId, setSelectedBundlePurchaseId] = useState(null);
//   const [selectedExternalInvoice, setSelectedExternalInvoice] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5
//   });

//   // Add state for active tab
//   const [activeTab, setActiveTab] = useState('All');

//   // Update hook call to include status filter based on active tab
//   const { data: list, isPending: invoiceLoading } = useAllInvoices({
//     page: pagination.page,
//     limit: pagination.limit,
//     status: activeTab === 'All' ? undefined : activeTab // Send status filter to API
//   });

//   const { data: bundlePurchaseDetails, isLoading: bundleDetailsLoading } = useBundlePurchaseDetails(selectedBundlePurchaseId);

//   console.log('list', list);

//   const { invoiceMaster } = useGetInvoiceMaster();
//   const [invoiceId, setInvoiceId] = useState(0);

//   const navigation = useNavigate();
//   const invoices = list?.data || [];
//   const paginationInfo = list?.pagination || {};

//   // Reset to page 1 when tab changes
//   useEffect(() => {
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, [activeTab]);

//   // Handle internal invoice navigation
//   useEffect(() => {
//     if (bundlePurchaseDetails && selectedBundlePurchaseId) {
//       // Find the original row data to get invoice info
//       const originalRow = invoices?.find((item) => item.bundlePurchase?.id === selectedBundlePurchaseId);

//       if (originalRow) {
//         const discountAmount = bundlePurchaseDetails.bundle.seatPrice - bundlePurchaseDetails.totalPrice;
//         console.log(`discountAmount: ${discountAmount}`);
//         navigation(`details?invoiceId=${originalRow.invoiceNumber}&status=${originalRow.status}`, {
//           state: {
//             bundleId: bundlePurchaseDetails.bundle?.id || originalRow.bundlePurchase.bundle.id,
//             seatsPurchased: bundlePurchaseDetails.seatsPurchased || originalRow.bundlePurchase.seatsPurchased,

//             bundleDetails: {
//               title: bundlePurchaseDetails.bundle?.title || originalRow.bundlePurchase.bundle.title,
//               seatPrice: bundlePurchaseDetails.totalPrice || originalRow.bundlePurchase.totalPrice,
//               courses: bundlePurchaseDetails.courses || [],
//               description: bundlePurchaseDetails.description || ''
//             },
//             discounts: {
//               appliedDiscount: bundlePurchaseDetails.discount.id
//                 ? {
//                     id: bundlePurchaseDetails.discount.id,
//                     percentage: bundlePurchaseDetails.discount.percentage,
//                     amount: discountAmount,
//                     isSeatDiscount: false
//                   }
//                 : null
//             },
//             pricing: {
//               baseSubtotal: Number(bundlePurchaseDetails.totalPrice || originalRow.bundlePurchase.totalPrice),
//               discountAmount: discountAmount || null,
//               finalTotal: Number(bundlePurchaseDetails.totalPrice || originalRow.bundlePurchase.totalPrice)
//             },

//             customerInfo: {
//               name: bundlePurchaseDetails.createdByUser?.firstName || originalRow.createdByUser.firstName || '',
//               email: bundlePurchaseDetails.createdByUser?.email || originalRow.createdByUser.email
//             },

//             purchaseDate: bundlePurchaseDetails.createdAt || originalRow.createdAt,
//             invoiceType: 'internal' // Add invoice type to state
//           }
//         });

//         setSelectedBundlePurchaseId(null);
//       }
//     }
//   }, [bundlePurchaseDetails, selectedBundlePurchaseId, invoices, navigation]);

//   // Handle external invoice navigation
//   useEffect(() => {
//     if (selectedExternalInvoice) {
//       const externalInvoice = invoices?.find((item) => item.id === selectedExternalInvoice);
//       const discountAmount =
//         externalInvoice && externalInvoice.discountPercentage
//           ? (externalInvoice.unitPrice * externalInvoice.quantity * externalInvoice.discountPercentage) / 100
//           : 0;

//       if (externalInvoice) {
//         navigation(`details?invoiceId=${externalInvoice.invoiceNumber}&status=${externalInvoice.status}`, {
//           state: {
//             // External invoice specific data
//             invoiceType: 'external',
//             seatsPurchased: externalInvoice.quantity,
//             companyInfo: {
//               id: externalInvoice.company?.id,
//               name: externalInvoice.company?.name,
//               address: externalInvoice.company?.address,
//               vatNumber: externalInvoice.company?.vatNumber
//             },
//             pricing: {
//               baseSubtotal: Number(externalInvoice.subtotal),
//               discountAmount: discountAmount || null,
//               finalTotal: Number(externalInvoice.amount)
//             },
//             bundleDetails: {
//               title: externalInvoice.description,
//               seatPrice: externalInvoice.unitPrice,
//               courses: externalInvoice.courses || [],
//               description: externalInvoice.itemDescription
//             },
//             invoiceDetails: {
//               description: externalInvoice.description,
//               itemDescription: externalInvoice.itemDescription,
//               seatsPurchased: externalInvoice.quantity,
//               unitPrice: externalInvoice.unitPrice,
//               subtotal: externalInvoice.subtotal,
//               discountPercentage: externalInvoice.discountPercentage,
//               amount: externalInvoice.amount,
//               notes: externalInvoice.notes,
//               pdfUrl: externalInvoice.pdfUrl
//             },
//             dates: {
//               createdAt: externalInvoice.createdAt,
//               dueDate: externalInvoice.dueDate
//             },
//             customerInfo: {
//               name: externalInvoice.company.name || '',
//               email: externalInvoice.company?.id || ''
//             },
//             status: externalInvoice.status || 'N/A',
//             notes: externalInvoice.notes || ''
//           }
//         });

//         setSelectedExternalInvoice(null);
//       }
//     }
//   }, [selectedExternalInvoice, invoices, navigation]);

//   const handleViewClick = (row) => {
//     console.log('row.original', row.original);

//     if (row.original.invoiceType === 'internal') {
//       // For internal invoices, use bundle purchase details
//       if (row.original.bundlePurchase?.id) {
//         setSelectedBundlePurchaseId(row.original.bundlePurchase.id);
//       } else {
//         console.error('No bundle purchase found for internal invoice');
//       }
//     } else if (row.original.invoiceType === 'external') {
//       // For external invoices, set the external invoice ID
//       setSelectedExternalInvoice(row.original.id);
//     } else {
//       console.error('Unknown invoice type:', row.original.invoiceType);
//     }
//   };

//   const handleClose = (status) => {
//     if (status) {
//       deleteInvoice(invoiceId);
//       openSnackbar({
//         open: true,
//         message: 'Column deleted successfully',
//         anchorOrigin: { vertical: 'top', horizontal: 'right' },
//         variant: 'alert',
//         alert: { color: 'success' }
//       });
//     }
//     handlerDelete(false);
//   };

//   const columns = useMemo(
//     () => [
//       {
//         id: 'Row Selection',
//         header: ({ table }) => (
//           <IndeterminateCheckbox
//             {...{
//               checked: table.getIsAllRowsSelected(),
//               indeterminate: table.getIsSomeRowsSelected(),
//               onChange: table.getToggleAllRowsSelectedHandler()
//             }}
//           />
//         ),
//         cell: ({ row }) => (
//           <IndeterminateCheckbox
//             {...{
//               checked: row.getIsSelected(),
//               disabled: !row.getCanSelect(),
//               indeterminate: row.getIsSomeSelected(),
//               onChange: row.getToggleSelectedHandler()
//             }}
//           />
//         )
//       },
//       {
//         header: 'Invoice Id',
//         accessorKey: 'invoiceNumber',
//         meta: { className: 'cell-center' }
//       },
//       {
//         header: 'User Info',
//         accessorKey: 'createdByUser.firstName',
//         cell: ({ row, getValue }) => (
//           <Stack direction="row" spacing={1.5} alignItems="center">
//             <Avatar
//               alt="Avatar"
//               size="sm"
//               src={getImageUrl(`avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`, ImagePath.USERS)}
//             />
//             <Stack spacing={0}>
//               <Typography variant="subtitle1">{row.original.createdByUser.firstName}</Typography>
//               <Typography color="text.secondary">{row.original.createdByUser.email}</Typography>
//             </Stack>
//           </Stack>
//         )
//       },
//       {
//         header: 'Create Date',
//         accessorKey: 'createdAt',
//         cell: ({ getValue }) => {
//           const raw = getValue();
//           const date = new Date(raw);

//           return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'numeric',
//             day: 'numeric'
//           });
//         }
//       },
//       {
//         header: 'Quantity',
//         accessorKey: 'bundlePurchase.seatsPurchased',
//         cell: ({ row, getValue }) => (
//           <Typography>
//             {row.original.invoiceType === 'internal'
//               ? row.original.bundlePurchase?.seatsPurchased || 'N/A'
//               : row.original.quantity || 'N/A'}
//           </Typography>
//         )
//       },
//       {
//         header: 'Type',
//         accessorKey: 'invoiceType',
//         cell: ({ row, getValue }) => (
//           <Chip
//             label={row.original.invoiceType || 'N/A'}
//             color={row.original.invoiceType === 'internal' ? 'primary' : 'secondary'}
//             size="small"
//             variant="light"
//           />
//         )
//       },
//       {
//         header: 'Status',
//         accessorKey: 'status',
//         cell: (cell) => {
//           switch (cell.getValue()) {
//             case 'cancelled':
//               return <Chip color="error" label="Cancelled" size="small" variant="light" />;
//             case 'paid':
//               return <Chip color="success" label="Paid" size="small" variant="light" />;
//             case 'pending':
//               return <Chip color="warning" label="Pending" size="small" variant="light" />;
//             case 'unpaid':
//             default:
//               return <Chip color="info" label="Unpaid" size="small" variant="light" />;
//           }
//         }
//       },
//       {
//         header: 'Actions',
//         meta: { className: 'cell-center' },
//         disableSortBy: true,
//         cell: ({ row }) => {
//           return (
//             <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
//               <Tooltip title="View">
//                 <IconButton
//                   color="secondary"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleViewClick(row);
//                   }}
//                 >
//                   <Eye />
//                 </IconButton>
//               </Tooltip>
//             </Stack>
//           );
//         }
//       }
//     ],
//     []
//   );

//   const theme = useTheme();
//   const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

//   const widgetsData = [
//     {
//       title: 'Paid',
//       count: '$7,825',
//       percentage: 70.5,
//       isLoss: false,
//       invoice: '9',
//       color: theme.palette.success,
//       chartData: [200, 600, 100, 400, 300, 400, 50]
//     },
//     {
//       title: 'Unpaid',
//       count: '$1,880',
//       percentage: 27.4,
//       isLoss: true,
//       invoice: '6',
//       color: theme.palette.warning,
//       chartData: [100, 550, 300, 350, 200, 100, 300]
//     },
//     {
//       title: 'Overdue',
//       count: '$3,507',
//       percentage: 27.4,
//       isLoss: true,
//       invoice: '4',
//       color: theme.palette.error,
//       chartData: [100, 550, 200, 300, 100, 200, 300]
//     }
//   ];

//   let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Invoice', to: '/apps/invoice/dashboard' }, { title: 'List' }];

//   return (
//     <>
//       {/* <Breadcrumbs custom heading="Invoice List" links={breadcrumbLinks} /> */}
//       <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ pb: 2 }}>
//         <Grid item md={8}>
//           <Grid container direction="row" spacing={2}>
//             {widgetsData.map((widget, index) => (
//               <Grid item sm={4} xs={12} key={index}>
//                 <MainCard>
//                   <InvoiceCard
//                     title={widget.title}
//                     count={widget.count}
//                     percentage={widget.percentage}
//                     isLoss={widget.isLoss}
//                     invoice={widget.invoice}
//                     color={widget.color.main}
//                   >
//                     <InvoiceChart color={widget.color} data={widget.chartData} />
//                   </InvoiceCard>
//                 </MainCard>
//               </Grid>
//             ))}
//           </Grid>
//         </Grid>
//         <Grid item md={4} sm={12} xs={12}>
//           <Box
//             sx={{
//               background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
//               borderRadius: 1,
//               p: 1.75
//             }}
//           >
//             <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1}>
//               <Stack direction="row" spacing={1} alignItems="center">
//                 <Avatar alt="Natacha" variant="rounded" type="filled">
//                   <ProfileTick style={{ fontSize: '20px' }} />
//                 </Avatar>
//                 <Box>
//                   <Stack direction="row" spacing={1} alignItems="center">
//                     <Typography variant="body1" color="white">
//                       Total Recievables
//                     </Typography>
//                     <InfoCircle color={theme.palette.background.paper} />
//                   </Stack>
//                   <Stack direction="row" spacing={1}>
//                     <Typography variant="body2" color="white">
//                       Current
//                     </Typography>
//                     <Typography variant="body1" color="white">
//                       109.1k
//                     </Typography>
//                   </Stack>
//                 </Box>
//               </Stack>
//               <Stack direction="row" spacing={1}>
//                 <Typography variant="body2" color="white">
//                   Overdue
//                 </Typography>
//                 <Typography variant="body1" color="white">
//                   62k
//                 </Typography>
//               </Stack>
//             </Stack>
//             <Typography variant="h4" color="white" sx={{ pt: 2, pb: 1, zIndex: 1 }}>
//               $43,078
//             </Typography>
//             <Box sx={{ maxWidth: '100%' }}>
//               <LinearWithLabel value={90} />
//             </Box>
//           </Box>
//         </Grid>
//         <Grid item xs={12}>
//           {invoiceLoading ? (
//             <EmptyReactTable />
//           ) : (
//             <ReactTable
//               data={invoices}
//               columns={columns}
//               pagination={pagination}
//               setPagination={setPagination}
//               paginationInfo={paginationInfo}
//               activeTab={activeTab}
//               setActiveTab={setActiveTab}
//             />
//           )}
//           <AlertProductDelete
//             title={invoiceId.toString()}
//             open={invoiceMaster ? invoiceMaster.alertPopup : false}
//             handleClose={handleClose}
//           />
//         </Grid>
//       </Grid>
//     </>
//   );
// }

// function LinearWithLabel({ value, ...others }) {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//       <Box sx={{ width: '100%', mr: 1 }}>
//         <LinearProgress color="warning" variant="determinate" value={value} {...others} />
//       </Box>
//       <Box sx={{ minWidth: 35 }}>
//         <Typography variant="body2" color="white">{`${Math.round(value)}%`}</Typography>
//       </Box>
//     </Box>
//   );
// }

// ReactTable.propTypes = {
//   data: PropTypes.array,
//   columns: PropTypes.array,
//   pagination: PropTypes.object,
//   setPagination: PropTypes.func,
//   paginationInfo: PropTypes.object,
//   activeTab: PropTypes.string,
//   setActiveTab: PropTypes.func
// };

// LinearWithLabel.propTypes = { value: PropTypes.any, others: PropTypes.any };

import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// third-party
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import InvoiceCard from 'components/cards/invoice/InvoiceCard';
import InvoiceChart from 'components/cards/invoice/InvoiceChart';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertProductDelete from 'sections/apps/invoice/AlertProductDelete';

import { APP_DEFAULT_PATH } from 'config';
import { openSnackbar } from 'api/snackbar';
import { handlerDelete, deleteInvoice, useGetInvoice, useGetInvoiceMaster } from 'api/invoice';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// assets
import { AddCircle, Edit, Eye, InfoCircle, ProfileTick, Trash } from 'iconsax-react';
import { useAllInvoices, useBundlePurchaseDetails, useInvoiceSummary } from 'api/queries/bundlepurchases';
import { useBundleById } from 'api/queries/bundles';
import { Button, CircularProgress } from '@mui/material';
import CircularLoader from 'pages/dashboard/components/CircularLoader';
import { useAdminProfile } from 'api/queries/userProfile';

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

function ReactTable({ data, columns, pagination, setPagination, paginationInfo, activeTab, setActiveTab, invoiceLoading, statusCounts }) {

  // const groups = ['All', 'internal', 'external'];
  const groups = ['All', 'paid', 'unpaid', 'cancelled'];


  // console.log('groups: ' + JSON.stringify(groups));
  // console.log('data in table:', data);

  const countGroup = data?.map((item) => item.status) || [];
  const counts = countGroup.reduce(
    (acc, value) => ({
      ...acc,
      [value]: (acc[value] || 0) + 1
    }),
    {}
  );

  const [sorting, setSorting] = useState([{ id: 'customer_name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const navigation = useNavigate();

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: pagination.page - 1, // Convert to zero-based for react-table
        pageSize: pagination.limit
      }
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit }) : updater;

      // Update parent pagination state
      setPagination({
        page: newPagination.pageIndex + 1, // Convert back to one-based
        limit: newPagination.pageSize
      });
    },
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
    manualPagination: true, // Crucial for server-side pagination
    pageCount: paginationInfo.totalPages || 1 // Use totalPages from API
  });

  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  return (
    <MainCard content={false}>
      <Box sx={{ p: 2.5, pb: 0, width: '100%' }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, value) => setActiveTab(value)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {groups.map((status, index) => (
              <Tab
                key={index}
                label={status}
                value={status}
                icon={
                  <Chip
                    label={statusCounts[status.toLowerCase()] || 0}
                    color={
                      status === 'All'
                        ? 'info'
                        : status === 'paid'
                          ? 'success'
                          : status === 'unpaid'
                            ? 'warning'
                            : 'error'
                    }
                    variant="light"
                    size="small"
                  />
                }
                iconPosition="end"
              />
            ))}
          </Tabs>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircle />}
            onClick={() => {
              // console.log('clicked');
              navigation('/contrib_dashboard/invoices/create');
            }}
          >
            {'Create Invoice'}
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 2.5 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search from records...`}
        />

        <Stack direction="row" alignItems="center" spacing={2}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <CSVExport
            {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'customer-list.csv' }}
          />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            {
              invoiceLoading ? <CircularLoader /> :
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup?.id}>
                        {headerGroup.headers.map((header) => {
                          if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                            Object.assign(header.column.columnDef.meta, {
                              className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                            });
                          }

                          return (
                            <TableCell
                              key={header?.id}
                              {...header.column.columnDef.meta}
                              onClick={header.column.getToggleSortingHandler()}
                              {...(header.column.getCanSort() &&
                                header.column.columnDef.meta === undefined && {
                                className: 'cursor-pointer prevent-select'
                              })}
                            >
                              {header.isPlaceholder ? null : (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                                  {header.column.getCanSort() && <HeaderSort column={header.column} />}
                                </Stack>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell?.id} {...cell.column.columnDef.meta}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            }
          </TableContainer>
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount,
                  initialPageSize: pagination.limit,
                  pageSizeOptions: [5, 10, 20, 30, 50, 100]
                }}
              />
            </Box>
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

export default function InvoiceList() {
  const { invoice: lodlist } = useGetInvoice();
  const [selectedBundlePurchaseId, setSelectedBundlePurchaseId] = useState(null);
  const [selectedExternalInvoice, setSelectedExternalInvoice] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5
  });

  // Add state for active tab
  const [activeTab, setActiveTab] = useState('All');
  const [persistedStatusCounts, setPersistedStatusCounts] = useState({}); // New state for persisting counts
  const [persistedWidgetData, setPersistedWidgetData] = useState([]);
  const [persistedReceivables, setPersistedReceivables] = useState({});

  // Update hook call to include status filter based on active tab
  const { data: list, isLoading: invoiceLoading } = useAllInvoices({
    page: pagination.page,
    limit: pagination.limit,
    // invoiceType: activeTab === 'All' ? undefined : activeTab // Send status filter to API
    status: activeTab === 'All' ? undefined : activeTab // Send status filter to API

  });
  const { widgetData, receivables, isPending: summaryLoading, refetch: refetchSummary } = useInvoiceSummary();

  const { data: bundlePurchaseDetails, isLoading: bundleDetailsLoading } = useBundlePurchaseDetails(selectedBundlePurchaseId);
  const { data: profile, isLoading: isAdminProfileLoading, error } = useAdminProfile();


  const { invoiceMaster } = useGetInvoiceMaster();
  const [invoiceId, setInvoiceId] = useState(0);

  const navigation = useNavigate();
  const invoices = list?.data || [];
  const paginationInfo = list?.pagination || {};


  useEffect(() => {
    if (list?.statusCounts) {
      setPersistedStatusCounts(list.statusCounts);
    }
  }, [list]);
  useEffect(() => {
    if (widgetData?.length) {
      setPersistedWidgetData(widgetData);
    }
    if (receivables && Object.keys(receivables).length) {
      setPersistedReceivables(receivables);
    }
  }, [widgetData, receivables]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab]);

  // Handle internal invoice navigation
  useEffect(() => {
    if (bundlePurchaseDetails && selectedBundlePurchaseId) {
      // Find the original row data to get invoice info
      const originalRow = invoices?.find((item) => item.bundlePurchase?.id === selectedBundlePurchaseId);
      if (originalRow) {
        const discountAmount = bundlePurchaseDetails?.bundle?.seatPrice - bundlePurchaseDetails?.totalPrice;

        navigation(`details?invoiceId=${originalRow?.invoiceNumber}&status=${originalRow?.status}`, {
          state: {
            bundleId: bundlePurchaseDetails?.bundle?.id || originalRow?.bundlePurchase?.bundle?.id,
            seatsPurchased: bundlePurchaseDetails?.seatsPurchased || originalRow?.bundlePurchase?.seatsPurchased,

            bundleDetails: {
              title: bundlePurchaseDetails.bundle?.title || originalRow?.bundlePurchase?.bundle.title,
              seatPrice: bundlePurchaseDetails?.totalPrice || originalRow?.bundlePurchase?.totalPrice,
              courses: bundlePurchaseDetails?.courses || [],
              description: bundlePurchaseDetails?.description || bundlePurchaseDetails?.bundle?.description || ''
            },
            discounts: {
              appliedDiscount: bundlePurchaseDetails?.discount?.id
                ? {
                  id: bundlePurchaseDetails?.discount?.id,
                  percentage: bundlePurchaseDetails?.discount?.percentage,
                  amount: discountAmount,
                  isSeatDiscount: false
                }
                : null
            },
            pricing: {
              baseSubtotal: Number(bundlePurchaseDetails?.totalPrice || originalRow?.bundlePurchase?.totalPrice),
              discountAmount: discountAmount || null,
              finalTotal: Number(bundlePurchaseDetails?.totalPrice || originalRow?.bundlePurchase?.totalPrice)
            },

            customerInfo: {
              name: bundlePurchaseDetails?.createdByUser?.firstName || originalRow?.createdByUser?.profile?.businessName || '',
              email: bundlePurchaseDetails?.createdByUser?.email || originalRow?.createdByUser?.email,
              phone: bundlePurchaseDetails?.createdByUser?.profile?.phoneNumber || originalRow?.createdByUser?.profile?.phoneNumber || '',
              address: bundlePurchaseDetails?.createdByUser?.profile?.businessAddress || originalRow?.createdByUser?.profile?.businessAddress || '',
            },
            cashierInfo: {
              name: profile?.data?.businessName || '',
              email: profile?.data?.email || '',
              phone: profile?.data?.phoneNumber || '' || '',
              address: profile?.data?.businessAddress || '',
            },

            purchaseDate: bundlePurchaseDetails?.createdAt || originalRow?.createdAt,
            invoiceType: 'internal' // Add invoice type to state
          }
        });

        setSelectedBundlePurchaseId(null);
      }
    }
  }, [bundlePurchaseDetails, selectedBundlePurchaseId, invoices, navigation]);

  // Handle external invoice navigation
  useEffect(() => {
    if (selectedExternalInvoice) {
      const externalInvoice = invoices?.find((item) => item.id === selectedExternalInvoice);
      const discountAmount =
        externalInvoice && externalInvoice.discountPercentage
          ? (externalInvoice.unitPrice * externalInvoice.quantity * externalInvoice.discountPercentage) / 100
          : 0;

      if (externalInvoice) {
        navigation(`details?invoiceId=${externalInvoice?.invoiceNumber}&status=${externalInvoice?.status}`, {
          state: {
            // External invoice specific data
            invoiceType: 'external',
            seatsPurchased: externalInvoice?.quantity,
            companyInfo: {
              id: externalInvoice?.company?.id,
              name: externalInvoice?.company?.name,
              address: externalInvoice?.company?.address,
              vatNumber: externalInvoice?.company?.vatNumber
            },
            pricing: {
              baseSubtotal: Number(externalInvoice?.subtotal),
              discountAmount: discountAmount || null,
              finalTotal: Number(externalInvoice?.amount)
            },
            bundleDetails: {
              title: externalInvoice?.description,
              seatPrice: externalInvoice?.unitPrice,
              courses: externalInvoice?.courses || [],
              description: externalInvoice?.itemDescription
            },
            invoiceDetails: {
              description: externalInvoice?.description,
              itemDescription: externalInvoice?.itemDescription,
              seatsPurchased: externalInvoice?.quantity,
              unitPrice: externalInvoice?.unitPrice,
              subtotal: externalInvoice?.subtotal,
              discountPercentage: externalInvoice?.discountPercentage,
              amount: externalInvoice?.amount,
              notes: externalInvoice?.notes,
              pdfUrl: externalInvoice?.pdfUrl
            },
            dates: {
              createdAt: externalInvoice?.createdAt,
              dueDate: externalInvoice?.dueDate
            },
            customerInfo: {
              name: externalInvoice.company?.name || '',
              email: externalInvoice.company?.email || '',
              vatNumber: externalInvoice.company?.vatNumber || '',
              address: externalInvoice.company?.address || ''
            },
            cashierInfo: {
              name: externalInvoice.createdByUser?.profile?.businessName || '',
              email: externalInvoice.createdByUser?.email || '',
              phone: externalInvoice.createdByUser?.profile?.phoneNumber || '',
              address: externalInvoice.createdByUser?.profile?.businessAddress || '',
            },
            status: externalInvoice?.status || 'N/A',
            notes: externalInvoice?.notes || ''
          }
        });

        setSelectedExternalInvoice(null);
      }
    }
  }, [selectedExternalInvoice, invoices, navigation]);

  const handleViewClick = (row) => {
    console.log('row.original', row.original);

    if (row.original.invoiceType === 'internal') {
      // For internal invoices, use bundle purchase details
      if (row.original.bundlePurchase?.id) {
        setSelectedBundlePurchaseId(row.original.bundlePurchase.id);
      } else {
        console.error('No bundle purchase found for internal invoice');
      }
    } else if (row.original.invoiceType === 'external') {
      // For external invoices, set the external invoice ID
      setSelectedExternalInvoice(row.original.id);
    } else {
      console.error('Unknown invoice type:', row.original.invoiceType);
    }
  };

  const handleEditClick = (invoiceData) => {
    if (invoiceData.invoiceType === 'external') {
      const discountAmount = invoiceData.discountPercentage
        ? (invoiceData.unitPrice * invoiceData.quantity * invoiceData.discountPercentage) / 100
        : 0;

      navigation(`/contrib_dashboard/invoices/edit?invoiceId=${invoiceData.invoiceNumber}`, {
        state: {
          // External invoice specific data for edit
          invoiceType: 'external',
          invoiceId: invoiceData.id,
          id: invoiceData.id,
          seatsPurchased: invoiceData.quantity,
          companyInfo: {
            id: invoiceData.company?.id,
            name: invoiceData.company?.name,
            address: invoiceData.company?.address,
            vatNumber: invoiceData.company?.vatNumber
          },
          pricing: {
            baseSubtotal: Number(invoiceData.subtotal),
            discountAmount: discountAmount || null,
            finalTotal: Number(invoiceData.amount)
          },
          bundleDetails: {
            title: invoiceData.description,
            seatPrice: invoiceData.unitPrice,
            courses: invoiceData.courses || [],
            description: invoiceData.itemDescription
          },
          invoiceDetails: {
            description: invoiceData.description,
            itemDescription: invoiceData.itemDescription,
            seatsPurchased: invoiceData.quantity,
            unitPrice: invoiceData.unitPrice,
            subtotal: invoiceData.subtotal,
            discountPercentage: invoiceData.discountPercentage,
            amount: invoiceData.amount,
            notes: invoiceData.notes,
            pdfUrl: invoiceData.pdfUrl
          },
          dates: {
            createdAt: invoiceData.createdAt,
            dueDate: invoiceData.dueDate
          },
          customerInfo: {
            name: invoiceData.company?.name || '',
            email: invoiceData.company?.email || '',
            address: invoiceData.company?.address || '',
            vatNumber: invoiceData.company?.vatNumber || ''
          },
          status: invoiceData.status || 'N/A',
          notes: invoiceData.notes || ''
        }
      });
    }
  };

  const handleClose = (status) => {
    if (status) {
      deleteInvoice(invoiceId);
      openSnackbar({
        open: true,
        message: 'Column deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: { color: 'success' }
      });
    }
    handlerDelete(false);
  };

  const columns = useMemo(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: 'Invoice Id',
        accessorKey: 'invoiceNumber',
        meta: { className: 'cell-center' }
      },
      {
        header: 'User Info',
        accessorKey: 'createdByUser.firstName',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt="Avatar"
              size="sm"
              src={getImageUrl(`avatar-${!row.original.avatar ? 1 : row.original.avatar}.png`, ImagePath.USERS)}
            />
            <Stack spacing={0}>
              <Typography variant="subtitle1">{row.original.createdByUser.firstName}</Typography>
              <Typography color="text.secondary">{row.original.createdByUser.email}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Create Date',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const raw = getValue();
          const date = new Date(raw);

          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
        }
      },
      {
        header: 'Due Date',
        accessorKey: 'dueDate',
        cell: ({ getValue }) => {
          const raw = getValue();
          if (!raw) return 'N/A';

          const date = new Date(raw);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          });
        },
      },

      {
        header: 'Offline / Direct',
        accessorKey: 'invoiceType',
        cell: ({ row }) => {
          const value = row.original.invoiceType;
          const label =
            value === 'internal'
              ? 'Direct Sales'
              : value === 'external'
                ? 'Offline Sales'
                : 'N/A';

          return (
            <Chip
              label={label}
              color={value === 'internal' ? 'primary' : 'secondary'}
              size="small"
              variant="light"
            />
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'cancelled':
              return <Chip color="error" label="Cancelled" size="small" variant="light" />;
            case 'paid':
              return <Chip color="success" label="Paid" size="small" variant="light" />;
            case 'pending':
              return <Chip color="warning" label="Pending" size="small" variant="light" />;
            case 'unpaid':
            default:
              return <Chip color="info" label="Unpaid" size="small" variant="light" />;
          }
        }
      },
      // {
      //   header: 'Actions',
      //   meta: { className: 'cell-center' },
      //   disableSortBy: true,
      //   cell: ({ row }) => {
      //     return (
      //       <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
      //         <Tooltip title="View">
      //           <IconButton
      //             color="secondary"
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               handleViewClick(row);
      //             }}
      //           >
      //             <Eye />
      //           </IconButton>
      //         </Tooltip>
      //       </Stack>
      //     );
      //   }
      // }
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        disableSortBy: true,
        cell: ({ row }) => {
          const isExternalInvoice = row.original.invoiceType === 'external';

          return (
            <Stack direction="row" alignItems="center" justifyContent="start" spacing={0}>
              <Tooltip title="View">
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(row);
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>

              {/* Edit icon for external invoices */}
              {isExternalInvoice && (
                <Tooltip title="Edit">
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(row.original);
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        }
      }
    ],
    []
  );

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Invoice', to: '/apps/invoice/dashboard' }, { title: 'List' }];

  return (
    <>
      {/* <Breadcrumbs custom heading="Invoice List" links={breadcrumbLinks} /> */}
      <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ pb: 2 }}>
        {/* <Grid item md={8}>
          <Grid container direction="row" spacing={2}>
            {widgetsData.map((widget, index) => (
              <Grid item sm={4} xs={12} key={index}>
                <MainCard>
                  <InvoiceCard
                    title={widget.title}
                    count={widget.count}
                    percentage={widget.percentage}
                    isLoss={widget.isLoss}
                    invoice={widget.invoice}
                    color={widget.color.main}
                  >
                    <InvoiceChart color={widget.color} data={widget.chartData} />
                  </InvoiceCard>
                </MainCard>
              </Grid>
            ))}
          </Grid>
        </Grid> */}
        {summaryLoading ? (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          </Grid>

        ) : (
          <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ p: 2.5 }}>
            <Grid item md={8}>
              <Grid container direction="row" spacing={2}>
                {persistedWidgetData.map((widget, index) => (
                  <Grid item sm={4} xs={12} key={index}>
                    <MainCard>
                      <InvoiceCard
                        title={widget.title}
                        count={`$${Number(widget.count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        percentage={Number(widget.percentage).toFixed(1)}
                        isLoss={widget.isLoss}
                        invoice={widget.invoice.toString()}
                        color={theme.palette[widget.color]?.main || theme.palette.primary.main}
                      >
                        <Box sx={{ width: '100%' }}>
                          <InvoiceChart
                            color={theme.palette[widget.color] || theme.palette.primary}
                            data={widget.chartData}
                          />
                        </Box>
                      </InvoiceCard>

                    </MainCard>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item md={4} sm={12} xs={12}>
              <Box
                sx={{
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  borderRadius: 1,
                  p: 1.75
                }}
              >
                <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar alt="Natacha" variant="rounded" type="filled">
                      <ProfileTick style={{ fontSize: '20px' }} />
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" color="white">
                          Total Receivables
                        </Typography>
                        <InfoCircle color={theme.palette.background.paper} />
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2" color="white">
                          Current
                        </Typography>
                        <Typography variant="body1" color="white">
                          {persistedReceivables.current
                            ? `$${Number(persistedReceivables.current).toLocaleString()}`
                            : '$0'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="white">
                      Overdue
                    </Typography>
                    <Typography variant="body1" color="white">
                      {persistedReceivables.overdue
                        ? `$${Number(persistedReceivables.overdue).toLocaleString()}`
                        : '$0'}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h4" color="white" sx={{ pt: 2, pb: 1, zIndex: 1 }}>
                  {persistedReceivables.total ? `$${Number(persistedReceivables.total).toLocaleString()}` : '$0'}
                </Typography>
                <Box sx={{ maxWidth: '100%' }}>
                  <LinearWithLabel value={persistedReceivables.progress || 0} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
        <Grid item md={4} sm={12} xs={12}>

        </Grid>
        <Grid item xs={12}>
          {/* {invoiceLoading ? (
            <EmptyReactTable />
          ) : (
            <ReactTable
              data={invoices}
              columns={columns}
              pagination={pagination}
              setPagination={setPagination}
              paginationInfo={paginationInfo}
              activeTab={activeTab}
              invoiceLoading
              setActiveTab={setActiveTab}
            />
          )} */}
          <ReactTable
            data={invoices}
            columns={columns}
            pagination={pagination}
            setPagination={setPagination}
            paginationInfo={paginationInfo}
            activeTab={activeTab}
            invoiceLoading={invoiceLoading}
            setActiveTab={setActiveTab}
            statusCounts={persistedStatusCounts}

          />
          <AlertProductDelete
            title={invoiceId.toString()}
            open={invoiceMaster ? invoiceMaster.alertPopup : false}
            handleClose={handleClose}
          />
        </Grid>
      </Grid>
    </>
  );
}

function LinearWithLabel({ value, ...others }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

ReactTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  pagination: PropTypes.object,
  setPagination: PropTypes.func,
  paginationInfo: PropTypes.object,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func
};

LinearWithLabel.propTypes = { value: PropTypes.any, others: PropTypes.any };
