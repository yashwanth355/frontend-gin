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
import Button from '../../../components/Button';
import _ from 'lodash';
const columns = [
  { id: 'dispatchNo', label: 'Dispatch Id', },
  { id: 'qty', label: 'Quantity' },
  { id: 'date', label: 'Dispatch Date' },
  { id: 'balance_quantity', label: 'Balance Quantity' },
  { id: 'relateddispatch_id', label: 'Parent Dispatch' },
];

function createData(dispatchNo, qty, date, relateddispatch_id, balance_quantity, ismrin_created, vehicle_no, invoice_no, conversationratio, invoice_quantity, coffee_grade) {
  return { dispatchNo, qty, date, relateddispatch_id, balance_quantity, ismrin_created, vehicle_no, invoice_no, conversationratio, invoice_quantity, coffee_grade };
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  textCenter: {
    textAlign: 'center'
  }
});

const DispatchList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rows = [];

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const formatDate = (datestr) => {
    if (_.isEmpty(datestr))
      return ""

    var validDt = new Date(datestr).getDate();
    if (isNaN(validDt) === true) {
      var dt = datestr.toString(); //;
      let dateVal = dt.replace(new RegExp(escapeRegExp('-'), 'g'), '/') //datestr ? '14-3-2022'.replace('-', '/') : '-'; //moment(datestr).format("DD/MM/YYYY")
      // console.log('dt::', dateVal)
      return dateVal;
    } else {
      // eslint-disable-next-line
      var dt = new Date(datestr);
      var dateVal = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
      // console.log('dt::12', dateVal, new Date(datestr))
      return dateVal;
    }

  }


  React.useEffect(() => {
    console.log("Props mrin creation Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.dispatch_id, v.quantity, formatDate(v.dispatch_date), v.relateddispatch_id,
      v.balance_quantity, v.ismrin_created, v.vehicle_no, v.invoice_no, v.conversationratio,
      v.invoice_quantity, v.coffee_grade

    ))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleCreateMrin = (data) => {
    console.log('createMrinData::111', data)
    props.createMrin("create_mrin", data)
  }

  return (
    <div className='dispatch_mrin'>
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Tables stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {/* {columns.map((column) => ( */}
                <TableCell><p>Dispatch<br />Id</p></TableCell>
                <TableCell><p>Quantity<br />(Kgs)</p></TableCell>
                <TableCell><p>Dispatch<br />Date</p></TableCell>
                <TableCell><p>Balance<br />Quantity</p></TableCell>
                <TableCell><p>Parent<br />Dispatch</p></TableCell>
                {/* ))} */}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

              {rows.length > 0 && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column, index) => {
                      const value = (row[column.id] !== null && row[column.id] !== '') ? row[column.id] : '-';
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      {row.ismrin_created === true ?
                        <p>MRIN already created</p> :
                        <Button label="Create MRIN" onClick={() => handleCreateMrin(row)}></Button>
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
              {
                (rows.length === 0 || rows === null) && <TableCell colSpan='5'><p className={classes.textCenter}><b>No Records to Display.</b></p></TableCell >
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
    </div>
  );
}

export default DispatchList;