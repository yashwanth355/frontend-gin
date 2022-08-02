import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { getProductAndCategory } from "../../../apis";
import _ from "lodash";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import useToken from "../../../hooks/useToken";
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

const EditMasterSampleItem = (props) => {
  const classes = useStyles();
  const { getCurrentUserDetails } = useToken();
  const [sample, setSampleInfo] = useState({});
  const [productType, setProductType] = useState([]);
  const [sampleCategoryList, setSampleCategoryList] = useState([]);
  const [validationError, setValidationError] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
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
    setSampleInfo({
      ...sample,
      [key]: value,
    });
  };

  const handleProductChange = (e, value) => {
    setSampleInfo({
      ...sample,
      'product': value.value,
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
      label: sample.target === "Yes" ? "Target price" : "No Target Price",
      type: "input",
      disabled: sample.target === "Yes" ? false : true,
      value: sample.targetprice,
    },
    {
      label: "Sample category",
      type: "select",
      required: true,
      value: sample.category,
      error: validationError?.category,
      helperText: validationError?.category,
      options: sampleCategoryList || [],
      onChange: (e) => handleChange(e, "category"),
    },
  ];

  const submitSample = async () => {
    let error = {},
      message = "Please fill valid details";
    if (!sample.category || sample.category === "") {
      error = { ...error, category: message };
    }
    if (!sample.product || sample.product === "") {
      error = { ...error, product: message };
    }
    if (!sample.description || sample.description === "") {
      error = { ...error, description: message };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        update: true,
        samplerequestid: props.id,
        accountid: sample.account,
        recordtypeid: sample.recordType,
        contactid: sample.contact,
        shippingAddress: sample.address,
        remarks: sample.remarks,
        "loggedinuserid": getCurrentUserDetails()?.id,
      };
      console.log(data)
      try {
        // let response = await createAccountSample(data);
        // console.log("Response", response);
        // if (response) {
          setSnack({
            open: true,
            message: "Sample updated successfully",
          });
          setTimeout(() => {
            props.back();
          }, 2000);
        // }
      } catch (e) {
        setSnack({
          open: true,
          message: e,
          severity: "error",
        });
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
          <Button label="Save" onClick={submitSample} />
        </Grid>
      </Grid>
    </form>
  );
};

export default EditMasterSampleItem;
