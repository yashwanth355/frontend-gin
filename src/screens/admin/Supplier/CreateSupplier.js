import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import Template from "../../../components/Template";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@material-ui/core";
import Button from "../../../components/Button";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  getStateNames,
  getCityNames,
  getCountryNames,
  CreateOrEditSupplier
} from "../../../apis";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import useToken from '../../../hooks/useToken';
import { useNavigate } from "react-router-dom";

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

export default function CreateSupplier(props) {
  const classes = useStyles();
  const [validationError, setValidationError] = useState({});
  const [vendorInfo, setVendorInfo] = useState({});
  const [country, setCountry] = useState([]);
  const [stateName, setStateName] = useState([]);
  const [cities, setCityName] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [vendorTypeId, setVendorTypeId] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [vendorCatId, setVendorCatId] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [vendorGroupId, setVendorGroupId] = useState([]);
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();

  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    getCountryNames().then((res) =>
      setCountry(formatToSelection(res, "country"))
    );
  }, []);

  const handleChange = (event, key) => {
    let data = {
      ...vendorInfo,
      [key]: event.target.value,
    };
    setVendorInfo(data);
  };

  const VendorTypeChange = (event, value) => {
    let data = {
      ...vendorInfo,
      'vendorTypeId': value
    };
    setVendorInfo(data);
    // var temp = vt.filter(v => v.value === value.value);
    setVendorTypeId(value?.label);
  };

  const VendorCatChange = (event, value) => {
    let data = {
      ...vendorInfo,
      'vendorCatId': value,
    };
    setVendorInfo(data);
    // var temp = vc.filter(v => v.value === value.value);
    setVendorCatId(value?.label);
  };

  const GroupChange = (event, value) => {
    let data = {
      ...vendorInfo,
      'vendorGroupId': value,
    };
    setVendorInfo(data);
    // var temp = vg.filter(v => v.value === value.value);
    setVendorGroupId(value?.label);
  };

  const handleContactInformation = (event, key) => {
    let data = {
      ...vendorInfo,
      [key]: event.target.value,
    };
    setVendorInfo(data);
  };

  const handleCountryInformation = (e, value) => {
    let data = {
      ...vendorInfo,
      'country': value,
    };
    if (value?.value)
      getStateNames({ countryname: value.value })
        .then((res) => setStateName(formatToSelection(res, "state")))
        .catch((err) => console.log("Get state error", err.message));
    else {
      setStateName([]);
      setCityName([]);
    }
    setVendorInfo(data);
  };

  const handleStateInformation = (e, value) => {
    let data = {
      ...vendorInfo,
      'state': value,
    };
    if (value?.value)
      getCityNames({ statename: value.value })
        .then((res) => setCityName(formatToSelection(res, "city")))
        .catch((err) => console.log("Get state error", err.message));
    else {
      setCityName([])
    }
    setVendorInfo(data);
  };

  const handleCityInformation = (e, value) => {
    let data = {
      ...vendorInfo,
      'city': value,
    };
    setVendorInfo(data);
  };

  const handleIdentificationNo = (event, key) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...vendorInfo,
      [key]: event.target.value,
    };
    setVendorInfo(data);
  };

  const handleBank = (event, key) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...vendorInfo,
      [key]: event.target.value,
    };
    setVendorInfo(data);
  };
  const createSupplier = async (e) => {
    e.preventDefault();
    let data = {
      create: true,
      createduserid: currentUserDetails.id,
      "loggedinuserid": getCurrentUserDetails()?.id,
      vendor_name: vendorInfo.VendorName,
      vendor_type_id: vendorInfo.vendorTypeId?.value,
      vendor_cat_id: vendorInfo.vendorCatId?.value,
      vendor_group_id: vendorInfo.vendorGroupId?.value,
      contact_name: vendorInfo.ContactName,
      address1: vendorInfo.Address1,
      address2: vendorInfo.Address2,
      city: vendorInfo.city?.value,
      pincode: vendorInfo.Pincode,
      state: vendorInfo.state?.value,
      country: vendorInfo.country?.value,
      phone: vendorInfo.Phone,
      mobile: vendorInfo.Mobile,
      email: vendorInfo.Email,
      website: vendorInfo.Website,
      pan_no: vendorInfo.PanNo,
      cin: vendorInfo.cin,
      tan: vendorInfo.tan,
      tds: vendorInfo?.tds,
      gst_no: vendorInfo.GstIdentificationNo,
      msmessi: vendorInfo.MsmeSsi,
      bank_name: vendorInfo.BankName,
      branch: vendorInfo.Branch,
      account_type: vendorInfo.AccountType,
      account_number: vendorInfo.AccountNumber,
      ifsc_code: vendorInfo.IfscCode,
      micr_code: vendorInfo.MicrCode,
      isactive: true,
    };
    const message = "Please enter valid details";
    let errorObj = {};

    if (_.isEmpty(vendorInfo.VendorName)) {
      errorObj = { ...errorObj, VendorName: message };
    }
    if (_.isEmpty(vendorInfo.ContactName)) {
      errorObj = { ...errorObj, ContactName: message };
    }
    if (vendorInfo.vendorTypeId?.value !== '1001' && _.isEmpty(vendorInfo.PanNo)) {
      errorObj = { ...errorObj, PanNo: message };
    }
    if (vendorInfo.vendorTypeId?.value !== '1001' && _.isEmpty(vendorInfo.GstIdentificationNo)) {
      errorObj = { ...errorObj, GstIdentificationNo: message };
    }
    if (vendorInfo.vendorTypeId?.value !== '1001' && _.isEmpty(vendorInfo.MsmeSsi)) {
      errorObj = { ...errorObj, MsmeSsi: message };
    }
    if (_.isEmpty(vendorInfo.vendorGroupId)) {
      errorObj = { ...errorObj, vendorGroupId: message };
    }
    if (_.isEmpty(vendorInfo.vendorTypeId)) {
      errorObj = { ...errorObj, vendorTypeId: message };
    }
    if (_.isEmpty(vendorInfo.vendorCatId)) {
      errorObj = { ...errorObj, vendorCatId: message };
    }
    if (_.isEmpty(vendorInfo.Phone)) {
      errorObj = { ...errorObj, Phone: message };
    }
    if (vendorInfo.vendorTypeId?.value !== '1001' && _.isEmpty(vendorInfo.Pincode)) {
      errorObj = { ...errorObj, Pincode: message };
    }
    if (_.isEmpty(vendorInfo.Address1)) {
      errorObj = { ...errorObj, Address1: message };
    }
    if (_.isEmpty(vendorInfo.Address2)) {
      errorObj = { ...errorObj, Address2: message };
    }
    if (_.isEmpty(vendorInfo.Email)) {
      errorObj = { ...errorObj, Email: message };
    }
    if (!(_.isEmpty(vendorInfo.Email)) && !(/^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(vendorInfo.Email))) {
      errorObj = { ...errorObj, Email: 'Please Enter Correct Email Format' };
    }

    console.log("validationError", errorObj);
    setValidationError(errorObj);
    if (_.isEmpty(errorObj)) {
      setLoading(true);
      try {
        let response = await CreateOrEditSupplier(data);
        if (response) {
          setSnack({
            open: true,
            message: response.status === 230 ? 'Supplier with same name already exists' : 'Supplier Created successfully',
            severity: response.status === 230 ? "error" : "success",
          });
          setVendorInfo({});
          setTimeout(() => {
            // navigate(-1)
          }, 1500);
        }
      } catch (e) {
        console.log("Error in creating Supplier", e.message);
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
  //static data
  const vg = [
    { value: "FAC-9", label: "Instant Coffee Suppliers" },
    {
      value: "FAC-3",
      label: "Indigenous Green Coffee Suppliers",
    },
    {
      value: "FAC-2",
      label: "Imported Green Coffee Suppliers",
    },
    {
      value: "FAC-20",
      label: "Indigenous Other Raw Material Suppliers",
    },
    {
      value: "FAC-21",
      label: "Imported Other Raw Material Suppliers",
    },
    { value: "FAC-1", label: 'GENERAL'},
    { value: "FAC-10", label: 'STORES & SPARES SUPPLIERS'},
    { value: "FAC-11", label: 'INDEGENIOUS MAINTENCE SUPPLIERS'},
    { value: "FAC-12", label: 'IMPORTED MAINTENANCE SUPPLIERS'},
    { value: "FAC-13", label: 'CAPITAL GOODS SUPPLIERS'},
    { value: "FAC-14", label: 'IMPORTED CAPITAL GOODS SUPPLIERS'},
    { value: "FAC-15", label: 'INDEGENIOUS CAPITAL GOODS SUPPLIERS'},
    { value: "FAC-16", label: 'SERVICES CREDITORS'},
    { value: "FAC-17", label: 'SUNDRY CREDITORS FOR EXPENSES'},
    { value: "FAC-18", label: 'HUSK SUPPLIER'},
    { value: "FAC-19", label: 'INSURANCE PROVIDERS'},
    { value: "FAC-20", label: 'OTHER RAW MATERIALS'},
    { value: "FAC-21", label: 'CANTEEN'},
    { value: "FAC-22", label: 'CAP SUPPLIERS'},
    { value: "FAC-23", label: 'CARTON SUPPLIERS'},
    { value: "FAC-24", label: 'PALLET SUPPLIERS'},
    { value: "FAC-25", label: 'FLAVOURS'},
    { value: "FAC-5", label: 'PACKING MATERIAL SUPPLIERS'},
    { value: "FAC-6", label: 'RAW MATERIAL SUPPLIERS'},
    { value: "FAC-7", label: 'INDEGENIOUS PACKING MATERIAL'},
    { value: "FAC-8", label: 'IMPORTED PACKING MATERIAL'},
  ];

  const vc = [
    { value: "1", label: "Company" },
    { value: "2", label: "Non Company" },
    // { value: "3", label: "MSME" },
  ];
  const vt = [
    { value: "1001", label: "Import" },
    { value: "1002", label: "Domestic" },
  ];
  const payload37 = [
    {
      label: "Supplier name",
      type: "input",
      value: vendorInfo.VendorName,
      required: true,
      error: validationError?.VendorName,
      helperText: validationError?.VendorName,
      onChange: (e) => handleChange(e, "VendorName"),
      sm: 6,
    },
    {
      label: "Supplier type",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.vendorTypeId,
      options: vt || [],
      required: true,
      error: validationError?.vendorTypeId,
      helperText: validationError?.vendorTypeId,
      onChange: VendorTypeChange,
      sm: 6,
    },
    {
      label: "Supplier category",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.vendorCatId,
      options: vc || [],
      required: true,
      error: validationError?.vendorCatId,
      helperText: validationError?.vendorCatId,
      onChange: VendorCatChange,
      sm: 6,
    },
    {
      label: "Supplier group",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.vendorGroupId,
      options: vg || [],
      required: true,
      error: validationError?.vendorGroupId,
      helperText: validationError?.vendorGroupId,
      onChange: GroupChange,
      sm: 6,
    },

  ]
  const payload36 = [
    {
      label: "Contact name",
      type: "input",
      value: vendorInfo.ContactName,
      required: true,
      error: validationError?.ContactName,
      helperText: validationError?.ContactName,
      onChange: (e) => handleContactInformation(e, "ContactName"),
      sm: 6,
    },
    {
      label: "Address1",
      type: "input",
      value: vendorInfo.Address1,
      required: true,
      error: validationError?.Address1,
      helperText: validationError?.Address1,
      onChange: (e) => handleContactInformation(e, "Address1"),
      sm: 6,
    },
    {
      label: "Address2",
      type: "input",
      value: vendorInfo.Address2,
      required: true,
      error: validationError?.Address2,
      helperText: validationError?.Address2,
      onChange: (e) => handleContactInformation(e, "Address2"),
      sm: 6,
    },
    {
      label: "Country",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.country,
      options: country || [],
      onChange: handleCountryInformation,
      sm: 6,
    },
    {
      label: "State",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.state,
      options: stateName || [],
      onChange: handleStateInformation,
      sm: 6,
    },
    {
      label: "City",
      type: 'autocomplete',
      labelprop: "label",
      value: vendorInfo.city,
      options: cities || [],
      onChange: handleCityInformation,
      sm: 6,
    },
    {
      label: "Pincode",
      type: "number",
      value: vendorInfo.Pincode,
      required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.Pincode,
      helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.Pincode,
      onChange: (e) => handleContactInformation(e, "Pincode"),
      sm: 6,
    },
    {
      label: "Phone",
      type: "number",
      value: vendorInfo.Phone,
      required: true,
      error: validationError?.Phone,
      helperText: validationError?.Phone,
      onChange: (e) => handleContactInformation(e, "Phone"),
      sm: 6,
    },
    {
      label: "Mobile",
      type: "number",
      value: vendorInfo.Mobile,
      required: false,
      error: validationError?.Mobile,
      helperText: validationError?.Mobile,
      onChange: (e) => handleContactInformation(e, "Mobile"),
      sm: 6,
    },
    {
      label: "Email",
      type: "input",
      value: vendorInfo.Email,
      required: true,
      error: validationError?.Email,
      helperText: validationError?.Email,
      onChange: (e) => handleContactInformation(e, "Email"),
      sm: 6,
    },
    {
      label: "Website",
      type: "input",
      value: vendorInfo.Website,
      required: false,
      error: validationError?.Website,
      helperText: validationError?.Website,
      onChange: (e) => handleContactInformation(e, "Website"),
      sm: 6,
    },
  ]
  const payload35 = [
    {
      label: "PAN no",
      type: "input",
      value: vendorInfo.PanNo,
      required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.PanNo,
      helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.PanNo,
      onChange: (e) => handleIdentificationNo(e, "PanNo"),
      sm: 6,
    },
    {
      label: "GST identification no",
      type: "input",
      value: vendorInfo.GstIdentificationNo,
      required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.GstIdentificationNo,
      helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.GstIdentificationNo,
      onChange: (e) => handleIdentificationNo(e, "GstIdentificationNo"),
      sm: 6,
    },
    {
      label: "MSME/SSI",
      type: "input",
      value: vendorInfo.MsmeSsi,
      required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      onChange: (e) => handleIdentificationNo(e, "MsmeSsi"),
      sm: 6,
    },
    {
      label: "CIN no",
      type: "input",
      value: vendorInfo.cin,
      // required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      // error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      // helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      onChange: (e) => handleIdentificationNo(e, "cin"),
      sm: 6,
    },
    {
      label: "TAN no",
      type: "input",
      value: vendorInfo.tan,
      // required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      // error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      // helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      onChange: (e) => handleIdentificationNo(e, "tan"),
      sm: 6,
    },
    {
      label: "TDS(%)",
      type: "input",
      value: vendorInfo.tds,
      // required: vendorInfo.vendorTypeId?.value === '1001' ? false : true,
      // error: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      // helperText: vendorInfo.vendorTypeId?.value === '1001' ? '' : validationError?.MsmeSsi,
      onChange: (e) => handleIdentificationNo(e, "tds"),
      sm: 6,
    },
  ];

  const payload34 = [
    {
      label: "Bank name",
      type: "input",
      value: vendorInfo.BankName,
      onChange: (e) => handleBank(e, "BankName"),
    },
    {
      label: "Branch",
      type: "input",
      value: vendorInfo.Branch,
      onChange: (e) => handleBank(e, "Branch"),
    },
    {
      label: "Account type",
      type: "input",
      value: vendorInfo.AccountType,
      onChange: (e) => handleBank(e, "AccountType"),
    },
    {
      label: "Account number",
      type: "number",
      value: vendorInfo.AccountNumber,
      onChange: (e) => handleBank(e, "AccountNumber"),
    },
    {
      label: "IFSC code",
      type: "input",
      value: vendorInfo.IfscCode,
      onChange: (e) => handleBank(e, "IfscCode"),
    },
    {
      label: "MICR code",
      type: "input",
      value: vendorInfo.MicrCode,
      onChange: (e) => handleBank(e, "MicrCode"),
    },
  ]

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
        <Grid item md={12} xs={12}>
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Supplier information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Template payload={payload37} />
            </AccordionDetails>
          </Accordion>
          {/* contact information */}
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Contact information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Template payload={payload36} />
            </AccordionDetails>
          </Accordion>

          {/* identification no */}
          {vendorInfo.vendorTypeId?.value !== '1001' &&
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Identification numbers</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Template payload={payload35} />
              </AccordionDetails>
            </Accordion>
          }

          {/* bank details */}


          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Bank details</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Template payload={payload34} />
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
              <Button label="Back" onClick={() => navigate(-1)} />
            </Grid>
            <Grid item>
              <Button disabled={loading} label={loading ? "Loading..." : "Create"} onClick={createSupplier} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}