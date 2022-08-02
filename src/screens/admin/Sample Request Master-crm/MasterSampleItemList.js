import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Template from "../../../components/Template";
import {
  Grid,
  Typography,
  Collapse,
  Box,
  Table,
} from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Button from "../../../components/Button";
import { CheckBox } from "../../../components/CheckBox";
import { Link } from "react-router-dom";

const columns = [
  { id: "sno", label: "SNO" },
  { id: "product", label: "Product" },
  { id: "description", label: "Description" },
  { id: "dispatchDate", label: "Dispatch" },
  { id: "size", label: "Size" },
  { id: "units", label: "Units" },
  { id: "weight", label: "Pkg.Wt" },
  { id: "samplecode", label: "Sample Code" },
  { id: "price", label: "Target Price" },
  { id: "lasmodified", label: "Last Modified" },
  { id: "disstatus", label: "Dis. Status" },
  { id: "status", label: "Status" },
  { id: "date", label: "Approved/Rejected Date" },
  { id: "remarks", label: "Remarks" },
];

const rowsData = [
  {
    sno: 1,
    product: "SD",
    description: "DFFF",
    price: "NO TARGET PRICE	",
    lasmodified: "28-FEB-20 14:56",
  },
];

function createData(
  lineitemid,
  samplecode,
  producttype,
  samplecategory,
  packingitem,
  dispatchDate,
  status
) {
  return {
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

const MasterSampleItemList = (props) => {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [showEditItem, setShowEditItem] = React.useState(false);
  const [showEditId, setShowEditId] = React.useState(-1);
  const [sample, setSampleInfo] = React.useState({});

  const rows = rowsData;
  React.useEffect(() => {
    console.log("Props Data", props.data);
  }, [props.data]);
  // eslint-disable-next-line
  props.data &&
    props.data.map((v) => {
      rows.push(
        createData(
          v.lineitemid,
          v.samplecode,
          v.producttype,
          v.samplecategory,
          v.packingitem,
          v.dispatchDate,
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

  const onEditMasterSampleItem = (e, sampleItemId) => {
    // props.sampleItemDetails("view_sampleitem", sampleItemId);
    setShowEditItem(!showEditItem);
    console.log(showEditId)
    setShowEditId(sampleItemId);
  };

  const getCloseForm = (e, sampleItemId) => {
    // props.sampleItemDetails("view_sampleitem", sampleItemId);
    setShowEditItem(!showEditItem);
  };  

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setSampleInfo({
      ...sample,
      [key]: value,
    });
  };

  const taskDetails = () => {
    props.showTaskDetails();
  }

  const product = [
    {
      label: "Sno",
      type: "input",
      disabled: true,
      value: sample.sno || "",
      sm: 12,
    },
    {
      label: "Product type",
      type: "input",
      disabled: true,
      value: sample.producttype || "",
      sm: 12,
    },
    {
      label: "Description",
      type: "input",
      multiline: true,
      rows: 3,
      value: sample.description || "test",
      sm: 12,
    },
    {
      label: "Target price",
      type: "input",
      disabled: true,
      value: sample.targetPrice || "No Target Price",
      sm: 12,
    },
    {
      label: "Sample category",
      type: "input",
      disabled: true,
      value: sample.sampleCategory || "",
      sm: 12,
    },
  ];

  const detId = [
    {
      label: "Det id",
      type: "input",
      value: sample.detid || "",
      sm: 12,
      disabled: true,
    },
  ];

  const sampledetails = [
    {
      label: "Customer  name",
      type: "input",
      disabled: true,
      value: sample.customername || "Sreedevi",
      sm: 12,
    },
    {
      label: "Sample code",
      type: "select",
      value: sample.sampleCode || "",
      sm: 12,
      options: [
        { value: "", id: "" },
        { value: "", id: "" },
        { value: "", id: "" },
      ],
    },
    {
      label: "Blend code",
      type: "input",
      disabled: true,
      value: sample.blendCode || "",
      sm: 12,
    },
    {
      label: "Packing type",
      type: "input",
      disabled: true,
      value: sample.packingtype || "",
      sm: 12,
    },
    {
      label: "No of unit",
      type: "input",
      disabled: true,
      value: sample.units || "",
      sm: 12,
    },
    {
      label: "Quantity in grams(Per Unit)",
      type: "input",
      disabled: true,
      value: sample.quantity || "",
      sm: 12,
    },
  ];

  const userentry = [
    {
      label: "Created by",
      type: "input",
      disabled: true,
      value: sample.createdby || "Sreedevi",
      sm: 12,
    },
    {
      label: "Created on",
      type: "input",
      disabled: true,
      value: sample.createdon || "5/14/2020 17:57:18",
      sm: 12,
    },
    {
      label: "Last updated by",
      type: "input",
      disabled: true,
      value: sample.updatedby || "shreedevik",
      sm: 12,
    },
    {
      label: "Last updated date",
      type: "input",
      disabled: true,
      value: sample.updatedon || "5/14/2020 18:10:49",
      sm: 12,
    },
  ];

  const request = [
    // {
    //   label: "Master Sample Request Id",
    //   type: "label",
    //   value: "Master Sample Request Id",
    //   sm: 12,
    // },
    {
      label: "Master sample request status",
      type: "input",
      value: "Completed",
      sm: 12,
      disabled: true,
    },
    {
      label: "Master sample code",
      type: "input",
      value: "",
      sm: 12,
      disabled: true,
    },
  ];

  const dispatch = [
    {
      label: "Dispatch date",
      type: "datePicker",
      value: sample.dispatch || new Date(),
      sm: 12,
    },
    {
      label: "Service provider",
      type: "select",
      value: sample.serviceprovider || "",
      sm: 12,
      options: [
        { value: "", id: "" },
        { value: "", id: "" },
        { value: "", id: "" },
      ],
    },
    {
      label: "Docket number",
      type: "input",
      value: sample.docketnumbe || "",
      sm: 6,
    },
  ];

  const remarks = [
    {
      label: "Remarks",
      type: "input",
      multiline: true,
      rows: 5,
      value: sample.remarks || "",
      onChange: (e) => handleChange(e, "remarks"),
      sm: 12,
    },
  ];

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table" size="small">
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
            </TableRow>
          </TableHead>
          {rows.length !== 0 ? (
            <TableBody>
              {rows.length &&
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <>
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={index}
                          style={{cursor: 'pointer'}}
                          title='click to edit item'
                          aria-label="expand row"
                                    onClick={(e) => {
                                      onEditMasterSampleItem(e, row.sno);
                                    }}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                { column.id === "disstatus" ? (
                                  <CheckBox />
                                ) : (
                                  value
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={13}
                          >
                            <Collapse
                              in={showEditItem}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box margin={1}>
                                <Table aria-label="sticky table" size="small">
                                  <TableBody>
                                    <Grid id="top-row" container>
                                      <Grid item md={6} xs={6}>
                                        <Template payload={detId} />
                                      </Grid>
                                      <Grid item md={4} xs={4}></Grid>
                                      <Grid item md={2} xs={2}>
                                      <Button label="Close" onClick={getCloseForm} />
                                      </Grid>
                                      <Grid item md={5} xs={5}>
                                        <Typography className="item">
                                          Product details
                                        </Typography>
                                        <Template payload={product} />
                                        <Typography className="item">
                                          Sample details for this line request
                            
                                        </Typography>
                                        <Template payload={sampledetails} />
                                        <Typography className="item">
                                          User entry details
                                          
                                        </Typography>
                                        <Template payload={userentry} />
                                      </Grid>
                                      <Grid item md={1} xs={1}></Grid>
                                      <Grid item md={5} xs={5}>
                                        <label>Master sample request id</label>
                                        <Link href='#' style={{float: 'right'}} onClick={() => taskDetails()} >TASK DETAILS</Link>
                                        <Template payload={request} />
                                        <Typography className="item">
                                          Green coffee composition
                                          
                                        </Typography>
                                        <TableContainer className={classes.container}>
                                        <Table
                                          size="small"
                                          aria-label="purchases"
                                        >
                                          <TableHead>
                                            <TableRow
                                              hover
                                              role="checkbox"
                                              tabIndex={-1}
                                            >
                                              <TableCell>Item Code</TableCell>
                                              <TableCell>Item Name</TableCell>
                                              <TableCell align="right">
                                                Percentage
                                              </TableCell>
                                              <TableCell align="right">
                                                Conversion Ratio
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            <TableRow>
                                              <TableCell
                                                style={{
                                                  paddingBottom: 0,
                                                  paddingTop: 0,
                                                }}
                                                colSpan={4}
                                              >
                                                <b>NO RECORDS TO DISPLAY.</b>
                                              </TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                        <Typography className="item">
                                        DISPATCH DETAILS
                                        </Typography>
                                        <Template payload={dispatch} />

                                        <Typography className="item">
                                          REMARKS
                                        </Typography>
                                        <Template payload={remarks} />

                                      </Grid>
                                    </Grid>
                                    <Grid
                                      id="top-row"
                                      container
                                      spacing={24}
                                      justify="center"
                                      alignItems="center"
                                    >
                                      <Grid item>
                                        <Button label="Cancel" onClick={getCloseForm} />
                                      </Grid>
                                      <Grid item>
                                        <Button label="Update" onClick={getCloseForm} />
                                      </Grid>
                                    </Grid>
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
            </TableBody>
          ) : null}
        </Table>
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

export default MasterSampleItemList;
