import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import ContentTabs from "../../../components/ContentTabs";
import Tab from "@material-ui/core/Tab";
import { Grid } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { createAccountContact } from "../../../apis";
import Button from "../../../components/Button";
import Paper from "@material-ui/core/Paper";
import { Table as Tables } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import EnhancedTableHead from "../../../components/EnhancedTableHead";
import "../../common.css";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "../../../components/Fab";
import { CheckBox } from "../../../components/CheckBox";

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginTop: 24,
  },
  container: {
    maxHeight: 440,
  },
  sortHeader: {
    cursor: "pointer",
  },
});

const columns = [
  { id: "id", label: "Id" },
  { id: "country", label: "Country" },
  { id: "state", label: "State" },
  { id: "city", label: "City" },
  { id: "postalcode", label: "PostalCode" },
  { id: "street", label: "Street" },
  { id: "primary", label: "Primary" },
];

function createData(
  id,
  country,
  state,
  city,
  postalcode,
  street,
  primary
) {
  return {
    id,
    country,
    state,
    city,
    postalcode,
    street,
    primary
  };
}

const ContactDetails = (props) => {
  const classes = useStyles();

  const [contactDetails, setContactDetails] = useState({});
  const [ accountId, setAccountId] = useState('');
  const [allBillingData, setAllBillingData] = useState([]);
  const [allShippingData, setAllShippingData] = useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [billingPrimary, setBillingPrimary] = React.useState({});  
  const [shippingPrimary, setShippingPrimary] = React.useState({});  

  useEffect(() => {
    createAccountContact({
      view: true,
      contactid: props.id.toString(),
    }).then((res) => {
      if(res !== null){
      setContactDetails(res);
      setAccountId(res.accountid);
      let rows = [];
      let temp = {};
       // eslint-disable-next-line
      res?.billinginfo?.map((v) => {
        rows.push(
          createData(
            v.billing_id,
            v.billing_country,
            v.billing_state,
            v.billing_city,
            v.billing_postalcode,
            v.billing_street,
            v.billing_primary
          )
        );
        if(v.billing_primary === true) {
          temp = {billing_city: v.billing_city, billing_country: v.billing_country, billing_id: v.billing_id, billing_postalcode: v.billing_postalcode, billing_primary: v.billing_primary, billing_state: v.billing_state, billing_street: v.billing_street};
        }
      });
      // eslint-disable-next-line
      setAllBillingData(rows);
      setBillingPrimary(temp);
      let rows1 = [];
      let temp1 = {};
      // eslint-disable-next-line
     res?.shippinginfo?.map((v) => {
       rows1.push(
         createData(
           v.shipping_id,
           v.shipping_country,
           v.shipping_state,
           v.shipping_city,
           v.shipping_postalcode,
           v.shipping_street,
           v.shipping_primary
         )
       );
       if(v.shipping_primary === true) {
        temp1 = {shipping_city: v.shipping_city, shipping_country: v.shipping_country, shipping_id: v.shipping_id, shipping_postalcode: v.shipping_postalcode, shipping_primary: v.shipping_primary, shipping_state: v.shipping_state, shipping_street: v.shipping_street};
       }
     });
     // eslint-disable-next-line
     setAllShippingData(rows1);
     setShippingPrimary(temp1);
    }
    });
    // eslint-disable-next-line
  }, []);

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
    return order === "desc"
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
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const payload = [
    {
      type: "label",
      value: "Contact owner",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.contactowner,
      sm: "6",
    },
    {
      type: "label",
      value: "First name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.firstname,
      sm: "6",
    },
    {
      type: "label",
      value: "Email",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.email,
      sm: "6",
    },
    {
      type: "label",
      value: "Mobile",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.mobile,
      sm: "6",
    },
    {
      type: "label",
      value: "Past sales number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.past_sales_no,
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Last name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.lastname,
      sm: "6",
    },
    {
      type: "label",
      value: "Phone",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.phone,
      sm: "6",
    },
    {
      type: "label",
      value: "Current sales number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: contactDetails.current_sales_no,
      sm: "6",
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "Billing Id",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_id,
      sm: "6",
    },
    {
      type: "label",
      value: "Billing City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Billing Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_country,
      sm: "6",
    },
    
  ];

  const payload3 = [
    {
      type: "label",
      value: "Billing State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Billing Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_street,
      sm: "6",
    },
    {
      type: "label",
      value: "Billing Postal Code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: billingPrimary.billing_postalcode,
      sm: "6",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: "Shipping Id",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_id,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_country,
      sm: "6",
    },
    
  ];

  const payload5 = [
    {
      type: "label",
      value: "Shipping State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_street,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping Postal Code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: shippingPrimary.shipping_postalcode,
      sm: "6",
    },
  ];

  return (
    <>
      <ContentTabs value="0">
        <Tab label="Contacts Information" index="0">
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Contact information</Typography>
            </Grid>
          </Grid>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload1} />
            </Grid>
          </Grid>
          <Grid
            container
            xs={12}
            md={12}
            style={{ margin: 24 }}
            justify="center"
          >
            <Grid item>
              <Button
                label="Edit"
                onClick={(e) => props.editContact("edit_contact", props.id)}
              />
            </Grid>
            <Grid item>
              <Button label="Cancel" onClick={props.back} />
            </Grid>
          </Grid>

          {/* billing */}
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Billing information</Typography>
            </Grid>
          </Grid>
          <Grid id="top-row" container>
            <Grid container direction="row">
              <Grid xs={6} item></Grid>
              <Grid
                xs={6}
                item
                justify="flex-end"
                alignItems="center"
                style={{ display: "flex" }}
              >
                <Fab
                  label={"Add Billing Address"}
                  variant="extended"
                  onClick={(e) => props.editContact("add_billing", {'contactId': props.id, 'accountid': accountId})}
                />
              </Grid>
            </Grid>
            <Grid id="top-row" xs={12} md={12} container direction="column">
              <Paper className={classes.root}>
                <TableContainer className={classes.container}>
                  <Tables stickyHeader aria-label="sticky table" size="small">
                    <EnhancedTableHead
                      classes={classes}
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      rowCount={allBillingData.length}
                      headCells={columns}
                                    selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
                    />
                    <TableBody>
                      {allBillingData.length > 0 ?  
                      stableSort(allBillingData, getComparator(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
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
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
                                   {column.id === "id" ? (
                                    // eslint-disable-next-line
                                      <a
                                      href="#"
                                      onClick={(e) => {
                                        props.editContact("edit_billing", {'contactId': props.id, 'accountid': accountId, 'data': row})
                                      }} >
                                        {value}
                                      </a>
                                            ) : column.id === "primary" ? (
                                              // eslint-disable-next-line
                                              <CheckBox checked={row.primary} name={row.primary} disabled={true}/>
                                          ) : (
                                    value
                                    )} 
                                  </TableCell>
                                );
                              })}
                               {/* <TableCell>Edit</TableCell> */}
                            </TableRow>
                          );
                        }): 'No records to display'}
                    </TableBody>
                  </Tables>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={allBillingData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </Paper>
            </Grid>
            {/* <Grid id="top-row" xs={12} md={6} container direction="column">
                            <Template payload={payload2} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={6} container direction="column">
                            <Template payload={payload3} />
                        </Grid> */}
          </Grid>

          {/* shipping */}
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Shipping information</Typography>
            </Grid>
          </Grid>
          <Grid id="top-row" container>
            <Grid container direction="row">
              <Grid xs={6} item></Grid>
              <Grid
                xs={6}
                item
                justify="flex-end"
                alignItems="center"
                style={{ display: "flex" }}
              >
                <Fab
                  label={"Add Shipping Address"}
                  variant="extended"
                  onClick={(e) => props.editContact("add_shipping", {'contactId': props.id, 'accountid': accountId})}
                />
              </Grid>
            </Grid>
            <Grid id="top-row" xs={12} md={12} container direction="column">
              <Paper className={classes.root}>
                <TableContainer className={classes.container}>
                  <Tables stickyHeader aria-label="sticky table" size="small">
                    <EnhancedTableHead
                      classes={classes}
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      rowCount={allShippingData.length}
                      headCells={columns}
                                    selectedAdvancedFilters={props.selectedAdvancedFilters}
              clearAdvancedFilters={props.clearAdvancedFilters}
                    />
                    <TableBody>
                      {allShippingData.length > 0 ?  
                      stableSort(allShippingData, getComparator(order, orderBy))
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
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
                                  <TableCell
                                    key={column.id}
                                    align={column.align}
                                  >
                                  {column.id === "id" ? (
                                                // eslint-disable-next-line
                                                <a
                                                href="#"
                                                onClick={(e) => {
                                                  props.editContact("edit_shipping", {'contactId': props.id, 'accountid': accountId, 'data': row});
                                                }}
                                                >
                                                {value}
                                                </a>
                                            ) : column.id === "primary" ? (
                                              // eslint-disable-next-line
                                              <CheckBox checked={row.primary} name={row.primary} disabled={true}/>
                                          ) : (
                                    value
                                    )} 
                                  </TableCell>
                                );
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
                  count={allShippingData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </Paper>
            </Grid>
          </Grid>
        </Tab>
        <Tab label="Billing Address" index="2">
        <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Billing information</Typography>
            </Grid>
          </Grid>
          <Grid id="top-row" container>
          {billingPrimary.billing_id === undefined ? 'There is no any primary billing address.' : 
            <>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload2} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload3} />
              </Grid>
            </>
          }
          </Grid>
        </Tab>
        <Tab label="Shipping Address" index="3">
        <Grid item md={12} xs={12} className="item">
              <Typography>Shipping information</Typography>
            </Grid>
            <Grid id="top-row" container>
              {shippingPrimary.shipping_id === undefined ? 'There is no any primary shipping address.' : 
                <>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload4} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload5} />
                </Grid>
                </>
              }
            </Grid>
        </Tab>
      </ContentTabs>
    </>
  );
};
export default ContactDetails;
