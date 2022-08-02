import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Container, Grid, Table as Tables } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import SimpleModal from "../../../components/Modal";
import Button from "../../../components/Button";
// import { viewAndDeleteSampleLineItem } from "../../../apis";
import Snackbar from "../../../components/Snackbar";

const columns = [
  { id: "sno", label: "SNO" },
  { id: "samplecode", label: "Sample Code" },
  { id: "producttype", label: "Product Type" },
  { id: "samplecategory", label: "Sample Category" },
  { id: "packingitem", label: "Packing Type" },
  { id: "dispatchDate", label: "Dispatch Date" },
  { id: "status", label: "Status" },
];

function createData(
  sno,
  lineitemid,
  samplecode,
  producttype,
  samplecategory,
  packingitem,
  dispatchDate,
  status
) {
  return {
    sno,
    lineitemid,
    samplecode,
    producttype,
    samplecategory,
    packingitem,
    dispatchDate,
    status,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "30%",
    left: "30%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const SampleItemList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [deleteItemId, setDeleteItemId] = React.useState(0);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);

  const rows = [];
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data &&
    props.data.map((v) => {
      rows.push(
        createData(
          v.serial_no,
          v.lineitem_id,
          v.sample_code,
          v.product_type,
          v.sample_category,
          v.packing_type,
          v.dispatch_date,
          v.status
        )
      );
      return true;
    });
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const CellClickHandler = (e, sampleItemId) => {
    props.sampleItemDetails("view_sampleitem", sampleItemId);
  };

  const onGetDeleteSampleItem = async (did) => {
    setDeleteItemId(did);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
    props.sampleItemDetails("delete_sampleitem", deleteItemId);
  };

  const handleClose = () => {
    setShowDeleteConfirmation(false);
  };

  const requestSampleItemDelete = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>Are you sure you want to delete this record?</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Ok" onClick={handleConfirmDelete} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={handleClose} />
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <>
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Tables stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <>
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  </>
                ))}
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
              <TableBody>
                {rows.length > 0 ? 
                  rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={index}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.id === "sno" ? (
                                  // eslint-disable-next-line
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      CellClickHandler(e, row.lineitemid);
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
                          <Button
                            label="Delete"
                            onClick={() =>
                              onGetDeleteSampleItem(row.lineitemid)
                            }
                          />
                        </TableRow>
                      );
                    }) : 'No records to display'}
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
        <SimpleModal
          open={showDeleteConfirmation}
          handleClose={handleClose}
          body={requestSampleItemDelete}
        />
      </Paper>
    </>
  );
};

export default SampleItemList;
