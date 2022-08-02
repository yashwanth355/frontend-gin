import React, { useEffect, useState } from "react";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Template from "../../../components/Template";
import Button from "../../../components/Button";
import {
  getStateNames,
  getCityNames,
  getCountryNames,
  CreateOrEditSupplier,
} from "../../../apis";
import AuditLog from "./AuditLog";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import { useParams, useNavigate } from "react-router-dom";
import { routeBuilder } from "../../../utils/routeBuilder";

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

export default function EditSupplier(props) {
  const { supplierId } = useParams();
  const classes = useStyles();
  const [validationError, setValidationError] = useState({});
  const [countryList, setCountryList] = useState([]);
  const [stateName, setStateName] = useState([]);
  const [cities, setCityName] = useState([]);
  const [supplierDetails, setSupplierDetails] = useState([]);
  const [logData, setLogData] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getSupplierData = async () => {
    let temp = await CreateOrEditSupplier({ "view": true, "vendor_id": supplierId });
    setLogData(temp.audit_log_vendor)
    temp.country = { label: temp.country, value: temp.country };
    temp.City = { label: temp.City, value: temp.City };
    temp.state = { label: temp.state, value: temp.state };

    getCountryNames().then((res) => {
      setCountryList(formatToSelection(res, "country"));
    });

    if (temp.country !== "") {
      getStateNames({ countryname: temp.country })
        .then((res) => setStateName(formatToSelection(res, "state")))
        .catch((err) => console.log("Get state error", err.message));
    }
    if (temp.state !== '') {
      getCityNames({ statename: temp.state })
        .then((res) => setCityName(formatToSelection(res, "city")))
        .catch((err) => console.log("Get state error", err.message));
    }
    setSupplierDetails(temp)
  }
  useEffect(() => {
    getSupplierData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  //   getTopMrinDetails({
  //     "type":"topmrinrecord",
  //     "gcitem_id":res.item_id ,
  //     "po_date": res.po_date
  // }).then(mrin => {
  //     if(mrin?.gcitem_id){
  //         let data = {
  //             ...mrin,
  //             "number": 1
  //         }
  //         setMrinList([data]);
  //     }      else{
  //         setMrinList(null);
  //     }
  // });


  const handleContactInformation = (event, key) => {
    setSupplierDetails({
      ...supplierDetails,
      [key]: event.target.value,
    });
    if (key === "country") {
      getStateNames({ countryname: event.target.value })
        .then((res) => setStateName(formatToSelection(res, "state")))
        .catch((err) => console.log("Get state error", err.message));
    }
    if (key === "state") {
      getCityNames({ statename: event.target.value })
        .then((res) => setCityName(formatToSelection(res, "city")))
        .catch((err) => console.log("Get state error", err.message));
    }
  };

  const handleBank = (event, key) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...supplierDetails,
      [key]: event.target.value,
    };
    setSupplierDetails(data);
  };

  const updateSupplier = async (e) => {
    e.preventDefault();
    let data = {
      "update": true,
      "updated_by": localStorage.getItem('currentUserId'),
      "loggedinuserid": localStorage.getItem('currentUserId'),
      "vendor_id": supplierDetails.vendor_id,
      "vendor_name": supplierDetails.vendor_name,

      "vendor_type": 0,
      "vendor_cat_name": 0,
      "vendor_group": supplierDetails.vendor_group_id,

      "lastvendorid": supplierDetails.lastvendorid,
      "vendor_type_id": supplierDetails.vendor_type_id,
      "vendor_cat_id": supplierDetails.vendor_cat_id,
      "vendor_group_id": supplierDetails.vendor_group_id,
      "isactive": supplierDetails?.isactive,
      "pan_no": supplierDetails.pan_no,
      "tan": supplierDetails.tan,
      "cin": supplierDetails.cin,
      "tds": supplierDetails?.tds,
      "gst_no": supplierDetails.gst_no,
      "msmessi": supplierDetails.msmessi,
      "bank_name": supplierDetails.bank_name,
      "branch": supplierDetails.branch,
      "account_type": supplierDetails.account_type,
      "account_number": supplierDetails.account_number,
      "ifsc_code": supplierDetails.ifsc_code,
      "micr_code": supplierDetails.micr_code,
      "contact_name": supplierDetails.contact_name,
      "address1": supplierDetails.address1,
      "address2": supplierDetails.address2,
      "city": supplierDetails.City?.value,
      "pincode": supplierDetails.pincode,
      "state": supplierDetails.state?.value,
      "country": supplierDetails.country?.value,
      "phone": supplierDetails.phone,
      "mobile": supplierDetails.mobile,
      "email": supplierDetails.email,
      "website": supplierDetails.website,
      "modifieduserid": localStorage.getItem("currentUserId")
    };
    //modifieduserid added
    const message = "Please enter valid details";
    let errorObj = {};

    if (_.isEmpty(supplierDetails.vendor_name)) {
      errorObj = { ...errorObj, vendor_name: message };
    }
    if (_.isEmpty(supplierDetails.contact_name)) {
      errorObj = { ...errorObj, contact_name: message };
    }
    if (supplierDetails.vendor_type_id !== '1001' && _.isEmpty(supplierDetails.pan_no)) {
      errorObj = { ...errorObj, pan_no: message };
    }
    if (supplierDetails.vendor_type_id !== '1001' && _.isEmpty(supplierDetails.gst_no)) {
      errorObj = { ...errorObj, gst_no: message };
    }
    if (supplierDetails.vendor_type_id !== '1001' && _.isEmpty(supplierDetails.msmessi)) {
      errorObj = { ...errorObj, msmessi: message };
    }
    if (_.isEmpty(supplierDetails.vendor_group_id)) {
      errorObj = { ...errorObj, vendor_group_id: message };
    }
    if (_.isEmpty(supplierDetails.vendor_type_id)) {
      errorObj = { ...errorObj, vendor_type_id: message };
    }
    if (_.isEmpty(supplierDetails.vendor_cat_id)) {
      errorObj = { ...errorObj, vendor_cat_id: message };
    }
    if (_.isEmpty(supplierDetails.phone)) {
      errorObj = { ...errorObj, phone: message };
    }
    if (supplierDetails.vendor_type_id !== '1001' && _.isEmpty(supplierDetails.pincode)) {
      errorObj = { ...errorObj, pincode: message };
    }
    if (_.isEmpty(supplierDetails.address1)) {
      errorObj = { ...errorObj, address1: message };
    }
    if (_.isEmpty(supplierDetails.address2)) {
      errorObj = { ...errorObj, address2: message };
    }
    if (_.isEmpty(supplierDetails.email)) {
      errorObj = { ...errorObj, email: message };
    }
    if (!(_.isEmpty(supplierDetails.email)) && !(/^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(supplierDetails.email))) {
      errorObj = { ...errorObj, email: 'Please Enter Correct Email Format' };
    }

    setValidationError(errorObj);
    if (_.isEmpty(errorObj)) {
      setLoading(true);
      try {
        let response = await CreateOrEditSupplier(data);
        if (response) {
          setSnack({
            open: true,
            message: response.status === 230 ? 'Supplier with same name already exists' : 'Supplier Updated successfully',
            severity: response.status === 230 ? "error" : "success",
          });
          setSupplierDetails({});
          // setApprover({});
          setTimeout(() => {
            navigate(routeBuilder('supplier',supplierId, 'view'), { replace: true });
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
    else {
      setSnack({
        open: true,
        message: 'Please fill all mandatory fields',
        severity: 'error'
      })
      setTimeout(() => {
        setSnack({
          open: false
          , message: "",
        })
      }, [2000])
    }
  };

  //static data
  const vg = [
    { value: "FAC-9", label: "Instant Coffee Supplier" },
    {
      value: "FAC-3",
      label: "Indigenous Green Coffee Supplier",
    },
    {
      value: "FAC-2",
      label: "Imported Green Coffee Supplier",
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

  const VendorTypeChange = (event, value) => {
    let data = {
      ...supplierDetails,
      'vendor_type_id': event.target.value
    };
    setSupplierDetails(data);
    // var temp = vt.filter(v => v.value === value.value);
    // setVendorTypeId(value.label);
  };

  const VendorCatChange = (event, value) => {
    let data = {
      ...supplierDetails,
      'vendor_cat_id': event.target.value,
    };
    setSupplierDetails(data);
    // var temp = vc.filter(v => v.value === value.value);
    // setVendorCatId(value.label);
  };

  const GroupChange = (event, value) => {
    let data = {
      ...supplierDetails,
      'vendor_group_id': event.target.value,
    };
    setSupplierDetails(data);
    // var temp = vg.filter(v => v.value === value.value);
    // setVendorGroupId(value.label);
  };

  const handleCountryInformation = (e, value) => {
    let data = {
      ...supplierDetails,
      'country': value,
    };
    if (value?.value) {
      getStateNames({ countryname: value.value })
        .then((res) => setStateName(formatToSelection(res, "state")))
        .catch((err) => console.log("Get state error", err.message));
    }
    else {
      setStateName([]);
      setCityName([]);
      data.state = null;
      data.City = null;
    }
    setSupplierDetails(data);
  };

  const handleStateInformation = (e, value) => {
    let data = {
      ...supplierDetails,
      'state': value,
    };
    if (value?.value)
      getCityNames({ statename: value.value })
        .then((res) => setCityName(formatToSelection(res, "city")))
        .catch((err) => console.log("Get state error", err.message));
    else {
      setCityName([]);
      data.City = null;
    }
    setSupplierDetails(data);
  };

  const handleCityInformation = (e, value) => {
    let data = {
      ...supplierDetails,
      'City': value,
    };
    setSupplierDetails(data);
  };
  const handleActiveChange = (active) => {
    setSupplierDetails({ ...supplierDetails, isactive: !active })
  }
  const payload = [
    {
      label: "Supplier name",
      type: "input",
      value: supplierDetails.vendor_name,
      required: true,
      error: validationError?.vendor_name,
      helperText: validationError?.vendor_name,
      onChange: (e) => handleContactInformation(e, "vendor_name"),
    },
    {
      label: "Supplier type",
      type: 'select',
      value: supplierDetails.vendor_type_id ? supplierDetails.vendor_type_id : '',
      required: true,
      options: vt || [],
      error: validationError?.vendor_type_id,
      helperText: validationError?.vendor_type_id,
      onChange: (e) => VendorTypeChange(e, "vendor_name"),
    },
    {
      label: "Supplier category",
      type: 'select',
      value: supplierDetails.vendor_cat_id ? supplierDetails.vendor_cat_id : '',
      required: true,
      options: vc || [],
      error: validationError?.vendor_cat_id,
      helperText: validationError?.vendor_cat_id,
      onChange: (e) => VendorCatChange(e, "vendor_name"),
    },
    {
      label: "Supplier group",
      type: 'select',
      value: supplierDetails.vendor_group_id ? supplierDetails.vendor_group_id : '',
      required: true,
      options: vg || [],
      error: validationError?.vendor_group_id,
      helperText: validationError?.vendor_group_id,
      onChange: (e) => GroupChange(e, "vendor_name"),
    },
    {
      label: "",
      value: "",
      sm: 6,
    },
    {
      label: "Is Active",
      type: "checkbox",
      value: true,
      checked: supplierDetails?.isactive === true ? true : false,
      sm: 6,
      onChange: () => handleActiveChange(supplierDetails?.isactive)
    },
  ];
  const payload1 = [
    {
      label: "Contact name",
      type: "input",
      value: supplierDetails.contact_name,
      required: true,
      error: validationError?.contact_name,
      helperText: validationError?.contact_name,
      onChange: (e) => handleContactInformation(e, "contact_name"),
    },
    {
      label: "Address1",
      type: "input",
      value: supplierDetails.address1,
      required: true,
      error: validationError?.address1,
      helperText: validationError?.address1,
      onChange: (e) => handleContactInformation(e, "address1"),
    },
    {
      label: "Address2",
      type: "input",
      value: supplierDetails.address2,
      required: true,
      error: validationError?.address2,
      helperText: validationError?.address2,
      onChange: (e) => handleContactInformation(e, "address2"),
    },
    {
      label: "Country",
      type: 'autocomplete',
      labelprop: "label",
      value: supplierDetails.country ? supplierDetails.country : '',
      options: countryList || [],
      onChange: handleCountryInformation,
    },
    {
      label: "State",
      type: 'autocomplete',
      labelprop: "label",
      value: supplierDetails.state ? supplierDetails.state : '',
      options: stateName || [],
      onChange: handleStateInformation,
    },
    {
      label: "City",
      type: 'autocomplete',
      labelprop: "label",
      value: supplierDetails.City ? supplierDetails.City : '',
      options: cities || [],
      onChange: handleCityInformation,
    },
    {
      label: "Pin code",
      type: "number",
      value: supplierDetails.pincode,
      required: supplierDetails.pincode === '1001' ? false : true,
      error: supplierDetails.pincode === '1001' ? '' : validationError?.pan_no,
      helperText: supplierDetails.pincode === '1001' ? '' : validationError?.pan_no,
      onChange: (e) => handleContactInformation(e, "pincode"),
    },
    {
      label: "Phone",
      type: "number",
      value: supplierDetails.phone,
      required: true,
      error: validationError?.phone,
      helperText: validationError?.phone,
      onChange: (e) => handleContactInformation(e, "phone"),
    },
    {
      label: "Mobile",
      type: "number",
      value: supplierDetails.mobile,
      onChange: (e) => handleContactInformation(e, "mobile"),
    },
    {
      label: "Email",
      type: "input",
      value: supplierDetails.email,
      required: true,
      error: validationError?.email,
      helperText: validationError?.email,
      onChange: (e) => handleContactInformation(e, "email"),
    },
    {
      label: "Website",
      type: "input",
      value: supplierDetails.website,
      onChange: (e) => handleContactInformation(e, "website"),
    },
  ];



  const payload2 = [
    {
      label: "PAN no",
      type: "input",
      value: supplierDetails.pan_no, //supplierDetails.vendor_id
      required: supplierDetails.vendor_type_id === '1001' ? false : true,
      error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      onChange: (e) => handleContactInformation(e, "pan_no"),
    },
    {
      label: "GST identification no",
      type: "input",
      value: supplierDetails.gst_no,
      required: supplierDetails.vendor_type_id === '1001' ? false : true,
      error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.gst_no,
      helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.gst_no,
      onChange: (e) => handleContactInformation(e, "gst_no"),
    },
    {
      label: "MSME/SSI",
      type: "input",
      value: supplierDetails.msmessi,
      required: supplierDetails.vendor_type_id === '1001' ? false : true,
      error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.msmessi,
      helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.msmessi,
      onChange: (e) => handleContactInformation(e, "msmessi"),
    },
    {
      label: "CIN no",
      type: "input",
      value: supplierDetails.cin, //supplierDetails.vendor_id
      // required: supplierDetails.vendor_type_id === '1001' ? false : true,
      // error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      // helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      onChange: (e) => handleContactInformation(e, "cin"),
    },
    {
      label: "TAN no",
      type: "input",
      value: supplierDetails.tan, //supplierDetails.vendor_id
      // required: supplierDetails.vendor_type_id === '1001' ? false : true,
      // error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      // helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      onChange: (e) => handleContactInformation(e, "tan"),
    },
    {
      label: "TDS(%)",
      type: "input",
      value: supplierDetails.tds, //supplierDetails.vendor_id
      // required: supplierDetails.vendor_type_id === '1001' ? false : true,
      // error: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      // helperText: supplierDetails.vendor_type_id === '1001' ? '' : validationError?.pan_no,
      onChange: (e) => handleContactInformation(e, "tds"),
    },
  ];

  const payload3 = [
    {
      label: "Bank name",
      type: "input",
      value: supplierDetails.bank_name,
      onChange: (e) => handleBank(e, "bank_name"),
    },
    {
      label: "Branch",
      type: "input",
      value: supplierDetails.branch,
      onChange: (e) => handleBank(e, "branch"),
    },
    {
      label: "Account type",
      type: "input",
      value: supplierDetails.account_type,
      onChange: (e) => handleBank(e, "account_type"),
    },
    {
      label: "Account number",
      type: "input",
      value: supplierDetails.account_number,
      onChange: (e) => handleBank(e, "account_number"),
    },
    {
      label: "IFSC code",
      type: "input",
      value: supplierDetails.ifsc_code,
      onChange: (e) => handleBank(e, "ifsc_code"),
    },
    {
      label: "MICR code",
      type: "input",
      value: supplierDetails.micr_code,
      onChange: (e) => handleBank(e, "micr_code"),
    },
  ];

  // const CreateRecordClick = () => {
  //   setShowAddRecord(!showAddRecord);
  // };

  // const recordTableColumns = [
  //   { id: "name", label: "Name" },
  //   { id: "credit", label: "Credit Amount" },
  //   { id: "debit", label: "Debit Amount" },
  // ];

  // const moqTableColumns = [
  //   { id: "name", label: "MOQId Sno" },
  //   { id: "credit", label: "Vendor Name" },
  //   { id: "debit", label: "Item Name" },
  //   { id: "debit", label: "MOQ qty" },
  //   { id: "debit", label: "Created By" },
  //   { id: "debit", label: "Created Date" },
  //   { id: "debit", label: "Modified By" },   
  //   { id: "debit", label: "Modified Name" }    
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
              <Template payload={payload} />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Contact information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Template payload={payload1} />
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
                <Template payload={payload2} />
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
              <Template payload={payload3} />
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
              <Button label="Back" onClick={() => navigate(-1)} />
            </Grid>
            <Grid item>
              <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={updateSupplier} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>


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
                {!showAddRecord && (
                  <Grid item md={12} xs={12}>
                    <Grid container style={{ margin: 6 }}>
                      <Grid item md={6} xs={6}></Grid>
                      <Grid item md={6} xs={6} style={{ textAlign: "right" }}>
                        <Fab
                          onClick={() => CreateRecordClick()}
                          label={"Add New Record"}
                          variant="extended"
                        />
                      </Grid>
                    </Grid>
                    <Grid id="top-row" container style={{ margin: 6 }}>
                      <Grid item md={12} xs={12} className="item">
                        <BasicTable
                          rows={recordsTableData}
                          columns={recordTableColumns}
                        ></BasicTable>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                {showAddRecord && (
                  <Grid item md={12} xs={12}>
                    <CreateRecord back={() => CreateRecordClick()} />
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Tab> */}

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
                <Grid item md={12} xs={12}>
                  <BasicTable
                    rows={moqTableData}
                    columns={moqTableColumns}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion> */}

    </form>
  );
}