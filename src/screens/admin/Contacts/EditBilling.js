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

const EditBilling = (props) => {
  const classes = useStyles();
  const [billing, setBillingInfo] = useState({});
  const [showBilling, setShowBilling] = useState({});
  const [billingCity, setBillingCity] = useState([]);
  const [billingState, setBillingState] = useState([]);
  // const [ salutation, setSalutation ] = useState([]);
  // eslint-disable-next-line
  const [validationError, setValidationError] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const { getCurrentUserDetails } = useToken();
  
  useEffect(() => {
    getCountryName();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // createAccountContact({
    //   view: true,
    //   contactid: props.id.toString(),
    // }).then((res) => {
    let res = {
        billing_id: props.data.id,
        billing_city: props.data.city,
        billing_country: {label: props.data.country, value: props.data.country},
        billing_postalcode: props.data.postalcode,
        billing_state: props.data.state,
        billing_street: props.data.street,
        billing_primary: props.data.primary
    };
   
      setBillingInfo(res);
      let temp = {};
      getCountryNames().then((country) => {
        let countries = formatToSelection(country, "country");
        temp.country = countries;
        if (res.billing_country !== "") {
          getStateNames({ countryname: res.billing_country?.value })
            .then((states) => {
              temp.state = formatToSelection(states, "state");
              setBillingState({label: res.billing_state, value: res.billing_state});
              if (res.billing_state !== "") {
                getCityNames({ statename: res.billing_state })
                  .then((cities) => {
                    temp.city = formatToSelection(cities, "city");
                    setBillingCity({label: res.billing_city, value: res.billing_city});
                  })
                  .catch((err) => console.log("Get city error", err.message));
              }
            })
            .catch((err) => console.log("Get state error", err.message));
        }
        setShowBilling(temp);
      });
    // });
    // eslint-disable-next-line
  }, [props.data]);

  const getCountryName = () => {
    getCountryNames().then((res) => {
      let countries = formatToSelection(res, "country");
      setShowBilling({ ...showBilling, country: countries });
      // setShowContact({...showContact, country: countries });
    });
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
      'billing_state': value.value,
    });
    setBillingState(value);
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
      'billing_city': value.value,
    });
    setBillingCity(value);
  }  

  const payload = [
    {
      label: "Street name",
      type: "input",
      required: true,
      value: billing.billing_street ? billing.billing_street : "",
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
      value: billing.billing_country ? billing.billing_country : "",
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
      value: billingState ? billingState : '',
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
      value: billingCity,
      options: showBilling.city || [],
      onChange: handleCityChange,
    },
    {
      label: "Postal code",
      type: "input",
      inputProps: { maxLength: 6 },
      value: billing.billing_postalcode ? billing.billing_postalcode : "",
      onChange: (e) => handleChange(e, "billing_postalcode"),
    },
    {   
      label: "Is Primary Billing Address",
      type: "checkbox",
      onChange: (e) => handleCheck(e, "billing_primary"),
      checked: billing.billing_primary ? billing.billing_primary : false,
    },
  ];

  const handleCheck = (event, key) => {
    let data = {
      ...billing,
      [key]: event.target.checked,
    };
    setBillingInfo(data);
  };

  const submitContact = async () => {
    let error = {};
    let errormsg = "Please fill the field value.";
    if (_.isEmpty(billingCity)) {
      error = { ...error, billing_city: errormsg };
    }
    if(_.isEmpty(billing.billing_country)) {
      error = { ...error, billing_country: errormsg };
    }
    if(_.isEmpty(billing.billing_street)) {
      error = { ...error, billing_street: errormsg };
    }
    if(_.isEmpty(billingState)) {
      error = { ...error, billing_state: errormsg };
    }
    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        contactbilling_update: true,
        contactid: props.id.toString(),
        accountid: props.accountId.toString(),
        "loggedinuserid": getCurrentUserDetails()?.id,
        billinginfo: [
          {
            billing_id: billing.billing_id,
            billing_city: billingCity?.value,
            billing_country: billing.billing_country?.value,
            billing_postalcode: billing.billing_postalcode,
            billing_state: billingState?.value,
            billing_street: billing.billing_street,
            billing_primary: billing.billing_primary,
          },
        ],
      };
      setLoading(true);
      try {
        let response = await createAccountContact(data);
        console.log("Response", response);
        if (response) {
          setSnack({
            open: true,
            message: "Contact updated successfully",
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
          <Button disabled={loading}  label={loading?"Loading...":"Save"} onClick={submitContact} />
        </Grid>
      </Grid>
    </form>
  );
};

export default EditBilling;