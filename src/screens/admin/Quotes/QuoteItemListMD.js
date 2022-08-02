import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import _ from 'lodash';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

const columns = [
  { id: 'lineitemnumber', label: 'Quoteline', },
  { id: 'packingdescription', label: 'Packing Description'},
  { id: 'samplecode', label: 'Sample Code'},
  { id: 'expectedquantity', label: 'Expected Qty (kgs)'}
];

function createData(quotelineitem_id, lineitemnumber, packingdescription, samplecode, expectedquantity) {
  return { quotelineitem_id, lineitemnumber, packingdescription, samplecode, expectedquantity};
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


const QuoteItemListMD = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData( v.quotelineitem_id, v.quotelineitem_number, v.packingdescription, v.sample_code, v.expectedorder_kgs ));
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, quoteItemId, quoteItem) => {  
    props.quoteItemDetails("view_quoteitem", quoteItemId, quoteItem);
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
            {rows.length > 0 ?  
            rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                         {(column.id === 'lineitemnumber') ?
                          // eslint-disable-next-line
                          <a href='#' onClick={(e) => {CellClickHandler(e, row.lineitemnumber, row.quotelineitem_id)}}>{value}</a>
                         : (column.id === 'baseprice' || column.id === 'finalrate') ? !_.isEmpty(value) ? parseFloat(value)?.toFixed(2) : '-' : value                        
                          }
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            }): 'No records to display'}
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

export default QuoteItemListMD;