import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Card, CardContent, CardHeader } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { getQuotesInfo, createQuote, getCountryNames, getUsers } from '../../../apis';
import useToken from '../../../hooks/useToken';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import AuditLog from './AuditLog';
import SimpleStepper from '../../../components/SimpleStepper';
import { roles } from '../../../constants/roles';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%'
        },
        '& .page-header': {
            width: '100%',
            marginBottom: 15,
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    card: {
        boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        marginBottom: 5
    }
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data?.map(v => formattedData?.push({ label: v?.[key], value: v?.[id] || v?.[key] }))
    return formattedData;
}

const formatQuoteDetails = (viewPayload, contacts = {}) => ({
    accountName: viewPayload.accountid || '',
    accountType: viewPayload.accounttypename || '',
    billingAddress: viewPayload.billing_address || '',
    contact: viewPayload.contactid || '',
    contactList: contacts,
    status: viewPayload.status || '',
    quoteAutoGenNumber: viewPayload.quote_autogennumber || '',
    terms: viewPayload.payment_terms || '',
    client: viewPayload.finalclientaccountid || '',
    createdDate: viewPayload.createddate,
    incoTerms: viewPayload.incotermsid || '',
    remarks: viewPayload.remarks_marketing || '',
    currencycode: viewPayload.currencycode || '',
    currencyid: viewPayload.currencyid || '',
    loadingPort: viewPayload.portloadingid || '',
    destinationPort: viewPayload.destinationid || '',
    portLoadingName: viewPayload.port_loading || '',
    destinationPortName: viewPayload.destination_port || '',
    dispatchFrom: viewPayload.fromdate,
    dispatchTo: viewPayload.todate,
    others: viewPayload.other_specification || '',
    destination_countryid: viewPayload.destination_countryid,
    pending_withuserid: viewPayload?.pending_withuserid
})

