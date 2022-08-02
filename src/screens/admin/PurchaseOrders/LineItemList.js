import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import _ from 'lodash';
// import Moment from 'moment';

const columns = [
  { id: 'dispatchNo', label: 'Sr. NO', },
  { id: 'qty', label: 'Item' },
  { id: 'date', label: 'Item Desc' },
  { id: 'delivered_quantity', label: 'Qty' },
  { id: 'balance_quantity', label: 'Price' },
  { id: 'balance_quantity', label: 'Total Price' },
];

function createData(dispatchNo, qty, date, delivered_quantity, balance_quantity) {
  // deliveredqty = mrin?.map(m => parseFloat(m.deliveredqty)).reduce((sum, i) => sum + i, 0);
  // balanceqty = parseFloat(qty) - parseFloat(deliveredqty);
  return {
    dispatchNo, qty: Number(qty)?.toLocaleString("en-IN"), date,
    delivered_quantity: Number(delivered_quantity)?.toLocaleString("en-IN"),
    balance_quantity: Number(balance_quantity)?.toLocaleString('en-IN')
  };
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  button: {
    background: 'none',
    textDecoration: 'underline',
    border: 'none',
    cursor: 'pointer',
    color: 'rgb(85, 26, 139)',
  }
});

const LineItemList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rows = [];
  React.useEffect(() => {
    console.log("Props Data DDDD", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props?.data && props?.data?.map(v => {
    rows.push(createData(v.dispatch_id, v.dispatch_quantity, v.dispatch_date, v.delivered_quantity, v.balance_quantity))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const action = (e, data) => {
    e.preventDefault();
    props.dispatchDetails("dispatch_details", data);
    return false;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const formatDate = (datestr) => {
    if (_.isEmpty(datestr))
    return ""

    var validDt = new Date(datestr).getDate();
    if(isNaN(validDt) === true){
      var dt = datestr.toString(); //;
      let dateVal = dt.replace(new RegExp(escapeRegExp('-'), 'g'), '/') //datestr ? '14-3-2022'.replace('-', '/') : '-'; //moment(datestr).format("DD/MM/YYYY")
      // console.log('dt::', dateVal)
      return dateVal;
    }else {
       // eslint-disable-next-line
      var dt = new Date(datestr);      
      var dateVal = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
      // console.log('dt::12', dateVal, new Date(datestr))
      return dateVal;
    }
   
  }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>

            {rows.length > 0 && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    let value;
                    if (column.id === "date")                  
                      value = formatDate(row?.date)
                    else
                      value = row[column.id] ? row[column.id] : '-';
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {
                          index ? value : <button className={classes.button} onClick={(e) => action(e, row)}>{value}</button>
                        }
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            })}
            {
              rows.length === 0 && <p><b>No Records to Display.</b></p>
            }
          </TableBody>
        </Tables>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default LineItemList;