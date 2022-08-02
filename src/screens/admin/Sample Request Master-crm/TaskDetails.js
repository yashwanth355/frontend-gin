import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, Table } from "@material-ui/core";
import { createAccountSample, getQuotesInfo } from "../../../apis";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

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

const TaskDetails = (props) => {
  const classes = useStyles();
  const [sample, setSampleInfo] = useState({});
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
        // setAccountName(
        //   formatToSelection([account], "account_name", "account_id")
        // );
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

  const tasks = [
    {
      label: "Task id",
      type: "input",
      disabled: true,
      value: sample.taskid || "",
      sm: 12,
    },
    {
      label: "Task name",
      type: "input",
      value: sample.taskname || "",
      sm: 12,
    },
    {
      label: "Select project",
      type: "select",
      value: sample.account || "",
      sm: 12,
      options: [{ label: "", id: "" }],
    },
    {
      label: "Task description",
      type: "input",
      multiline: true,
      rows: 3,
      value: sample.description || "",
      onChange: (e) => handleChange(e, "description"),
      sm: 12,
    },
    {
      label: "Master sample code",
      type: "select",
      value: sample.code || "",
      sm: 12,
      options: [{ label: "", id: "" }],
    },
    {
      label: "Assigned to",
      type: "select",
      value: sample.assign || "",
      sm: 12,
      options: [{ label: "", id: "" }],
    },
    {
      label: "Assigned to",
      type: "select",
      value: sample.assign || "",
      sm: 12,
      options: [{ label: "completed", id: "completed" }],
    },
    {
      label: "Task due date",
      type: "datePicker",
      value: new Date(),
      sm: 12,
    },
  ];

  const comments = [
    {
      label: "Comments",
      type: "input",
      multiline: true,
      rows: 3,
      value: sample.comments || "",
      onChange: (e) => handleChange(e, "comments"),
      sm: 12,
    },
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

      <Grid id="top-row" container>
        <Grid item md={6} xs={6} className="item">
          <Typography>Update</Typography>
        </Grid>
        <Grid item md={6} xs={6} className="item">
          <Typography>
            <strong>
              The task is either cancelled or completed so cannot be modify
              
            </strong>
          </Typography>
        </Grid>
      </Grid>

      <Grid id="top-row" container>
        <Grid item md={5} xs={5}>
          <Typography className="item">TASKS</Typography>
          <Template payload={tasks} />
        </Grid>
        <Grid item md={1} xs={1}></Grid>
        <Grid item md={5} xs={5}>
          <Typography className="item">Tasks comments</Typography>
          <Template payload={comments} />
          <Grid container>
            <Grid item md={8} xs={8}></Grid>
            <Grid item md={4} xs={4}>
              <Button label="Add Comment" disabled={true} />
            </Grid>
          </Grid>
          <TableContainer className={classes.container}>
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow hover role="checkbox" tabIndex={-1}>
              <TableCell>Comment</TableCell>
              <TableCell>Comment Date Time</TableCell>
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
          <Button label="Save" disabled={true} />
        </Grid>
        <Grid item>
          <Button label="Update" disabled={true} />
        </Grid>
        <Grid item>
          <Button label="Back" onClick={getBackToList} />
        </Grid>
      </Grid>
    </form>
  );
};

export default TaskDetails;
