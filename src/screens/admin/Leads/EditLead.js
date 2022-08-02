import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../constants/colors';
import { Grid, Typography } from '@material-ui/core';
import _ from 'lodash';
import { createLead, getCityNames, getCountryNames, getStateNames, getLeadsInfo, getLeadsDetails, getContactsInLeadtoAcc, convertLeadToAccount, getUsers, reAssignLead } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import SimpleModal from '../../../components/Modal';
import { Container } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { PieChart } from 'react-minimal-pie-chart';
import useToken from '../../../hooks/useToken';
import ErpContactsList from './ErpContactsList';
import '../../common.css'
import AuditLog from './AuditLog';
import { numberWithCommas } from '../../common';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import roles from '../../../constants/roles';
// import { leadRoute } from '../../../utils/routeBuilder'

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: 30,
        marginRight: 30,
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
        '& #top-row': {
            marginTop: 10,
            marginBottom: 5
        }
    },
    profileGraph: {
        marginLeft: 30,
        height: '25%'
    },
    modal: {
        position: 'absolute',
        margin: 'auto',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1000,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflow: "scroll",
    },
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const formatToSelectionPhoneCodes = (data = []) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: `${v.countryname} (+${v.dialcode})`, value: v.dialcode }))
    return formattedData;
}

const formatToSelectionUsers = (data = [], key) => {
    let formattedData = [];
    data?.map(v => formattedData.push({ label: v[key], value: v.userid || v[key] }))
    return formattedData;
}

const structuredLead = (viewPayload = {}) => ({
    name: viewPayload.accountname || '',
    aliases: viewPayload.aliases || '',
    accountType: viewPayload.accounttypeid?.split(","),
    website: viewPayload.website || '',
    turnover: viewPayload.approxannualrev || '',
    productSegment: viewPayload.Productsegment, //productsegmentid?.split(","),
    status: viewPayload.status
})

const profileCompletionStruct = (viewPayload = {}) => ({
    business: viewPayload.instcoffee === true ? "Yes" : "No",
    manufacturing: viewPayload.manfacunit === true ? "Yes" : "No",
    sample: viewPayload.sample_ready === true ? "Yes" : "No",
    interested: viewPayload.coffeetypeid?.split(","),
    otherinformation: viewPayload.otherinformation || '',
})

