import React, { useEffect, useState, useRef } from 'react';
import Template from '../../../components/Template';
import { CardHeader, Grid } from '@material-ui/core';
import { Typography, Card, CardContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import QuoteItemDetails from './QuoteItemDetails';
import EditQuoteItem from './EditQuoteItem';
import CreateQuoteItem from './CreateQuoteItem';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import SimpleModal from '../../../components/Modal';
import { Container } from '@material-ui/core';
import { getQuotesInfo, getQuoteItems, updateQuoteStatus, updateQuotationStatusForPricing, getFinalisedSamples, updateConfirmSample, getSamplesInfo, getQuoteItemsInfo } from '../../../apis';
import useToken from '../../../hooks/useToken';
import '../../common.css'
// eslint-disable-next-line
import SimpleStepper from '../../../components/SimpleStepper';
// eslint-disable-next-line
import { roles } from '../../../constants/roles';
import { colors } from '../../../constants/colors';
import BasicTable from '../../../components/BasicTable';
import QuoteItemListMD from './QuoteItemListMD';
import QuoteDetails from './QuoteDetails';

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
    },
    modal: {
        position: 'absolute',
        margin: 'auto',
        top: '30%',
        left: '30%',
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    button: {
        margin: theme.spacing(1),
        backgroundColor: colors.orange,
        color: colors.white,
        minWidth: 50,
        textTransform: 'capitalize',

        '&:hover': {
            backgroundColor: colors.orange,
            opacity: 0.8,
        },
        '& $MuiButton-label': {
            margin: 0,
        }
    },
}));

