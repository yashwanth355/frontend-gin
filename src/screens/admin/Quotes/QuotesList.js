import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import EnhancedTableHead from '../../../components/EnhancedTableHead';
// eslint-disable-next-line
import roles from '../../../constants/roles';
import useToken from '../../../hooks/useToken';
const columns = [
  { id: 'quotenumber', label: 'Quote Number', },
  { id: 'accountname', label: 'Account Name' },
  { id: 'status', label: 'Status' },
  { id: 'pendingwith', label: 'Responsible Owner' },
  { id: 'createdby', label: 'Created By' },
  { id: 'createddate', label: 'Created Date' }
];

const columns1 = [
  { id: 'quotenumber', label: 'Quote Number', },
  { id: 'status', label: 'Status' },
  { id: 'requestedby', label: 'Requested By' },
  { id: 'requesteddate', label: 'Requested Date' },
  { id: 'approvedby', label: 'Approved By' },
  { id: 'approvedate', label: 'Approved Date' },
];

const columns2 = [
  { id: 'quotenumber', label: 'Quotation No.', },
  { id: 'accountname', label: 'Party Name' },
  { id: 'requesteddate', label: 'Approval Requested On' },
  { id: 'requestedby', label: 'Approval Requested By' },
  { id: 'approvedate', label: 'Prices Approved On' },
  { id: 'approvedby', label: 'Prices Approved By' },
  { id: 'dispatchperiod', label: 'Dispatch Period' },
];

const formatDate = (datestr) => {
  let dateVal = datestr ? new Date(datestr) : new Date();
  return datestr === '' ? '' : dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}

const formatVal = (val) => {
  return !val ? '-' : val;
}

function createData(quoteid, quotenumber, accountname, status, createdby, createddate, pendingwith) {
  return { quoteid, quotenumber, accountname, status, createdby, createddate, pendingwith };
}
function createData1(quoteid, quotenumber, status, requestedby, requesteddate, approvedby, approvedate) {
  return { quoteid, quotenumber, status, requestedby, requesteddate, approvedby, approvedate };
}
function createData2(quoteid, quotenumber, accountname, approvedate, approvedby, requesteddate, requestedby, dispatchperiod, status) {
  return { quoteid, quotenumber, accountname, approvedate, approvedby, requesteddate, requestedby, dispatchperiod, status };
}
const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
});

const QuotesList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // const [enableUser, setEnableUser] = React.useState({});
  const [allData, setAllData] = useState([]);//change
  const [order, setOrder] = React.useState('asc');//change
  const [orderBy, setOrderBy] = React.useState('');//change
  const rows = [];
  const { getCurrentUserDetails } = useToken();
  // eslint-disable-next-line
  const currentUserDetails = getCurrentUserDetails();

  React.useEffect(() => {
    console.log("Props Data", props.data);
    // }, [props.data]);
    // eslint-disable-next-line
    props.data && props.data.map(v => {
      (props?.currentState === 'GC Price Requested' || props?.currentState === 'GC Price Received' || props?.currentState === 'Packing Price Requested' || props?.currentState === 'Packing Price Received') ?
        rows.push(createData1(v.quoteid, v.quotenumber, v.status, v.requestedby, formatDate(v.requesteddate), v.approvedby, formatDate(v.approvedate)))
        : (props?.currentState === 'Price Requested' || props?.currentState === 'Price Approved' || props?.currentState === 'Base Price Received' || props?.currentState === 'Base Price Requested') ?
          rows.push(createData2(v.quoteid, v.quotenumber, v.accountname, formatDate(v.approvedate), v.approvedby, formatDate(v.requesteddate), v.requestedby, v.dispatchperiod, v.status)) :
          rows.push(createData(v.quoteid, v.quotenumber, v.accountname, v.status, v.createdby, formatDate(v.createddate), formatVal(v.pendingwith)));
    })
    // eslint-disable-next-line
    setAllData(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data]);
  // eslint-disable-next-line

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  //change
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, id, quoteNumber, quoteStatus) => {
    console.log(id);
    if (id === 'quotenumber') {
      props.quoteDetails("view_quote", quoteNumber, quoteStatus);
    }
  };

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
          {(props?.currentState === 'GC Price Requested' || props?.currentState === 'GC Price Received' || props?.currentState === 'Packing Price Requested' || props?.currentState === 'Packing Price Received') ?
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={allData.length}
              headCells={columns1}
              selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
            /> : (props?.currentState === 'Price Requested' || props?.currentState === 'Price Approved' || props?.currentState === 'Base Price Received' || props?.currentState === 'Base Price Requested') ? <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={allData.length}
              headCells={columns2}
              selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
            /> : <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={allData.length}
              headCells={columns}
              selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
            />}
          <TableBody>
            {(allData !== null || allData.length > 0) ?
              stableSort(allData, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                if (props?.currentState === 'GC Price Requested' || props?.currentState === 'GC Price Received' || props?.currentState === 'Packing Price Requested' || props?.currentState === 'Packing Price Received') {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns1.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {(column.id === 'quotenumber') ?
                              // eslint-disable-next-line
                              <a href='#' onClick={(e) => { CellClickHandler(e, column.id, row.quoteid, row.status) }}>{value}</a>
                              : value
                            }
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                } else if ((props?.currentState === 'Price Requested' || props?.currentState === 'Price Approved' || props?.currentState === 'Base Price Received' || props?.currentState === 'Base Price Requested')) {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns2.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {(column.id === 'quotenumber') ?
                              // eslint-disable-next-line
                              <a href='#' onClick={(e) => { CellClickHandler(e, column.id, row.quoteid, row.status) }}>{value}</a>
                              : value
                            }
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                } else {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {(column.id === 'quotenumber') ?
                              // eslint-disable-next-line
                              <a href='#' onClick={(e) => { CellClickHandler(e, column.id, row.quoteid, row.status) }}>{value}</a>
                              : value
                            }
                          </TableCell>
                        )
                      })}
                    </TableRow>)
                }

              }) : 'No records to display'}
          </TableBody>
        </Tables>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={allData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default QuotesList;