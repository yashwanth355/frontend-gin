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
import { getgcDetails } from "../../../apis";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import AuditLog from './AuditLog';
import BasicTable from "../../../components/BasicTable";
import { useNavigate, useParams } from "react-router-dom";
import { routeBuilder } from "../../../utils/routeBuilder";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiGrid-container": {
      alignItems: 'center',
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

export default function GcDetails(props) {
  const classes = useStyles();
  //new
  const [gcDetails, setGcDetails] = useState({});
  const [lovipTableData, setLovipTableData] = useState(null);
  const [islTableData, setIslTableData] = useState(null);
  const [logData, setLogData] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const navigate = useNavigate();
  const { gcId } = useParams();

  async function fetchData() {
    let response = await getgcDetails({ item_id: gcId });
    setGcDetails(response);
    setLogData(response.audit_log_gc);
    setIslTableData(response.item_stock_location);
    setLovipTableData(response.vendor_list);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line 
  }, [gcId]);

  const payload20 = [
    {
      value: "Item description",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.item_desc
        ? gcDetails.item_desc
        : "-",
      sm: 6,
      lg: 6,
    },
    {
      value: "Conversion ratio",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.convertion_ratio
        ? gcDetails.convertion_ratio
        : "-",
      sm: 6,
      lg: 6,
    },
  ];
  const payload21 = [
    {
      value: "HSN code",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.hsn_code
        ? gcDetails.hsn_code
        : "-",
      sm: 6,
      lg: 6,
    },
  ];
  const payload22 = [
    {
      value: "Item category",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.item_catname ? gcDetails.item_catname : "-",
      sm: 6,
      lg: 6,
    },
  ];
  const payload23 = [
    {
      value: "UOM",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.uom_name ? gcDetails.uom_name : "-",
      sm: 6,
      lg: 6,
    },
  ];
  const payload24 = [
    {
      label: "",
      type: "checkbox",
      checked: gcDetails.display_in_dailyupdates ? gcDetails.display_in_dailyupdates : false,
      sm: 1,
      lg: 1,
      disabled: true,
    },
    {
      value: "Display this green coffee rates in daily update",
      type: "label",
      bold: true,
      sm: 11,
      lg: 11,
    },
    {
      label: "",
      type: "checkbox",
      checked: gcDetails.display_inpo ? gcDetails.display_inpo : false,
      sm: 1,
      lg: 1,
      disabled: true,
    },
    {
      value: "Display this item in purchase order",
      type: "label",
      bold: true,
      sm: 11,
      lg: 11,
    }


  ];
  const payload25 = [
    {
      value: "Item type",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.coffee_type ? gcDetails.coffee_type : "-",
      sm: 6,
      lg: 6,
    }
  ];

  const payload50 = [
    {
      value: "Item type",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.coffee_type ? gcDetails.coffee_type : "-",
      sm: 6,
      lg: 6,
    },
    {
      label: "",
      type: "checkbox",
      checked: gcDetails?.is_specialcoffee === true ? gcDetails.is_specialcoffee : false,
      sm: 1,
      lg: 1,
      disabled: true,
    },
    {
      value: "Is special coffee",
      type: "label",
      bold: true,
      sm: 11,
      lg: 11,
    },
  ];

  const payload26 = [
    {
      value: "Density(Gm/cc)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.density === "" ? "-" : gcDetails.density,
      sm: 6,
      lg: 6,
    },
    {
      value: "Moisture(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.moisture === "" ? "-" : gcDetails.moisture,
      sm: 6,
      lg: 6,
    },
    {
      value: "Sound Beans(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.soundbeans === "" ? "-" : gcDetails.soundbeans,
      sm: 6,
      lg: 6,
    },
    {
      value: "Browns(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.browns === "" ? "-" : gcDetails.browns,
      sm: 6,
      lg: 6,
    },
    {
      value: "Blacks(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.blacks === "" ? "-" : gcDetails.blacks,
      sm: 6,
      lg: 6,
    },
    {
      value: "Broken & Bites(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.broken_bits === "" ? "-" : gcDetails.broken_bits,
      sm: 6,
      lg: 6,
    },
    {
      value: "Insected beans(%)",
      type: "label",
      bold: true,
      sm: 6,
      lg: 6,
    },
    {
      type: "label",
      value: gcDetails.insected_beans === "" ? "-" : gcDetails.insected_beans,
      sm: 6,
      lg: 6,
    },
  ];

  const payload27 = [
    {
      value: "Bleached(%)",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: gcDetails.bleached === "" ? "-" : gcDetails.bleached,
      sm: 4,
      lg: 4,
    },
    {
      value: "Husk(%)",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: gcDetails.husk === "" ? "-" : gcDetails.husk,
      sm: 4,
      lg: 4,
    },
    {
      value: "Sticks(%)",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: gcDetails.sticks === "" ? "-" : gcDetails.sticks,
      sm: 4,
      lg: 4,
    },
    {
      value: "Stones(%)",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: gcDetails.stones === "" ? "-" : gcDetails.stones,
      sm: 4,
      lg: 4,
    },
    {
      value: "Beans retained on 5mm mesh during sieve analysis",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: gcDetails.beans_retained === "" ? "-" : gcDetails.beans_retained,
      sm: 4,
      lg: 4,
    },
  ]


  const lovipTableColums = [
    { id: "vendor_name", label: "Vendor" },
    { id: "contact_name", label: "Contact" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "country", label: "Country" },
  ];

  const islTableColumns = [
    { id: "entity", label: "Entity" },
    { id: "name", label: "Name" },
    { id: "quantity", label: "Quantity" },
    { id: "value", label: "Value" },
    { id: "unit_price", label: "Unit Price" },
  ];

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
        <CardHeader title="GC Details" className="cardHeader" />
        <CardContent>
          <Grid container md={12}>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">GC no</Typography>
              <Typography>{gcId ?? "-"}</Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Item code</Typography>
              <Typography>
                {gcDetails?.item_code
                  ? gcDetails?.item_code
                  : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Item group</Typography>
              <Typography>
                {gcDetails?.lname
                  ? gcDetails?.lname
                  : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Item name</Typography>
              <Typography>
                {gcDetails?.item_name
                  ? gcDetails?.item_name
                  : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Short code</Typography>
              <Typography>
                {gcDetails?.s_code
                  ? gcDetails?.s_code
                  : "-"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid id="top-row" container>
        <Grid item md={12} xs={12}>
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>GC information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload20} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload21} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Category & UOM</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload22} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload23} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Display & Type information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload24} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  {gcDetails.coffee_type === 'GC' ? <Template payload={payload50} /> : <Template payload={payload25} />}
                </Grid>
                {/* <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload26} />
                </Grid> */}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* //gcDetails */}
          {gcDetails.coffee_type === 'GC' ?
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Specification information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid id="top-row" container>
                  <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload26} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload27} />
                  </Grid>
                  {/* <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload26} />
                </Grid> */}
                </Grid>
              </AccordionDetails>
            </Accordion> : null}

          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={8} className="item">
                  <Typography>Item stock locations</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={8} className="item">
                  <BasicTable rows={islTableData} columns={islTableColumns} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 4 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>List of vendors purchased this item </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container style={{ margin: 6 }}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={8} className="item">
                    <BasicTable
                      rows={lovipTableData}
                      columns={lovipTableColums}
                    ></BasicTable>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

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


          <Grid
            id="top-row"
            container
            spacing={24}
            justify="center"
            alignItems="center"
            style={{ margin: 24 }}
          >
            <Grid item>
              <Button label="Edit" onClick={() => navigate(routeBuilder('gc', gcId, 'edit'), { replace: true })} />
            </Grid>
            <Grid item>
              <Button label="Cancel" onClick={() => navigate(-1)} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

    </form>
  );
}