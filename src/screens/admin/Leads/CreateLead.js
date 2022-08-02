import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import _ from 'lodash';
import { createLead, getCityNames, getCountryNames, getStateNames, getLeadsInfo, } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import useToken from '../../../hooks/useToken';
import { useNavigate } from 'react-router-dom';
import '../../common.css'
const useStyles = makeStyles((theme) => ({
    root: {
        margin: 30,
        '& .MuiTextField-root': {
            margin: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%',
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& #top-row': {
            marginTop: 10,
            marginBottom: 5
        }
    }
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v.id || v[key] }))
    return formattedData;
}
const formatToSelectionPhoneCodes = (data = []) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: `${v.countryname} (+${v.dialcode})`, value: v.dialcode }))
    return formattedData;
}

const CreateLead = (props) => {
    const classes = useStyles();
    const [lead, setLeadInfo] = useState({});
    const [contact, setContactInfo] = useState({});
    const [profileCompletion, setProfileCompletion] = useState({ sample: "No", manufacturing: "No", business: "No", });
    const [billing, setBilling] = useState({});
    const [contactAddress, setContactAddress] = useState({});
    const [shipping, setShipping] = useState({});
    const [showBilling, setShowBilling] = useState({});
    const [showContact, setShowContact] = useState({});
    const [coffeeType, setCoffeeType] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [product, setProduct] = useState([]);
    const [phonecodes, setPhonecodes] = useState([]);
    const [salutation, setSalutation] = useState([]);
    const [shippingCountries, setShippingCountries] = useState([]);
    const [validationError, setValidationError] = useState({});
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [sameAsBilling, setSameAsBilling] = useState(false);
    const [disableCreate, setDisableCreate] = useState(false);
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    useEffect(() => {
        getLeadsInfo({ "type": "accountDetails" }).then(res => setAccountTypes(formatToSelection(res, 'accounttype', 'accounttype')));
        getLeadsInfo({ "type": "productsegments" }).then(res => setProduct(formatToSelection(res, 'productsegment', 'id')));
        getLeadsInfo({ "type": "phonecodes" }).then(res => setPhonecodes(formatToSelectionPhoneCodes(res)));
        getLeadsInfo({ "type": "coffeetypes" }).then(res => setCoffeeType(formatToSelection(res, 'coffeetype', 'id')));
        getLeadsInfo({ "type": "salutations" }).then(res => setSalutation(formatToSelection(res, 'salutation')));
    }, []);
    const getCountryName = () => {
        getCountryNames().then(res => {
            let countries = formatToSelection(res, 'country');
            setShowBilling({ ...showBilling, country: countries });
            setShowContact({ ...showContact, country: countries });
        });
    }
    useEffect(() => {
        getCountryName();
        // eslint-disable-next-line
    }, []);
    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setLeadInfo({
            ...lead,
            [key]: value,
        })
    }
    const accountTypehandleChange = (e, value) => {
        if (!value) {
            return;
        } else {
            setLeadInfo({
                ...lead,
                'accountType': value,
            })
        }
    }
    const handleChange2 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setContactInfo({
            ...contact,
            [key]: value,
        })
    }
    const handleChange3 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setProfileCompletion({
            ...profileCompletion,
            [key]: value,
        })
    }
    const handleChange4 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setBilling({
            ...billing,
            [key]: value,
        })
        if (sameAsBilling) {
            setContactAddress({
                ...contactAddress,
                [key]: value
            })
        }
    }

    const handleChange5 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setContactAddress({
            ...contactAddress,
            [key]: value,
        })
    }

    const handleproductSegmentChange = (e, value) => {
        e.preventDefault();
        setLeadInfo({
            ...lead,
            'productSegment': value,
        })
    }

    const payload = [
        {
            label: 'Lead for company',
            type: 'input',
            disabled: true,
            value: "CCL",
        },
        {
            label: 'Lead name',
            type: 'input',
            required: true,
            value: lead.name,
            error: validationError?.name,
            helperText: validationError?.name,
            onChange: (e) => handleChange(e, 'name'),
        },
        {
            label: 'Aliases name',
            type: 'input',
            value: lead.aliases,
            onChange: (e) => handleChange(e, 'aliases'),
        },
        {
            label: 'Account type',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            required: true,
            error: validationError?.accountType,
            helperText: validationError?.accountType,
            value: lead.accountType,
            options: accountTypes || [],
            onChange: accountTypehandleChange,
        },
        {
            label: 'Website',
            type: 'input',
            value: lead.website,
            onChange: (e) => handleChange(e, 'website'),
        },
        {
            label: 'Annual turn over ($)',
            type: 'input',
            value: lead.turnover,
            onChange: (e) => handleChange(e, 'turnover'),
        },
        {
            label: 'Product segment',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            value: lead.productSegment || [],
            options: product,
            onChange: handleproductSegmentChange
        },
    ];

    const handlesalutationChange = (e, value) => {
        setContactInfo({
            ...contact,
            'salutation': value,
        })
    }

    const handlextChange = (e, value) => {
        e.preventDefault();
        setContactInfo({
            ...contact,
            'ext': value,
        })
    }

    const payload2 = [
        {
            label: 'Salutation',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.salutation,
            helperText: validationError?.salutation,
            value: contact.salutation,
            options: salutation,
            onChange: handlesalutationChange,
        },
        {
            label: 'First name',
            type: 'input',
            required: true,
            value: contact.firstName,
            error: validationError?.firstName,
            helperText: validationError?.firstName,
            onChange: (e) => handleChange2(e, 'firstName'),
        },
        {
            label: 'Last name',
            type: 'input',
            required: true,
            value: contact.lastName,
            error: validationError?.lastName,
            helperText: validationError?.lastName,
            onChange: (e) => handleChange2(e, 'lastName'),
        },
        {
            label: 'Email',
            type: 'input',
            required: true,
            value: contact.email,
            error: validationError?.email,
            helperText: validationError?.email,
            onChange: (e) => handleChange2(e, 'email'),
        },
        {
            label: 'Designation',
            type: 'input',
            value: contact.designation,
            onChange: (e) => handleChange2(e, 'designation'),
        },
        {
            label: 'Ext',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.ext,
            helperText: validationError?.ext,
            value: contact.ext !== undefined ? contact.ext : '',
            options: phonecodes,
            onChange: handlextChange,
            sm: 3,
        },
        {
            label: 'Phone',
            type: 'number',
            required: true,
            value: contact.phone,
            error: validationError?.phone,
            helperText: validationError?.phone,
            placeholder: '',
            onChange: (e) => handleChange2(e, 'phone'),
            sm: 3,
        },
        {
            label: 'Mobile',
            type: 'number',
            value: contact.mobile,
            error: validationError?.mobile,
            helperText: validationError?.mobile,
            onChange: (e) => handleChange2(e, 'mobile'),
        },
    ];

    const handleinterestedChange = (e, value) => {
        setProfileCompletion({
            ...profileCompletion,
            'interested': value,
        })
    }
    const payload3 = [
        {
            label: 'Instant coffee business',
            type: 'radio',
            value: profileCompletion.business || "No",
            options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
            onChange: (e) => handleChange3(e, 'business'),
            sm: 3
        },
        {
            label: 'Manufacturing unit',
            type: 'radio',
            value: profileCompletion.manufacturing || "No",
            options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
            onChange: (e) => handleChange3(e, 'manufacturing'),
            sm: 3
        },
        {
            label: 'Coffee type',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            value: profileCompletion.interested,
            options: coffeeType,
            onChange: handleinterestedChange
        },
        {
            label: 'Sample ready',
            type: 'radio',
            value: profileCompletion.sample || "No",
            options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
            onChange: (e) => handleChange3(e, 'sample'),
        },
        {
            label: 'Other information',
            type: 'input',
            required: false,
            value: profileCompletion.otherinformation,
            onChange: (e) => handleChange3(e, 'otherinformation'),
        }
    ]

    const handlecountryChange = (e, value) => {
        if (!_.isEmpty(value)) {
            getStateNames({ countryname: value.value }).then(res => setShowBilling({ ...showBilling, state: formatToSelection(res, 'state') })).catch(err => console.log("Get state error", err.message));
            setBilling({
                ...billing,
                'country': value,
                'state': null,
                'city': null
            })
            if (sameAsBilling) {
                setContactAddress({
                    ...contactAddress,
                    'country': value,
                    'state': null,
                    'city': null
                })
            }
        }
        else {
            setShowBilling({ ...showBilling, state: [] })
            setBilling({ ...billing, 'country': null, 'state': null, 'city': null });
            if (sameAsBilling) {
                setContactAddress({
                    ...contactAddress,
                    'country': null,
                    'state': null,
                    'city': null
                })
            }
        }
    }
    const handlestateChange = (e, value) => {
        if (!_.isEmpty(value)) {
            getCityNames({ statename: value.value }).then(res => setShowBilling({ ...showBilling, city: formatToSelection(res, 'city') })).catch(err => console.log("Get state error", err.message));
            setBilling({
                ...billing,
                'state': value,
                'city': null
            })
            if (sameAsBilling) {
                setContactAddress({
                    ...contactAddress,
                    'state': value,
                    'city': null
                })
            }
        }
        else {
            setShowBilling({ ...showBilling, city: [] })
            setBilling({ ...billing, 'state': null, 'city': null })
            if (sameAsBilling) {
                setContactAddress({
                    ...contactAddress,
                    'state': null,
                    'city': null
                })
            }
        }

    }
    const handlecityChange = (e, value) => {
        setBilling({
            ...billing,
            'city': value,
        })
        if (sameAsBilling) {
            setContactAddress({
                ...contactAddress,
                'city': value
            })
        }
    }

    const payload4 = [
        {
            label: 'Street name',
            type: 'input',
            required: true,
            value: billing.street,
            error: validationError?.billingStreet,
            helperText: validationError?.billingStreet,
            onChange: (e) => handleChange4(e, 'street'),
        },
        {
            label: 'Country',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingCountry,
            helperText: validationError?.billingCountry,
            value: billing.country || "",
            options: showBilling.country || [],
            onChange: handlecountryChange,
        },
        {
            label: 'Province/State',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingState,
            helperText: validationError?.billingState,
            value: billing.state || "",
            options: showBilling.state || [],
            onChange: handlestateChange,
        },
        {
            label: 'City',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingCity,
            helperText: validationError?.billingCity,
            value: billing.city || "",
            options: showBilling.city || [],
            onChange: handlecityChange,
        },
        {
            label: 'Postal code',
            type: 'input',
            inputProps: { maxLength: 6 },
            value: billing.postalcode,
            onChange: (e) => handleChange4(e, 'postalcode'),
        },
    ];

    const handlecountryChange5 = (e, value) => {
        if (!_.isEmpty(value)) {
            getStateNames({ countryname: value.value }).then(res => setShowContact({ ...showContact, state: formatToSelection(res, 'state') })).catch(err => console.log("Get state error", err.message));
            setContactAddress({
                ...contactAddress,
                'country': value,
                'city': null,
                'state': null
            })
        } else {
            setShowContact({ ...showContact, state: [] })
            setContactAddress({ ...contactAddress, country: null, state: null, city: null })
        }

    }
    const handlestateChange5 = (e, value) => {
        if (!_.isEmpty(value)) {
            getCityNames({ statename: value.value }).then(res => setShowContact({ ...showContact, city: formatToSelection(res, 'city') })).catch(err => console.log("Get state error", err.message));
            setContactAddress({
                ...contactAddress,
                'state': value,
                'city': null
            })
        } else {
            setShowContact({ ...showContact, city: [] })
            setContactAddress({ ...contactAddress, state: null, city: null })
        }

    }
    const handlecityChange5 = (e, value) => {
        setContactAddress({
            ...contactAddress,
            'city': value,
        })
    }


    const handlecontinentChange6 = (e, value) => {
        if (!_.isEmpty(value)) {
            getLeadsInfo({ "type": "countries", "continentname": value.value })
                .then(res => res && setShippingCountries(formatToSelection(res, 'countryname')));
            setShipping({
                ...shipping,
                'continent': value,
                'country': null
            })
        } else {
            setShippingCountries([])
            setShipping({ ...shipping, 'continent': null, 'country': null });
        }

    }

    const handlecountryChange6 = (e, value) => {
        setShipping({
            ...shipping,
            'country': value,
        })
    }

    const onClickSameBilling = (e) => {
        var val = e.target.checked;
        setSameAsBilling(val);
        if (!!val) {
            setContactAddress(billing);
        }
    }

    const payload9 = [
        {
            label: 'Same as Billing',
            type: 'checkbox',
            sm: 6,
            checked: sameAsBilling,
            onChange: (e) => onClickSameBilling(e),
        },
    ];

    const payload5 = [
        {
            label: 'Street name',
            type: 'input',
            value: contactAddress.street || '',
            onChange: (e) => handleChange5(e, 'street'),
        },
        {
            label: 'Country',
            type: 'autocomplete',
            labelprop: "label",
            value: contactAddress.country || "",
            options: showContact.country || [],
            onChange: handlecountryChange5
        },
        {
            label: 'Province/State',
            type: 'autocomplete',
            labelprop: "label",
            value: contactAddress.state || "",
            options: showContact.state || [],
            onChange: handlestateChange5
        },
        {
            label: 'City',
            type: 'autocomplete',
            labelprop: "label",
            value: contactAddress.city || "",
            options: showContact.city || [],
            onChange: handlecityChange5
        },
        {
            label: 'Postal code',
            type: 'input',
            inputProps: { maxLength: 6, },
            value: contactAddress.postalcode || '',
            onChange: (e) => handleChange5(e, 'postalcode'),
        },
        {
            label: 'Shipping to continent',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.shippingContinent,
            helperText: validationError?.shippingContinent,
            value: shipping.continent || "",
            options: [{ label: "South America", value: "South America" }, { label: "Oceania", value: "Oceania" }, { label: "North America", value: "North America" }, { label: "Europe", value: "Europe" }, { label: "Asia", value: "Asia" }, { label: "Antarctica", value: "Antarctica" }, { label: "Africa", value: "Africa" }],
            onChange: handlecontinentChange6
        },
        {
            label: 'Shipping to country',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.shippingCountry,
            helperText: validationError?.shippingCountry,
            value: shipping.country || "",
            options: shippingCountries,
            onChange: handlecountryChange6
        },
    ];

    const getLeadScore = () => {
        const { interested, sample, manufacturing, business, otherinformation } = profileCompletion;
        let percentage = 0;
        if (interested?.length > 0 && !_.isEmpty(interested[0])) {
            percentage = percentage + 20;
        }
        if (!_.isEmpty(sample)) {
            percentage = percentage + 20;
        }
        if (!_.isEmpty(manufacturing)) {
            percentage = percentage + 20;
        }
        if (!_.isEmpty(business)) {
            percentage = percentage + 20;
        }
        if (!_.isEmpty(otherinformation)) {
            percentage = percentage + 20;
        }
        return percentage;
    }

    const submitLead = async () => {
        const { phone, mobile, designation, salutation, firstName, lastName, email, ext } = contact;
        const { postalcode, street, country, state, city } = billing;
        const { interested, sample, manufacturing, business, otherinformation } = profileCompletion;
        const { website, productSegment, turnover, accountType, name, aliases } = lead;
        const { continent } = shipping;
        let interestedtemp = [];
        // eslint-disable-next-line
        interested?.map((item, index) => {
            interestedtemp.push(item.value);
        })

        let productSegmenttemp = [];
        // eslint-disable-next-line
        productSegment?.map((item, index) => {
            productSegmenttemp.push(item.value);
        })

        let accountTypetemp = [];
        // eslint-disable-next-line
        accountType?.map((item, index) => {
            accountTypetemp.push(item.value);
        })
        let error = {}, message = "Please fill valid details";
        let lengthMessage = "Exceeded maximum length"
        if (_.isEmpty(name)) {
            error = { ...error, name: message };
        }
        if (_.isEmpty(firstName)) {
            error = { ...error, firstName: message };
        }
        if (_.isEmpty(lastName)) {
            error = { ...error, lastName: message };
        }
        if (_.isEmpty(salutation)) {
            error = { ...error, salutation: message };
        }
        if (_.isEmpty(email)) {
            error = { ...error, email: message };
        }
        if (_.isEmpty(ext)) {
            error = { ...error, ext: message }
        }
        if (_.isEmpty(phone)) {
            error = { ...error, phone: message };
        }
        if (!_.isEmpty(phone) && phone.length > 10) {
            error = { ...error, phone: lengthMessage };
        }
        if (!_.isEmpty(mobile) && mobile.length > 10) {
            error = { ...error, mobile: lengthMessage };
        }
        if (_.isEmpty(accountType)) {
            error = { ...error, accountType: message };
        }
        if (_.isEmpty(street)) {
            error = { ...error, billingStreet: message };
        }
        if (_.isEmpty(country)) {
            error = { ...error, billingCountry: message };
        }
        if (_.isEmpty(state)) {
            error = { ...error, billingState: message };
        }
        if (_.isEmpty(city)) {
            error = { ...error, billingCity: message };
        }
        if (_.isEmpty(continent)) {
            error = { ...error, shippingContinent: message };
        }
        if (_.isEmpty(shipping.country)) {
            error = { ...error, shippingCountry: message };
        }
        if (!_.isEmpty(error)) {
            try {
                setValidationError(error);
                const errorMessage = { message: "Please fill all mandatory fields" }
                throw errorMessage;
            }
            catch (err) {
                setSnack({
                    open: true,
                    message: err.response?.data,
                    severity: "error",
                })
            }
        }
        else {
            setLoading(true);
            setDisableCreate(true);
            let data = {
                "update": false,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "accountname": name,
                "accounttypeid": accountTypetemp?.join(","),
                "aliases": aliases,
                "approvalstatus": true,
                "approxannualrev": turnover,
                "billing_citycode": city?.value,
                "billing_countrycode": country?.value,
                "billing_postalcode": postalcode,
                "billing_statecode": state?.value,
                "billing_street": street,
                "coffeetypeid": interestedtemp?.join(","),
                "contact_citycode": contactAddress?.city?.value,
                "contact_countrycode": contactAddress?.country?.value,
                "contact_email": email,
                "contact_ext": ext?.value,
                "contact_firstname": firstName,
                "contact_lastname": lastName,
                "contact_mobile": mobile,
                "contact_phone": phone,
                "contact_position": designation,
                "contact_postalcode": contactAddress?.postalcode,
                "contact_salutationid": +salutation?.value,
                "contact_statecode": contactAddress?.state?.value,
                "contact_street": contactAddress?.street,
                "countryid": "123",
                "createddate": new Date(),
                "createduserid": getCurrentUserDetails().id,
                "loggedinuserid": getCurrentUserDetails()?.id,
                "instcoffee": business === "Yes" ? true : false,
                "isactive": true,
                "leadscore": getLeadScore(),
                "manfacunit": manufacturing === "Yes" ? true : false,
                "masterstatus": "New",
                "productsegmentid": productSegmenttemp?.join(","),
                "sample_ready": sample === "Yes" ? true : false,
                "shipping_continent": continent?.value,
                "shipping_continentid": "123",
                "shipping_country": shipping?.country?.value,
                "website": website,
                "otherinformation": otherinformation
            }
            try {
                let response = await createLead(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Lead created successfully",
                    });
                    setTimeout(() => {
                        // navigate(-1)
                        setLoading(false);
                        
                    }, 2000)
                }
            } catch (e) {
                setLoading(false);
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
        }
    }

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Leads information
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload} />
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Contacts information
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload2} />
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Profile completion
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload3} />
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Billing address
                    </Typography>
                </Grid>

            </Grid>
            <Template payload={payload4} />
            <Grid id="top-row" container alignItems='flex-end'>
                <Grid item md={9} xs={6} className='item'>
                    <Typography>
                        Shipping address
                    </Typography>
                </Grid>
                <Grid item md={3} xs={6} className='item'>
                    <Template payload={payload9} spacing={12} />
                </Grid>
            </Grid>
            <Template payload={payload5} />
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1)} />
                </Grid>
                <Grid item>
                    <Button disabled={disableCreate} label={loading ? 'Loading ...' : 'Create Lead'} onClick={submitLead} />
                </Grid>
            </Grid>
        </form>
    )
}

export default CreateLead;