import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Template from "../../../components/Template";
import Button from "../../../components/Button";
import { CreateOrEditSupplier } from "../../../apis";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import AuditLog from "./AuditLog";
import { useParams, useNavigate } from "react-router-dom";
import { routeBuilder } from "../../../utils/routeBuilder";
//import BasicTable from "../../../components/BasicTable";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    "& .MuiPaper-rounded": {
      width: "100%",
    },
    "& .page-header": {
      width: "100%",
      marginBottom: 15,
    },
    "& .MuiAccordion-root": {
      width: "100%",
    },
    "& .dispatchTable": {
      maxHeight: "400px",
      overflowY: "auto",
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
}));

export const formatToSelection = (data = [], key) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v[key] }));
  return formattedData;
};

export default function SupplierDetails(props) {
  const classes = useStyles();
  const [supplierDetails, setSupplierDetails] = useState([]);
  const { supplierId } = useParams()
  const [logData, setLogData] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const navigate = useNavigate();

  const getSupplierDetails = async () => {
    let response = await CreateOrEditSupplier({ "view": true, "vendor_id": supplierId });
    setSupplierDetails(response)
    setLogData(response.audit_log_vendor)
  }
  useEffect(() => {
    getSupplierDetails();
    //eslint-disable-next-line
  }, [supplierId])

  const payload1 = [
    {
      value: "Contact name",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.contact_name
        ? supplierDetails.contact_name
        : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Address2",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.address2 ? supplierDetails.address2 : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "State",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.state ? supplierDetails.state : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Pin code",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.pincode ? supplierDetails.pincode : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Mobile",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.mobile ? supplierDetails.mobile : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Website",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.website ? supplierDetails.website : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
  ];

  const payload11 = [
    {
      value: "Address1",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.address1 ? supplierDetails.address1 : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Country",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.country ? supplierDetails.country : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "City",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.City ? supplierDetails.City : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Phone",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.phone ? supplierDetails.phone : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: "Email",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      value: supplierDetails.email ? supplierDetails.email : "-",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "PAN no",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.pan_no ? supplierDetails.pan_no : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },

    {
      type: "label",
      value: "GST identification no",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.gst_no
        ? supplierDetails.gst_no
        : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: "TAN no",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.tan ? supplierDetails.tan : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: "TDS(%)",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.tds ? supplierDetails.tds : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },
  ];

  const payload21 = [
    {
      type: "label",
      value: "MSME/SSI",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.msmessi ? supplierDetails.msmessi : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: "CIN no",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: supplierDetails.cin ? supplierDetails.cin : "-",
      bold: true,
      sm: 6,
      lg: 6,
    },
  ];

  const payload3 = [
    {
      value: "Bank name",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.bank_name ? supplierDetails.bank_name : "-",
    },

    {
      value: "Account type",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.account_type ? supplierDetails.account_type : "-",
    },

    {
      value: "IFSC code",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.ifsc_code ? supplierDetails.ifsc_code : "-",
    },
  ];

  const payload31 = [
    {
      value: "Branch",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.branch ? supplierDetails.branch : "-",
    },
    {
      value: "Account number",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.account_number ? supplierDetails.account_number : "-",
    },
    {
      value: "MICR code",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
      value: supplierDetails.micr_code ? supplierDetails.micr_code : "-",
    },
  ];
  const payload9 = [
    {
      label: "",
      value: "",
      sm: 9,
    },
    {
      label: "Is Active",
      type: "checkbox",
      checked: supplierDetails?.isactive === true ? true : false,
      value: supplierDetails?.isactive === true ? true : false,
      sm: 3,
      disabled: true,
    },
  ];
  // const recordTableColumns = [
  //   { id: "name", label: "Name" },
  //   { id: "credit", label: "Credit Amount" },
  //   { id: "debit", label: "Debit Amount" },
  // ];

  // const moqTableColumns = [
  //   { id: "name", label: "MOQId Sno" },
  //   { id: "credit", label: "Supplier Name" },
  //   { id: "debit", label: "Item Name" },
  //   { id: "debit", label: "MOQ qty" },
  //   { id: "debit", label: "Created By" },
  //   { id: "debit", label: "Created Date" },
  //   { id: "debit", label: "Modified By" },
  //   { id: "debit", label: "Modified Date" },
  // ];

  return (
    <form className={classes.root} noValidate autoComplete="off">
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}

      <Card className="page-header">
        <CardHeader title="Supplier details" className="cardHeader" />
        <CardContent>
          <Grid container md={12}>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Supplier name</Typography>
              <Typography>
                {supplierDetails.vendor_name ? supplierDetails.vendor_name : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Supplier group</Typography>
              <Typography>
                {supplierDetails.groupname ? supplierDetails.groupname : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Supplier category</Typography>
              <Typography>
                {supplierDetails.vendorcatname
                  ? supplierDetails.vendorcatname
                  : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Supplier type</Typography>
              <Typography>
                {supplierDetails.vendor_type_id === '1002' ? 'Domestic' : "Import"}
              </Typography>
            </Grid>
            <Grid item md={12} xs={12}>
              <Template payload={payload9} />
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <Typography>Vendor Information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload01} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion> */}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Contact information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload1} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload11} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {supplierDetails.vendor_type_id !== '1001' &&
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <Typography>Identification numbers</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload2} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload21} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      }

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Bank details</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload3} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload31} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>MOQ</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <BasicTable rows={moqTableData} columns={moqTableColumns} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion> */}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <Typography>Audit log information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <AuditLog data={logData} />
        </AccordionDetails>
      </Accordion>

      {/* <Tab label="Credit & Debit Opening" index="1">
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Vendor Opening Amounts</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container style={{ margin: 6 }}>
                    <Grid id="top-row" container style={{ margin: 6 }}>
                      <Grid item md={12} xs={12} className="item">
                        <BasicTable
                          rows={recordsTableData}
                          columns={recordTableColumns}
                        ></BasicTable>
                      </Grid>
                    </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Tab> */}

      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
        style={{ margin: 24 }}
      >
        <Grid item>
          <Button label="Edit" onClick={() => navigate(routeBuilder('supplier', supplierId, 'edit'))} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => navigate('/supplier')} />
        </Grid>
      </Grid>
    </form>
  );
}