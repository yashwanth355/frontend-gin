import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, FormControl } from '@material-ui/core';
import { TextField } from '../../../components/TextField';
import { Select } from '../../../components/Select';
import Button from '../../../components/Button';
import { getRoles, changeUserStatusDisable, registerUser, getCompanyNames, getDesignation, getDepartmentNames, getDivisionNames, getDelegatedApprover, getCountryNames, getStateNames, getCityNames, getProfileName } from '../../../apis'
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import useToken from '../../../hooks/useToken';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%',
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    }
}));

export const formatToSelection = (data = [], key) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: v[key], value: v[key] }))
    return formattedData;
}

export default function CreateUser(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    const [validationError, setValidationError] = useState({});
    const [generalInfo, setGeneralInfo] = useState({});
    const [roles, setRoles] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [department, setDepartment] = useState([]);
    const [division, setDivision] = useState([]);
    const [delegatedApprover, setDelegatedApprover] = useState([]);
    const [country, setCountry] = useState([]);
    const [stateName, setStateName] = useState([]);
    const [cities, setCityName] = useState([]);
    const [profile, setProfileName] = useState([]);
    const [mailingAddress, setMailingAddress] = useState({});
    const [approver, setApprover] = useState({});
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getRoles().then(res => setRoles(formatToSelection(res, 'userrole')));
        getCompanyNames().then(res => setCompanies(formatToSelection(res, 'compname')));
        getDesignation().then(res => setDesignation(formatToSelection(res, 'desgName')));
        getDepartmentNames().then(res => setDepartment(formatToSelection(res, 'deptname')));
        // setDepartment(["a",'b','c'])
        getDelegatedApprover().then(res => res && setDelegatedApprover(formatToSelection(res, 'delegatedapprover')));
        getCountryNames().then(res => setCountry(formatToSelection(res, 'country')));
        getProfileName().then(res => setProfileName(formatToSelection(res, 'userprofile')));
    }, [])

    const handleChange = (event, key,) => {
        let data = {
            ...generalInfo,
            [key]: event.target.value
        }
        setGeneralInfo(data);
        if (key === 'department') {
            getDivisionNames({ deptname: event.target.value }).then(res => setDivision(formatToSelection(res, 'division')));
        }
    };

    const handleMailingChange = (event, key) => {
        setMailingAddress({
            ...mailingAddress,
            [key]: event.target.value
        });
        if (key === 'country') {
            getStateNames({ countryname: event.target.value }).then(res => setStateName(formatToSelection(res, 'state'))).catch(err => console.log("Get state error", err.message));
        }
        if (key === 'state') {
            getCityNames({ statename: event.target.value }).then(res => setCityName(formatToSelection(res, 'city'))).catch(err => console.log("Get state error", err.message));
        }
    };

    const handleApproverChange = (event, key) => {
        setApprover({
            ...approver,
            [key]: event.target.value
        });
    };

    function isUpper(str) {
        return /[A-Z]/.test(str);
    }

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const createUser = async (e) => {
        e.preventDefault();
        const { firstName, lastName, middlename, email, alias, username, empcode, designation, company, employee, department, division, role, title, active, profile, phone, mobile, extension } = generalInfo;
        const { street, city, state, postalcode, country } = mailingAddress;
        let data = {
            "userid": new Date().getTime(),
            "emailid": email?.trim(),
            "password": "Ccl@1234",
            "firstname": firstName,
            "lastname": lastName,
            "middlename": middlename,
            "alias": alias,
            "username": username?.trim(),
            "empcode": empcode,
            "designation": designation,
            "company": company,
            "employee": employee,
            "department": department,
            "division": division,
            "role": role,
            "title": title,
            "active": active,
            "ext": extension,
            "phone": phone,
            "mobile": mobile,
            "profile": generalInfo?.profile,
            "delegatedapprover": approver?.delegatedapprover,
            "manager": approver?.manager,
            "street": street,
            "city": city,
            "state": state,
            "postalcode": postalcode,
            "country": country,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(firstName)) {
            errorObj = { ...errorObj, firstName: message };
        }
        if (_.isEmpty(lastName)) {
            errorObj = { ...errorObj, lastName: message };
        }
        if (_.isEmpty(email)) {
            errorObj = { ...errorObj, email: message };
        }
        if (_.isEmpty(alias)) {
            errorObj = { ...errorObj, alias: message };
        }
        if (_.isEmpty(username)) {
            errorObj = { ...errorObj, username: message };
        }
        if (_.isEmpty(empcode)) {
            errorObj = { ...errorObj, empcode: message };
        }
        if (_.isEmpty(role)) {
            errorObj = { ...errorObj, role: message };
        }
        if (_.isEmpty(profile)) {
            errorObj = { ...errorObj, profile: message };
        }
        if (_.isEmpty(city)) {
            errorObj = { ...errorObj, city: message };
        }
        if (_.isEmpty(state)) {
            errorObj = { ...errorObj, state: message };
        }
        if (_.isEmpty(country)) {
            errorObj = { ...errorObj, country: message };
        }
        if (_.isEmpty(street)) {
            errorObj = { ...errorObj, street: message };
        }
        if (_.isEmpty(postalcode)) {
            errorObj = { ...errorObj, postalcode: message };
        }
        if (email === username) {
            errorObj = { ...errorObj, username: message };
        }
        if (!validateEmail(email)) {
            errorObj = { ...errorObj, email: 'Please enter valid email' };
        }
        if (isUpper(email)) {
            errorObj = { ...errorObj, email: 'Email id should not contain capital letter.' };
        }
        setValidationError(errorObj);
        if (_.isEmpty(errorObj)) {
            setLoading(true);
            try {
                let response = await registerUser(data);
                console.log('response::', response)
                if (response) {
                    if (response.status === 230) {
                        // eslint-disable-next-line
                        throw { message: "User with same email already exists" };
                    }
                    setSnack({
                        open: true,
                        message: 'User created successfully',
                        severity: "success",
                    })
                    setGeneralInfo({});
                    // setMailingAddress({});
                    setApprover({});
                    setTimeout(() => {
                        // navigate(-1);
                        props.updateCreationInfo();
                    }, 1500);
                }
                let payload = {
                    "username": email?.trim(),
                }
                if (data.active === undefined || !data.active) {
                    setTimeout(async () => {
                        await changeUserStatusDisable(payload)
                    }, 5000);
                }
            } catch (e) {
                console.log("Error in creating user", e);
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
            finally {
                setLoading(false);
            }
        }
    }

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        General Information
                    </Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="First name"
                        value={generalInfo.name}
                        onChange={(e) => handleChange(e, 'firstName')}
                        error={validationError?.firstName}
                        helperText={validationError?.firstName}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Middle name"
                        value={generalInfo.middlename}
                        onChange={(e) => handleChange(e, 'middlename')}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        label="Last name"
                        value={generalInfo.lastName}
                        onChange={(e) => handleChange(e, 'lastName')}
                        error={validationError?.lastName}
                        helperText={validationError?.lastName}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Alias"
                        value={generalInfo.alias}
                        onChange={(e) => handleChange(e, 'alias')}
                        error={validationError?.alias}
                        helperText={validationError?.alias}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Email"
                        value={generalInfo.email}
                        onChange={(e) => handleChange(e, 'email')}
                        error={validationError?.email}
                        helperText={validationError?.email}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Username"
                        value={generalInfo.username}
                        onChange={(e) => handleChange(e, 'username')}
                        error={validationError?.username}
                        helperText={validationError?.username}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="EMP code"
                        value={generalInfo.empcode}
                        onChange={(e) => handleChange(e, 'empcode')}
                        error={validationError?.empcode}
                        helperText={validationError?.empcode}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={2} sm={1}>
                    <TextField
                        label="Ext"
                        value={generalInfo.extension}
                        onChange={(e) => handleChange(e, 'extension')}
                    // error={validationError?.extension}
                    />
                </Grid>
                <Grid item xs={10} sm={5}>
                    <TextField
                        label="Phone"
                        value={generalInfo.phone}
                        onChange={(e) => handleChange(e, 'phone')}
                        // error={validationError?.phone}
                        inputProps={{ maxLength: 10 }}
                    // required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Mobile"
                        value={generalInfo.mobile}
                        onChange={(e) => handleChange(e, 'mobile')}
                        inputProps={{ maxLength: 10 }}
                    // required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Designation"
                        value={generalInfo.designation}
                        onChange={e => handleChange(e, 'designation')}
                        options={designation || []}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Company"
                        value={generalInfo.company}
                        onChange={e => handleChange(e, 'company')}
                        options={companies || []}
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Department"
                        value={generalInfo.department}
                        onChange={e => handleChange(e, 'department')}
                        options={department || []}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Division"
                        value={generalInfo.division}
                        onChange={e => handleChange(e, 'division')}
                        options={division || []}
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <FormControl error={validationError?.role} fullWidth>
                        <Select
                            label="Role *"
                            value={generalInfo.role}
                            onChange={(e) => handleChange(e, 'role')}
                            options={roles || []}
                            error={validationError?.role}
                            helperText={validationError?.role}
                            required
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl error={validationError?.profile} fullWidth>
                        <Select
                            label="Profile *"
                            value={generalInfo.profile}
                            onChange={(e) => handleChange(e, 'profile')}
                            options={profile || []}
                            error={validationError?.profile}
                            helperText={validationError?.profile}
                            required
                        />
                    </FormControl>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Employee"
                        value={generalInfo.employee}
                        onChange={(e) => handleChange(e, 'employee')}
                        options={[
                            { label: 'YES', value: true },
                            { label: 'NO', value: false },
                        ]}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Title"
                        value={generalInfo.title}
                        onChange={(e) => handleChange(e, 'title')}
                    // required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Active"
                        value={generalInfo.active}
                        onChange={(e) => handleChange(e, 'active')}
                        options={[
                            { label: 'Active', value: true },
                            { label: 'In Active', value: false },
                        ]}
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Approver settings
                    </Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Delegated approver"
                        value={approver.delegatedapprover}
                        onChange={e => handleApproverChange(e, 'delegatedapprover')}
                        options={delegatedApprover || []}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Manager"
                        value={approver.manager}
                        onChange={e => handleApproverChange(e, 'manager')}
                        options={delegatedApprover || []}
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Mailing address
                    </Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="Country *"
                        value={mailingAddress.country}
                        onChange={e => handleMailingChange(e, 'country')}
                        options={country || []}
                        error={validationError?.country}
                        helperText={validationError?.country}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="State/Province *"
                        value={mailingAddress.state}
                        onChange={e => handleMailingChange(e, 'state')}
                        options={stateName || []}
                        error={validationError?.state}
                        helperText={validationError?.state}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Address"
                        value={mailingAddress.street}
                        onChange={e => handleMailingChange(e, 'street')}
                        rows={3}
                        multiline
                        error={validationError?.street}
                        helperText={validationError?.street}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        label="City *"
                        value={mailingAddress.city}
                        onChange={e => handleMailingChange(e, 'city')}
                        options={cities || []}
                        error={validationError?.city}
                        helperText={validationError?.city}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Zip/Postal code"
                        value={mailingAddress.postalcode}
                        onChange={e => handleMailingChange(e, 'postalcode')}
                        error={validationError?.postalcode}
                        helperText={validationError?.postalcode}
                        required
                    />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1)} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? "Loading..." : "Create User"} onClick={createUser} />
                </Grid>
            </Grid>
        </form>
    );
}
