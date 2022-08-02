import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Template from "../../../../components/Template";
import Button from "../../../../components/Button";
import Snackbar from "../../../../components/Snackbar";
import "../../../common.css";
import { CreateEditTaxMaster } from "../../../../apis";
// eslint-disable-next-line
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiGrid-container": {
      alignItems: "center",
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

const TaxDetails = (props) => {
  const classes = useStyles();
  const [taxDetails, setTaxDetails] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  async function fetchData() {
    let data = { view:true,tax_id:props?.id };
    let response = await CreateEditTaxMaster(data);
    setTaxDetails(response);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [props.id]);

  const payload1 = [
    {
      value: "Notes",
      type: "label",
      bold: true,
      sm: 8,
      lg: 8,
    },
    {
      type: "label",
      value: taxDetails.tax_notes === "" ? "-" : taxDetails.tax_notes,
      sm: 4,
      lg: 4,
    },
  ];

  const payload2 = [
    {
      label: "",
      type: "checkbox",
      checked: taxDetails.isactive ? taxDetails.isactive : false,
      sm: 1,
      lg: 1,
      disabled: true,
    },
    {
      value: "Is active",
      type: "label",
      bold: true,
      sm: 11,
      lg: 11,
    },
  ];

  
  const downloadFileHandler = async (e) => {
    // try {
    //   let response = await getMRINDetail({
    //     type: "downloadMRINDocument",
    //     file_name: invoiceFile.file_name,
    //   });
    //   console.log("Response", response);
    //   if (response) {
    //     const linkSource = `data:application/pdf;base64,${response.fileData}`;
    //     const downloadLink = document.createElement("a");
    //     downloadLink.href = linkSource;
    //     downloadLink.download = invoiceFile.file_name;
    //     downloadLink.click();
    //     setSnack({
    //       open: true,
    //       message: "File downloaded successfully",
    //     });
    //   }
    // } catch (e) {
    //   setSnack({
    //     open: true,
    //     message: e,
    //     severity: "error",
    //   });
    // }
  };

// eslint-disable-next-line
  const payload7 = [
    {
      type: "label",
      value: "Attachment",
      bold: true,
      sm: 2,
    },
    {
      type: "label",
      value: taxDetails.document_name,
      sm: "6",
    },
    {
      label: "Download attachment",
      type: "button",
      sm: 12,
      onClick: (e) => downloadFileHandler(e, "invoiceAttachment"),
    },
  ];

// eslint-disable-next-line
  const allpdfsColumns = [
    { id: "label", label: "File Name" },
    { id: "download", label: "Download" },
    // { id: "delete", label: "Delete" },
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
        <CardHeader title="Tax Details" className="cardHeader" />
        <CardContent>
          <Grid container md={12}>
          <Grid item md={3} xs={12}>
              <Typography variant="h7">Tax Id</Typography>
              <Typography>
                {taxDetails?.tax_id ? taxDetails?.tax_id : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Tax Name</Typography>
              <Typography>
                {taxDetails?.tax_name ? taxDetails?.tax_name : "-"}
              </Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="h7">Tax Percentage (%)</Typography>
              <Typography>{taxDetails?.tax_percentage ? taxDetails?.tax_percentage : "-"}</Typography>
            </Grid>
            <Grid item md={3} xs={12}>
              <Template payload={payload2} />
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
                  <Typography>Tax information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                  <Template payload={payload1} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Attachment</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload7} />
        </AccordionDetails>
      </Accordion> */}
      
      
      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button
            label="Edit"
            onClick={(e) => props.updateTaxActionInfo(taxDetails)}
          />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
      </Grid>

    </form>
  );
};

export default TaxDetails;
