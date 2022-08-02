import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { Container, Grid } from "@material-ui/core";
// import Button from "../../../components/Button";
import Select from "@material-ui/core/Select";
import ContactList from "./ContactList";
import EditContact from "../Contacts/EditContact";
import ContactDetails from "../Contacts/ContactDetails";
import { getContacts } from "../../../apis";
import { DownloadExcel } from "../../../components/DownloadExcel";
import RoundButton from "../../../components/RoundButton";
import EditBilling from "./EditBilling";
import EditShipping from "./EditShipping";
import AddBilling from "./AddBilling";
import AddShipping from "./AddShipping";
import _ from 'lodash';
import useToken from "../../../hooks/useToken";
import {roles} from "../../../constants/roles";
import Snackbar from "../../../components/Snackbar";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    minWidth: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
}));

const Contacts = (props) => {

  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  const userRole = currentUserDetails?.role;
  const userId = currentUserDetails?.id;

  const [state, setState] = React.useState(userRole === roles.managingDirector ? "All Contacts" : "My Contacts");
  const classes = useStyles();
  const [contacts, setContacts] = useState(null);
  const [showContactDetails, setContactDetails] = useState(false);
  const [showContactEdit, setContactEdit] = useState(false);
  const [contactId, setContactId] = useState(-1);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);
  const [showBillingEdit, setBillingEdit] = useState(false);
  const [showBillingAdd, setBillingAdd] = useState(false);
  const [showShippingAdd, setShippingAdd] = useState(false);
  const [showShippingEdit, setShippingEdit] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [shippingData, setShippingData] = useState('');
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
  const [billingData, setBillingData] = useState('');
  const [filter, setFilter] = useState("");
  const fetchData = async (filter, state) => {
    let filterString = "";
    if (userRole !== roles.managingDirector || state === "My Contacts") {
      filterString = filterString + `createdbyuserid = '${userId}'`
    }
    if (state !== "All Contacts" && state !== "My Contacts") {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + ` status = '${state}'`
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + `${filter}`
    }
    
    let data = { filter: filterString, loggedinuserid: userId  }

    try {
    let response = await getContacts(data);
      console.log("Response", response);
      if (response) {
        setContacts(response);
      }
  } catch (e) {      
      setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: 'error',
      })
  }

  };
  useEffect(() => {
    fetchData(filter, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, state]);
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

  const HideContactEditHandler = () => {
    setContactEdit(false);
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };
  const HideBillingEditHandler = () => {
    setContactDetails(true);
    setBillingEdit(false);
  };

  const HideBillingAddHandler = () => {
    setContactDetails(true);
    setBillingAdd(false);
  };

  const HideShippingEditHandler = () => {
    setContactDetails(true);
    setShippingEdit(false);
  };

  const HideShippingAddHandler = () => {
    setContactDetails(true);
    setShippingAdd(false);
  };
  let component;
  if (showContactDetails) {
    component = (
      <ContactDetails
        back={HideContactDetailsHandler}
        id={contactId}
        editContact={(event, contactId) => //console.log("showShippingEdit::1", event)
          event === 'edit_billing' ? ShowBillingEditHandler(event, contactId) :
            event === 'add_billing' ? ShowBillingAddHandler(event, contactId) :
              event === 'add_shipping' ? ShowShippingAddHandler(event, contactId) :
                event === 'edit_shipping' ? ShowShippingEditHandler(event, contactId) :
                  ShowContactEditHandler(event, contactId)
        }
      ></ContactDetails>
    );
  } else if (showContactEdit) {
    component = <EditContact back={HideContactEditHandler} id={contactId}></EditContact>
  } else if (showBillingEdit) {
    component = <EditBilling back={HideBillingEditHandler} id={contactId} accountId={accountId} data={billingData} ></EditBilling>
  } else if (showBillingAdd) {
    component = <AddBilling back={HideBillingAddHandler} id={contactId} accountId={accountId} ></AddBilling>
  } else if (showShippingEdit) {
    component = <EditShipping back={HideShippingEditHandler} id={contactId} accountId={accountId} data={shippingData}></EditShipping>
  } else if (showShippingAdd) {
    component = <AddShipping back={HideShippingAddHandler} id={contactId} accountId={accountId}></AddShipping>
  } else {
    return (
      <>
         {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid container direction="row">
          <Grid xs={6} item>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
              <Select
                native
                value={state}
                onChange={(event) => { setState(event.target.value); setFilter(null) }}
                label="View"
                inputProps={{
                  name: "view",
                  id: "outlined-view-native-simple",
                }}
              >
                {userRole === roles.managingDirector ? <option value="All Contacts">All contacts</option> : null}
                <option value="My Contacts">My contacts</option>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            {contacts !== null && (
              <RoundButton
                onClick={() => exportExcel()}
                label="Export to excel"
              // variant="extended"
              />
            )}
          </Grid>
        </Grid>

        {
          showDownloadExcel === true && (
            <DownloadExcel tableData={contacts} tableName="Contacts" />
          )
        }

        <ContactList
          selectedAdvancedFilters={(val) => { setFilter(val) }}
          clearAdvancedFilters={() => setFilter("")}
          data={contacts}
          contactDetails={(event, contactId) =>
            ShowContactDetailsHandler(event, contactId)
          }
        />
      </>
    );
  }

  return <Container className={classes.root}>{component}</Container>;
};

export default Contacts;