const EditLead = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leadId } = useParams();
    const classes = useStyles();
    // const [edit, setEdit] = useState(false);
    const edit = location.pathname.split('/')[location.pathname.split('/').length - 1] === 'edit'
    const [convertOn, setConvertOn] = useState(false);
    const [approveOn, setApproveOn] = useState(false);
    const [rejectOn, setRejectOn] = useState(false);
    const [reAssignOn, setReAssignOn] = useState(false);
    const [lead, setLeadInfo] = useState(structuredLead());
    const [contact, setContactInfo] = useState(null);
    const [profileCompletion, setProfileCompletion] = useState(profileCompletionStruct());
    const [leadscore, setLeadScore] = useState(0);
    const [billingStreet, setBillingStreet] = useState('');
    const [billingCountry, setBillingCountry] = useState('');
    const [billingState, setBillingState] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingPostal, setBillingPostal] = useState('');
    const [shipping, setShipping] = useState({});
    const [showBillingCountry, setShowBillingCountry] = useState([]);
    const [showBillingState, setShowBillingState] = useState([]);
    const [showBillingCity, setShowBillingCity] = useState([]);
    const [defaultContactData, setDefaultContactData] = useState({});
    const [contactStreet, setContactStreet] = useState('');
    const [contactCountry, setContactCountry] = useState('');
    const [contactState, setContactState] = useState('');
    const [contactCity, setContactCity] = useState('');
    const [contactPostal, setContactPostal] = useState('');
    const [showContactCountry, setShowContactCountry] = useState([]);
    const [showContactState, setShowContactState] = useState([]);
    const [showContactCity, setShowContactCity] = useState([]);
    const [sameAsBilling, setSameAsBilling] = useState(false);
    // const [contactExt, setContactExt] = useState("");
    // eslint-disable-next-line
    const [coffeeType, setCoffeeType] = useState([]);
    // eslint-disable-next-line
    const [accountType, setAccountType] = useState([]);
    // eslint-disable-next-line
    const [product, setProduct] = useState([]);
    // eslint-disable-next-line
    const [phonecodes, setPhonecodes] = useState([]);
    // eslint-disable-next-line
    const [salutation, setSalutation] = useState([]);
    const [shippingCountries, setShippingCountries] = useState([]);
    const [validationError, setValidationError] = useState({});
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [openConvertToAccount, setConvertToAccount] = useState(false);
    const [openReAssign, setReAssign] = useState(false);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line
    const [openApprove, setApprove] = useState(false);
    // eslint-disable-next-line
    const [contactsInLeadToAccount, setContactsInLeadToAccount] = useState({});
    const [usersToReAssign, setUsersToReAssign] = useState([]);
    const [reAssignUser, setReAssignUser] = useState('');
    const [comments, setComments] = useState('');
    const [logData, setLogData] = useState([]);
    const { getCurrentUserDetails } = useToken();

    const getCountryName = () => {
        getCountryNames().then(res => {
            let country = formatToSelection(res, 'country');
            setShowBillingCountry(country);
            setShowContactCountry(country);
        });
    }
    useEffect(() => {
        getCountryName();
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        const tempext = _.find(phonecodes, { value: contact?.ext })
        setContactInfo({ ...contact, ext: { label: tempext?.label, value: tempext?.value } })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phonecodes])
    useEffect(() => {
        getLeadsInfo({ "type": "accountDetails" }).then(res => setAccountType(formatToSelection(res, 'accounttype', 'id')));
        getLeadsInfo({ "type": "productsegments" }).then(res => setProduct(formatToSelection(res, 'productsegment', 'id')));
        let phonedata = [];
        getLeadsInfo({ "type": "phonecodes" }).then(res => {
            phonedata = res;
            setPhonecodes(formatToSelectionPhoneCodes(res))
        });
        getLeadsInfo({ "type": "coffeetypes" }).then(res => setCoffeeType(formatToSelection(res, 'coffeetype', 'id')));
        getLeadsInfo({ "type": "salutations" }).then(res => setSalutation(formatToSelection(res, 'salutation', 'id')));
        if (leadId)
            getLeadsDetails({ leadid: leadId }).then(async res => {
                let leadTemp = {
                    name: res.accountname || '',
                    aliases: res.aliases || '',
                    accountType: formatToSelection(res.accounttypes, 'accounttype', 'id'),
                    website: res.website || '',
                    turnover: res.approxannualrev || '',
                    productSegment: res.Productsegment !== null ? formatToSelection(res.Productsegment, 'productsegment', 'id') : [], //productsegmentid?.split(","),
                    status: res.status
                };
                await setLeadInfo(leadTemp);

                // setContactExt(res.contact_ext);
                const tempext = _.find(formatToSelectionPhoneCodes(phonedata), { value: res.contact_ext })
                let contacttemp = {
                    salutation: { value: res.salutation.id, label: res.salutation.salutation },
                    firstName: res.contact_firstname || '',
                    lastName: res.contact_lastname || '',
                    email: res.contact_email || res.email || '',
                    designation: res.contact_position || '',
                    ext: tempext ? { label: tempext.label, value: tempext.value } : res?.contact_ext ? res?.contact_ext : {},
                    contact_phone: res.contact_phone || '',
                    mobile: res.contact_mobile || ''
                };
                await setContactInfo(contacttemp);
                let profiletemp = {
                    business: res.instcoffee === true ? "Yes" : "No",
                    manufacturing: res.manfacunit === true ? "Yes" : "No",
                    sample: res.sample_ready === true ? "Yes" : "No",
                    interested: formatToSelection(res.coffeetypes ?? [], 'coffeetype', 'coffeetypeid'), //res.coffeetypeid?.split(","),
                    otherinformation: res.otherinformation || '',
                };
                setProfileCompletion(profiletemp);
                setBillingStreet(res.billing_street);
                setBillingPostal(res.billing_postalcode);
                setBillingCountry({ label: res.billing_countrycode, value: res.billing_countrycode });
                setLeadScore(res.leadscore ? parseInt(res.leadscore) : 0);  //getLeadScore() 
                setDefaultContactData({
                    contactStreet: res.contact_street,
                    contactCountry: { label: res.contact_countrycode, value: res.contact_countrycode },
                    contactState: { label: res.billing_statecode, value: res.billing_statecode },
                    contactCity: { label: res.billing_citycode, value: res.billing_citycode },
                    contactPostal: res.contact_postalcode,
                });
                setContactStreet(res.contact_street);
                setLogData(res.audit_log_crm_leads);
                setContactPostal(res.contact_postalcode);
                setContactCountry({ label: res.contact_countrycode, value: res.contact_countrycode });
                getStateNames({ countryname: res.billing_countrycode }).then(states => {
                    setShowBillingState(formatToSelection(states, 'state'));
                    setBillingState({ label: res.billing_statecode, value: res.billing_statecode });
                    getCityNames({ statename: res.billing_statecode }).then(cities => {
                        setShowBillingCity(formatToSelection(cities, 'city'));
                        setBillingCity({ label: res.billing_citycode, value: res.billing_citycode });
                    }).catch(err => console.log("Get city error", err.message));
                }).catch(err => console.log("Get state error", err.message));
                getStateNames({ countryname: res.contact_countrycode }).then(states => {
                    setShowContactState(formatToSelection(states, 'state'));
                    setContactState({ label: res.contact_statecode, value: res.contact_statecode });
                    getCityNames({ statename: res.contact_statecode }).then(cities => {
                        setShowContactCity(formatToSelection(cities, 'city'));
                        setContactCity({ label: res.contact_citycode, value: res.contact_citycode });
                    }).catch(err => console.log("Get city error", err.message));
                }).catch(err => console.log("Get state error", err.message));
                getLeadsInfo({ "type": "countries", "continentname": res.shipping_continent }).then(response => {
                    response && setShippingCountries(formatToSelection(response, 'countryname'));
                    let tempship = {
                        continent: { label: res.shipping_continent, value: res.shipping_continent },
                        country: { label: res.shipping_country, value: res.shipping_country }
                    };
                    setShipping(tempship);
                });
                getContactsInLeadtoAcc({ leadname: res.accountname }).then(res => {
                    setContactsInLeadToAccount((res))
                });
                getUsers({ "type": "Accounts", "loginuserid": getCurrentUserDetails()?.id }).then(res => {
                    setUsersToReAssign(formatToSelectionUsers(res, 'username'))
                });
            });

        // eslint-disable-next-line
    }, [leadId]);


    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setLeadInfo({
            ...lead,
            [key]: value,
        })
    }

    const handleaccountTypeChange = (e, value) => {
        setLeadInfo({
            ...lead,
            'accountType': value,
        })
    }

    const handleChange2 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setContactInfo({
            ...contact,
            [key]: value,
        })
    }
    const handlesalutationChange2 = (e, value) => {
        e.preventDefault();
        setContactInfo({
            ...contact,
            'salutation': value,
        })
    }
    const handleextChange2 = (e, value) => {
        e.preventDefault();
        setContactInfo({
            ...contact,
            'ext': value,
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
    const handleinterestedChange3 = (e, value) => {
        e.preventDefault();
        setProfileCompletion({
            ...profileCompletion,
            'interested': value,
        })
    }

    const handleChange4 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        if (key === 'postalcode') {
            setBillingPostal(value);
            if (sameAsBilling) {
                setContactPostal(value)
            }
        }
        if (key === 'street') {
            setBillingStreet(value);
            if (sameAsBilling) {
                setContactStreet(value)
            }
        }
    }

    const handlecountryChange4 = (e, value) => {
        setBillingCountry(value);
        setBillingState(null);
        setBillingCity(null);
        if (sameAsBilling) {
            setContactCountry(value)
            setContactState(null);
            setContactCity(null);
        }
        getStateNames({ countryname: value.value }).then(res => {
            setShowBillingState(formatToSelection(res, 'state'))
            setShowContactState(formatToSelection(res, 'state'))
        }).catch(err => console.log("Get state error", err.message))
    }

    const handlestateChange4 = (e, value) => {
        setBillingState(value);
        setBillingCity(null);
        if (sameAsBilling) {

            setContactState(value);
            setContactCity(null);
        }
        getCityNames({ statename: value.value })
            .then(res => {
                setShowBillingCity(formatToSelection(res, 'city'))
                setShowContactCity(formatToSelection(res, 'city'))
            }).catch(err => console.log("Get state error", err.message));
    }

    const handlecityChange4 = (e, value) => {
        setBillingCity(value);
        if (sameAsBilling)
            setContactCity(value);
    }

    const handleChange5 = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        if (key === 'postalcode') {
            setContactPostal(value);
        }
        if (key === 'street') {
            setContactStreet(value);
        }
    }

    const handlecountryChange5 = (e, value) => {
        setContactCountry(value);
        getStateNames({ countryname: value?.value }).then(res => setShowContactState(formatToSelection(res, 'state'))).catch(err => console.log("Get state error", err.message));
    }

    const handlestateChange5 = (e, value) => {
        setContactState(value);
        getCityNames({ statename: value?.value }).then(res => setShowContactCity(formatToSelection(res, 'city'))).catch(err => console.log("Get state error", err.message));
    }

    const handlecityChange5 = (e, value) => {
        setContactCity(value);
    }

    const handlecountryChange6 = (e, value) => {
        e.preventDefault();
        setShipping({
            ...shipping,
            'country': value,
        })
    }

    const handlecontinentChange6 = (e, value) => {
        e.preventDefault();
        getLeadsInfo({ "type": "countries", "continentname": value.value }).then(res => res && setShippingCountries(formatToSelection(res, 'countryname')));

        setShipping({
            ...shipping,
            'continent': value,
        })
    }

    const handleChange7 = (e, value) => {
        e.preventDefault();
        setReAssignUser(value);
    }

    const handleChange8 = (e) => {
        e.preventDefault();
        const value = e.target.value;
        setComments(value);
    }

    const handleproductSegmentChange = (e, value) => {
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
            disabled: !edit,
            placeholder: '',
        },
        {
            label: 'Aliases name',
            type: 'input',
            value: lead.aliases,
            onChange: (e) => handleChange(e, 'aliases'),
            disabled: !edit,
            placeholder: '',
        },
        {
            label: 'Account type',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            error: validationError?.accountType,
            helperText: validationError?.accountType,
            value: lead.accountType || [],
            options: accountType,
            onChange: handleaccountTypeChange,
            disabled: !edit,
            placeholder: '',
        },
        {
            label: 'Website',
            type: 'input',
            value: lead.website,
            onChange: (e) => handleChange(e, 'website'),
            disabled: !edit
        },
        {
            label: 'Annual turn over ($)',
            type: 'input',
            value: !edit ? numberWithCommas(lead.turnover) : lead.turnover,
            onChange: (e) => handleChange(e, 'turnover'),
            disabled: !edit,
            placeholder: '',
        },
        {
            label: 'Product segment',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            value: lead.productSegment || [],
            options: product,
            onChange: handleproductSegmentChange,
            disabled: !edit,
            placeholder: '',
        },
    ];
    const payload2 = [
        {
            label: 'Salutation',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.salutation,
            helperText: validationError?.salutation,
            disabled: !edit,
            value: contact?.salutation || '',
            options: salutation,
            onChange: handlesalutationChange2,
        },
        {
            label: 'First name',
            type: 'input',
            required: true,
            value: contact?.firstName || '',
            error: validationError?.firstName,
            helperText: validationError?.firstName,
            onChange: (e) => handleChange2(e, 'firstName'),
            disabled: !edit,
        },
        {
            label: 'Last name',
            type: 'input',
            required: true,
            value: contact?.lastName || '',
            error: validationError?.lastName,
            helperText: validationError?.lastName,
            onChange: (e) => handleChange2(e, 'lastName'),
            disabled: !edit,
        },
        {
            label: 'Email',
            type: 'input',
            required: true,
            value: contact?.email || '',
            error: validationError?.email,
            helperText: validationError?.email,
            onChange: (e) => handleChange2(e, 'email'),
            disabled: !edit,
        },
        {
            label: 'Designation',
            type: 'input',
            value: contact?.designation ? contact?.designation : '',
            onChange: (e) => handleChange2(e, 'designation'),
            disabled: !edit,
        },
        {
            label: 'Ext',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.ext,
            helperText: validationError?.ext,
            value: contact?.ext ? contact.ext : '',
            options: phonecodes,
            onChange: handleextChange2,
            disabled: !edit,
            sm: 3,

        },
        {
            label: 'Phone',
            type: 'number',
            required: true,
            value: contact?.contact_phone || '',
            error: validationError?.contact_phone,
            helperText: validationError?.contact_phone,
            placeholder: '',
            onChange: (e) => handleChange2(e, 'contact_phone'),
            disabled: !edit,
            sm: 3,
        },
        {
            label: 'Mobile',
            type: 'number',
            error: validationError?.mobile,
            helperText: validationError?.mobile,
            value: contact?.mobile || '',
            onChange: (e) => handleChange2(e, 'mobile'),
            disabled: !edit,
        },
    ]
    const payload3 = [
        {
            label: 'Instant coffee business',
            type: 'radio',
            value: profileCompletion.business || "Yes",
            options: [{ label: 'Yes', value: "Yes" }, { label: 'No', value: "No" }],
            onChange: (e) => handleChange3(e, 'business'),
            disabled: !edit,
            sm: 3
        },
        {
            label: 'Manufacturing unit',
            type: 'radio',
            value: profileCompletion.manufacturing || "Yes",
            options: [{ label: 'Yes', value: "Yes" }, { label: 'No', value: "No" }],
            onChange: (e) => handleChange3(e, 'manufacturing'),
            disabled: !edit,
            sm: 3
        },
        {
            label: 'Coffee type',
            type: 'autocomplete',
            labelprop: "label",
            multiple: true,
            value: profileCompletion.interested || [],
            options: coffeeType,
            onChange: handleinterestedChange3,
            disabled: !edit,
        },
        {
            label: 'Sample ready',
            type: 'radio',
            value: profileCompletion.sample || "Yes",
            options: [{ label: 'Yes', value: "Yes" }, { label: 'No', value: "No" }],
            onChange: (e) => handleChange3(e, 'sample'),
            disabled: !edit,
        },
        {
            label: 'Other information',
            type: 'input',
            required: false,
            value: profileCompletion.otherinformation || '',
            onChange: (e) => handleChange3(e, 'otherinformation'),
            disabled: !edit,
        },

    ]

    const onClickSameBilling = (e) => {
        var val = e.target.checked;
        setSameAsBilling(val);
        if (val === true) {
            setContactStreet(billingStreet);
            setContactCountry(billingCountry);
            setContactState(billingState);
            setContactCity(billingCity);
            setContactPostal(billingPostal);
        } else {
            setContactStreet(defaultContactData?.contactStreet);
            setContactCountry(defaultContactData?.contactCountry);
            setContactState(defaultContactData?.contactState);
            setContactCity(defaultContactData?.contactCity);
            setContactPostal(defaultContactData?.contactPostal);
        }
    }

    const payload10 = [
        {
            label: 'Same as Billing',
            type: 'checkbox',
            sm: 6,
            checked: sameAsBilling,
            onChange: (e) => onClickSameBilling(e),
        },
    ];

    const payload4 = [
        {
            label: 'Street name',
            type: 'input',
            required: true,
            value: billingStreet,
            error: validationError?.billingStreet,
            helperText: validationError?.billingStreet,
            onChange: (e) => handleChange4(e, 'street'),
            disabled: !edit,
        },
        {
            label: 'Country',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingCountry,
            helperText: validationError?.billingCountry,
            value: billingCountry || "",
            options: showBillingCountry || [],
            onChange: handlecountryChange4,
            disabled: !edit,
        },
        {
            label: 'Province/State',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingState,
            helperText: validationError?.billingState,
            value: billingState || "",
            options: showBillingState || [],
            onChange: handlestateChange4,
            disabled: !edit,
        },
        {
            label: 'City',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.billingCity,
            helperText: validationError?.billingCity,
            value: billingCity || "",
            options: showBillingCity || [],
            onChange: handlecityChange4,
            disabled: !edit,
        },
        {
            label: 'Postal code',
            type: 'input',
            // required: true,
            inputProps: { maxLength: 6 },
            value: billingPostal,
            onChange: (e) => handleChange4(e, 'postalcode'),
            disabled: !edit,
        },
    ];

    const payload5 = [
        {
            label: 'Street name',
            type: 'input',
            value: contactStreet,
            onChange: (e) => handleChange5(e, 'street'),
            disabled: !edit,
        },
        {
            label: 'Country',
            type: 'autocomplete',
            labelprop: "label",
            value: contactCountry || "",
            options: showContactCountry || [],
            onChange: handlecountryChange5,
            disabled: !edit,
        },
        {
            label: 'Province/State',
            type: 'autocomplete',
            labelprop: "label",
            value: contactState || "",
            options: showContactState || [],
            onChange: handlestateChange5,
            disabled: !edit,
        },
        {
            label: 'City',
            type: 'autocomplete',
            labelprop: "label",
            value: contactCity || "",
            options: showContactCity || [],
            onChange: handlecityChange5,
            disabled: !edit,
        },
        {
            label: 'Postal code',
            type: 'input',
            inputProps: { maxLength: 6, },
            value: contactPostal,
            onChange: (e) => handleChange5(e, 'postalcode'),
            disabled: !edit,
        },
        {
            label: 'Shipping to continent',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.shippingContinent,
            helperText: validationError?.shippingContinent,
            disabled: !edit,
            value: shipping.continent || [],
            options: [{ label: "South America", value: "South America" }, { label: "Oceania", value: "Oceania" }, { label: "North America", value: "North America" }, { label: "Europe", value: "Europe" }, { label: "Asia", value: "Asia" }, { label: "Antarctica", value: "Antarctica" }, { label: "Africa", value: "Africa" }],
            onChange: handlecontinentChange6,
        },
        {
            label: 'Shipping to country',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.shippingCountry,
            helperText: validationError?.shippingCountry,
            disabled: !edit,
            value: shipping.country || [],
            options: shippingCountries,
            onChange: handlecountryChange6,
        },
    ];

    const payload7 = [
        {
            type: 'label',
            value: "Contact",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.contact : '',
            sm: '6'
        },
        {
            type: 'label',
            value: "Phone",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.phone : '',
            sm: '6'
        },
        {
            type: 'label',
            value: "Email",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.email : '',
            sm: '6'
        },
        {
            type: 'label',
            value: "Website",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.website : '',
            sm: '6'
        },
        {
            type: 'label',
            value: "Lead owner",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.username : '',
            sm: '6'
        }
    ];

    const payload8 = [
        {
            label: 'Select users to assign',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            value: reAssignUser,
            options: usersToReAssign,
            onChange: handleChange7,
        }
    ]

    const payload9 = [
        {
            label: 'Comments',
            type: 'input',
            required: true,
            error: validationError?.comments,
            helperText: validationError?.comments,
            multiline: true,
            rows: 5,
            value: comments,
            onChange: (e) => handleChange8(e),
            sm: 12
        }
    ]

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
        console.log('percentage::', percentage)
        return percentage;
    }

    const submitLead = async () => {
        const { contact_phone, mobile, designation, salutation, firstName, lastName, email, ext } = contact;
        const { interested, sample, manufacturing, business, otherinformation } = profileCompletion;
        const { website, productSegment, turnover, accountType, name, aliases } = lead;
        const { continent } = shipping;
        let interestedtemp = [];
        // eslint-disable-next-line
        interested.map((item, index) => {
            interestedtemp.push(item.value);
        })
        let productSegmenttemp = [];
        // eslint-disable-next-line
        productSegment.map((item, index) => {
            productSegmenttemp.push(item.value);
        })
        let accountTypetemp = [];
        // eslint-disable-next-line
        accountType.map((item, index) => {
            accountTypetemp.push(item.value);
        })
        let error = {}, message = "Please fill valid details";
        let lengthMessage = "Exceeded maximum length";
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
        if (_.isEmpty(contact_phone)) {
            error = { ...error, contact_phone: message };
        }
        if (!_.isEmpty(contact_phone) && contact_phone.length > 10) {
            error = { ...error, contact_phone: lengthMessage };
        }
        if (!_.isEmpty(mobile) && mobile.length > 10) {
            error = { ...error, mobile: lengthMessage };
        }
        if (_.isEmpty(billingStreet)) {
            error = { ...error, billingStreet: message };
        }
        if (_.isEmpty(accountType)) {
            error = { ...error, accountType: message };
        }
        if (_.isEmpty(billingCountry)) {
            error = { ...error, billingCountry: message };
        }
        if (_.isEmpty(billingState)) {
            error = { ...error, billingState: message };
        }
        if (_.isEmpty(billingCity)) {
            error = { ...error, billingCity: message };
        }
        if (_.isEmpty(continent)) {
            error = { ...error, shippingContinent: message };
        }
        if (_.isEmpty(shipping.country)) {
            error = { ...error, shippingCountry: message };
        }
        if (!_.isEmpty(error)) {
            console.log("Error is", error);
            setValidationError(error);
            setSnack({
                open: true,
                message: "Please fill all mandatory fields to continue",
                severity: 'error'
            });
        }
        else {
            setLoading(true);
            let data = {
                "update": true,
                "leadid": props.leadId,
                "accountname": name ? name : null,
                "accounttypeid": accountTypetemp.length > 0 ? accountTypetemp?.join(",") : null,
                "aliases": aliases ? aliases : null,
                "approvalstatus": true,
                "approxannualrev": turnover ? turnover : null,
                "billing_citycode": billingCity ? billingCity.value : null,
                "billing_countrycode": billingCountry ? billingCountry.value : null,
                "billing_postalcode": billingPostal ? billingPostal : null,
                "billing_statecode": billingState ? billingState.value : null,
                "billing_street": billingStreet ? billingStreet : null,
                "coffeetypeid": interestedtemp.length > 0 ? interestedtemp?.join(",") : null,
                "contact_citycode": contactCity ? contactCity.value : null,
                "contact_countrycode": contactCountry ? contactCountry.value : null,
                "contact_email": email ? email : null,
                "contact_ext": ext ? ext.value : null,
                "contact_firstname": firstName ? firstName : null,
                "contact_lastname": lastName ? lastName : null,
                "contact_mobile": mobile ? mobile : null,
                "contact_phone": contact_phone ? contact_phone : null,
                "contact_position": designation ? designation : null,
                "contact_postalcode": contactPostal ? contactPostal : null,
                "contact_salutationid": salutation ? +salutation.value : null,
                "contact_statecode": contactState ? contactState.value : null,
                "contact_street": contactStreet ? contactStreet : null,
                "countryid": "123",
                "modifieddate": new Date(),
                "modifieduserid": getCurrentUserDetails().id,
                "loggedinuserid": getCurrentUserDetails()?.id,
                "instcoffee": business === "Yes" ? true : false,
                "isactive": true,
                "leadscore": getLeadScore(),
                "manfacunit": manufacturing === "Yes" ? true : false,
                "masterstatus": lead.status ? lead.status : null,
                "productsegmentid": productSegmenttemp.length > 0 ? productSegmenttemp?.join(",") : null,
                "sample_ready": sample === "Yes" ? true : false,
                "shipping_continent": continent ? continent.value : null,
                "shipping_continentid": "123",
                "shipping_country": shipping ? shipping.country.value : null,
                "website": website !== '' ? website : null,
                "otherinformation": otherinformation ? otherinformation : null
            }
            try {
                let response = await createLead(data)
                console.log("Response", response);
                if (response) {
                    setSnack({
                        open: true,
                        message: "Lead updated successfully",
                    });
                    setTimeout(() => {
                        setLoading(false);
                        navigate(`/leads/${leadId}/view`, { replace: true });
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
    const leadToAccountCall = async (e, action) => {
        if (action !== "convertleadtoaccount") {
            let error = {}, message = "Please fill valid details";
            if (_.isEmpty(comments)) {
                error = { ...error, comments: message };
            }
            if (!_.isEmpty(error)) {
                setValidationError(error);
                return;
            }
        }

        action === "approve" ? setApproveOn(!approveOn) : action === "reject" ? setRejectOn(!rejectOn) : setConvertOn(!convertOn);
        try {
            let payload = {
                "leadid": leadId,
                "role": getCurrentUserDetails().role,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "loggedinuserid": getCurrentUserDetails()?.id,
            };
            if (action === "convertleadtoaccount") {
                payload.convertleadtoaccount = true;
            } else if (action === "approve") {
                payload.approve = true;
            } else if (action === "reject") {
                payload.reject = true;
            }
            let response = await convertLeadToAccount(payload);
            console.log("Response", response);
            if (response) {
                let responseMessage;
                if (action === "convertleadtoaccount") {
                    responseMessage = "Lead approval and conversion email sent successfully";
                } else if (action === "approve") {
                    responseMessage = "Lead approved, Account created and email sent successfully!";
                } else if (action === "reject") {
                    responseMessage = "Lead rejected and email sent successfully";
                }

                setTimeout(() => {
                    action === "approve" ? setApproveOn(!approveOn) : action === "reject" ? setRejectOn(!rejectOn) : setConvertOn(!convertOn);
                    setSnack({
                        open: true,
                        message: responseMessage,
                    });
                    props.back()
                }, 5000)
            }
        } catch (e) {
            action === "approve" ? setApproveOn(!approveOn) : action === "reject" ? setRejectOn(!rejectOn) : setConvertOn(!convertOn);
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }

    const reAssignLeadToUser = async (e) => {
        setReAssignOn(!reAssignOn);
        try {
            if (_.isEmpty(reAssignUser?.value) || reAssignUser?.value === undefined) {
                setSnack({
                    open: true, severity: "error",
                    message: "Please select a user to reassign"
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: ""
                    })
                }, 2000)
                return;
            }
            let payload = {
                "leadid": leadId?.toString(),
                "userid": reAssignUser?.value,
                'loggedinuserid': getCurrentUserDetails()?.id
            };
            setLoading(true);
            let response = await reAssignLead(payload);
            console.log("Response", response);
            if (response) {
                let responseMessage = "Lead reassigned successfully";
                setSnack({
                    open: true,
                    message: responseMessage,
                });
                setReAssignOn(!reAssignOn);
                setTimeout(() => {
                    props.back()
                }, 2000)
            }
        } catch (e) {
            setReAssignOn(!reAssignOn);
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

    const convertToAccount = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Lead Details
            </h2>
            <MuiAlert icon={false}>
                Lead Conversion
                <ul>
                    {
                        contactsInLeadToAccount?.erpcontacts?.customername !== '' && <li> Similar contact already exsist in the system for the account <b>{lead.name}</b></li>
                    }
                    <li>
                        Are you sure you want to proceed creating account for <b>{lead.name}</b> in the system?
                    </li>
                    <li>
                        Click on "Proceed" button to create Account.
                    </li>
                </ul>
            </MuiAlert>
            <h3>Lead Name: {contactsInLeadToAccount ? contactsInLeadToAccount.leaddetails?.leadname : ''}</h3>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={3} container direction="column">
                    <Template payload={payload7} />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label={convertOn ? "Loading ..." : "Proceed"} disabled={convertOn} onClick={(e) => leadToAccountCall(e, "convertleadtoaccount")} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => onConvertToAccount()} />
                </Grid>
            </Grid>
            <h3>Similar contact records from Accounts database</h3>
            <ErpContactsList data={[contactsInLeadToAccount?.erpcontacts]}></ErpContactsList>
        </Container>
    );

    const reAssign = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Select user
            </h2>
            <h4>Select user to assign:</h4>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    <Template payload={payload8}></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label={loading ? "Loading..." : "Proceed"} disabled={loading}
                        onClick={reAssignLeadToUser} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => setReAssign(!openReAssign)} />
                </Grid>
            </Grid>
        </Container>
    );

    const approve = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Approval/Reject
            </h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={10} md={10} container direction="column">
                    <Template payload={payload9} />
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label={approveOn ? "Loading ..." : "Approve"} disabled={approveOn} onClick={(e) => leadToAccountCall(e, "approve")} />
                </Grid>
                <Grid item>
                    <Button label={rejectOn ? "Loading ..." : "Reject"} disabled={rejectOn} onClick={(e) => leadToAccountCall(e, "reject")} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => setApprove(!openApprove)} />
                </Grid>
            </Grid>
        </Container>
    );

    const profileCompletionGraph = () => {
        return (
            <PieChart
                label={() => `${leadscore}%`}
                labelStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                viewBoxSize={25}
                totalValue={100}
                animate
                animationDuration={1000}
                data={[
                    { title: '', value: leadscore, color: '#E38627' },
                ]}
            />
        )
    }

    const onConvertToAccount = () => {
        setConvertToAccount(!openConvertToAccount);
    }

    return (
        <>
            <Typography style={{ marginLeft: 30, marginTop: 30, marginBottom: 20, color: colors.orange, fontWeight: 'bold' }}>
                Profile Completion
            </Typography>
            <div className={classes.profileGraph}>{profileCompletionGraph()}</div>
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
                    <Grid item md={9} xs={12} className='item'>
                        <Typography>
                            Shipping address
                        </Typography>
                    </Grid>
                    <Grid item md={3} xs={12} className='item'>
                        {edit && <Template payload={payload10} />}
                    </Grid>

                </Grid>
                <Template payload={payload5} />

                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Audit log information</Typography>
                    </Grid>
                </Grid>
                <AuditLog data={logData} />

            </form>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1)} />
                </Grid>
                <Grid item>
                    {
                        !edit ? (lead.status !== "Account Created" && lead.status !== "Approved") &&
                            <Button label="Edit" onClick={() => {
                                navigate(`/leads/${leadId}/edit`, { replace: true })
                            }} />
                            :
                            <Button disabled={loading} label={loading ? 'Loading ...' : 'Save'} onClick={submitLead} />
                    }
                </Grid>
                <Grid item>
                    {
                        (getCurrentUserDetails().role === roles.managingDirector || getCurrentUserDetails().role === "Marketing Executive") && lead.status === "New" && leadscore >= 90 &&
                        <Button label={"Convert To Account"} onClick={(e) => onConvertToAccount()} />
                    }
                </Grid>
                <Grid item>
                    {
                        (lead.status === "New" || lead.status === "Rejected") && getCurrentUserDetails().role === roles.managingDirector &&
                        <Button label="Re-Assign" onClick={(e) => setReAssign(!openReAssign)} />
                    }
                </Grid>
                <Grid item>
                    {
                        lead.status === "Pending Approval" && getCurrentUserDetails().role !== "Marketing Executive" &&
                        <Button label="Approve / Reject" onClick={(e) => setApprove(!openApprove)} />
                    }
                </Grid>
            </Grid>
            <SimpleModal open={openConvertToAccount} handleClose={() => setConvertToAccount(!openConvertToAccount)} body={convertToAccount} />
            <SimpleModal open={openReAssign} handleClose={() => setReAssign(!openReAssign)} body={reAssign} />
            <SimpleModal open={openApprove} handleClose={() => setApprove(!openApprove)} body={approve} />
        </>
    )
}

export default EditLead;