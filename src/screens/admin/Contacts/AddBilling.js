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

const AddBilling = (props) => {
  const classes = useStyles();
  const [billing, setBillingInfo] = useState({});
  const [showBilling, setShowBilling] = useState({});
  const [loading, setLoading] = useState(false);
  const [disableCreate, setDisableCreate] = useState(false);
  // eslint-disable-next-line
  const [validationError, setValidationError] = useState({});
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
      setShowBilling({ ...showBilling, country: countries });
      // setShowContact({...showContact, country: countries });
    });
  };

  const handleCheck = (event, key) => {
    let data = {
      ...billing,
      [key]: event.target.checked,
    };
    setBillingInfo(data);
  };

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setBillingInfo({
      ...billing,
      [key]: value,
    });
  };

  const handleCountryChange = (e, value) => {
    setBillingInfo({
      ...billing,
      'billing_country': value,
    });
    getStateNames({ countryname: value.value })
        .then((res) =>
          setShowBilling({
            ...showBilling,
            state: formatToSelection(res, "state"),
          })
        )
        .catch((err) => console.log("Get state error", err.message));
  }

  const handleStateChange = (e, value) => {
    setBillingInfo({
      ...billing,
      'billing_state': value,
    });
    getCityNames({ statename: value.value })
    .then((res) =>
      setShowBilling({
        ...showBilling,
        city: formatToSelection(res, "city"),
      })
    )
    .catch((err) => console.log("Get state error", err.message));
  }

  const handleCityChange = (e, value) => {
    setBillingInfo({
      ...billing,
      'billing_city': value,
    });
  }  

  const payload = [
    {
      label: "Street name",
      type: "input",
      required: true,
      value: billing.billing_street,
      error: validationError?.billing_street,
      helperText: validationError?.billing_street,
      onChange: (e) => handleChange(e, "billing_street"),
    },
    {
      label: "Country",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.billing_country,
      helperText: validationError?.billing_country,
      value: billing.billing_country || "",
      options: showBilling.country || [],
      onChange: handleCountryChange,
    },
    {
      label: "Province/State",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.billing_state,
      helperText: validationError?.billing_state,
      value: billing.billing_state || "",
      options: showBilling.state || [],
      onChange: handleStateChange,
    },
    {
      label: "City",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.billing_city,
      helperText: validationError?.billing_city,
      value: billing.billing_city || "",
      options: showBilling.city || [],
      onChange: handleCityChange,
    },
    {
      label: "Postal code",
      type: "input",
      inputProps: { maxLength: 6 },
      value: billing.billing_postalcode,
      onChange: (e) => handleChange(e, "billing_postalcode"),
    },
    {
      label: "Is Primary Billing Address",
      type: "checkbox",
      onChange: (e) => handleCheck(e, "billing_primary"),
      checked: billing.billing_primary
    },
  ];

  const submitContact = async () => {
    let error = {};
    let errormsg = "Please fill the field value.";
    if (_.isEmpty(billing.billing_city)) {
      error = { ...error, billing_city: errormsg };
    }
    if (_.isEmpty(billing.billing_country)) {
      error = { ...error, billing_country: errormsg };
    }
    if (_.isEmpty(billing.billing_street)) {
      error = { ...error, billing_street: errormsg };
    }
    if (_.isEmpty(billing.billing_state)) {
      error = { ...error, billing_state: errormsg };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        contactbilling_create: true,
        contactid: props.id.toString(),
        accountid: props.accountId.toString(),
        billinginfo: [
          {
            billing_id: '',
            billing_city: billing.billing_city?.value,
            billing_country: billing.billing_country?.value,
            billing_postalcode: billing.billing_postalcode,
            billing_state: billing.billing_state?.value,
            billing_street: billing.billing_street,
            billing_primary: billing.billing_primary,
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
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Billing details</Typography>
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
          <Button disabled={disableCreate} label={loading ? 'Loading ...' : 'Save'} onClick={submitContact} />
        </Grid>
      </Grid>
    </form>
  );
};

export default AddBilling;
