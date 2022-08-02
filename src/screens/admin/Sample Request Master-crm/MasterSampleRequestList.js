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
import { Link } from 'react-router-dom';

const columns = [
  { id: 'date', label: 'Sample Request'},
  { id: 'date', label: 'Request Date'},
  { id: 'accountname', label: 'Account Name'},
  { id: 'firstname', label: 'First Name'},
  { id: 'lastname', label: 'Last Name'},
  { id: 'date', label: 'REQ. DELIVERY DATE'},  
  { id: 'count', label: 'Count'},    
  { id: 'products', label: 'Products'},
  { id: 'date', label: 'Last Modified'},
  { id: 'status', label: 'Status'},
  { id: 'status', label: 'Mail status To CRM'} 
];

function createData(id, accountname, firstname, lastname, products, date, createdby, status, requestqcstatus, receivedqcstatus) {
  return { id, accountname, firstname, lastname, products, date, createdby, status, requestqcstatus, receivedqcstatus};
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

const MasterSampleRequestList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rows = [];
 React.useEffect(() => {
   console.log("Props Data", props.data);
}, [props?.data]);
  // eslint-disable-next-line
   props.data && props.data.map(v => {
    rows.push(createData(v.id, v.accountname, v.firstname, v.lastname, v.products, v.date, v.createdby, v.status, v.requesttoqcstatus, v.receivedbyqcstatus ))
 })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getEditRow = (e, sampleid) => {
    props.masterSampleEditId("edit_mastersample", sampleid);
  };

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
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
          {<TableBody>
            {rows.length && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  <TableCell><Link href="#" onClick={(e) => getEditRow(e, row.id)}>Edit</Link></TableCell>  
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            })}
          </TableBody>}
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

export default MasterSampleRequestList;