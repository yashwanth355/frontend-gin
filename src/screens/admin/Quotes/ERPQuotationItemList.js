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
  { id: 'lineitemid', label: 'ID', },
  { id: 'type', label: 'Type', },
  { id: 'brand', label: 'Brand'},
  { id: 'samplecode', label: 'Sample'},
  { id: 'packtype', label: 'Pack Type'},
  { id: 'expectedquantity', label: 'Expected Order Qty (kgs)'},
  { id: 'currency', label: 'Currency'},
  { id: 'baseprice', label: 'Base Price'},
  { id: 'stockprice', label: 'Stock Price'},
  { id: 'selling', label: 'Selling'},
  { id: 'pricetocrm', label: 'Price to CRM', },
  { id: 'sellingprice', label: 'Selling Price'}, 
  { id: 'customerapprovalstatus', label: 'Customer Approval'},
  { id: 'gmcapprovalstatus', label: 'GMC Approval'}  
];

function createData(lineitemid, type, brand, samplecode, packtype, expectedquantity, currency, baseprice, stockprice, selling, pricetocrm, sellingprice, customerapprovalstatus, gmcapprovalstatus) {
  return { lineitemid, type, brand, samplecode, packtype,expectedquantity, currency, baseprice, stockprice, selling, pricetocrm, sellingprice, customerapprovalstatus, gmcapprovalstatus};
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


const ERPQuotationItemList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.quotelineitem_id, v.type, v.brand, v.sample, v.pack_type, v.expectedorder_kgs, v.currency, v.base_price, v.stock_price, v.selling, v.price_to_crm, v.selling_price, v.customer_approval, v.gmc_approval ))
  })
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, quoteItemId, sampleCode) => {  
    props.quoteItemEdit("edit_quoteitem", quoteItemId, sampleCode);
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
            {rows.length && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                         {(column.id === 'lineitemid') ?
                          // eslint-disable-next-line
                          <a href='#' onClick={(e) => {CellClickHandler(e, row.lineitemid, row.samplecode)}}>{value}</a>
                         : value                        
                          }                        
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            })}
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

export default ERPQuotationItemList;