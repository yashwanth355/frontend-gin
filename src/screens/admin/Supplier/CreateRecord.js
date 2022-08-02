import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "../../../components/Button";
import Template from "../../../components/Template";
import {} from "../../../apis";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";

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
  },
}));

export const formatToSelection = (data = [], key) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v[key] }));
  return formattedData;
};

export default function CreateRecord(props) {
   // eslint-disable-next-line
  const classes = useStyles();
  const [recordInfo, setRecordInfo] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
   
  }, []);

  const handleChange = (event, key) => {
    let data = {
      ...recordInfo,
      [key]: event.target.value,
    };
    setRecordInfo(data);
  };

  const createRecords = () => {
    props.back();
  };

  const payload = [
    {
      label: "Credit amount",
      type: "input",
      value: recordInfo.credit,
      onChange: (e) => handleChange(e, "credit"),
      sm: 6,
      xs: 6,
    },
    {
      label: "Debit amount",
      type: "input",
      value: recordInfo.debit,
      onChange: (e) => handleChange(e, "debit"),
      sm: 6,
      xs: 6,
    },
  ];

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
      <Grid container>
        <Grid item md={12} xs={12}>
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Create new record</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Template payload={payload} />
            </AccordionDetails>
          </Accordion>
         
              <Grid
                container
                spacing={24}
                justify="center"
                alignItems="center"
                style={{ margin: 24 }}
              >
                <Grid item>
                  <Button label="Back" onClick={() => props.back()} />
                </Grid>
                <Grid item>
                  <Button label="Save" onClick={createRecords} />
                </Grid>
              </Grid>

        </Grid>
      </Grid>
    </>
  );
}