const EditQuote = (props) => {
    const classes = useStyles();
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;

    const [quoteDetails, setQuoteDetails] = useState({});
    const [billingAddresses, setBillingAddresses] = useState([]);
    const [contactName, setContactName] = useState({});
    const [accountDetails, setAccountDetails] = useState([{}]);
    const [validationError, setValidationError] = useState({});
    const [accountName, setAccountName] = useState([]);
    const [finalClient, setFinalClient] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [loadingPorts, setLoadingPorts] = useState([]);
    const [destinationPorts, setDestinationports] = useState([]);
    const [countries, setCountries] = useState([]);
    const [logData, setLogData] = useState([]);
    const [currentBillingAddress, setCurrentBillingAddress] = useState(null);
    const [pendingWith, setPendingWith] = useState([]);
    const [currencyResponse, setCurrencyResponse] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // const [customerCurrency, setCustomerCurrency] = useState(null);
    // const [conversatioRatio, setConversatioRatio] = useState(null);
    // const [conversatioRatioRate, setConversatioRatioRate] = useState(null);
    // const [rateCurrency, setRateCurrency] = useState({ label: 'United States Dollars', value: 'USD' });
    const [destinationCountryCode, setDestinationCountryCode] = useState(null);
    function formatBillingAddress(address) {
        return { label: address?.address, value: address?.billing_id }
    }

    useEffect(() => {
        getQuotesInfo({ "type": "destinationports", countryCode: destinationCountryCode })
            .then(res => setDestinationports(formatToSelection(res, 'destination_port', 'id')));
    }, [destinationCountryCode])
    useEffect(() => {
        getCountryNames().then(res => {
            const tempCountries = res !== null && res?.map((country) => {
                return {
                    label: country?.country,
                    value: country?.countryid,
                    countryCode: country?.countrycode
                }
            })
            setCountries(tempCountries)
            getQuotesInfo(createdUser).then((res) => {
                setAccountDetails(res);
                setAccountName(formatToSelection(res, 'account_name', "account_id"));
                setFinalClient(formatToSelection(res, 'account_name', "account_id"));
                getQuotesInfo({
                    "type": "viewquote",
                    "loggedinuserid": getCurrentUserDetails()?.id,
                    "quote_number": props.id?.toString()
                }).then(response => {
                    let details = res.find(acc => acc.account_id.toString() === response.accountid);
                    let contactList = (details?.contact_details ? formatToSelection(details.contact_details,
                        "contact_name", "contact_id") : []);
                    setQuoteDetails(formatQuoteDetails(response, contactList));
                    setLogData(response.audit_log);
                    setContactName(details?.contact_details || {})
                    setCurrentBillingAddress(response?.billing_id);
                    const tempDestinationCountryCode = tempCountries.find((country) =>
                        country?.value === response?.destination_countryid)?.countryCode;
                    setDestinationCountryCode(tempDestinationCountryCode);
                });
            });
        });
        getQuotesInfo({ "type": "incoterms" }).then(res => setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));
        getQuotesInfo({ "type": "currencies" }).then(res => { setCurrency(formatToSelection(res, 'currencyname', 'currencycode')); setCurrencyResponse(res) });
        getQuotesInfo({ "type": "loadingports" }).then(res => setLoadingPorts(formatToSelection(res, "portloading_name", 'id')));
        getUsers({ type: "Accounts" }).then(res => {
            setPendingWith(res.map((option) => {
                return {
                    label: option?.username,
                    value: option?.userid
                }
            }))
        });
        const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforQuotation", "createdbyuserid": userId } : { "type": "accountdetailsforQuotation" };


        // eslint-disable-next-line 
    }, []);

    useEffect(() => {
        if (!!quoteDetails?.accountName && !!quoteDetails?.contact) {
            //Changed account_id, contact_id from float to string since api is failing with float values"
            getQuotesInfo({
                "type": "billingaddressoncontacts",
                "account_id": quoteDetails?.accountName.toString(),
                "contact_id": quoteDetails?.contact.toString()
            }).then(contacts => {
                const unformattedAddressArray = [];
                const addressArray = [];
                contacts?.map(contact =>
                    contact?.billing_address?.map(address => {
                        unformattedAddressArray.push(address);
                        addressArray.push(formatBillingAddress(address))
                        return null;
                    }
                    )
                )
                setBillingAddresses(addressArray);
                let tempQuoteDetails = _.cloneDeep(quoteDetails);
                tempQuoteDetails.billingAddress = formatBillingAddress(
                    unformattedAddressArray?.find(address =>
                        address?.primary_address) || unformattedAddressArray?.[0])
                setQuoteDetails(tempQuoteDetails);
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactName])
    useEffect(() => {
        let tempQuoteDetails = _.cloneDeep(quoteDetails);
        if (currentBillingAddress) {
            tempQuoteDetails.billingAddress =
                billingAddresses?.find(address =>
                    address?.value === currentBillingAddress)
            setQuoteDetails(tempQuoteDetails);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBillingAddress, billingAddresses])
    const getAutocompleteValue = (options = [], value) => {
        // eslint-disable-next-line
        const option = options?.filter(option => option.value == value)[0];
        return option;
    }
    const handleChange = (event, key,) => {
        let data = {
            ...quoteDetails,
            [key]: event.target.value
        }
        setQuoteDetails(data);
        console.log(data);
    };

    const handlecontactChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'contact': value?.value
        }
        setContactName(value);
        setQuoteDetails(data);
    };
    const handleincoTermsChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'incoTerms': value?.value
        }
        setQuoteDetails(data);
    }
    const handlecurrencyChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'currencycode': value?.value,
        }
        setQuoteDetails(data);
    }
    const handleclientChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'client': value?.value
        }
        setQuoteDetails(data);
    }
    const handleloadingPortChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'loadingPort': value?.value,
            "portLoadingName": value?.label
        }
        setQuoteDetails(data);
    }
    const handledestinationCountryChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'destination_countryid': value?.value,
            'destination_country': value?.label,
            'destinationPort': null,
            'destinationPortName': null,
        }
        setDestinationCountryCode(value?.countryCode)
        setQuoteDetails(data);
    }
    const handledestinationPortChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'destinationPort': value?.value,
            "destinationPortName": value?.label,
        }
        setQuoteDetails(data);
    }
    const handlePendingWithChange = (e, value) => {
        let data = {
            ...quoteDetails,
            'pending_withuserid': value?.value,
        }
        setQuoteDetails(data);
    }

    const handleAccountNameChange = (event, value) => {
        let details = accountDetails.find(acc => acc.account_id === value?.value);
        let data = {
            ...quoteDetails,
            'accountName': value?.value,
            "accountType": details.accounttype_name,
            "accountTypeId": details.accounttype_id,
            "billingAddress": details.billing_address,
            "contactList": details.contact_details ? formatToSelection(details.contact_details, "contact_name", "contact_id") : []
        }
        setQuoteDetails(data);
        setContactName({});
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...quoteDetails,
            [key]: date
        }
        setQuoteDetails(data);
        console.log(data);
    };
    const handleAutoCompleteChange = (event, key, value,) => {

        let data = {
            ...quoteDetails,
            [key]: value
        }
        setQuoteDetails(data);
    };
    const formatDate = (datestr) => {
        let dateVal = datestr ? new Date(datestr) : new Date();
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
    }

    const createQuoteAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(quoteDetails.accountName?.toString())) {
            errorObj = { ...errorObj, accountName: message };
        }
        if (_.isEmpty(quoteDetails.incoTerms)) {
            errorObj = { ...errorObj, incoTerms: message };
        }
        if (_.isEmpty(quoteDetails.currencycode)) {
            errorObj = { ...errorObj, currencycode: message };
        }
        if (!quoteDetails.loadingPort) {
            errorObj = { ...errorObj, loadingPort: message };
        }
        if (!quoteDetails.dispatchFrom) {
            errorObj = { ...errorObj, dispatchFrom: message };
        }
        if (!quoteDetails.dispatchTo) {
            errorObj = { ...errorObj, dispatchTo: message };
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
        }
        else {
            let data =
            {
                "update": true,
                "quoteid": props.id,
                "modifieduserid": (currentUserDetails.id),
                "loggedinuserid": getCurrentUserDetails()?.id,
                "accountid": quoteDetails.accountName?.toString(),
                "accounttypeid": (quoteDetails.accountTypeId),
                "accounttypename": quoteDetails.accountType,
                "finalclientaccountid": quoteDetails.client?.toString() || '0',
                "incotermsid": (quoteDetails.incoTerms),
                "modifieddate": new Date(),
                "fromdate": quoteDetails.dispatchFrom,
                "todate": quoteDetails.dispatchTo,
                "currencycode": quoteDetails.currencycode,
                "currencyid": currencyResponse
                    ?.find(currency => currency?.currencycode === quoteDetails?.currencycode)?.currencyid,
                "portloadingid": quoteDetails.loadingPort?.toString(),
                "destinationid": quoteDetails.destinationPort?.toString() || '0',
                "isactive": 1,
                "payment_terms": quoteDetails.terms,
                "other_specification": quoteDetails.others,
                "remarks_marketing": quoteDetails.remarks,
                "destination_port": quoteDetails.destinationPortName,
                "port_loading": quoteDetails.portLoadingName,
                "destination_countryid": quoteDetails?.destination_countryid,
                "destination_country": quoteDetails?.destination_country,
                "status_id": "1",
                "master_status": quoteDetails.status,
                "contactid": quoteDetails.contact?.toString() || '1',
                "billing_id": quoteDetails?.billingAddress?.value,
                "pending_withuserid": quoteDetails?.pending_withuserid
            }
            try {
                let response = await createQuote(data)
                console.log("Response", response);
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote updated successfully",
                    });
                    setTimeout(() => {
                        props.back()
                    }, 2000)
                }
            } catch (e) {

                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
        }
    }
    const payload = [
        {
            label: 'Account name *',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            disabled: true,
            error: validationError?.accountName,
            helperText: validationError?.accountName,
            value: getAutocompleteValue(accountName, quoteDetails.accountName) || '',
            options: accountName,
            onChange: handleAccountNameChange
        },
        {
            label: 'Contact name',
            type: 'autocomplete',
            labelprop: "label",
            disabled: true,
            value: getAutocompleteValue(quoteDetails.contactList, quoteDetails.contact) || [],
            options: quoteDetails.contactList || [],
            onChange: handlecontactChange
        },
        {
            label: 'Account type',
            type: 'input',
            multiline: true,
            required: true,
            disabled: true,
            rows: 2,
            value: quoteDetails.accountType || ''
        },
        {
            label: 'Quote creation date',
            type: 'input',
            disabled: true,
            value: formatDate(quoteDetails.creationDate) || formatDate("")
        },
        {
            label: 'Billing address',
            type: 'autocomplete',
            options: billingAddresses || [],
            multiline: true,
            required: true,
            rows: 3,
            error: validationError?.billingAddress,
            helperText: validationError?.billingAddress,
            value: quoteDetails.billingAddress || '',
            onChange: (e, value) => handleAutoCompleteChange(e, "billingAddress", value),
        },
        {
            label: 'Payment terms',
            type: 'input',
            value: quoteDetails.terms || '',
            onChange: (e) => handleChange(e, 'terms')
        },
        {
            label: 'Incoterms *',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.incoTerms,
            helperText: validationError?.incoTerms,
            value: getAutocompleteValue(incoterms, quoteDetails.incoTerms) || '',
            options: incoterms,
            onChange: handleincoTermsChange,
        },
        {
            label: 'Quote status',
            type: 'input',
            disabled: true,
            value: quoteDetails.status || 'New',
        },
        {
            label: 'Remarks from marketing',
            type: 'input',
            value: quoteDetails.remarks || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'remarks'),
        },
        {
            label: 'Customer currency *',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(currency, quoteDetails?.currencycode) || '',
            required: true,
            error: validationError?.currencycode,
            helperText: validationError?.currencycode,
            options: currency,
            onChange: handlecurrencyChange,
        },
        {
            label: 'Final client',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(finalClient, quoteDetails.client) || [],
            options: finalClient,
            onChange: handleclientChange,
        },
        {
            label: 'Pending With',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(pendingWith, quoteDetails.pending_withuserid) || [],
            options: pendingWith,
            onChange: handlePendingWithChange,
        },
    ]
    const payload1 = [
        {
            label: 'Port of loading *',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(loadingPorts, quoteDetails.loadingPort) || [],
            required: true,
            error: validationError?.loadingPort,
            helperText: validationError?.loadingPort,
            options: loadingPorts,
            onChange: handleloadingPortChange,
        },
        {
            label: 'Destination country',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(countries, quoteDetails.destination_countryid) || '',
            options: countries,
            onChange: handledestinationCountryChange,
        },
        {
            label: 'Dispatch period from',
            type: 'datePicker',
            value: quoteDetails.dispatchFrom || null,
            required: true,
            error: validationError?.dispatchFrom,
            helperText: validationError?.dispatchFrom,
            minDate: new Date(),
            onChange: (date) => handleDateChange(date, 'dispatchFrom'),
            sm: 3
        },
        {
            label: 'Dispatch period to',
            type: 'datePicker',
            value: quoteDetails.dispatchTo || null,
            required: true,
            error: validationError?.dispatchTo,
            helperText: validationError?.dispatchTo,
            minDate: new Date(),
            onChange: (date) => handleDateChange(date, 'dispatchTo'),
            sm: 3
        },
        {
            label: 'Destination port',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(destinationPorts, quoteDetails.destinationPort) || '',
            options: destinationPorts,
            onChange: handledestinationPortChange,
        },
        {
            label: 'Others (specification)',
            type: 'input',
            value: quoteDetails.others || '',
            onChange: (e) => handleChange(e, 'others')
        },
    ];

    // const handleCustomerCurrency = (e, val) => {
    //     setCustomerCurrency(val);
    // }

    // const handleRateCurrency = (e, val) => {
    //     setRateCurrency(val);
    // }

    // const payload7 = [
    //     {
    //         label: 'Comments',
    //         type: 'input',
    //         multiline: true,
    //         rows: 3,
    //         value: quoteDetails?.comments || '',
    //         onChange: (e) => handleChange(e, 'comments')
    //     },
    //     {
    //         label: 'Title',
    //         type: 'input',
    //         value: quoteDetails?.commentTitle || '',
    //         onChange: (e) => handleChange(e, 'commentTitle')
    //     },
    // ];
    // eslint-disable-next-line
    const payload6 = [
        {
            type: 'label',
            value: "Commission Agent",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: localStorage.getItem('currentUserName'),
            sm: '6'
        },
    ];

    // const handleGetFact = async () => {
    //     let data = {
    //         'currencyid': currencyResponse
    //             ?.find(currency => currency?.currencycode === customerCurrency?.value)?.currencyid
    //     };
    //     let res = await getConversatioRatio(data);
    //     setConversatioRatio(res);
    // }

    // const handleGetFactRate = async () => {
    //     let data = { 'currencyid': 'HO-102' };
    //     let res = await getConversatioRatio(data);
    //     setConversatioRatioRate(res);
    // }
    // eslint-disable-next-line
    // const payload4 = [
    //     {
    //         type: 'label',
    //         value: "Currency For The Rate Calculation",
    //         bold: true,
    //         sm: 4
    //     },
    //     {
    //         label: 'Get CFact',
    //         type: 'button',
    //         className: classes.button,
    //         onClick: () => handleGetFactRate(),
    //         sm: 2
    //     },
    //     {
    //         label: 'Currency For The Rate Calculation',
    //         type: 'autocomplete',
    //         labelprop: "label",
    //         value: rateCurrency || [],
    //         options: currency,
    //         disabled: true,
    //         onClick: () => handleRateCurrency,
    //         sm: 3
    //     },
    //     {
    //         label: 'Display convertion value',
    //         type: 'input',
    //         value: conversatioRatioRate?.conv_factor || '',
    //         disabled: true,
    //         // onChange: (e) => handleTempOtherChargeChange(e, 'item', index),
    //         sm: 3
    //     }
    // ];
    // eslint-disable-next-line
    // const payload5 = [
    //     {
    //         type: 'label',
    //         value: "Currency For The Customer",
    //         bold: true,
    //         sm: 4
    //     },
    //     {
    //         label: 'Get CFact',
    //         type: 'button',
    //         className: classes.button,
    //         onClick: () => handleGetFact(),
    //         sm: 2
    //     },
    //     {
    //         label: 'Currency For The Customer',
    //         type: 'autocomplete',
    //         labelprop: "label",
    //         value: customerCurrency || '',
    //         options: currency,
    //         onChange: handleCustomerCurrency,
    //         sm: 3
    //     },
    //     {
    //         label: 'Display convertion value',
    //         type: 'input',
    //         value: conversatioRatio?.conv_factor || '',
    //         disabled: true,
    //         // onChange: (e) => handleTempOtherChargeChange(e, 'item', index),
    //         sm: 3
    //     }
    // ];
    // eslint-disable-next-line
    const samplePricingCols = [
        { id: "name", label: "Item name" },
        { id: "previousRate", label: "Previous Rates" },
        { id: "dailyRate", label: "Daily Rates (onDate)" },
        { id: "currentPrice", label: "Current Price MT(USD)" },
        { id: "stockPrice", label: "Stock Price MT(USD)" }
    ];
    // eslint-disable-next-line
    let samplePricingData = [
        {
            name: <div><h4>Dark Roasted Chicory Cubes</h4><hr /><p style={{ color: 'red' }}>Required Quantity: <br />1,16,900</p></div>,
            previousRate: <div><p style={{ color: 'green' }}>(07-jan-2022)</p><br /><p>2.00</p></div>,
            dailyRate: '-',
            currentPrice: <input type='number' value='0.0000' />,
            stockPrice: <input type='number' value='0.0000' />,
        },
        {
            name: <div><h4>Dark Roasted Chicory Cubes</h4><hr /><p style={{ color: 'red' }}>Required Quantity: <br />1,16,900</p></div>,
            previousRate: <div><p style={{ color: 'green' }}>(07-jan-2022)</p><br /><p>2.00</p></div>,
            dailyRate: '-',
            currentPrice: <input type='number' value='0.0000' />,
            stockPrice: <input type='number' value='0.0000' />,
        }
    ];
    // eslint-disable-next-line
    const packingDetailsCols = [
        { id: "packing", label: "Packing" },
        { id: "packingCost", label: "Packing Cost" },
        { id: "palletCost", label: "Pallet Cost" }
    ];
    // eslint-disable-next-line
    let packingDetailsData = [
        {
            packing: <div><p>48 X 25 GMS Round Jars</p><hr /><b>CARTON COUNT : 788</b><br /><p style={{ color: 'red' }} >(COMPUTED FROM EOQ)</p><br /><p>Additional Description: </p><p>Packing Description: </p></div>,
            packingCost: <div><p>0.000(INR)</p><p>0.000(USD)</p><p style={{ color: 'red' }} >As Per Packing List</p><input type='number' value='0.000' /></div>,
            palletCost: <div><p>0.000(INR)</p><p>0.000(USD)</p><p style={{ color: 'red' }} >As Per Packing List</p><input type='number' value='0.000' /></div>
        }
    ];

    const sampleSteps = [
        'New',
        'Pricing',
        'Expired',
        'Customer Review',
        'Approved',
        'Rejected',
    ];

    const allStatus = [
        { 'Quote Approved by GMC': 'Pricing' },
        { 'New': 'New' },
        { 'Quote Expired': 'Expired' },
        { 'Quote Rejected': 'Rejected' },
        { 'Quote Rejected by GMC': 'Pricing' },
        { 'Validity Ext. Pending Approval': 'Expired' },
        { 'Bid Resubmitted to GMC': 'Pricing' },
        { 'Quote Approved': 'Approved' },
        { 'Quote Submitted': 'Customer Review' },
        { 'Pending with GMC': 'Pricing' },
        { 'Bid Submitted to GMC': 'Pricing' },
        { 'Quote Validity Ext. Rejected': 'Expired' },
        { 'Base Price Received': 'Pricing' },
        { 'Quote Validity Ext. Approved': 'Expired' },
    ];

    const getActiveStep = () => {
        // var data = null;
        // allStatus.map((item, index) => {
        //     if(item[quoteDetails.status] !== undefined){
        //         return item[quoteDetails.status];
        //     }
        // })
        var data = allStatus.find(i => i[quoteDetails.status])
        // return data;
        var dataIndex = (data !== null && quoteDetails.status !== undefined) && sampleSteps?.findIndex(i => i === data[quoteDetails?.status])
        return dataIndex + 1;
    };

    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Card className="page-header">
            <CardHeader
                title=" Quotation details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={6}>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quotation no</Typography>
                        <Typography>{quoteDetails.quoteAutoGenNumber}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Quote creation</Typography>
                        <Typography>{formatDate(quoteDetails.createddate)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Card className="page-header">
            <CardContent>
                <Grid container md={12}>
                    <Grid item md={12} xs={12}>
                        {getActiveStep() !== false &&
                            <SimpleStepper
                                activeStep={getActiveStep()}
                                steps={sampleSteps}
                                quoteSteps={true}
                                stepClick={(e) => {
                                    console.log("e::", e);
                                }}
                            ></SimpleStepper>
                        }
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Quote information</Typography>
            </Grid>
        </Grid>
        <Template payload={payload} />
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Dispatch details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload1} />

        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
            </Grid>
        </Grid>
        <AuditLog data={logData} />

        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button label="Save" onClick={createQuoteAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
    </form>)
}
export default EditQuote;