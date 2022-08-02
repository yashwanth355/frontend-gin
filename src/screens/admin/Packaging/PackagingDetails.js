import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  Typography,

  Grid,
  Container,
} from "@material-ui/core";
import { viewPackingRequest, approveNewPackType, rejectNewPackType } from "../../../apis";
import Button from "../../../components/Button";
import "../../common.css";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import { useNavigate, useParams } from "react-router-dom";
import useToken from "../../../hooks/useToken";
import { NEW_PACKTYPE_STATUS, QC_STATUS } from './packagingEnums'
import roles from "../../../constants/roles";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 30,
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
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  card: {
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    marginBottom: 5,
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
const WhiteTextTypography = withStyles({
  root: {
    color: "#F05A30"
  }
})(Typography);

const PackingDetails = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { packagingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [packingDetails, setPackingDetails] = useState({});
  const [submitSample, setSubmitSample] = useState(false);
  const { getCurrentUserDetails } = useToken();
  const [data, setData] = useState({
    height: "",
    width: "",
    length: ""
  })
  const [validationError, setValidationError] = useState(true);
  let currentUserDetails = getCurrentUserDetails();
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const handleChange = (e, key) => {
    let tempData = { ...data, [key]: e.target.value };
    const error = Object.keys(tempData).reduce((total, current) => {
      return total || tempData[current] === ""
    }, false)
    setData(tempData)
    setValidationError(error)
  }
  useEffect(() => {

    viewPackingRequest({
      pack_request_id: packagingId,
    }).then((res) => {
      setPackingDetails(res);

    });
    // eslint-disable-next-line
  }, [packagingId]);

  const payload = [
    {
      type: "label",
      value: "Quote ID",
      bold: true,
      sm: "12",
    },
    {
      type: "label",
      value: packingDetails.quote_id,
      sm: "12",
    }
  ];
  const payload1 = [
    {
      type: "label",
      value: "Quote Item ID",
      bold: true,
      sm: "12",
    },
    {
      type: "label",
      value: packingDetails.quotelineitem_id,
      sm: "12",
    }
  ];
  const payload2 = [
    {
      type: "label",
      value: "Sample Code",
      bold: true,
      sm: "12",
    },
    {
      type: "label",
      value: packingDetails.sample_code,
      sm: "12",
    }
  ];
  const payload4 = [
    {
      type: 'label',
      value: "Packing Category",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.category_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Weight",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.weight_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "No of Secondary Packs/Master Carton",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.noofsecondary_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Carton Type",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.cartontype_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Is Palletization Required?",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.palletizationrequire_id === 1 ? "Yes" : "No",
      sm: '6'
    },
  ];

  const payload5 = [
    {
      type: 'label',
      value: "Packing Type",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.categorytype_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Secondary Packing",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.secondary_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "UPC",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.upc_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Cap Type",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.captype_name,
      sm: '6'
    },
    {
      type: 'label',
      value: "Additional Requirements",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.taskdesc,
      sm: '6'
    },
  ];
  const payload6 = [{
    label: 'Height',
    type: 'number',
    value: data.height || '',
    error: validationError?.height,
    helperText: validationError?.height,
    onChange: (e) => handleChange(e, 'height'),
    required: true,
    disabled: false
  },]
  const payload7 = [{
    label: 'Width',
    type: 'number',
    value: data.width || '',
    error: validationError?.width,
    helperText: validationError?.width,
    onChange: (e) => handleChange(e, 'width'),
    required: true,
    disabled: false
  },]
  const payload8 = [{
    label: 'Length',
    type: 'number',
    value: data.length || '',
    error: validationError?.length,
    helperText: validationError?.length,
    onChange: (e) => handleChange(e, 'length'),
    required: true,
    disabled: false
  },]
  const payload9 = [
    {
      type: 'label',
      value: "Height",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.height,
      sm: '6'
    },
    {
      type: 'label',
      value: "Width",
      bold: true,
      sm: '6'
    },
    {
      type: 'label',
      value: packingDetails.width,
      sm: '6'
    },
  ];
  const payload10 = [{
    type: 'label',
    value: "Length",
    bold: true,
    sm: '6'
  },
  {
    type: 'label',
    value: packingDetails.length,
    sm: '6'
  },]
  const handleClose = () => {
    setSubmitSample(false);
    props.back();
  };


  const requestSampleSuccess = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>Sample request submitted and email sent successfully</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Close" onClick={handleClose} />
        </Grid>
      </Grid>
    </Container>
  );
  const approveNewPackingType = async () => {
    if (validationError && currentUserDetails?.role === roles.managerPurchasePackaging) {
      setSnack({
        message: 'Please fill all mandatory fields to continue', open: true,
        severity: 'error'
      })
      return;
    }
    setIsLoading(true)
    try {
      let finalPayload = {
        "createduserid": currentUserDetails.id,
        "packtype_approve": true,
        "pack_request_id": packagingId,
        "comments": "None"
      }
      if (currentUserDetails?.role === roles.managerPurchasePackaging) {
        finalPayload = { ...finalPayload, ...data }
      }
      await approveNewPackType(finalPayload);
    }
    catch (error) {
      setSnack({ open: true, message: error, severity: 'error' });
      setTimeout(({
        open: false,
        message: 'Server Error. Please contact administrator', //e.response?.data
      }))
    }
    finally {
      setIsLoading(false);
      navigate(-1)
    }
  }
  const rejectNewPackingType = async () => {
    setIsLoading(true)
    try {
      await rejectNewPackType(
        {
          "createduserid": currentUserDetails?.id,
          "packtype_reject": true,
          "pack_request_id": packagingId,
          "comments": "None"
        })
    }
    catch (error) {
      setSnack({ open: true, message: error, severity: 'error' });
      setTimeout(({
        open: false,
        message: 'Server Error. Please contact administrator', //e.response?.data
      }))
    }
    finally {
      setIsLoading(false)
      navigate(-1)
    }
  }

  const ButtonGroup = () => {
    return <React.Fragment>
      <Grid item>
        <Button
          label={"Approve"}
          disabled={isLoading}
          onClick={approveNewPackingType}
        />
      </Grid>
      <Grid item>
        <Button
          label="Reject" disabled={isLoading}

          onClick={rejectNewPackingType}
        />
      </Grid>
    </React.Fragment>
  }
  const getButtonGroup = () => {
    if (currentUserDetails.role === roles.managerPurchasePackaging) {
      if (packingDetails.new_packtype_status === NEW_PACKTYPE_STATUS.newPackTypeRequested) return <ButtonGroup />
    }
    else if (currentUserDetails.role === roles.qcManager) {
      if (packingDetails.new_packtype_status === NEW_PACKTYPE_STATUS.approved && packingDetails.qc_status === QC_STATUS.newPackTypeRequested)
        return <ButtonGroup />
    }
  }
  return (
    <Container className={classes.root}>
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}

      <Grid id="top-row" container>
        <Grid item md={12} xs={12}>
          <WhiteTextTypography variant="h5">
            Quotation Item Details</WhiteTextTypography>
        </Grid>

      </Grid>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={12} md={4} >
          <Template payload={payload} />
        </Grid>
        <Grid id="top-row" xs={12} md={4}>
          <Template payload={payload1} />
        </Grid>
        <Grid id="top-row" xs={12} md={4}>
          <Template payload={payload2} />
        </Grid>
      </Grid>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={12} md={12} direction="column">
          <Grid item md={12} xs={12} className="item">
            <WhiteTextTypography variant="h3">Packaging Type Details</WhiteTextTypography>
          </Grid>
        </Grid>
        <Grid id="top-row" container >
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload4} />
          </Grid>
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload5} />
          </Grid>
        </Grid>
      </Grid>

      <Grid id="top-row" container>
        {(packingDetails.new_packtype_status === NEW_PACKTYPE_STATUS.newPackTypeRequested) &&
          (currentUserDetails.role === roles.managerPurchasePackaging) ? <Grid id="top-row" container >
          <Grid id="top-row" xs={12} md={4} container direction="column">
            <Template payload={payload6} />
          </Grid>
          <Grid id="top-row" xs={12} md={4} container direction="column">
            <Template payload={payload7} />
          </Grid>
          <Grid id="top-row" xs={12} md={4} container direction="column">
            <Template payload={payload8} />
          </Grid>
        </Grid> :
          <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload9} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload10} />
            </Grid>
          </Grid>
        }
      </Grid>
      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <React.Fragment>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            {getButtonGroup()}
            <Button label="Back" onClick={() => navigate(-1)}
              disabled={isLoading} />
          </Grid>
        </React.Fragment>
      </Grid>
      <SimpleModal
        open={submitSample}
        handleClose={handleClose}
        body={requestSampleSuccess}
      />
    </Container >
  );
};
export default PackingDetails;