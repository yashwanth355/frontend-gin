import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { getProductAndCategory, createorupdateSampleLineItem } from "../../../apis";
import _ from "lodash";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import AuditLog from "./AuditLog";
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
    "& #top-row": {
      marginTop: 10,
      marginBottom: 5,
    },
  },
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key]}))
    return formattedData;
}

const currentDate = () => {
  // 2019-07-25 17:31:46.967
  var dateVal = new Date();
  return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const EditSampleItem = (props) => {
  const classes = useStyles();
  const [sample, setSampleInfo] = useState({});
  const [productType, setProductType] = useState([]);
  const [sampleCategoryList, setSampleCategoryList] = useState([]);
  const [validationError, setValidationError] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    let temp = {...props.data};
    temp.product_id = {label: temp.product_type, value: temp.product_id};
    temp.sample_catid = {label: temp.sample_category, value: temp.sample_catid};
    setSampleInfo(temp);
  }, [props.data]);

  useEffect(() => {
    async function fetchData() {
      let data = await getProductAndCategory({});
      setProductType(
        formatToSelection(data.product_type, "product_name", "product_id")
      );
      setSampleCategoryList(
        formatToSelection(
          data.sample_category,
          "sample_category",
          "samplecat_id"
                    
        )
      );
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    if(key === 'targetprice_enabled' && value === 'No'){
      setSampleInfo({
        ...sample,
        [key]: value,
        'target_price': '',
      });
     } else {
        setSampleInfo({
          ...sample,
          [key]: value,
        });
    }
  };

  const handleProductIdChange = (e, value) => {
    setSampleInfo({
      ...sample,
      'product_id': value,
    });
  };

  const handleSampleCatIdChange = (e, value) => {
    setSampleInfo({
      ...sample,
      'sample_catid': value,
    });
  };  
  
  const payload = [
    {
      label: "Product Type",
      type: 'autocomplete',  
      labelprop: "label", 
      required: true,
      value: sample.product_id ? sample.product_id : '',
      error: validationError?.product_id,
      helperText: validationError?.product_id,
      options: productType || [],
      onChange: handleProductIdChange,
    },
    {
      label: "Description",
      type: "input",
      multiline: true,
      rows: 3,
      value: sample.description || "",
      error: validationError?.description,
      helperText: validationError?.description,
      required: true,
      onChange: (e) => handleChange(e, "description"),
    },
    {
      label: "Target",
      type: "radio",
      value: (sample.targetprice_enabled === true || sample.targetprice_enabled === 'Yes') ? 'Yes' : 'No',
      defaultValue: 'No',
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      onChange: (e) => handleChange(e, "targetprice_enabled"),
      sm: 6,
    },
    {
      label: (sample.targetprice_enabled === true || sample.targetprice_enabled === 'Yes') ? "Target Price" : "No Target Price",
      type: "input",
      disabled: (sample.targetprice_enabled === true || sample.targetprice_enabled === 'Yes') ? false : true,
      value: sample.target_price,
      onChange: (e) => handleChange(e, "target_price"),
    },
    {
      label: "Sample category",
      type: 'autocomplete',  
      labelprop: "label", 
      required: true,
      value: sample.sample_catid ? sample.sample_catid : '',
      error: validationError?.sample_catid,
      helperText: validationError?.sample_catid,
      options: sampleCategoryList || [], 
      onChange: handleSampleCatIdChange,
    }
  ];

  const submitSample = async () => {
    let error = {},
      message = "Please fill valid details";
    if (!sample.sample_catid || sample.sample_catid === "") {
      error = { ...error, sample_catid: message };
    }
    if (!sample.product_id || sample.product_id === "") {
      error = { ...error, product_id: message };
    }
    if (!sample.description || sample.description === "") {
      error = { ...error, description: message };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        "update":true,
        "lineitem_id": props.id,
        "sample_reqid":props.sampleid.toString(),
        "product_id":sample.product_id?.value.toString(),
        "sample_catid":sample.sample_catid?.value.toString(),
        "description":sample.description,
        "targetprice_enabled": sample.targetprice_enabled ? (sample.targetprice_enabled === 'Yes' || sample.targetprice_enabled === true) ? true : false : false,
        "target_price": sample.target_price ? sample.target_price : '',
        "modified_date":currentDate(),
        "modified_byuser": localStorage.getItem('currentUserName'),
        "modified_byuserid": localStorage.getItem('currentUserId'),
        "loggedinuserid": localStorage.getItem('currentUserId'),
      };
      setLoading(true);
      try {
        let response = await createorupdateSampleLineItem(data);
          if (response) {
            setSnack({
              open: true,
              message: "Sample updated successfully",
            });
            setTimeout(() => {
              props.back();
            }, 2000);
          }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      }
      finally{
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
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Sample request information</Typography>
        </Grid>
      </Grid>
      <Template payload={payload} />
      <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
              </Grid>
            </Grid>
            <AuditLog data={sample.audit_log} />
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading...":"Save"} onClick={submitSample} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => props.back()} />
        </Grid>
      </Grid>
    </form>
  );
};

export default EditSampleItem;
