import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Table as Tables } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

const columns = [
  { id: "number", label: "Quote Number" },
  { id: "status", label: "Status" },
  { id: "createdby", label: "Created By" },
  { id: "createddate", label: "Created Date" },
];

const formatDate = (datestr) => {
  let dateVal = datestr ? new Date(datestr) : new Date();
  return (
    dateVal.getDate() +
    "/" +
    (dateVal.getMonth() + 1) +
    "/" +
    dateVal.getFullYear()
  );
};

function createData(number, status, createdby, createddate) {
  return { number, status, createdby, createddate };
}

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
});

const AccountQuotesList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    console.log("Props Data", props.data);
    let tempRows = [];
    // eslint-disable-next-line
    props.data &&
      props.data !== null &&
      // eslint-disable-next-line
      props.data.map((v) => {
        tempRows.push(
          createData(
            v.quoteid,
            v.status,
            v.createdby,
            formatDate(v.createddate)
          )
        );
      });
    setRows(tempRows);
    // eslint-disable-next-line
  }, [props.data]);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, id, quoteNumber, quoteStatus) => {
    console.log(id);
    if (id === "number") {
      props.quoteDetails("view_quote", quoteNumber, quoteStatus);
    }
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
            {rows.length > 0
              ? rows.length &&
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.id === "number" ? (
                                // eslint-disable-next-line
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    CellClickHandler(
                                      e,
                                      column.id,
                                      row.number,
                                      row.status
                                    );
                                  }}
                                >
                                  {value}
                                </a>
                              ) : (
                                value
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
              : "No records to display"}
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
};

export default AccountQuotesList;
