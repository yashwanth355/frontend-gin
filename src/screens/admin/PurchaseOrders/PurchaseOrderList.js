import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import EnhancedTableHead from '../../../components/EnhancedTableHead';
import { numberWithCommas } from '../../common';

const columns = [
  { id: 'pono', label: 'PO No' },
  { id: 'contractno', label: 'Contract No' },
  { id: 'podate', label: 'PO Date', sort: true },
  { id: 'total_quantity', label: 'PO Qty' },
  { id: 'gc_itemname', label: 'Item' },
  { id: 'vendorname', label: 'Vendor' },
  { id: 'status', label: 'Status' },
  { id: 'pocat', label: 'Category' },
  { id: 'vendortype', label: 'Bean Category' },
  { id: 'currencycode', label: 'currencycode' },
  { id: 'povalue', label: 'PO Value', sort: true }
];

const formatDate = (datestr) => {
  let dateVal = datestr ? new Date(datestr) : new Date();
  return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}

function createData(pono, contractno, vendorname, vendortype, pocat, status, currencycode, povalue, podate, total_quantity, gc_itemname) {
  return { pono, contractno, vendorname, vendortype, pocat, status, currencycode, povalue, podate, total_quantity, gc_itemname };
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  sortHeader: {
    cursor: 'pointer',
  }
});

const PurchaseOrderList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [allData, setAllData] = useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');
  useEffect(() => {
    let rows = [];
    // eslint-disable-next-line
    props.data && props.data.map(v => {
      rows.push(createData(v.pono, v.contract_no, v.vendorname, v.vendortype, v.pocat, v.status, v.currencycode, v.povalue, formatDate(v.podate), v.total_quantity, v.gc_itemname))
    })
    setAllData(rows);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const action = (e, index, purchaseId) => {
    e.preventDefault();
    if (index === 0) {
      props.purchaseDetails("create_po_edit", purchaseId);
    }
    return false;
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  //   function numberWithCommas(n) {
  //     var parts=n.toString().split(".");
  //     return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  // }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={allData.length}
            headCells={columns}
            selectedAdvancedFilters={props.selectedAdvancedFilters}
            clearAdvancedFilters={props.clearAdvancedFilters}
          />
          <TableBody>
            {allData.length > 0 ?
              stableSort(allData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                      {columns.map((column, index) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {
                              !index ?
                                // eslint-disable-next-line
                                (parseInt(row.status) === 4 || parseInt(row.status) === 5) ? value :
                                  // eslint-disable-next-line 
                                  <a href="#" onClick={(e) => action(e, index, row.pono)}>{value}</a>
                                : (column.id === 'povalue') ? numberWithCommas(parseFloat(row.povalue).toFixed(3)) :
                                  (column.id === 'total_quantity') ? numberWithCommas(parseFloat(row.total_quantity)) :
                                    value
                            }
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  );
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

export default PurchaseOrderList;