import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import ContentTabs from "../../../components/ContentTabs";
import Tab from "@material-ui/core/Tab";
import { Grid } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import {
  getAccountDetails,
  getQuotes,
  reassignAccount,
  getUsers,
  getContacts,
  getSampleRequests,
} from "../../../apis";
import AccountContactList from "./AccountContactList";
import SampleRequestList from "../Sample Requests/SampleRequestList";
import CreateSample from "../Sample Requests/CreateSample";
import EditSample from "../Sample Requests/EditSample";
import { Container } from "@material-ui/core";
import SampleDetails from "../Sample Requests/SampleDetails";
import CreateContact from "../Contacts/CreateContact";
import CreateQuote from "../Quotes/CreateQuote";
import QuoteDetails from "../Quotes/QuoteDetails";
import EditQuote from "../Quotes/EditQuote";
import EditContact from "../Contacts/EditContact";
import ContactDetails from "../Contacts/ContactDetails";
import AccountQuotesList from "./AccountQuotesList";
import Button from "../../../components/Button";
import Fab from "../../../components/Fab";
import "../../common.css";
import EditBilling from "../Contacts/EditBilling";
import AddBilling from "../Contacts/AddBilling";
import EditShipping from "../Contacts/EditShipping";
import AddShipping from "../Contacts/AddShipping";
import { makeStyles } from "@material-ui/core/styles";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import _ from "lodash";
import { numberWithCommas } from "../../common";
import { withStyles } from "@material-ui/core/styles";
import roles from "../../../constants/roles";


const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    '& .MuiGrid-root': {
      color: '#F05A30',
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
  modal: {
    position: "absolute",
    margin: "auto",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "scroll",
  },
}));

const WhiteTextTypography = withStyles({
  root: {
    color: "#F05A30"
  }
})(Typography);

