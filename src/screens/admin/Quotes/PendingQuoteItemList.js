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
  { id: 'lineitemnumber', label: 'Line Item Id', },
  { id: 'quoteitem', label: 'Quote Item'},
  { id: 'quotationno', label: 'Quotation No'},
  { id: 'samplecode', label: 'Sample Code'},
  { id: 'productType', label: 'Product Type'},
  { id: 'expectedquantity', label: 'Expected Qty (kgs)'},
  { id: 'category', label: 'Catogory'},
  { id: 'categorytype', label: 'Catogory Type', },
  // { id: 'weight', label: 'Weight'},
  // { id: 'upc', label: 'UPC'},
  { id: 'baseprice', label: 'Base Price'},
  { id: 'finalrate', label: 'Final Rate'},
  { id: 'margin', label: 'Margin'},
  { id: 'margin', label: 'Margin %'}, 
  { id: 'negativemarginstatus', label: 'Negative Margin Status'}
];

function createData(lineitemid,lineitemnumber, quoteitem, quotationno, samplecode, productType, expectedquantity, category, categorytype, weight, upc, baseprice, finalrate, margin, marginperc, negativemarginstatus) {
  return { lineitemid,lineitemnumber, quoteitem, quotationno, samplecode, productType, expectedquantity, category, categorytype, weight, upc, baseprice, finalrate, margin, marginperc, negativemarginstatus};
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


const PendingQuoteItemList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.quotelineitem_id,v.quotelineitem_number, v.quotelineitem_id, v.quotationno, v.sample_code, v.productType, v.expectedorder_kgs, v.category, v.categorytype, v.weight, v.upc_id, v.baseprice, v.final_price, v.margin, v.margin, v.negativemargin_status ))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, quoteItemId) => {  
    props.quoteItemDetails("view_quoteitem", quoteItemId);
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
                          <a href='#' onClick={(e) => {CellClickHandler(e, row.lineitemid)}}>{value}</a>
                         : value                        
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

export default PendingQuoteItemList;