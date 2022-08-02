import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { createAccountSample, getQuotesInfo } from "../../../apis";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import MasterSampleItemList from "./MasterSampleItemList";
import SimpleStepper from "../../../components/SimpleStepper";
import TaskDetails from "./TaskDetails";
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    "& #top-row": {
      marginTop: 10,
      marginBottom: 5,
    },
    "& .mb-4": {
      marginTop: 10,
      marginBottom: 50,
    },
    "& .makeStyles-root-36 .makeStyles-container-37": {
      maxHeight: "100%",
    },
  },
}));

const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map((v) =>
    formattedData.push({ label: v[key], value: v[id] || v[key] })
  );
  return formattedData;
};

const formatSampleDetails = (viewPayload, contacts = {}) => ({
  account: viewPayload.accountid || "",
  address: viewPayload.shippingaddress || "",
  contact: contacts ? contacts[0]?.value || "" : "",
  contactList: contacts,
  createddate: viewPayload.createddate,
  status: viewPayload.status,
  remarks: viewPayload.remarks,
  samplerequestid: viewPayload.samplerequestid,
});

const EditMasterSample = (props) => {
  const classes = useStyles();
  const [sample, setSampleInfo] = useState({});
  const [accountName, setAccountName] = useState([]);
  const [showTaskDetails, setShowTaskDetails] = React.useState(false);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  useEffect(() => {
    createAccountSample({
      view: true,
      samplerequestid: props.id,
    }).then((res) => {
      getQuotesInfo({ type: "accountdetails" }).then((response) => {
        let account = response.find(
          (acc) => acc.account_id === parseInt(res[0].accountid)
        );
        setAccountName(
          formatToSelection([account], "account_name", "account_id")
        );
        let contactList = account?.contact_details
          ? formatToSelection(
              account.contact_details,
              "contact_name",
              "contact_id"
            )
          : [];
        setSampleInfo(formatSampleDetails(res[0], contactList));
      });
    });
    // eslint-disable-next-line
  }, []);

  const getBackToList = () => {
    props.back();
  };

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setSampleInfo({
      ...sample,
      [key]: value,
    });
  };

  const system = [
    {
      label: "CRM sample request id",
      type: "input",
      disabled: true,
      value: sample.samplerequestid || "",
      sm: 12,
    },
    {
      label: "CRM request number",
      type: "input",
      disabled: true,
      value: sample.samplerequestnumber || "",
      sm: 12,
    },
    {
      label: "Requested date",
      type: "datePicker",
      disabled: true,
      value: sample.requestedDate || new Date(),
      sm: 12,
    },
    {
      label: "CRM account record type",
      type: "select",
      value: sample.account || "",
      sm: 12,
      options: accountName || [],
      disabled: true,
    },
    {
      label: "Req approval",
      type: "checkbox",
      value: sample.approval || true,
      sm: 6,
      disabled: true,
    },
    {
      label: "Approval status",
      type: "checkbox",
      value: sample.approvalstatus || true,
      sm: 6,
      disabled: true,
    },
  ];

  const account = [
    {
      label: "Id",
      type: "input",
      disabled: true,
      value: sample.accountid || "",
      sm: 12,
    },
    {
      label: "Name",
      type: "input",
      disabled: true,
      value: sample.name || "",
      sm: 12,
    },
    {
      label: "Shipping address",
      type: "input",
      multiline: true,
      rows: 3,
      disabled: true,
      value: sample.address || "test",
      sm: 12,
    },
  ];

  const contact = [
    {
      label: "Id",
      type: "input",
      disabled: true,
      value: sample.accountid || "",
      sm: 12,
    },
    {
      label: "First name",
      type: "input",
      disabled: true,
      value: sample.firstname || "",
      sm: 12,
    },
    {
      label: "Last name",
      type: "input",
      disabled: true,
      value: sample.lastname || "test",
      sm: 12,
    },
  ];

  const remarks = [
    {
      label: "Remarks",
      type: "input",
      multiline: true,
      rows: 3,
      value: sample.remarks || "",
      onChange: (e) => handleChange(e, "remarks"),
      sm: 12,
    },
  ];

  const getActiveStep = () => {
    if (props.status === "Pending with GMC" || props.status === "New") {
      return "0";
    } else if (props.status === "Pending with GC rates") {
      return "1";
    }
  };

  const status = [
    {
      label: "Staus",
      type: "select",
      value: sample.status || "",
      sm: 12,
      options: accountName || [],
      disabled: true,
    },
    {
      label: "Email status",
      type: "input",
      value: sample.emailstatus || "Sent",
      sm: 6,
      disabled: true,
    },
  ];

  const entry = [
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
      label: "Last updated on",
      type: "input",
      disabled: true,
      value: sample.updatedon || "5/14/2020 18:10:49",
      sm: 12,
    },
    {
      label: "Source",
      type: "input",
      disabled: true,
      value: sample.source || "CRM",
      sm: 12,
    },
  ];

  const sampleSteps = [
    "REQ Approval",
    "Approve",
    "Create",
    "Update",
    "Send Mail",
  ];

  const getShowTaskDetails = () => {
    setShowTaskDetails(!showTaskDetails);
  };

  const backToDetails = () => {
    setShowTaskDetails(!showTaskDetails);
  }

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
    {showTaskDetails ? (
      <TaskDetails back={backToDetails} />
    ):(
      <>
        <Grid id="top-row" container>
          <Grid item md={6} xs={6} className="item">
            <Typography>Sample Request master</Typography>
          </Grid>
          <Grid item md={6} xs={6} className="item">
            <Typography>
              <strong>Sample request # 20200514-64 cannot be modified</strong>
            </Typography>
          </Grid>
        </Grid>

        {/* <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item md={3} xs={3}>
          <Button label="REQ APPROVAL" disabled={true} />
        </Grid>
        <Grid item md={6} xs={6}>
          <Button label="APPROVE" disabled={true} />
          <Button label="CREATE" disabled={true} />
          <Button label="UPDATE" disabled={true} />
        </Grid>
        <Grid item md={2} xs={2}>
          <Button label="SEND MAIL" />
        </Grid>
      </Grid> */}

        <Grid container md={12}>
          <Grid item md={12} xs={12}>
            <SimpleStepper
              activeStep={getActiveStep()}
              steps={sampleSteps}
              stepClick={(e) => {
                console.log(e);
              }}
            ></SimpleStepper>
          </Grid>
        </Grid>

        <Grid id="top-row" container>
          <Grid item md={5} xs={5}>
            <Typography className="item">System</Typography>
            <Template payload={system} />
            <Typography className="item">CRM user entry details</Typography>
            <Template payload={entry} />
          </Grid>
          <Grid item md={1} xs={1}></Grid>
          <Grid item md={5} xs={5}>
            <Typography className="item">CRM account details</Typography>
            <Template payload={account} />

            <Typography className="item">CRM contact details</Typography>
            <Template payload={contact} />

            <Typography className="item">REMARKS</Typography>
            <Template payload={remarks} />

            <Typography className="item">Status management</Typography>
            <Template payload={status} />
          </Grid>
        </Grid>

        <Grid container spacing={24} className="mb-3">
          <Grid item md={12} xs={12}>
            <Typography className="item">Line item information</Typography>
            <MasterSampleItemList showTaskDetails={getShowTaskDetails} />
          </Grid>
        </Grid>

        <Grid
          id="top-row"
          container
          spacing={24}
          justify="center"
          alignItems="center"
          className="mb-4"
        >
          <Grid item>
            <Button label="Create" disabled={true} />
          </Grid>
          <Grid item>
            <Button label="Update" disabled={true} />
          </Grid>
          <Grid item>
            <Button label="Back" onClick={getBackToList} />
          </Grid>
        </Grid>
      </>
    )}
    </form>
  );
};

export default EditMasterSample;