const AccountDetails = (props) => {
  const classes = useStyles();
  const [accountDetails, setAccountDetails] = useState({});
  // eslint-disable-next-line
  const [contacts, setAccountContacts] = useState({});
  const [samples, setAccountSamples] = useState(null);
  const [quotes, setAccountQuotes] = useState(null);
  const [showCreateContact, setCreateContact] = useState(false);
  const [showCreateSample, setCreateSample] = useState(false);
  const [showCreateQuote, setCreateQuote] = useState(false);
  const [showContactDetails, setContactDetails] = useState(false);
  const [usersToReAssign, setUsersToReAssign] = useState([]);

  const [showContactEdit, setContactEdit] = useState(false);
  const [contactId, setContactId] = useState(-1);
  const [showSampleDetails, setSampleDetails] = useState(false);
  const [showSampleEdit, setSampleEdit] = useState(false);
  const [sampleId, setSampleId] = useState(-1);
  const [showQuoteDetails, setQuoteDetails] = useState(false);
  const [editQuoteDetails, setEditQuoteDetails] = useState(false);

  const [showBillingEdit, setBillingEdit] = useState(false);
  const [showBillingAdd, setBillingAdd] = useState(false);
  const [showShippingAdd, setShippingAdd] = useState(false);
  const [showShippingEdit, setShippingEdit] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [shippingData, setShippingData] = useState("");
  const [billingData, setBillingData] = useState("");
  const [openReAssign, setReAssign] = useState(false);
  const [reAssignUser, setReAssignUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSnack, setSnack] = useState({ open: false, message: "" });
  const [quoteId, setQuoteId] = useState(-1);
  const userRole = localStorage.getItem("currentUserRole");
  const loggedinuserid = localStorage.getItem("currentUserId");

  const formatToSelectionUsers = (data = [], key) => {
    console.log("key");
    let formattedData = [];
    data?.map((v) =>
      formattedData.push({ label: v[key], value: v.userid || v[key] })
    );
    return formattedData;
  };

  useEffect(() => {
    getAccountDetails({
      viewaccount: true,
      accountid: props.id.toString(),
    }).then((res) => {
      setAccountDetails(res);
    });
    getUsers({ type: "Accounts", loginuserid: loggedinuserid }).then((res) => {
      setUsersToReAssign(formatToSelectionUsers(res, "username"));
    });
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    let response = await getContacts({
      filter: `accountid = ${props.id}`,
    });
    setAccountContacts(response);
    let quotesa = await getQuotes({
      filter: `accountid = ${props.id}`,
    });
    setAccountQuotes(quotesa);
    let samplesa = await getSampleRequests({
      filter: `accountid = ${props.id}`,
    });
    setAccountSamples(samplesa);
  }
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);
  const handleChange7 = (e, value) => {
    e.preventDefault();
    setReAssignUser(value);
  };
  const reAssignAccountToUser = async (e) => {
    try {
      if (_.isEmpty(reAssignUser?.value)) {
        setSnack({
          open: true,
          severity: "error",
          message: "Please select a user to reassign",
        });
        setTimeout(() => {
          setSnack({
            open: false,
            message: "",
          });
        }, 2000);
        return;
      }
      let payload = {
        accountid: props.id?.toString(),
        userid: reAssignUser?.value,
        loggedinuserid: loggedinuserid,
      };
      setLoading(true);
      let response = await reassignAccount(payload);
      console.log("Response", response);
      if (response) {
        let responseMessage = "Account reassigned successfully";
        setSnack({
          open: true,
          message: responseMessage,
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
    } finally {
      setLoading(false);
    }
  };
  const payload = [
    {
      type: "label",
      value: "Account owner",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accountowner,
      sm: "6",
    },
    {
      type: "label",
      value: "Account type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accounttypes
        ?.map((acc) => {
          return acc.accounttype;
        })
        ?.join(","),
      sm: "6",
    },
    {
      type: "label",
      value: "Phone",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.phone,
      sm: "6",
    },
    {
      type: "label",
      value: "Fax",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.fax,
      sm: "6",
    },
    {
      type: "label",
      value: "Approx. annual turnover ($) ",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: numberWithCommas(accountDetails?.approxannualrev),
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Account name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accountname,
      sm: "6",
    },
    {
      type: "label",
      value: "Aliases",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.aliases,
      sm: "6",
    },
    {
      type: "label",
      value: "Email",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.email,
      sm: "6",
    },
    {
      type: "label",
      value: "Website",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.website,
      sm: "6",
    },
    {
      type: "label",
      value: "Product segment",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.Productsegment?.map((ps) => {
        return ps.productsegment;
      })?.join(","),
      sm: "6",
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_street,
      sm: "6",
    },
    {
      type: "label",
      value: "City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Province/State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Postal code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_postalcode,
      sm: "6",
    },
    {
      type: "label",
      value: "Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_country,
      sm: "6",
    },
  ];

  const payload3 = [
    {
      type: "label",
      value: "Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_street,
      sm: "6",
    },
    {
      type: "label",
      value: "City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Province/State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Postal code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_postalcode,
      sm: "6",
    },
    {
      type: "label",
      value: "Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_country,
      sm: "6",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: "Already in instant cofee business?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.profilesectioninfo &&
          accountDetails.profilesectioninfo[0].instcoffee === true
          ? "Yes"
          : "No",
      sm: "6",
    },
    {
      type: "label",
      value: "Coffee type interested in ?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.coffeetypes
        ?.map((cof) => {
          return cof.coffeetype;
        })
        ?.join(","),
      sm: "6",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "Do you have instant coffee manufacturing unit?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.profilesectioninfo &&
          accountDetails.profilesectioninfo[0].manfacunit === true
          ? "Yes"
          : "No",
      sm: "6",
    },
    {
      type: "label",
      value: "Other information",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.otherinfo,
      sm: "6",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "Shipping to continent",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.shippingtocontinent,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping to country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.shippingtocountry,
      sm: "6",
    },
  ];


  const payload8 = [
    {
      label: "Select users to assign",
      type: "autocomplete",
      labelprop: "label",
      required: true,
      value: reAssignUser,
      options: usersToReAssign,
      onChange: handleChange7,
    },
  ];
  const handleCheck = (event, key) => {
    let data = {
      ...accountDetails,
      [key]: event.target.checked,
    };
    setAccountDetails(data);
  };

  const payload9 = [
    {
      label: "Eligible for stock price",
      type: "checkbox",
      onChange: (e) => handleCheck(e, "stock"),
      checked: accountDetails?.stock ? accountDetails?.stock : false,
      sm: 12,
    },
  ];

  const ShowCreateContactHandler = () => {
    setCreateContact(true);
  };

  const HideCreateContactHandler = () => {
    fetchData();
    setCreateContact(false);
  };

  const ShowCreateSampleHandler = () => {
    setCreateSample(true);
  };

  const HideCreateSampleHandler = () => {
    fetchData();
    setCreateSample(false);
  };

  const ShowCreateQuoteHandler = () => {
    setCreateQuote(true);
  };

  const HideCreateQuoteHandler = () => {
    fetchData();
    setCreateQuote(false);
  };

  const ShowContactDetailsHandler = (event, contactId) => {
    setContactDetails(true);
    setContactId(contactId);
  };
  const HideContactDetailsHandler = () => {
    setContactDetails(false);
  };

  const ShowContactEditHandler = (event, contactId) => {
    setContactDetails(false);
    setContactEdit(true);
    setContactId(contactId);
  };

  const HideContactEditHandler = () => {
    setContactEdit(false);
  };
  const ShowSampleDetailsHandler = (event, sampleId) => {
    setSampleDetails(true);
    setSampleId(sampleId);
  };

  const HideSampleDetailsHandler = () => {
    setSampleDetails(false);
  };

  const ShowSampleEditHandler = (event, sampleId) => {
    setSampleDetails(false);
    setSampleEdit(true);
    setSampleId(sampleId);
  };

  const HideSampleEditHandler = () => {
    setSampleEdit(false);
  };

  const ShowQuoteDetailsHandler = (event, quoteNumber, quoteStatus) => {
    setQuoteDetails(true);
    setQuoteId(quoteNumber);
  };

  const EditQuoteDetailsHandler = (event, quoteNumber) => {
    setEditQuoteDetails(true);
    setQuoteId(quoteNumber);
    setQuoteDetails(false);
  };

  const HideQuoteDetailsHandler = () => {
    setQuoteDetails(false);
  };

  const HideEditQuoteHandler = () => {
    setEditQuoteDetails(false);
  };

  const ShowSampleListDetailsHandler = () => {
    setCreateSample(false);
    setSampleDetails(true);
  };

  const ShowBillingEditHandler = (event, temp) => {
    setContactDetails(false);
    setShippingEdit(false);
    setBillingAdd(false);
    setBillingEdit(true);
    setContactEdit(false);
    setContactId(temp.contactId);
    setAccountId(temp.accountid);
    setBillingData(temp.data);
  };

  const ShowBillingAddHandler = (event, temp) => {
    setContactDetails(false);
    setShippingEdit(false);
    setBillingEdit(false);
    setBillingAdd(true);
    setContactEdit(false);
    setContactId(temp.contactId);
    setAccountId(temp.accountid);
  };

  const ShowShippingAddHandler = (event, temp) => {
    setContactDetails(false);
    setShippingEdit(false);
    setBillingEdit(false);
    setBillingAdd(false);
    setShippingAdd(true);
    setContactEdit(false);
    setContactId(temp.contactId);
    setAccountId(temp.accountid);
  };

  const ShowShippingEditHandler = (event, temp) => {
    setContactDetails(false);
    setShippingEdit(true);
    setBillingAdd(false);
    setBillingEdit(false);
    setContactEdit(false);
    setContactId(temp.contactId);
    setAccountId(temp.accountid);
    setShippingData(temp.data);
  };

  const HideBillingEditHandler = () => {
    setBillingEdit(false);
    setContactDetails(true);
  };

  const HideBillingAddHandler = () => {
    setBillingAdd(false);
    setContactDetails(true);
  };

  const HideShippingEditHandler = () => {
    setShippingEdit(false);
    setContactDetails(true);
  };

  const HideShippingAddHandler = () => {
    setShippingAdd(false);
    setContactDetails(true);
  };
  const reAssign = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Select user</h2>
      <h4>Select user to assign:</h4>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={6} md={10} container direction="column">
          <Template payload={payload8}></Template>
        </Grid>
      </Grid>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button
            label={loading ? "Loading..." : "Proceed"}
            disabled={loading}
            onClick={reAssignAccountToUser}
          />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => setReAssign(!openReAssign)} />
        </Grid>
      </Grid>
    </Container>
  );

  let component;
  if (showCreateContact) {
    component = (
      <CreateContact
        back={HideCreateContactHandler}
        accountId={props.id}
      ></CreateContact>
    );
  } else if (showCreateSample) {
    console.log("props.id::", props.id);
    component = (
      <CreateSample
        back={HideCreateSampleHandler}
        showDetailsSample={ShowSampleListDetailsHandler}
        accountId={props.id}
      ></CreateSample>
    );
  } else if (showCreateQuote) {
    component = (
      <CreateQuote
        back={HideCreateQuoteHandler}
        accountId={props.id}
      ></CreateQuote>
    );
  } else if (showContactDetails) {
    component = (
      <ContactDetails
        back={HideContactDetailsHandler}
        id={contactId}
        editContact={(event, contactId) =>
          event === "edit_billing"
            ? ShowBillingEditHandler(event, contactId)
            : event === "add_billing"
              ? ShowBillingAddHandler(event, contactId)
              : event === "add_shipping"
                ? ShowShippingAddHandler(event, contactId)
                : event === "edit_shipping"
                  ? ShowShippingEditHandler(event, contactId)
                  : ShowContactEditHandler(event, contactId)
        }
      ></ContactDetails>
    );
  } else if (showContactEdit) {
    component = (
      <EditContact back={HideContactEditHandler} id={contactId}></EditContact>
    );
  } else if (showSampleDetails) {
    component = (
      <SampleDetails
        back={HideSampleDetailsHandler}
        id={sampleId}
        editSample={(event, sampleId) => ShowSampleEditHandler(event, sampleId)}
      ></SampleDetails>
    );
  } else if (showSampleEdit) {
    component = (
      <EditSample back={HideSampleEditHandler} id={sampleId}></EditSample>
    );
  } else if (showBillingEdit) {
    component = (
      <EditBilling
        back={HideBillingEditHandler}
        id={contactId}
        accountId={accountId}
        data={billingData}
      ></EditBilling>
    );
  } else if (showBillingAdd) {
    component = (
      <AddBilling
        back={HideBillingAddHandler}
        id={contactId}
        accountId={accountId}
      ></AddBilling>
    );
  } else if (showShippingEdit) {
    component = (
      <EditShipping
        back={HideShippingEditHandler}
        id={contactId}
        accountId={accountId}
        data={shippingData}
      ></EditShipping>
    );
  } else if (showShippingAdd) {
    component = (
      <AddShipping
        back={HideShippingAddHandler}
        id={contactId}
        accountId={accountId}
      ></AddShipping>
    );
  } else if (showQuoteDetails) {
    component = (
      <QuoteDetails
        back={HideQuoteDetailsHandler}
        id={quoteId}
        edit={(event, quoteNumber) =>
          EditQuoteDetailsHandler(event, quoteNumber)
        }
      ></QuoteDetails>
    );
  } else if (editQuoteDetails) {
    component = (
      <EditQuote back={HideEditQuoteHandler} id={quoteId}></EditQuote>
    );
  } else {
    component = (
      <>
        {showSnack.open && (
          <Snackbar
            {...showSnack}
            handleClose={() =>
              setSnack({ open: false, message: "", severity: "" })
            }
          />
        )}
        <ContentTabs value="0">
          <Tab label="Accounts Information" index="0">
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} style={{textAlign: 'right'}}>
                <Template payload={payload9} />
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <WhiteTextTypography variant="h3">Account information</WhiteTextTypography>
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload1} />
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} direction="column">
                <Grid item md={12} xs={12} className="item">
                  <WhiteTextTypography variant="h3">Shipping address</WhiteTextTypography>
                </Grid>
                <Template payload={payload2} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} direction="column">
                <Grid item md={12} xs={12} className="item">
                  <WhiteTextTypography variant="h3">Billing address</WhiteTextTypography>
                </Grid>
                <Template payload={payload3} />
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <WhiteTextTypography variant="h3">Profile completion</WhiteTextTypography>
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload4} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload5} />
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <WhiteTextTypography variant="h3">Shipping information</WhiteTextTypography>
              </Grid>
            </Grid>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={12} container direction="column">
                <Template payload={payload6} />
              </Grid>
            </Grid>
            <Grid
              container
              xs={12}
              md={12}
              style={{ margin: 24 }}
              justify="center"
            >
              <Grid item>
                <Button
                  label="Edit"
                  onClick={() => props.editAccount("edit_account", props.id)}
                />
              </Grid>
              <Grid item>
                <Button label="Cancel" onClick={props.back} />
              </Grid>
              {userRole === roles.managingDirector ? (
                <Grid item>
                  <Button label="Re-Assign" onClick={() => setReAssign(true)} />
                </Grid>
              ) : null}
            </Grid>
            <SimpleModal
              open={openReAssign}
              handleClose={() => setReAssign(!openReAssign)}
              body={reAssign}
            />
          </Tab>
          <Tab label="Contact Information" index="1">
            <Grid container direction="row">
              <Grid xs={6} item></Grid>
              <Grid
                xs={6}
                item
                justify="flex-end"
                alignItems="center"
                style={{ display: "flex" }}
              >
                <Fab
                  onClick={ShowCreateContactHandler}
                  label={"Create Contact"}
                  variant="extended"
                />
              </Grid>
            </Grid>
            <AccountContactList
              data={contacts}
              contactDetails={(event, contactId) =>
                ShowContactDetailsHandler(event, contactId)
              }
            />
          </Tab>
          <Tab label="Sample Request Information" index="2">
            <Grid container direction="row">
              <Grid xs={6} item></Grid>
              <Grid
                xs={6}
                item
                justify="flex-end"
                alignItems="center"
                style={{ display: "flex" }}
              >
                <Fab
                  label={"Request Sample"}
                  onClick={ShowCreateSampleHandler}
                  variant="extended"
                />
              </Grid>
            </Grid>
            <SampleRequestList
              data={samples}
              sampleDetails={(event, sampleId) =>
                ShowSampleDetailsHandler(event, sampleId)
              }
            />
          </Tab>
          <Tab label="Quote Information" index="3">
            <Grid container direction="row">
              <Grid xs={6} item></Grid>
              <Grid
                xs={6}
                item
                justify="flex-end"
                alignItems="center"
                style={{ display: "flex" }}
              >
                <Fab
                  label={"Create Quote"}
                  onClick={ShowCreateQuoteHandler}
                  variant="extended"
                />
              </Grid>
            </Grid>
            <AccountQuotesList
              data={quotes}
              quoteDetails={(event, quoteNumber, quoteStatus) =>
                ShowQuoteDetailsHandler(event, quoteNumber, quoteStatus)
              }
            />
          </Tab>
        </ContentTabs>
      </>
    );
  }
  return <>{component}</>;
};
export default AccountDetails;
