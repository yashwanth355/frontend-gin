import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import _ from "lodash";
import {
  createAccountContact,
  getCityNames,
  getCountryNames,
  getStateNames,
} from "../../../apis";
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

const formatToSelection = (data = [], key) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v.id || v[key] }));
  return formattedData;
};

const AddShipping = (props) => {
  const classes = useStyles();
  const [shipping, setShippingInfo] = useState({});
  const [showShipping, setShowShipping] = useState({});
  // eslint-disable-next-line
  const [validationError, setValidationError] = useState({});
  const [loading, setLoading] = useState(false);
  const [disableCreate, setDisableCreate] = useState(false);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const { getCurrentUserDetails } = useToken();
  useEffect(() => {
    getCountryName();
    // eslint-disable-next-line
  }, []);
  const getCountryName = () => {
    getCountryNames().then((res) => {
      let countries = formatToSelection(res, "country");
      setShowShipping({ ...showShipping, country: countries });
      // setShowContact({...showContact, country: countries });
    });
  };

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setShippingInfo({
      ...shipping,
      [key]: value,
    });
  };

  const handleCityChange = (e, value) => {
    setShippingInfo({
   ...shipping,
   'shipping_city': value,
 });
}

  const handleStateChange = (e, value) => {
       setShippingInfo({
      ...shipping,
      'shipping_state': value,
    });
    getCityNames({ statename: value.value })
    .then((res) =>
      setShowShipping({
        ...showShipping,
        city: formatToSelection(res, "city"),
      })
    )
    .catch((err) => console.log("Get state error", err.message));
  }  

  const handleCountryChange = (e, value) => {
       setShippingInfo({
      ...shipping,
      'shipping_country': value,
    });
    getStateNames({ countryname: value.value })
        .then((res) =>
          setShowShipping({
            ...showShipping,
            state: formatToSelection(res, "state"),
          })
        )
        .catch((err) => console.log("Get state error", err.message));
  }

  const handleCheck = (event, key) => {
    let data = {
      ...shipping,
      [key]: event.target.checked,
    };
    setShippingInfo(data);
  };

  const payload = [
    {
      label: "Street name",
      type: "input",
      required: true,
      value: shipping.shipping_street,
      error: validationError?.shipping_street,
      helperText: validationError?.shipping_street,
      onChange: (e) => handleChange(e, "shipping_street"),
    },
    {
      label: "Country",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_country,
      helperText: validationError?.shipping_country,
      value: shipping.shipping_country || "",
      options: showShipping.country || [],
      onChange: handleCountryChange,
    },
    {
      label: "Province/State",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_state,
      helperText: validationError?.shipping_state,
      value: shipping.shipping_state || "",
      options: showShipping.state || [],
      onChange: handleStateChange,
    },
    {
      label: "City",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_city,
      helperText: validationError?.shipping_city,
      value: shipping.shipping_city || "",
      options: showShipping.city || [],
      onChange: handleCityChange,
    },
    {
      label: "Postal code",
      type: "input",
      inputProps: { maxLength: 6 },
      value: shipping.shipping_postalcode,
      onChange: (e) => handleChange(e, "shipping_postalcode"),
    },
    {
        label: "Is Primary Shipping Address",
        type: "checkbox",
        onChange: (e) => handleCheck(e, "shipping_primary"),
        checked: shipping.shipping_primary
    },
  ];

  const submitContact = async () => {
    let error = {};
    let errormsg = "Please fill the field value.";
    if (_.isEmpty(shipping.shipping_city)) {
      error = { ...error, shipping_city: errormsg };
    } if(_.isEmpty(shipping.shipping_country)) {
      error = { ...error, shipping_country: errormsg };
    } if(_.isEmpty(shipping.shipping_street)) {
      error = { ...error, shipping_street: errormsg };
    } if(_.isEmpty(shipping.shipping_state)) {
      error = { ...error, shipping_state: errormsg };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        contactshipping_create: true,
        contactid: props.id.toString(),
        accountid: props.accountId.toString(),
        shippinginfo: [
          {
            shipping_id: "",
            shipping_city: shipping.shipping_city?.value,
            shipping_country: shipping.shipping_country?.value,
            shipping_postalcode: shipping.shipping_postalcode,
            shipping_state: shipping.shipping_state?.value,
            shipping_street: shipping.shipping_street,
            shipping_primary: shipping.shipping_primary
          },
        ],
        "loggedinuserid": getCurrentUserDetails()?.id,
      };
      setLoading(true);
      setDisableCreate(true);
      try {
        let response = await createAccountContact(data);
        console.log("Response", response);
        if (response) {
          setSnack({
            open: true,
            message: "Contact updated successfully",
          });
          setTimeout(() => {
            // props.back();
          }, 2000);
        }
      } catch (e) {
        console.log('error', e.response?.data)
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
          <Typography>Shipping details</Typography>
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
          <Button disabled={disableCreate} label={loading ? 'Loading ...' : 'Save'}  onClick={submitContact} />
        </Grid>
      </Grid>
    </form>
  );
};

export default AddShipping;