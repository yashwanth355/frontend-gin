import React, { useEffect, useState, useRef } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import QuoteItemList from './QuoteItemList';
import QuoteItemDetails from './QuoteItemDetails';
import EditQuoteItem from './EditQuoteItem';
import CreateQuoteItem from './CreateQuoteItem';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import SimpleModal from '../../../components/Modal';
import SimplePopper from '../../../components/Popper';
import { Container } from '@material-ui/core';
import _ from 'lodash';
import { getQuotesInfo, getQuoteItems, updateQuoteStatus, updateQuotationStatusForPricing, createQuote } from '../../../apis';
import useToken from '../../../hooks/useToken';
import '../../common.css'
import AuditLog from './AuditLog';
import SimpleStepper from '../../../components/SimpleStepper';
import { roles } from '../../../constants/roles';
import { colors } from '../../../constants/colors';

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

const QuoteDetailsComm = (props) => {
    const classes = useStyles();
    const [quoteDetails, setQuoteDetails] = useState({});
    const [quoteItems, setQuoteItems] = useState([]);
    //eslint-disable-next-line
    const [loading, setLoading] = useState(false);
    const [showCreateQuoteItem, setCreateQuoteItem] = useState(false);
    const [enablegcandpricerequest, setEnablegcandpricerequest] = useState(false);
    const [enablemdpricerequest, setEnablemdpricerequest] = useState(false);
    const [showQuoteItemDetails, setQuoteItemDetails] = useState(false);
    const [showEditQuoteItem, setEditQuoteItem] = useState(false);
    const [quoteItemId, setQuoteItemId] = useState(-1);
    const [requestPrice, setRequestPrice] = useState(false);
    // const [conversatioRatio, setConversatioRatio] = useState(null);
    const [logData, setLogData] = useState([]);
    const quoteItemInfoRef = useRef(null)
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // const [conversatioRatioRate, setConversatioRatioRate] = useState(null);
    const sampleSteps = [
        'New',
        'Pricing',
        'Expired',
        'Customer Review',
        'Approved',
        'Rejected',
    ];
    const { getCurrentUserDetails } = useToken();
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

    const fetchData = async () => {
        console.log("Into this", props.id);
        getQuotesInfo({
            "type": "viewquote",
            "loggedinuserid": getCurrentUserDetails()?.id,
            "quote_number": props.id?.toString()
        }).then(async res => {
            setLogData(res.audit_log);
            setQuoteDetails(res);
            setEnablegcandpricerequest(!res?.enablegcandpricerequest);
            setEnablemdpricerequest(!res?.enablemdpricerequest);

            // let data = { 'currencyid': res.currencyid };
            // let res1 = await getConversatioRatio(data);
            // setConversatioRatio(res1);

            // let data1 = { 'currencyid': 'HO-102' };
            // let res2 = await getConversatioRatio(data1);
            // setConversatioRatioRate(res2);

        });

        getQuoteItems({
            "quote_id": props.id,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(response => {
            setQuoteItems(response ?? []);
        });



    }

    useEffect(() => {
        if (!showEditQuoteItem)
            fetchData();
        // eslint-disable-next-line 
    }, [showEditQuoteItem]);

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
    }
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
            value: "Quote Creation Date",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: formatDate(quoteDetails.createddate),
            sm: '6'
        },
        {
            type: 'label',
            value: "Contact Name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.contactname,
            sm: '6'
        }
        // {
        //     type: 'label',
        //     value: "Account Name",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.accountname,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Account Type",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.accounttypename,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Billing Address",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.billing_address,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Quote Status",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.status,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Payment Terms",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.payment_terms,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Final Client",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.finalclientaccountname,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Remarks from GMC",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.remarks_gmc,
        //     sm: '6'
        // },
    ];
    // eslint-disable-next-line
    const payload1 = [
        {
            type: 'label',
            value: "Exchange Rate USD(AS Per Requested Date)",
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
            value: "Marketing Representative",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.remarks_marketing,
            sm: '6'
        },
        {
            type: 'label',
            value: "Total Expected Instant Coffee Quantity (Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
        // {
        //     type: 'label',
        //     value: "Incoterms",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.incoterms,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Remarks from Marketing",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.remarks_marketing,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Customer Currency",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.currencyname,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: "Pending With",
        //     bold: true,
        //     sm: '6'
        // },
        // {
        //     type: 'label',
        //     value: quoteDetails.pending_withuser,
        //     sm: '6'
        // },

    ];

    const payload8 = [
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
            value: "Account Name",
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
            value: "Account Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.accounttypename,
            sm: '6'
        },
        {
            type: 'label',
            value: "Billing Address",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.billing_address,
            sm: '6'
        },
        {
            type: 'label',
            value: "Quote Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.status,
            sm: '6'
        },
        {
            type: 'label',
            value: "Payment Terms",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.payment_terms,
            sm: '6'
        },
        {
            type: 'label',
            value: "Final Client",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.finalclientaccountname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Remarks from GMC",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.remarks_gmc,
            sm: '6'
        },
    ];

    const payload9 = [
        {
            type: 'label',
            value: "Contact Name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.contactname,
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
            value: "Remarks from Marketing",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.remarks_marketing,
            sm: '6'
        },
        {
            type: 'label',
            value: "Customer Currency",
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
            value: "Pending With",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.pending_withuser,
            sm: '6'
        },

    ];

    const payload2 = [
        {
            type: 'label',
            value: "Port Loading",
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
            value: "Dipatch Time Period",
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
            value: "Others (Specification)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.other_specification,
            sm: '6'
        },
    ];

    const payload3 = [
        {
            type: 'label',
            value: "Destination Country",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails?.destination_country,
            sm: '6'
        },
        {
            type: 'label',
            value: "Destination Port",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails.destination_port,
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
            value: "Title",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        }
    ];

    const payload6 = [
        {
            type: 'label',
            value: "Commission Agent",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteDetails?.createdby,
            sm: '6'
        },
        {
            type: 'label',
            value: "Internal Commets",
            bold: true,
            sm: '6'
        },
        {
            type: 'input',
            value: quoteDetails?.internalComments || '',
            multiline: true,
            rows: 6,
            cols: 10,
            sm: '6',
            onChange: (e) => handleChange(e, 'internalComments'),
        },
    ];

    const handleChange = (event, key) => {
        let data = {
            ...quoteDetails,
            [key]: event.target.value
        }
        setQuoteDetails(data);
    }


    // const handleGetFact = async () => {
    //     let data = { 'currencyid': quoteDetails.currencyid };
    //     let res = await getConversatioRatio(data);
    //     setConversatioRatio(res);
    // }

    // const handleGetFactRate = async () => {
    //     let data = { 'currencyid': 'HO-102' };
    //     let res = await getConversatioRatio(data);
    //     setConversatioRatioRate(res);
    // }

    const payload4 = [
        {
            type: 'label',
            value: "Currency For The Rate Calculation",
            bold: true,
            sm: 4
        },
        // {
        //     label: 'Get CFact',
        //     type: 'button',
        //     className: classes.button,
        //     onClick: () => handleGetFactRate(),
        //     sm: 2
        // },
        {
            value: 'UNITED STATES DOLLERS',
            type: 'label',
            sm: 3
        },
        {
            label: 'Display convertion value',
            type: 'input',
            value: quoteDetails?.coporatecurrency ? quoteDetails?.coporatecurrency : '',
            disabled: true,
            // onChange: (e) => handleTempOtherChargeChange(e, 'item', index),
            sm: 3
        }
    ];

    const payload5 = [
        {
            type: 'label',
            value: "Currency For The Customer",
            bold: true,
            sm: 4
        },
        // {
        //     label: 'Get cFact',
        //     type: 'button',
        //     className: classes.button,
        //     onClick: () => handleGetFact(),
        //     sm: 2
        // },
        {
            value: quoteDetails.currencyname,
            type: 'label',
            sm: 3
        },
        {
            label: 'Display convertion value',
            type: 'input',
            value: quoteDetails?.customercurrenctyasperinr ? quoteDetails?.customercurrenctyasperinr : '',
            disabled: true,
            // onChange: (e) => handleTempOtherChargeChange(e, 'item', index),
            sm: 3
        }
    ];

    const ShowCreateQuoteItemHandler = () => {
        setCreateQuoteItem(true);
    };

    const HideCreateQuoteItemHandler = () => {
        setCreateQuoteItem(false);
        fetchData();
    };

    const ShowQuoteItemDetailsHandler = (event, quoteItemId) => {
        setQuoteItemDetails(true);
        setQuoteItemId(quoteItemId);
    };

    const HideQuoteItemDetailsHandler = () => {
        setQuoteItemDetails(false);
        fetchData();
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
    const getSaveButton = () => {
        if (quoteDetails?.status === "New" && quoteItems?.length > 0 && quoteItems?.reduce((accumulator, current) => {
            return accumulator &&
                !_.isEmpty(current?.category)
        }, true)) {
            return <Button disabled={loading} label={loading ? "Loading..." : "Request Price"}
                onClick={() => updateQuotationStatus("requestforprice")} />
        }
        else if (quoteDetails?.status === "Base Price Received" && (role === roles.managingDirector || role === roles.marketingExecutive)
            && quoteItems?.length > 0
            && quoteItems?.reduce((accumulator, current) => {
                return accumulator && !_.isEmpty(current?.final_price)
            }, true)) {
            return <Button disabled={loading} label={loading ? "Loading..." : "Submit Quote"}
                onClick={() => updateQuotationStatus("quotesubmit")} />
        }
        else if (quoteDetails?.status === "Quote Submitted" && (role === roles.managingDirector || role === roles.marketingExecutive)
            && quoteItems?.length > 0
            && quoteItems?.reduce((accumulator, current) => {
                return accumulator && !_.isEmpty(current?.customer_approval?.toString())
            }, true)) {
            return <Button disabled={loading} label={loading ? "Loading..." : "Submit to GMC"}
                onClick={() => updateQuotationStatus("bidsubmitted")} />
        }
        else if (quoteDetails?.status === "Bid Submitted to GMC" && (role === roles.managingDirector || role === roles.gmc)
            && quoteItems?.length > 0
            && quoteItems?.reduce((accumulator, current) => {
                return accumulator && !_.isEmpty(current?.gms_approvalstatus)
            }, true)) {
            return <React.Fragment>
                <Button disabled={loading} label={loading ? "Loading..." : "Approve"}
                    onClick={() => updateQuotationStatus("quoteapprovedbygmc")} />

                <Button disabled={loading} label={loading ? "Loading..." : "Reject"}
                    onClick={() => updateQuotationStatus("quoterejectedbygmc")} />
            </React.Fragment>
        }
        else {
            return null
        }
    }
    // eslint-disable-next-line
    const samplePricingCols = [
        { id: "name", label: "Item name" },
        { id: "previousRate", label: "Previous Rates" },
        { id: "dailyRate", label: "Daily Rates (onDate)" },
        { id: "currentPrice", label: "Current Price MT(USD)" },
        { id: "stockPrice", label: "Stock Price MT(USD)" }
    ];

    // eslint-disable-next-line
    const packingDetailsCols = [
        { id: "packing", label: "Packing" },
        { id: "packingCost", label: "Packing Cost" },
        { id: "palletCost", label: "Pallet Cost" }
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
        var data = allStatus?.find(i => i[quoteDetails?.status])
        // return data;
        var dataIndex = (data !== null && quoteDetails?.status !== undefined) && sampleSteps?.findIndex(i => i === data?.[quoteDetails?.status])
        return dataIndex + 1;
    };

    const quoteItemInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container ref={quoteItemInfoRef}>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Item Information</Typography>
                </Grid>
            </Grid>
            <Grid container direction="row">
                <Grid xs={6} item>
                </Grid>
                {quoteDetails?.status !== "New" ? null :
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {role !== roles.managerPurchaseGCQuotes && <Fab label={"Create Quote Item"} variant="extended" onClick={ShowCreateQuoteItemHandler}
                            quoteId={props.id} />}
                    </Grid>}
            </Grid>
            <QuoteItemList data={quoteItems} quoteItemDetails={(event, quoteItemId) => ShowQuoteItemDetailsHandler(event, quoteItemId)} />
        </Container>
    );

    async function sendForApproval() {
        try {
            let response = await updateQuotationStatusForPricing({
                "status": "PriceRequested",
                "quoteid": props.id.toString(),
                "modifieduserid": getCurrentUserDetails()?.id
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "Price Requested successfully",
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

    async function sendForGC() {
        try {
            let response = await updateQuotationStatusForPricing({
                "status": "GCPriceRequested",
                "quoteid": props.id.toString(),
                "modifieduserid": getCurrentUserDetails()?.id
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "GC Price Requested successfully",
                });

            }
        } catch (e) {
            setSnack({
                open: true,
                message: e.message,
                severity: 'error',
            })
        }
        setTimeout(async () => {
            try {
                let response = await updateQuotationStatusForPricing({
                    "status": "PackingPriceRequested",
                    "quoteid": props.id.toString(),
                    "modifieduserid": getCurrentUserDetails()?.id
                });
                if (response) {
                    setSnack({
                        open: true,
                        message: "Packing Price Requested successfully",
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
        }, 1000);
    }

    const onUpdateCurrency = async () => {
        let data =
        {
            "update": true,
            "quoteid": props.id,
            "modifieduserid": getCurrentUserDetails()?.id,
            "loggedinuserid": getCurrentUserDetails()?.id,
            "accountid": quoteDetails.accountid?.toString(),
            "accounttypeid": (quoteDetails.accounttypeid),
            "accounttypename": quoteDetails.accounttypename,
            "finalclientaccountid": quoteDetails.finalclientaccountid?.toString() || '0',
            "incotermsid": quoteDetails.incotermsid,
            "modifieddate": new Date(),
            "fromdate": quoteDetails.fromdate,
            "todate": quoteDetails.todate,
            "currencycode": quoteDetails.currencycode,
            "currencyid": quoteDetails?.currencyid,
            "portloadingid": quoteDetails.portloadingid?.toString(),
            "destinationid": quoteDetails.destinationid?.toString() || '0',
            "isactive": 1,
            "payment_terms": quoteDetails.payment_terms,
            "other_specification": quoteDetails.other_specification,
            "remarks_marketing": quoteDetails.remarks_marketing,
            "destination_port": quoteDetails.destination_port,
            "port_loading": quoteDetails.port_loading,
            "destination_countryid": quoteDetails?.destination_countryid,
            "destination_country": quoteDetails?.destination_country,
            "status_id": quoteDetails?.status_id,
            "master_status": quoteDetails.master_status,
            "contactid": quoteDetails.contactid?.toString() || '1',
            "billing_id": quoteDetails?.billing_id?.value,
            "pending_withuserid": quoteDetails?.pending_withuserid,
            "internal_comments": quoteDetails?.internalComments
        }
        console.log('data::33', quoteDetails, data)
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

    let component;
    if (showCreateQuoteItem) {
        component = <CreateQuoteItem back={HideCreateQuoteItemHandler} accountId={quoteDetails.accountid} quoteId={props.id}></CreateQuoteItem>
    } else if (showQuoteItemDetails) {
        component = <QuoteItemDetails back={HideQuoteItemDetailsHandler} status={quoteDetails.status} accountId={quoteDetails.accountid} id={quoteItemId} edit={(event, quoteItemId) => ShowEditQuoteItemHandler(event, quoteItemId)}></QuoteItemDetails>
    } else if (showEditQuoteItem) {
        component = <EditQuoteItem back={HideEditQuoteItemHandler} accountId={quoteDetails.accountid} id={quoteItemId} quoteId={props.id} status={quoteDetails?.status}></EditQuoteItem>
    } else {
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
                    <Grid container className={classes.links} md={6}>
                        <Grid item md={3} xs={6} >
                            <SimplePopper linkLabel="Quote Item Information" body={quoteItemInfo} linkRef={quoteItemInfoRef}></SimplePopper>
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

            {/* <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Information</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload1} />
                </Grid>
            </Grid> */}

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Information</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload8} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload9} />
                </Grid>
            </Grid>

            {/* <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Comments From Commercial & Purchase</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <Template payload={payload7} />
                </Grid>
            </Grid> 

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Samples For Pricing</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={samplePricingData} columns={samplePricingCols} ></BasicTable> 
                </Grid>
            </Grid>

            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Packing Details</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={12} container direction="column">
                    <BasicTable rows={packingDetailsData} columns={packingDetailsCols} ></BasicTable> 
                </Grid>
            </Grid>*/}

            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Dispatch Details</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload2} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload3} />
                </Grid>
            </Grid>
            <Card className="page-header">
                <CardContent>
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Currency Management</Typography>
                        </Grid>
                    </Grid>
                    <Grid id="top-row" container>
                        <Grid id="top-row" xs={12} md={12} container direction="column" >
                            <Template payload={payload4} align='center' />
                        </Grid>
                        <Grid id="top-row" xs={12} md={12} container direction="column" style={{ marginTop: 10 }}>
                            <Template payload={payload5} align='center' />
                        </Grid>
                    </Grid>

                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Commission Agent</Typography>
                        </Grid>
                    </Grid>
                    <Grid id="top-row" container>
                        <Grid id="top-row" xs={12} md={6} container direction="column" >
                            <Template payload={payload6} align='center' />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>



            <Grid id="top-row" container ref={quoteItemInfoRef}>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Quote Item Information</Typography>
                </Grid>
            </Grid>
            <Grid container direction="row">
                <Grid xs={6} item>
                </Grid>
                {quoteDetails?.status !== "New" ? null : <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                    <Fab label={"Create Quote Item"} variant="extended" onClick={ShowCreateQuoteItemHandler} quoteId={props.id} />
                </Grid>}
            </Grid>
            {
                quoteItems?.length > 0 && <QuoteItemList data={quoteItems} quoteItemDetails={(event, quoteItemId) => ShowQuoteItemDetailsHandler(event, quoteItemId)} />
            }

            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                    <Typography>Audit log information</Typography>
                </Grid>
            </Grid>
            <AuditLog data={logData} />

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                {//role === roles.BusinessDevelopmentManager &&
                    !enablegcandpricerequest &&
                    <Grid item>
                        <Button label="Request Prices" onClick={(e) => sendForGC()} />
                    </Grid>

                }
                <Grid item >
                    <Button label={"Save"} onClick={() => onUpdateCurrency()} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={props.back} />
                </Grid>
                <Grid item>
                    <Button label="Request For Price Approval" disabled={enablemdpricerequest} onClick={(e) => sendForApproval()} />
                </Grid>
                {/* {role !== roles.BusinessDevelopmentManager &&
                    <Grid item>
                        {getSaveButton()}
                    </Grid>} */}
            </Grid>
            <SimpleModal open={requestPrice} handleClose={handleClose} body={requestPriceSuccess} />
        </>)
    }
    return (<>
        {component}
    </>
    );
}
export default QuoteDetailsComm;