import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

const columns = [  
    { id: 'dispatchNo', label: 'Dispatch Detail', }, 
    { id: 'qty', label: 'Quantity'},
    { id: 'date', label: 'Date'},        
    { id: 'delivered_quantity', label: 'Delivered'},   
    { id: 'balance_quantity', label: 'Balance'}      
];

function createData(dispatchNo, qty, date, delivered_quantity, balance_quantity, mrin) {
    // deliveredqty = mrin?.map(m => parseFloat(m.deliveredqty)).reduce((sum, i) => sum + i, 0);
    // balanceqty = parseFloat(qty) - parseFloat(deliveredqty);
    return { dispatchNo, qty, date, delivered_quantity, balance_quantity };
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

const DispatchList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    var mrin = props.mrin?.filter(m => m.dispatch === v.dispatch_id);
    rows.push(createData(v.dispatch_id, v.dispatch_quantity, v.dispatch_date, v.delivered_quantity, v.balance_quantity, mrin))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };  

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
                    const value = row[column.id] ? row[column.id] : '-';
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {value}                        
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

export default DispatchList;