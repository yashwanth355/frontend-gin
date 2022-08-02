import React,{useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import EnhancedTableHead from '../../../components/EnhancedTableHead';

const columns = [  
  { id: 'accountname', label: 'Lead Name', },
  { id: 'aliases', label: 'Aliases'},
  { id: 'contactfirstname', label: 'First Name'},
  { id: 'contactlastname', label: 'Last Name'},
  { id: 'contact_mobile', label: 'Mobile'},
  { id: 'email', label: 'Email'},
  { id: 'leadscore', label: 'Profile Completion'},
  { id: 'masterstatus', label: 'Status'},
];

function createData(id, accountname, aliases, contactfirstname, contactlastname, contact_mobile, email, leadscore, masterstatus) {
  return { id, accountname, aliases, contactfirstname, contactlastname, contact_mobile, email, leadscore, masterstatus };
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

const LeadsList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [allData, setAllData] = useState([]);//change
  const [order, setOrder] = React.useState('asc');//change
  const [orderBy, setOrderBy] = React.useState('');//change
 
  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
    // eslint-disable-next-line array-callback-return
    props.data && props.data.map(v => {
      rows.push(createData(v.leadid, v.accountname, v.aliases, v.contactfirstname, v.contactlastname, v.contact_mobile, v.email, v.leadscore, v.masterstatus))
    })
    setAllData(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  },[props.data]);
  // eslint-disable-next-line
  
  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  //change
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

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const action = (e, index, leadId) => {
    e.preventDefault();
    if(index === 0) {
      props.setRoute("create_lead_edit", leadId);
    }
    return false;
  }

  return (
    <Paper className={classes.root}>
      {console.log('allData::', allData)}
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
            stableSort(allData, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {
                          !index ?
                          // eslint-disable-next-line
                          <a href="#" onClick={(e) => action(e, index, row.id)}>{value}</a> : value
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
        //rows
        count={allData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default LeadsList;