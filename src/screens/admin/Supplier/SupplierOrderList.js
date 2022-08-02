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

const columns = [
  { label: 'Name', id: 'vendorname' },
  { label: 'Contact Person', id: 'contactname' },
  { label: 'Phone', id: 'phone' },
  { label: 'City', id: 'city' },
  { label: 'State', id: 'state' },
  { label: 'Country', id: 'country' },
  { label: 'Group', id: 'groupname' },
];

function createData(vendorname, contactname, phone, city, state, country, groupname, suppliers, number) {
  return { vendorname, contactname, phone, city, state, country, groupname, suppliers, number };
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

const SupplierOrderList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // eslint-disable-next-line no-unused-vars
  const [allData, setAllData] = useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('');

  useEffect(() => {
    let rows = [];
    // eslint-disable-next-line
    props.data && props.data.map(v => {
      rows.push(createData(v.vendorname, v.contactname, v.phone, v.city, v.state, v.country, v.groupname, v.suppliers, v.vendorid))
    })
    setAllData(rows);
  }, [props.data]);
  //eslint-disable-next-line

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

  const action = (e, id) => {
    e.preventDefault();
    props.supplierDetails(id);
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  console.log("Columns are", columns, allData);
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
                            {(column.id === 'vendorname') ?
                              // eslint-disable-next-line
                              <a href="#" onClick={(e) => action(e, row.number)}>{value}</a>
                              : value
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

export default SupplierOrderList;