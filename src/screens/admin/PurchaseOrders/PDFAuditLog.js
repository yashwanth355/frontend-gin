import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const columns = [  
    { id: 'description', label: 'Description', }, 
    { id: 'createdby', label: 'Created By'},
    { id: 'createddate', label: 'Created Date'},        
    { id: 'modifiedby', label: 'Modified By'},   
    { id: 'modifieddate', label: 'Modified Date'}      
];

const formatDate = (datestr) => {
    let dateVal =  new Date(datestr);
    return datestr ? dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear() : ''; 
}

function createData(description, createdby, createddate, modifiedby, modifieddate) {
    return { description, createdby, createddate, modifiedby, modifieddate };
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

const PDFAuditLog = (props) => {
  const classes = useStyles();
  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data && props.data.map(v => {
    rows.push(createData(v.description, v.createduserid, formatDate(v.createddate), v.modifieduserid, formatDate(v.modifieddate)))
  })

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
          <TableBody style={{backgroundColor: '#fff'}}>
            
            {rows.length > 0 && rows.map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align} style={{backgroundColor: '#fff'}}>
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
    </Paper>
  );
}

export default PDFAuditLog;