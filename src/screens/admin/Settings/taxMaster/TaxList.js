import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables, TableHead} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { CheckBox } from '../../../../components/CheckBox';

const columns = [  
  { id: 'tax_name', label: 'Tax Name' },
  { id: 'tax_percentage', label: 'Tax Percentage' },
  { id: 'isactive', label: 'Status' },
];

function createData(tax_id, tax_name, tax_percentage, isactive) {
    return { tax_id, tax_name, tax_percentage, isactive };
}  

const useStyles = makeStyles({
  root: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  sortHeader : {
    cursor: 'pointer',
  }
});

const TaxList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
 const [allData, setAllData] = useState([]); 

  useEffect(() => {
    let rows = [];
    // eslint-disable-next-line    
    props.data && props.data.map(v => {
      rows.push(createData(v.tax_id, v.tax_name, v.tax_percentage, v.isactive))
    })
    setAllData(rows);
  }, [props.data]);
  // eslint-disable-next-line

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const action = (e, index, taxId) => {
    e.preventDefault();
    if(index === 0) {
        props.taxDetails("tax_details", taxId);
    }
    return false;
  }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
            <TableHead>
            <TableRow>
              {columns?.map((item, index) => {
                return(
                  <TableCell>{item?.label}</TableCell>
                  )
              })}
              </TableRow>
            </TableHead>
          <TableBody>
            {allData.length > 0 ?  allData.map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    const value = row[column.id] ? row[column.id] : '-';
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {
                          (column.id === 'tax_name') ?
                          // eslint-disable-next-line
                          <a href="#" onClick={(e) => action(e, index, row.tax_id)}>{value}</a> 
                           : (column.id === 'isactive') ? 
                           <CheckBox checked={row.isactive ? true : false} name={row.isactive} disabled={true}/> 
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
        count={allData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default TaxList;