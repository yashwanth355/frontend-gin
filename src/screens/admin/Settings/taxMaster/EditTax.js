import React, { useEffect, useState } from "react";
import Template from "../../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "../../../../components/Button";
import Snackbar from "../../../../components/Snackbar";
import "../../../common.css";
import _ from "lodash";
import { CreateEditTaxMaster } from "../../../../apis";
import useToken from "../../../../hooks/useToken";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
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
  modal: {
    position: "absolute",
    margin: "0 auto",
    top: "30%",
    right: "10%",
    left: "10%",
    width: 700,
    textAlign: "center",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const EditTax = (props) => {
  const classes = useStyles();
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();

  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [taxData, setTaxData] = useState({});
  // eslint-disable-next-line
  const [validationError, setValidationError] = useState({});
  // eslint-disable-next-line
  const [uploadedFile, setUploadedFile] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(props?.data){
      setTaxData(props.data)
    }
  }, [props.data]);

  const onClickActive = (e) => {
    var val = e.target.checked;
    setTaxData({
      ...taxData,
      isactive: val,
    });
  };

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setTaxData({
      ...taxData,
      [key]: value,
    });
  };
// eslint-disable-next-line
console.log('active::', taxData?.isactive)
  const payload = [
    {
      label: "Tax Name",
      type: "input",
      sm: 6,
      value: taxData?.tax_name,
      onChange: (e) => handleChange(e, "tax_name"),
    },
    {
      label: "Tax Percentage",
      type: "number",
      sm: 6,
      // required: true,
      // error: validationError?.entity,
      // helperText: validationError?.entity,
      value: taxData?.tax_percentage,
      onChange: (e) => handleChange(e, "tax_percentage"),
    },
    {
      label: "Notes",
      type: "input",
      sm: 6,
      value: taxData?.tax_notes,
      cols: 5,
      onChange: (e) => handleChange(e, "tax_notes"),
    },
    {
      label: "Is Active",
      type: "checkbox",
      sm: 6,
      checked: taxData?.isactive === true ? true : false,
      onChange: (e) => onClickActive(e),
    },
  ];

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const handleFileChange = async (e) => {
    if (!e.target.files) {
        return;
    }
    // setDisableUpload(false);
    let file = await toBase64(e.target.files[0]);
    file = file.replace(/^data:application\/(pdf);base64,/, "")
    // setInvoiceFile({
    //     file_name: e.target.files[0].name,
    //     document_name: e.target.files[0].name,
    //     file: file
    // });
    setUploadedFile({
        file_name: e.target.files[0].name,
        document_name: e.target.files[0].name,
        file: file
    });
}
// eslint-disable-next-line
  const payload4 = [
    {
        type: "label",
        value: "Invoice file",
        bold: true,
        sm: "4",
    },
    {
        type: "label",
        value: taxData.document_name,
        sm: "8",
    },
    {
        type: 'file',
        // disabled: disableInvoice,
        onChange: (e) => handleFileChange(e),
    },
];

  const editTaxAction = async (e) => {
  e.preventDefault();

  const message = "Please enter valid details";
  let errorObj = {};
  if (_.isEmpty(taxData.tax_name)) {
    errorObj = { ...errorObj, tax_name: message };
  }
  if (_.isEmpty(taxData.tax_percentage)) {
    errorObj = { ...errorObj, tax_percentage: message };
  }
  setValidationError(errorObj);
  if (!_.isEmpty(errorObj)) {
    setValidationError(errorObj);
  } else {
    setLoading(true)
    let data = {
      'update':true,
      "tax_id":taxData.tax_id,
      "tax_name":taxData.tax_name,
      "tax_percentage":taxData.tax_percentage,
      "isactive":taxData.isactive,
      "tax_notes":taxData.tax_notes,
      "loggedinuserid": getCurrentUserDetails()?.id,
      'createduserid':currentUserDetails.id,
      // 'file_name': uploadedFile?.name ? uploadedFile?.name : '',
      // 'doc_kind': uploadedFile?.name ? uploadedFile?.name : '',
      // 'document_content': uploadedFile?.file ? uploadedFile?.file : '',
      }
    console.log('data::', data)
    try {
      let response = await CreateEditTaxMaster(data);
      if (response) {
        setSnack({
          open: true,
          message: "Tax Information Created Successfully",
        });
        setTaxData({});
        setTimeout(() => {
          props.back();
        }, 1500);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: "error",
      });
    }
    finally {
      setLoading(false);
    }
  }
};

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
        <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Tax Information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload} />
        </AccordionDetails>
      </Accordion>
{/* 
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Tax Information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload4} />
        </AccordionDetails>
      </Accordion> */}

      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={editTaxAction} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
      </Grid>

    </form>
  );
};

export default EditTax;
