import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../../../components/Button";
import { getAccountDetails, getLeadsInfo } from "../../../apis";
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
  },
}));

const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map((v) =>
    formattedData.push({ label: v[key], value: v[id] || v[key] })
  );
  return formattedData;
};

const EditAccount = (props) => {
  const classes = useStyles();
  const [accountDetails, setAccountDetails] = useState({});
  const [coffeeTypeList, setCoffeeType] = useState([]);
  // eslint-disable-next-line
  const [accountTypeList, setAccountType] = useState([]);
  // eslint-disable-next-line
  const [productSegmentList, setProduct] = useState([]);
  const [shippingCountries, setShippingCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const { getCurrentUserDetails } = useToken();

  useEffect(() => {
    getLeadsInfo({ type: "accountDetails" }).then((res) =>
      setAccountType(formatToSelection(res, "accounttype", "id"))
    );
    getLeadsInfo({ type: "productsegments" }).then((res) =>
      setProduct(formatToSelection(res, "productsegment", "id"))
    );
    getLeadsInfo({ type: "coffeetypes" }).then((res) =>
      setCoffeeType(formatToSelection(res, "coffeetype", "id"))
    );

    getAccountDetails({
      viewaccount: true,
      accountid: props.id.toString(),
    }).then((viewPayload) => {
      getLeadsInfo({
        type: "countries",
        continentname: viewPayload.shippingtocontinent,
      }).then((response) => {
        response &&
          setShippingCountries(formatToSelection(response, "countryname"));
      });
      let temp = {
        accountOwner: viewPayload.accountowner || "",
        accountName: viewPayload.accountname || "",
        accountType:
          viewPayload.accounttypes !== null
            ? formatToSelection(viewPayload.accounttypes, "accounttype", "id")
            : [],
        aliases: viewPayload.aliases || "",
        phone: viewPayload.phone || "",
        fax: viewPayload.fax || "",
        email: viewPayload.email || "",
        website: viewPayload.website || "",
        turnover: viewPayload.approxannualrev || "",
        productSegment:
          viewPayload.Productsegment !== null
            ? formatToSelection(
                viewPayload.Productsegment,
                "productsegment",
                "id"
              )
            : [],
        street:
          (viewPayload.shippinginformation &&
            viewPayload.shippinginformation[0]?.shipping_street) ||
          "",
        city:
          (viewPayload.shippinginformation &&
            viewPayload.shippinginformation[0]?.shipping_city) ||
          "",
        state:
          (viewPayload.shippinginformation &&
            viewPayload.shippinginformation[0]?.shipping_state) ||
          "",
        postalCode:
          (viewPayload.shippinginformation &&
            viewPayload.shippinginformation[0]?.shipping_postalcode) ||
          "",
        country:
          (viewPayload.shippinginformation &&
            viewPayload.shippinginformation[0]?.shipping_country) ||
          "",
        billingStreet:
          (viewPayload.billinginformation &&
            viewPayload.billinginformation[0]?.billing_street) ||
          "",
        billingCity:
          (viewPayload.billinginformation &&
            viewPayload.billinginformation[0]?.billing_city) ||
          "",
        billingState:
          (viewPayload.billinginformation &&
            viewPayload.billinginformation[0]?.billing_state) ||
          "",
        billingPostalCode:
          (viewPayload.billinginformation &&
            viewPayload.billinginformation[0]?.billing_postalcode) ||
          "",
        billingCountry:
          (viewPayload.billinginformation &&
            viewPayload.billinginformation[0]?.billing_country) ||
          "",
        alreadyInBusiness:
          viewPayload.profilesectioninfo &&
          viewPayload.profilesectioninfo[0]?.instcoffee === true
            ? "Yes"
            : "No" || "No",
        hasManfacUnit:
          viewPayload.profilesectioninfo &&
          viewPayload.profilesectioninfo[0]?.manfacunit === true
            ? "Yes"
            : "No" || "No",
        // eslint-disable-next-line
        coffeeType:
          viewPayload.coffeetypes !== null
            ? formatToSelection(
                viewPayload.coffeetypes,
                "coffeetype",
                "coffeetypeid"
              )
            : [],
        other: viewPayload.otherinfo || "",
        shippingCountry: {
          label: viewPayload.shippingtocountry,
          value: viewPayload.shippingtocountry,
        },
        shippingContinent: {
          label: viewPayload.shippingtocontinent,
          value: viewPayload.shippingtocontinent,
        },
      };
      setAccountDetails(temp);
    });
    // eslint-disable-next-line
  }, []);

  const handleChange = (event, key) => {
    let data = {
      ...accountDetails,
      [key]: event.target.value,
    };
    setAccountDetails(data);
    console.log(data);
  };

  const handleChangeShipping = (e, value) => {
    e.preventDefault();
    getLeadsInfo({ type: "countries", continentname: value.value }).then(
      (res) =>
        res && setShippingCountries(formatToSelection(res, "countryname"))
    );
    setAccountDetails({
      ...accountDetails,
      shippingContinent: value,
    });
  };

  const editAccountAction = async () => {
    setLoading(true);
    let accountTypetemp = [];
    // eslint-disable-next-line
    accountDetails.accountType.map((item, index) => {
      accountTypetemp.push(item.value);
    });
    let productSegmenttemp = [];
    // eslint-disable-next-line
    accountDetails.productSegment.map((item, index) => {
      productSegmenttemp.push(item.value);
    });
    let coffeeTypetemp = [];
    // eslint-disable-next-line
    accountDetails.coffeeType.map((item, index) => {
      coffeeTypetemp.push(item.value);
    });

    let data = {
      accountid: props.id.toString(),
      updateaccount: true,
      accountowner: accountDetails.accountOwner,
      accountname: accountDetails.accountName,
      coffeetypeid: coffeeTypetemp.join(","),
      accounttypeid: accountTypetemp.join(","),
      aliases: accountDetails.aliases,
      phone: accountDetails.phone,
      email: accountDetails.email,
      fax: accountDetails.fax,
      website: accountDetails.website,
      approxannualrev: accountDetails.turnover,
      productsegmentid: productSegmenttemp.join(","),
      shippingtocontinent: accountDetails.shippingContinent.value,
      shippingtocountry: accountDetails.shippingCountry.value,
      otherinfo: accountDetails.other,
      shipping_street: accountDetails.street,
      shipping_city: accountDetails.city,
      shipping_state: accountDetails.state,
      shipping_postalcode: accountDetails.postalCode,
      shipping_country: accountDetails.country,
      billing_street: accountDetails.billingStreet,
      billing_city: accountDetails.billingCity,
      billing_state: accountDetails.billingState,
      billing_postalcode: accountDetails.billingPostalCode,
      billing_country: accountDetails.billingCountry,
      instcoffee: accountDetails?.alreadyInBusiness === "Yes" ? true : false,
      manfacunit: accountDetails?.hasManfacUnit === "Yes" ? true : false,
      "loggedinuserid": getCurrentUserDetails()?.id,
    };
    try {
      let response = await getAccountDetails(data);
      if (response) {
        setSnack({
          open: true,
          message: "Account edited successfully",
        });
        setTimeout(() => {
          setLoading(false);
          props.back();
        }, 2000);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (event, value) => {
    let data = {
      ...accountDetails,
      accountType: value,
    };
    setAccountDetails(data);
  };

  const handleProductSegmentChange = (event, value) => {
    let data = {
      ...accountDetails,
      productSegment: value,
    };
    setAccountDetails(data);
  };

  const payload = [
    {
      label: "Account name",
      type: "input",
      value: accountDetails.accountName || "",
      onChange: (e) => handleChange(e, "accountName"),
    },
    {
      label: "Account type",
      type: "autocomplete",
      labelprop: "label",
      multiple: true,
      value: accountDetails.accountType || [],
      options: accountTypeList || [],
      onChange: handleAccountChange,
    },
    {
      label: "Aliases",
      type: "input",
      multiline: true,
      rows: 2,
      value: accountDetails.aliases || "",
      onChange: (e) => handleChange(e, "aliases"),
    },
    {
      label: "Phone",
      type: "input",
      value: accountDetails.phone || "",
      onChange: (e) => handleChange(e, "phone"),
    },
    {
      label: "Email",
      type: "input",
      value: accountDetails.email || "",
      onChange: (e) => handleChange(e, "email"),
    },
    {
      label: "Fax",
      type: "input",
      value: accountDetails.fax || "",
      onChange: (e) => handleChange(e, "fax"),
    },
    {
      label: "Website",
      type: "input",
      value: accountDetails.website || "",
      onChange: (e) => handleChange(e, "website"),
    },
    {
      label: "Annual approx. turnover($)",
      type: "input",
      value: accountDetails.turnover || "",
      onChange: (e) => handleChange(e, "turnover"),
    },
    {
      label: "Product segment",
      type: "autocomplete",
      labelprop: "label",
      multiple: true,
      value: accountDetails.productSegment || [],
      options: productSegmentList || [],
      onChange: handleProductSegmentChange,
    },
  ];

  const payload1 = [
    {
      label: "Street",
      type: "input",
      value: accountDetails.street || "",
      onChange: (e) => handleChange(e, "street"),
    },
    {
      label: "City",
      type: "input",
      value: accountDetails.city || "",
      onChange: (e) => handleChange(e, "city"),
    },
    {
      label: "Province/State",
      type: "input",
      value: accountDetails.state || "",
      onChange: (e) => handleChange(e, "state"),
    },
    {
      label: "Postal code",
      type: "input",
      value: accountDetails.postalCode || "",
      onChange: (e) => handleChange(e, "postalCode"),
    },
    {
      label: "Country",
      type: "input",
      value: accountDetails.country || "",
      onChange: (e) => handleChange(e, "country"),
    },
  ];

  const payload2 = [
    {
      label: "Street",
      type: "input",
      value: accountDetails.billingStreet || "",
      onChange: (e) => handleChange(e, "billingStreet"),
    },
    {
      label: "City",
      type: "input",
      value: accountDetails.billingCity || "",
      onChange: (e) => handleChange(e, "billingCity"),
    },
    {
      label: "Province/State",
      type: "input",
      value: accountDetails.billingState || "",
      onChange: (e) => handleChange(e, "billingState"),
    },
    {
      label: "Postal code",
      type: "input",
      value: accountDetails.billingPostalCode || "",
      onChange: (e) => handleChange(e, "billingPostalCode"),
    },
    {
      label: "Country",
      type: "input",
      value: accountDetails.billingCountry || "",
      onChange: (e) => handleChange(e, "billingCountry"),
    },
  ];

  const handleCoffeeTypeChange = (event, value) => {
    let data = {
      ...accountDetails,
      coffeeType: value,
    };
    setAccountDetails(data);
  };

  const handleshippingCountryChange = (event, value) => {
    let data = {
      ...accountDetails,
      shippingCountry: value,
    };
    setAccountDetails(data);
  };

  const payload3 = [
    {
      label: "Already in instant coffee business?",
      type: "radio",
      value: accountDetails.alreadyInBusiness || "",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      onChange: (e) => handleChange(e, "alreadyInBusiness"),
      sm: 6,
    },
    {
      label: "Do you have instant coffee manufacturing unit?",
      type: "radio",
      value: accountDetails.hasManfacUnit || "",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      onChange: (e) => handleChange(e, "hasManfacUnit"),
      sm: 6,
    },
    {
      label: "Coffee type interested in?",
      type: "autocomplete",
      labelprop: "label",
      multiple: true,
      value: accountDetails.coffeeType || [],
      options: coffeeTypeList || [],
      onChange: handleCoffeeTypeChange,
    },
    {
      label: "Other information",
      type: "input",
      multiline: true,
      rows: 2,
      value: accountDetails.other || "",
      onChange: (e) => handleChange(e, "other"),
    },
  ];

  const payload4 = [
    {
      label: "Shipping to continent",
      type: "autocomplete",
      labelprop: "label",
      value: accountDetails.shippingContinent || "",
      options: [
        { label: "South America", value: "South America" },
        { label: "Oceania", value: "Oceania" },
        { label: "North America", value: "North America" },
        { label: "Europe", value: "Europe" },
        { label: "Asia", value: "Asia" },
        { label: "Antarctica", value: "Antarctica" },
        { label: "Africa", value: "Africa" },
      ],
      onChange: handleChangeShipping,
    },
    {
      label: "Shipping to country",
      type: "autocomplete",
      labelprop: "label",
      value: accountDetails.shippingCountry || "",
      options: shippingCountries || [],
      onChange: handleshippingCountryChange,
    },
  ];

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
          <Typography>Accounts information</Typography>
        </Grid>
      </Grid>
      <Template payload={payload} />
      <Grid id="top-row" container>
        <Grid id="top-row" xs={12} md={6} direction="column">
          <Grid item md={12} xs={12} className="item">
            <Typography>Shipping address</Typography>
          </Grid>
          <Template payload={payload1} />
        </Grid>
        <Grid id="top-row" xs={12} md={6} direction="column">
          <Grid item md={12} xs={12} className="item">
            <Typography>Billing address</Typography>
          </Grid>
          <Template payload={payload2} />
        </Grid>
      </Grid>
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Profile completion</Typography>
        </Grid>
      </Grid>
      <Template payload={payload3} />
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Shipping information</Typography>
        </Grid>
      </Grid>
      <Template payload={payload4} />
      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button
            disabled={loading}
            label={loading ? "Loading ..." : "Save"}
            onClick={editAccountAction}
          />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
      </Grid>
    </form>
  );
};
export default EditAccount;
