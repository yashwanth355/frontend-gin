import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Table as Tables} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import EnhancedTableHead from '../../../components/EnhancedTableHead';
import { CheckBox } from '../../../components/CheckBox';

const columns = [  
  { id: 'itemcode', label: 'Item Code' },
  { id: 's_code', label: 'Short Code' },
  { id: 'itemname', label: 'Item Name' },
  { id: 'category_name', label: 'Item Category' },
  { id: 'uom', label: 'UOM' },
  { id: 'groupname', label: 'Group Name' },
  { id: 'show_in_po', label: 'Show In Po' },
  { id: 'coffee_type', label: 'Item Type' },
];

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr): '';
    return datestr ? dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear() : ''; 
}

function createData(id, itemcode, s_code, itemname, category_name, uom, groupname, display_inpo, coffee_type, rm, createdby, createdon, lastupdatedby, lastupdatedon) {
    return { id, itemcode, s_code, itemname, category_name, uom, groupname, display_inpo, coffee_type, rm, createdby, createdon, lastupdatedby, lastupdatedon };
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

const GcList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
 const [allData, setAllData] = useState([]);
 const [order, setOrder] = React.useState('asc');
 const [orderBy, setOrderBy] = React.useState('');

  useEffect(() => {
    let rows = [];
    // eslint-disable-next-line    
    props.data && props.data.map(v => {
      rows.push(createData(v.itemid, v.itemcode, v.s_code, v.itemname, v.categoryname, v.uom, v.groupname, v.display_inpo, v.coffee_type, v.is_rawmeterial, v.created_by, formatDate(v.created_on), v.updated_by, formatDate(v.updated_on)))
    })
    setAllData(rows);
  }, [props.data]);
  // eslint-disable-next-line

  // useEffect(()=>{
  //   console.log('new::', props?.newList)
  //   if(props?.newList !== -1) {
  //     setPage(0);
  //   }
  // }, [props?.newList])

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const action = (e, index, gcId) => {
    e.preventDefault();
    if(index === 0) {
        props.gcDetails("create_gc_edit", gcId);
    }
    return false;
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function handleAdvancedFilter(val) {
    props.selectedAdvancedFilters(val);
    setPage(0)
  }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Tables stickyHeader aria-label="sticky table" size="small">
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={allData.length}
              headCells={columns}
              selectedAdvancedFilters={(val) => handleAdvancedFilter(val)}
              clearAdvancedFilters={props.clearAdvancedFilters}
            />
          <TableBody>
            {allData.length > 0 ?  
            stableSort(allData, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  {columns.map((column, index) => {
                    const value = row[column.id] ? row[column.id] : '-';
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {
                          !index ?
                          // eslint-disable-next-line 
                           (parseInt(row.status) === 4 || parseInt(row.status) === 5) ? value :
                           // eslint-disable-next-line 
                           <a href="#" onClick={(e) => action(e, index, row.id)}>{value}</a> 
                           : (column.id === 'show_in_po') ? 
                           <CheckBox checked={row.display_inpo ? true : false} name={row.display_inpo} disabled={true}/> 
                          //  : (column.id === 'gc') ? 
                          //  <CheckBox checked={row.enable ? true : false} name={row.enable} disabled={true}/>
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

export default GcList;