const QuoteDetailsMD = (props) => {
    const classes = useStyles();
    const [quoteDetails, setQuoteDetails] = useState({});
    const [quoteItems, setQuoteItems] = useState([]);
    const [alternateSamples, setAlternateSamples] = useState(null);
    //eslint-disable-next-line
    const [loading, setLoading] = useState(false);
    const [previousRateData, setpreviousRateData] = useState([]);
    const [showCreateQuoteItem, setCreateQuoteItem] = useState(false);
    const [showQuoteItemDetails, setQuoteItemDetails] = useState(false);
    const [showQuoteItemDetailsMD, setQuoteItemDetailsMD] = useState(false);
    const [enablepriceapprovebutton, setEnablepriceapprovebutton] = useState(false);
    const [showEditQuoteItem, setEditQuoteItem] = useState(false);
    const [additionalPrices, setAddtionalPrices] = useState([]);
    const [redirectQuote, setRedirectQuote] = useState(false);
    const [checkedSample, setCheckedSample] = useState([]);
    const [defaultSelectedSample, setDefaultSelectedSample] = useState({});
    // const [showRequest, setShowRequest] = useState(false);
    const [quoteItemId, setQuoteItemId] = useState(-1);
    const [requestPrice, setRequestPrice] = useState(false);
    // eslint-disable-next-line
    const [enableConfirmSample, setEnableConfirmSample] = useState(false);
    // eslint-disable-next-line
    const [logData, setLogData] = useState([]);
    // eslint-disable-next-line
    const quoteItemInfoRef = useRef(null)
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // eslint-disable-next-line
    const sampleSteps = [
        'New',
        'Pricing',
        'Expired',
        'Customer Review',
        'Approved',
        'Rejected',
    ];
    const { getCurrentUserDetails } = useToken();
    // eslint-disable-next-line
    const { id, role } = getCurrentUserDetails();


    // const sampleSteps = [ {
    //     'New': [
    //         'New',
    //     ]},
    //     {'Pricing': ['Quote Approved by GMC', 'Quote Rejected by GMC', 'Bid Resubmitted to GMC', 'Pending with GMC', 'Bid Submitted to GMC', 'Base Price Received']},
    //     {'Expired': ['Quote Expired', 'Validity Ext. Pending Approval', 'Quote Validity Ext. Rejected', 'Quote Validity Ext. Approved']},
    //     {'Customer Review': ['Quote Submitted']},
    //     {'Approved': ['Quote Approved']},
    //     {'Rejected': ['Quote Rejected']},
    // ]; 

    const fetchData = () => {
        console.log("Into this", props.id);
        getQuotesInfo({
            "type": "viewquote",
            "loggedinuserid": getCurrentUserDetails()?.id,
            "quote_number": props.id?.toString()
        }).then(res => {
            setLogData(res.audit_log);
            setQuoteDetails(res);
            setEnablepriceapprovebutton(res?.enablepriceapprovebutton)
        });

        getQuoteItems({
            "quote_id": props.id,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(response => {
            setQuoteItems(response ?? []);
        });
    }

    useEffect(() => {
        if (alternateSamples) {
            console.log('temp::', alternateSamples)
        }
    }, [alternateSamples]);

    useEffect(() => {
        if (!showEditQuoteItem)
            fetchData();
        // eslint-disable-next-line 
    }, [showEditQuoteItem]);

    const formatDate = (datestr) => {
        if(datestr){
            let dateVal = new Date(datestr);
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
        } else {
            return '';
        }
        
    }

    // const handleCheck = (event, key) => {
    //     let data = {
    //         ...quoteDetails,
    //         [key]: event.target.checked,
    //     };
    //     setQuoteDetails(data);
    // };
    // eslint-disable-next-line
    const payload = [
        {
            type: 'label',
            value: "Quote Id",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },

        {
            type: 'label',
            value: "Quote Creation Date",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: formatDate(quoteDetails.createddate),
            sm: '6'
        },
        // {
        //     label: "Reqapproval For Price",
        //     type: "checkbox",
        //     disabled: true,
        //     checked: quoteDetails.billing_primary || false,
        //     sm: '6'
        // }
    ];
    // eslint-disable-next-line
    const payload1 = [
        {
            type: 'label',
            value: "Quote Number",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.quote_autogennumber,
            sm: '6'
        },
        {
            type: 'label',
            value: "",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '',
            sm: '6'
        },
        // {
        //     label: "Approval Status For Price",
        //     type: "checkbox",
        //     onChange: (e) => handleCheck(e, "approve_status"),
        //     checked: quoteDetails.billing_primary,
        //     sm: '6'
        // }
    ];

    const payload2 = [
        {
            type: 'label',
            value: "Customer",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.accountname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Currency Requested by Customer",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.currencyname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Exchange Rate USD (as per quotation date)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
    ];

    const payload3 = [
        {
            type: 'label',
            value: "Final Client",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails?.finalclientaccountname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Marketing Representative",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.remarks_marketing,
            sm: '6'
        }
    ];
    // eslint-disable-next-line
    const payload7 = [
        {
            type: 'label',
            value: "Comments",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
        {
            type: 'label',
            value: "Comments To GMC",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        }
    ];

    const payload4 = [
        {
            type: 'label',
            value: "Dispatch Period",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: "From " + formatDate(quoteDetails.fromdate) + " To " + formatDate(quoteDetails.todate),
            sm: '6'
        },
        {
            type: 'label',
            value: "Incoterms",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.incoterms,
            sm: '6'
        },
        {
            type: 'label',
            value: "Internal Comments",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        }
    ];

    const payload5 = [
        {
            type: 'label',
            value: "Port Of Loading",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.port_loading,
            sm: '6'
        },
        {
            type: 'label',
            value: "Destination",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.destination_port,
            sm: '6'
        }
    ];

    const handleChange = (event, key,) => {
        let data = {
            ...quoteDetails,
            [key]: event.target.value
        }
        setQuoteDetails(data);
    };

    let sampleQuotation = [
        {
            name: 'Pending',
            label: 'pending'
        },
        {
            name: 'Confirmed',
            label: 'confirmed'
        }
    ];

    const handleSampleQuotation = (e, value) => {
        let data = {
            ...quoteDetails,
            'confirmQuote': value?.value
        }
        setQuoteDetails(data);
    }
    // eslint-disable-next-line
    const payload8 = [
        {
            label: 'Additional Rate (+/- variation) In (USD)',
            type: 'input',
            required: true,
            onChange: (e) => handleChange(e, 'additionalRate'),
            value: quoteDetails.additionalRate || ''
        },
        {
            label: 'Confirm The Sample For Quotation',
            type: 'autocomplete',
            labelprop: "label",
            value: quoteDetails.confirmQuote,
            options: sampleQuotation,
            onChange: handleSampleQuotation,
        }

    ];
    // eslint-disable-next-line
    const payload9 = [
        {
            label: 'Please select the action against stock price request(selling & price type)',
            type: 'input',
            disabled: true,
            value: 'Current Price'
        }
    ];
    // eslint-disable-next-line
    const ShowCreateQuoteItemHandler = () => {
        setCreateQuoteItem(true);
    };

    const HideCreateQuoteItemHandler = () => {
        setCreateQuoteItem(false);
        fetchData();
    };
    // eslint-disable-next-line
    const ShowQuoteItemDetailsHandler = (event, quoteItemId) => {
        setQuoteItemDetails(true);
        setQuoteItemId(quoteItemId);
    };

    const previousQuoteSample = [
        { id: "customer", label: "Customer" },
        { id: "quote_no", label: "QT.No" },
        { id: "quote_date", label: "Date" },
        { id: "sample", label: "Sample" },
        { id: "packingType", label: "Packing Type" },
        { id: "currency", label: "Currency" },
        { id: "final_rate", label: "Final Rate" },
        { id: "inco_terms", label: "Inco Terms" }
    ];

    const ShowQuoteItemDetailsHandlerMD = (event, quoteItemId, quoteItem) => {
        setQuoteItemDetailsMD(true);
        setQuoteItemId(quoteItemId);

        getQuoteItemsInfo({
            "type": "Viewquotelineitem",
            "loggedinuserid": getCurrentUserDetails()?.id,
            "quotelineitem_id": parseInt(quoteItem)
        }).then(res2 => {
        getSamplesInfo({
            'msampleid': parseInt(res2?.msampleid),
            'quotelineitemid': res2.quote_id, //
            'sampleid': res2.sample_id //
        }).then(res1 => {
            // setAlternatesamples(res1?.alternatesamples);
            // setMastersamples(res1?.mastersamples);
            // setPreviousquoterates(res1?.previousquoterates);
            let tempRate = [];
            // eslint-disable-next-line
            res1?.previousquoterates?.map((item, index) => {
                tempRate.push({
                    customer: <div><b>Customer: </b>{item.customer}<br /><b>Final Client: </b>{item.finalclient}</div>,
                    // eslint-disable-next-line 
                    quote_no: <a onClick={() => onRedirectToQuote(item)}>{item.quotationno}</a>,
                    quote_date: formatDate(item.quotationdate),
                    sample: item.samplecode,
                    packingType: item.description,
                    currency: item.currency,
                    final_rate: item.finalbaseprice,
                    inco_terms: item.incoterms
                });
            })
            setpreviousRateData(tempRate);
        })

    })

        getFinalisedSamples({
            "quoteid": props.id?.toString(),
            "quotelineid": quoteItemId,
            "userid": getCurrentUserDetails()?.id,
        }).then(response => {
            const indx = response.composition.findIndex(v => v.confirmedsample === true);
            setEnableConfirmSample(indx !== -1 ? false : true);
            let temp = [...additionalPrices];
            let tamp = null;
            let temp1 = [];
            // eslint-disable-next-line
            response.composition?.map(item => {
                item.current_price_checked = item.currentpriceapproved === true && item.confirmedsample === true ? true : false;
                item.stock_price_checked = item.stockpriceapproved === true && item.confirmedsample === true ? true : false;;
                item.currentbaseprice = parseFloat(item.currentbaseprice).toFixed(2);
                item.stockbaseprice = parseFloat(item.stockbaseprice).toFixed(2);

                var currentSum = item?.itemcomposition?.reduce(function (prev, current) { return prev + + current.gccompositionprice }, 0);
                var stockSum = item?.itemcomposition?.reduce(function (prev, current) { return prev + + parseFloat(current.stockcompositionprice) }, 0);

                var sumOther = response?.otherfactorcomposition?.reduce(function (prev, current) { return prev + + parseFloat(current.purgcrate) }, 0);

                item.totalCurrentBasePrice = item?.currentpricerequested === true ? parseFloat(currentSum + sumOther).toFixed(2) : null;
                item.totalStockBasePrice = item?.stockpricerequested === true ? parseFloat(stockSum + sumOther).toFixed(2) : null;

                // eslint-disable-next-line
                item.itemcomposition?.map(item1 => {
                    item1.current_price = item1?.gccomposition + item1?.gccompositionprice;
                    item1.stock_price = item1?.stockcomposition + item1?.stockcompositionprice;
                })
                temp.push({ msamplecode: item.msamplecode, currentAdditional: item.additionalrate, stockAdditional: item.additionalrate, totalCurrentBasePrice: item.totalCurrentBasePrice, totalStockBasePrice: item.totalStockBasePrice });

                if (item?.confirmedsample === true) {
                    tamp = {
                        "quoteid": props.id?.toString(),
                        "quotelineid": quoteItemId,
                        "stockpriceapproved": false, //item?.stock_price_checked,
                        "currentpriceapproved": false, //item?.current_price_checked,
                        "confirmedsample": false,
                        "finalbaseprice": item?.stock_price_checked ? item?.stockbaseprice.toString() : item?.currentbaseprice.toString(),
                        "additionalrate": item.additionalrate.toString(),
                        "msamplecode": item?.msamplecode,
                        "userid": getCurrentUserDetails()?.id,
                        "userrole": getCurrentUserDetails()?.role,
                        "username": getCurrentUserDetails()?.name
                    };
                }
            });
            setAddtionalPrices(temp);
            setDefaultSelectedSample(tamp);
            temp1 = response ? response : [];
            setAlternateSamples(temp1);
        });
    };

    const onRedirectToQuote = (item) => {
        setRedirectQuote(true);
        setQuoteItems(item);
    }

    const HideQuoteDetailsHandler = (item) => {
        setRedirectQuote(false);
    }

    const HideQuoteItemDetailsHandler = () => {
        setQuoteItemDetails(false);
    };

    const ShowEditQuoteItemHandler = (event, quoteItemId) => {
        setQuoteItemDetails(false);
        setEditQuoteItem(true);
        setQuoteItemId(quoteItemId);
    };

    const HideEditQuoteItemHandler = () => {
        setEditQuoteItem(false);
    };

    const requestPriceSuccess = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Success
            </h2>
            <p>Request submitted for Quote number: {props.id} and email sent successfully</p>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Close" onClick={handleClose} />
                </Grid>
            </Grid>
        </Container>
    );

    const handleClose = () => {
        setRequestPrice(!requestPrice);
        props.back();
    }

    // const requestPriceAction = async (e) => {
    //     try {
    //         let response = await requestQuotePriceInfo({
    //             "type": "requestprice",
    //             "quote_number": props.id?.toString()
    //         });
    //         console.log("Response", response);
    //         if (response) {
    //             setRequestPrice(!requestPrice);
    //             setTimeout(() => {
    //                 handleClose();
    //             }, 2000)
    //         }
    //     } catch (e) {
    //         setSnack({
    //             open: true,
    //             message: e.message,
    //             severity: 'error',
    //         })
    //     }
    // }
    // eslint-disable-next-line
    const updateQuotationStatus = async (status) => {
        try {
            let response = null;
            if (status === 'requestforprice') {
                var msg = `To Commercial Team, <br /><br /> Quotation# ${quoteDetails.quote_autogennumber} for Customer ${quoteDetails.accountname} is created in ERP. Please provide base price. <br/><br /> Please click the below link for further details:<br/> https://erp.cclproducts.com/adminlogin.aspx <br /><br /> Note :This is an auto-generated email please don’t reply to this email. In case of any queries reach out to ravisai.v@continental.coffee`;
                var sub = `Customer: ${quoteDetails.accountname} / Quotation: ${quoteDetails.quote_autogennumber} created in ERP - Action required.`;
                // ?srt=editSALESQUOTATION_NEW.aspx%QUOTATIONID=${props?.id}
                console.log('sub::', sub, msg)
                response = await updateQuoteStatus({
                    type: status,
                    quote_id: props?.id.toString(),
                    updated_by: id,
                    "loggedinuserid": getCurrentUserDetails()?.id,
                    emailcontent: { message: msg, subject: sub }
                });
            } else {
                response = await updateQuoteStatus({
                    type: status,
                    quote_id: props?.id.toString(),
                    updated_by: id,
                });
            }

            console.log("Response", response);
            if (response) {
                setRequestPrice(!requestPrice);
                setTimeout(() => {
                    handleClose();
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
    // eslint-disable-next-line
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

    async function onApprove() {
        try {
            let response = await updateQuotationStatusForPricing({
                "status": "PriceApproved",
                "quoteid": props.id.toString(),
                "modifieduserid": getCurrentUserDetails()?.id
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "Price Approved successfully",
                });
                setTimeout(() => {
                    handleClose();
                }, 2000)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    const gcConfig = [
        { id: "itemname", label: "Item Name" },
        { id: "yeildratio", label: "Ratio" },
        { id: "percentage", label: "Percentage" },
        { id: "current_price", label: "Current Price (GC * Yeild * Composition%)" },
        { id: "stock_price", label: "Stock Price (GC * Yeild * Composition%)" }
    ];
    // eslint-disable-next-line
    const otherfactor = [
        { id: "factorname", label: "Factor" },
        { id: "purgcrate", label: "Current Price" },
        { id: "purgcrate", label: "Stock Price" }
    ];

    const onConfirmSample = async (item) => {
        var indx = additionalPrices.findIndex(v => v.msamplecode === item.msamplecode);
        let data = [];
        console.log('additional::11', defaultSelectedSample, alternateSamples?.composition)
        // eslint-disable-next-line
        alternateSamples?.composition.map(item1 => {
            if (item1?.msamplecode !== item.msamplecode) {
                var indx1 = additionalPrices.findIndex(v => v.msamplecode === item1.msamplecode);
                var totalCurrent1 = parseFloat(item1?.totalCurrentBasePrice) + parseFloat(additionalPrices[indx1]?.currentAdditional);
                var totalStock1 = parseFloat(item1?.totalStockBasePrice) + parseFloat(additionalPrices[indx1]?.stockAdditional);

                data.push({
                    "quoteid": props.id?.toString(),
                    "quotelineid": quoteItemId,
                    "stockpriceapproved": item1?.stock_price_checked,
                    "currentpriceapproved": item1?.current_price_checked,
                    "confirmedsample": true,
                    "finalbaseprice": item1?.stock_price_checked ? totalStock1.toString() : totalCurrent1.toString(),
                    "additionalrate": item1?.stock_price_checked ? additionalPrices[indx1]?.stockAdditional.toString() : additionalPrices[indx1]?.currentAdditional.toString(),
                    "msamplecode": item1?.msamplecode,
                    "userid": getCurrentUserDetails()?.id,
                    "userrole": getCurrentUserDetails()?.role,
                    "username": getCurrentUserDetails()?.name
                });
            }
        })

        var totalCurrent = parseFloat(item?.totalCurrentBasePrice) + parseFloat(additionalPrices[indx]?.currentAdditional);
        var totalStock = parseFloat(item?.totalStockBasePrice) + parseFloat(additionalPrices[indx]?.stockAdditional);

        data.push({
            "quoteid": props.id?.toString(),
            "quotelineid": quoteItemId,
            "stockpriceapproved": item?.stock_price_checked,
            "currentpriceapproved": item?.current_price_checked,
            "confirmedsample": true,
            "finalbaseprice": item?.stock_price_checked ? totalStock.toString() : totalCurrent.toString(),
            "additionalrate": item?.stock_price_checked ? additionalPrices[indx]?.stockAdditional.toString() : additionalPrices[indx]?.currentAdditional.toString(),
            "msamplecode": item?.msamplecode,
            "userid": getCurrentUserDetails()?.id,
            "userrole": getCurrentUserDetails()?.role,
            "username": getCurrentUserDetails()?.name
        });
        console.log('additional::', data, indx, item)

        try {
            let response = await updateConfirmSample(data);
            if (response) {
                setSnack({
                    open: true,
                    message: "Sample Confirmed Successfully",
                });
                fetchData();
                setQuoteItemDetailsMD(false);
                setAlternateSamples(null);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
    }

    const onPriceChecked = (checked, type, index, item) => {
        setCheckedSample(item);
        let temp = { ...alternateSamples };
        // eslint-disable-next-line
        temp.composition.map(item1 => {
            item1.stock_price_checked = false;
            item1.current_price_checked = false;
        });
        // if (type === 'stock_price_checked') {
        temp.composition[index][type] = true;
        // temp.composition[index].current_price_checked = false;
        // } else {
        // temp.composition[index][type] = checked;
        // temp.composition[index].stock_price_checked = false;
        // }
        setAlternateSamples(temp);
    }

    const onAdditionalCharges = (type, val, item, index) => {
        let temp = [...additionalPrices];
        var indx = temp.findIndex(v => v.msamplecode === item.msamplecode);
        var value = val === '' ? 0 : parseInt(val);
        temp[indx].stockAdditional = value;
        temp[indx].currentAdditional = value;
        console.log('temp::55', temp, additionalPrices, item, value, type)
        setAddtionalPrices(temp);
    }

    let component;
    if (showCreateQuoteItem) {
        component = <CreateQuoteItem back={HideCreateQuoteItemHandler} accountId={quoteDetails.accountid} quoteId={props.id}></CreateQuoteItem>
    } else if (showQuoteItemDetails) {
        component = <QuoteItemDetails back={HideQuoteItemDetailsHandler} accountId={quoteDetails.accountid} id={quoteItemId} edit={(event, quoteItemId) => ShowEditQuoteItemHandler(event, quoteItemId)}></QuoteItemDetails>
    } else if (showEditQuoteItem) {
        component = <EditQuoteItem back={HideEditQuoteItemHandler} accountId={quoteDetails.accountid} id={quoteItemId} quoteId={props.id} status={quoteDetails?.status}></EditQuoteItem>
    } else if (redirectQuote) {
        component =  <QuoteDetails back={HideQuoteDetailsHandler} id={quoteItems?.quoteid} hideEdit={true}></QuoteDetails>
    }else {
        component = (<>
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Card className="page-header">
                <CardHeader
                    title=" Quotation Details"
                    className='cardHeader'
                />
                <CardContent>
                    <Grid container md={6}>
                        <Grid item md={3} xs={12} >
                            <Typography variant="h7">Quotation No</Typography>
                            <Typography>{quoteDetails.quote_autogennumber}</Typography>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <Typography variant="h7">Quote Creation</Typography>
                            <Typography>{formatDate(quoteDetails.createddate)}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Customer & Final Client Information</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload2} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload3} />
                </Grid>
            </Grid>

            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Dispatch Period, Incoterms & Port Details</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload4} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload5} />
                </Grid>
            </Grid>

            {
                quoteItems?.length > 0 && <QuoteItemListMD data={quoteItems} quoteItemDetails={(event, quoteItemId, quoteItem) => ShowQuoteItemDetailsHandlerMD(event, quoteItemId, quoteItem)} />
            }
            <br /><br />

            {showQuoteItemDetailsMD === true &&
                <>
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Previous Quotation Rates For This Sample And Customer</Typography>
                        </Grid>
                    </Grid>
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12}>
                            <BasicTable rows={previousRateData} columns={previousQuoteSample}></BasicTable>
                        </Grid>
                    </Grid>

                    <Grid id="top-row" container style={{ margin: 1 }}>
                        <Grid item md={11} xs={12} className='item'>
                            <Typography>Requested Samples</Typography>
                        </Grid>
                        <Grid item md={1} xs={12} className='item' style={{ textAlign: 'right', cursor: 'pointer' }}>
                            <Typography onClick={() => setQuoteItemDetailsMD(false)}>X</Typography>
                        </Grid>
                        <Grid id="top-row" container >
                            {alternateSamples?.composition?.map((item, index) => {
                                var len = alternateSamples?.composition?.length;
                                var currentpricerequested = (item.currentpricerequested === true && item.stockpricerequested === true) ?
                                    [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Current Price' }, { id: "purgcrate", label: 'Stock Price' }] :
                                    item.currentpricerequested === true ?
                                        [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Current Price' }] :
                                        [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Stock Price' }];

                                var currentpricerequestedcheck = (item.currentpricerequested === true && item.stockpricerequested === true) ? 'both' : item.currentpricerequested === true ? 'Current' : 'Stock';
                                var indx = additionalPrices.findIndex(v => v.msamplecode === item.msamplecode);

                                var sumCurrentBase = parseFloat(item?.totalCurrentBasePrice) + parseFloat(additionalPrices[indx]['currentAdditional']);
                                var sumStockBase = parseFloat(item?.totalStockBasePrice) + parseFloat(additionalPrices[indx]['stockAdditional']);
                                console.log('current::', item?.totalCurrentBasePrice, additionalPrices[indx]['currentAdditional'], additionalPrices);
                                return (

                                    <Grid id="top-row" style={{ padding: 12 }} xs={12} md={len > 1 ? 6 : 12} container direction="column">
                                        <Card className="page-header">
                                            <CardHeader
                                                title={item?.msamplecode}
                                                className='cardHeader'
                                            />
                                            <Grid>
                                                <Grid item md={12} xs={12} className='item'>
                                                    <Typography>Green Coffee Configuration & Pricing (USD) </Typography>
                                                </Grid>
                                            </Grid>
                                            <Grid item md={12} xs={12} style={{ textAlign: 'center' }}>
                                                <BasicTable fullwidth={true} rows={item?.itemcomposition} columns={gcConfig}></BasicTable>
                                            </Grid>
                                            {/* {item?.stock_price_checked === true && */}
                                            <>
                                                <Grid>
                                                    <Grid item md={12} xs={12} className='item'>
                                                        <Typography>Green Coffee & Other Factors Pricing (USD) </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item md={12} xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
                                                    <BasicTable fullwidth={true} rows={alternateSamples?.otherfactorcomposition} columns={currentpricerequested}
                                                        currentpricerequested={currentpricerequestedcheck} allData={item} otherfactorCheck={true} current_price_checked={item?.current_price_checked} stock_price_checked={item?.stock_price_checked} priceChecked={(type, checked) => onPriceChecked(checked, type, index, item)} currentbaseprice={sumCurrentBase} stockbaseprice={sumStockBase} AdditionalCharges={(type, val) => onAdditionalCharges(type, val, item, index)} enablepriceapprovebutton={quoteDetails?.status === 'Base Price Received' || quoteDetails?.status === 'Quote Submitted'} ></BasicTable>
                                                </Grid>
                                            </>
                                            {/* } */}
                                            {/* {sampleIndx === -1 && */}
                                            {/* <Grid item style={{ textAlign: 'center' }}>
                                                <Button label="Confirm" onClick={() => onConfirmSample(item, index)} />
                                            </Grid> */}
                                            {/* } */}
                                            {/* {item?.confirmedsample === true && sampleIndx !== -1 &&
                                            <Grid item style={{ textAlign: 'center' }}>
                                                <Button label="Confirmed" disabled={true} onClick={() => onConfirmSample(item, index)} />
                                            </Grid>
                                        } */}
                                        </Card>

                                    </Grid>
                                )
                            })}
                            <Grid item md={12} xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Button label="Confirm" disabled={quoteDetails?.status === 'Base Price Received' || quoteDetails?.status === 'Quote Submitted'} onClick={() => onConfirmSample(checkedSample)} />
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            }

            {/* <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Please Select The Line Item To Get The Raw Material Configuration With Prices</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={packingDetailsData} columns={packingDetailsCols} ></BasicTable>
                </Grid>
            </Grid>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Green Coffee Configuration & Pricing (USD)</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={coffeeConfigurationData} columns={coffeeConfiguration} hasTotal='stockPrice' ></BasicTable>
                </Grid>
            </Grid>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Other Factors Pricing (USD)</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={coffeeConfigurationFactorsData} columns={coffeeConfigurationFactors} hasTotal='stockPrice' ></BasicTable>
                </Grid>
            </Grid> */}

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button label="Approve" disabled={!enablepriceapprovebutton} onClick={onApprove} />
                </Grid>
                {/* <Grid item>
                    <Button label="Save" onClick={onSave} />
                </Grid> */}
                <Grid item>
                    <Button label="Cancel" onClick={props.back} />
                </Grid>
            </Grid>
            <SimpleModal open={requestPrice} handleClose={handleClose} body={requestPriceSuccess} />
        </>)
    }
    return (<>
        {component}
    </>
    );
}
export default QuoteDetailsMD;