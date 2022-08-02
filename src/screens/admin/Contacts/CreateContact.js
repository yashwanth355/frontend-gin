import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import _ from "lodash";
import {
  createAccountContact,
  getLeadsInfo,
  getQuotesInfo,
} from "../../../apis";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import useToken from '../../../hooks/useToken'
import {roles} from '../../../constants/roles';

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
  data?.map((v) =>
    formattedData?.push({ label: v?.[key], value: v?.[id] || v?.[key] })
  );
  return formattedData;
};

const CreateContact = (props) => {
  const classes = useStyles();
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const userRole = currentUserDetails?.role;
  const userId = currentUserDetails?.id;

  const [contact, setContactInfo] = useState({});
  const [accountName, setAccountName] = useState([]);
  const [salutation, setSalutation] = useState([]);
  const [validationError, setValidationError] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const [disableCreate, setDisableCreate] = useState(false);
  const getAutocompleteValue = (options = [], value) => {
    const result = options?.filter((option) => option.value === value)[0];
    return result;
  };
  useEffect(() => {
    getLeadsInfo({ type: "salutations" }).then((res) =>
      setSalutation(formatToSelection(res, "salutation", "id"))
    );
    const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforQuotation", "createdbyuserid": userId } : { "type": "accountdetailsforQuotation" };
    getQuotesInfo(createdUser).then((res) => {
      console.log("Res is", res);
      if (res !== null) {
        const options = formatToSelection(res, "account_name", "account_id");
        setAccountName(options);
        if (props.accountId) {
          let account = res.find(
            (acc) => acc.account_id.toString() === props?.accountId?.toString()
          );
          setContactInfo({
            ...contact,
            account:
              account !== undefined
                ? getAutocompleteValue(options, account?.account_id)
                : {},
          });
        }
      } else {
        setAccountName([]);
        setContactInfo(...contact);
      }
    });
    // eslint-disable-next-line
  }, [props.accountId]);


  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setContactInfo({
      ...contact,
      [key]: value,
    });
  };

  const handleaccountChange = (e, value) => {
    setContactInfo({
      ...contact,
      account: value,
    });
  };

  const handlesalutationChange = (e, value) => {
    setContactInfo({
      ...contact,
      salutation: value,
    });
  };

  const payload = [
    {
      label: "Account name",
      type: "autocomplete",
      labelprop: "label",
      value: contact?.account !== undefined ? contact?.account : {}, //getAccountValue(accountName, contact.account || props.accountId),
      options: accountName,
      onChange: handleaccountChange,
    },
    {
      label: "Salutation",
      type: "autocomplete",
      labelprop: "label",
      required: true,
      error: validationError?.salutation,
      helperText: validationError?.salutation,
      value: getAutocompleteValue(salutation, contact.salutation),
      options: salutation,
      onChange: handlesalutationChange,
    },
    {
      label: "First name",
      type: "input",
      value: contact.firstName,
      required: true,
      error: validationError?.firstName,
      helperText: validationError?.firstName,
      onChange: (e) => handleChange(e, "firstName"),
    },
    {
      label: "Last name",
      type: "input",
      value: contact.lastName,
      onChange: (e) => handleChange(e, "lastName"),
    },
    {
      label: "Email",
      type: "input",
      value: contact.email,
      onChange: (e) => handleChange(e, "email"),
    },
    {
      label: "Position",
      type: "input",
      value: contact.position,
      onChange: (e) => handleChange(e, "position"),
    },
    {
      label: "Phone",
      type: "number",
      value: contact.phone,
      error: validationError?.phone,
      helperText: validationError?.phone,
      onChange: (e) => handleChange(e, "phone"),
    },
    {
      label: "Mobile",
      type: "number",
      value: contact.mobile,
      error: validationError?.mobile,
      helperText: validationError?.mobile,
      onChange: (e) => handleChange(e, "mobile"),
    },
  ];

  const submitContact = async () => {
    let error = {},
      message = "Please fill valid details";
    let lengthMessage = "Exceeded maximum length";
    if (_.isEmpty(contact.salutation)) {
      error = { ...error, salutation: message };
    }
    if (_.isEmpty(contact.firstName)) {
      error = { ...error, firstName: message };
    }
    if (!_.isEmpty(contact.phone) && contact.phone.length > 10) {
      error = { ...error, phone: lengthMessage };
    }
    if (!_.isEmpty(contact.mobile) && contact.mobile.length > 10) {
      error = { ...error, mobile: lengthMessage };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      // return;
      let data = {
        create: true,
        "loggedinuserid": userId,
        //Changed account id back to string as per discussion with backend
        accountid: contact?.account?.value.toString(),
        salutationid: parseInt(contact?.salutation?.value),
        firstname: contact.firstName || "",
        lastname: contact.lastName || "",
        email: contact.email || "",
        position: contact.position || "",
        phone: contact.phone?.toString() || "",
        mobile: contact.mobile?.toString() || "",
      };
      setLoading(true);
      setDisableCreate(true);
      try {
        let response = await createAccountContact(data);
        console.log("Response", response);
        if (response) {
          setSnack({
            open: true,
            message: "Contact created successfully",
          });
          setTimeout(() => {
            // props.back();
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
          <Typography>Contact details</Typography>
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
          <Button
            disabled={disableCreate}
            label={loading ? "Loading..." : "Create Contact"}
            onClick={submitContact}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateContact;
