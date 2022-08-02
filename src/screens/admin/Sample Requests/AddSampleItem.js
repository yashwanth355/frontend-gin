import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import _ from 'lodash';
import { getProductAndCategory, createorupdateSampleLineItem } from "../../../apis";
import Button from "../../../components/Button";
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
    "& #top-row": {
      marginTop: 10,
      marginBottom: 5,
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

const currentDate = () => {
  // 2019-07-25 17:31:46.967
  var dateVal = new Date();
  return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const AddSampleItem = (props) => {
  const classes = useStyles();
  const [sample, setSampleInfo] = useState({});
  const [productType, setProductType] = useState([]);
  const [sampleCategoryList, setSampleCategoryList] = useState([]);
  const [ validationError, setValidationError ] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [disableCreate, setDisableCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    let data = await getProductAndCategory({});
    setProductType(formatToSelection(data.product_type, 'product_name', 'product_id'));
    setSampleCategoryList(formatToSelection(data.sample_category, 'sample_category', 'samplecat_id'));
  }

  useEffect(() => {
    fetchData();
  }, []);

  // const formatSampleDetails = (viewPayload, contacts = {}, key, value) => ({
  //   ...sample,
  //   account: viewPayload.account_id || "",
  //   address: viewPayload.billing_address || "",
  //   contact: contacts[0]?.value || "",
  //   contactList: contacts,
  // });

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
     if(key === 'target' && value === 'No'){
      setSampleInfo({
        ...sample,
        [key]: value,
        'targetprice': '',
      });
     } else {
        setSampleInfo({
          ...sample,
          [key]: value,
        });
    }
  };

  const handleProductChange = (e, value) => {
      setSampleInfo({
        ...sample,
        'product': value,
      });
  };
  
  const handleCategoryChange = (e, value) => {
      setSampleInfo({
        ...sample,
        'category': value,
      });
  };  

  const payload = [
    {
      label: "Product type",
      type: 'autocomplete',  
      labelprop: "label", 
      required: true,
      value: sample.product,
      error: validationError?.product,
      helperText: validationError?.product,
      options: productType || [],
      onChange: handleProductChange,
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
      value: sample.target,
      defaultValue: 'No',
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      onChange: (e) => handleChange(e, "target"),
      sm: 6,
    },
    {
      label: sample.target === "Yes" ? "Target Price" : "No Target Price",
      type: "input",
      disabled: sample.target === "Yes" ? false : true,
      value: sample.targetprice,
      onChange: (e) => handleChange(e, "targetprice"),
    },
    {
      label: "Sample category",
      type: 'autocomplete',  
      labelprop: "label", 
      required: true,
      value: sample.category,
      error: validationError?.category,
      helperText: validationError?.category,
      options: sampleCategoryList || [],
      onChange: handleCategoryChange,
    },
  ];

  const submitSample = async () => {
    let error = {}, message = "Please fill valid details";     
    if(!sample.category || sample.category === '') {
        error = { ...error, category: message };
    }
    if(!sample.product || sample.product === '') {
        error = { ...error, product: message };
    }
    if(!sample.description || sample.description === '') {
        error = { ...error, description: message };
    }
           
    if(!_.isEmpty(error)) {
        setValidationError(error);
    }
    else {
      let data = {
        "sample_reqid":props.sampleid.toString(),
        "product_id": sample.product?.value.toString(),
        "sample_catid": sample.category?.value.toString(),
        "description": sample.description,
        "targetprice_enabled": sample.target ? sample.target === 'Yes' ? true : false : false,
        "target_price": sample.targetprice ? sample.targetprice.toString() : '',
        "created_date":currentDate(),
        "created_byuser": localStorage.getItem('currentUserName'),
        "created_byuserid": localStorage.getItem('currentUserId'),
        "loggedinuserid": localStorage.getItem('currentUserId'),
      };
      setLoading(true);
      setDisableCreate(true);
      try {
        let response = await createorupdateSampleLineItem(data);
        if (response) {
          setSnack({
            open: true,
            message: "Sample line item created successfully",
          });
          setTimeout(() => {
            // props.back();
            // props.CreatedSample()
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
        setDisableCreate(false);
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
          <Typography>Sample request item information</Typography>
        </Grid>
      </Grid>
      <Template payload={payload} />
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Back" onClick={() => props.back()} />
        </Grid>
        <Grid item>
          <Button disabled={disableCreate} label={loading ? "Loading...":"Request Sample Item"} onClick={submitSample} />
        </Grid>
      </Grid>
    </form>
  );
};

export default AddSampleItem;
