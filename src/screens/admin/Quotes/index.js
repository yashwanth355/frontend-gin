import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import QuotesList from './QuotesList';
import CreateQuote from './CreateQuote';
import QuoteDetails from './QuoteDetails';
import EditQuote from './EditQuote';
// import ERPQuotationEdit from './ERPQuotationEdit';
// import ERPQuotePendingGCEdit from './ERPQuotePendingGCEdit';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { getQuotes, getQuotesInfo } from "../../../apis";
import useToken from '../../../hooks/useToken';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import Snackbar from '../../../components/Snackbar';
import _ from 'lodash';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import { roles } from '../../../constants/roles';
import QuoteDetailsMD from './QuoteDetailsMD';
import QuoteDetailsPT from './QuoteDetailsPT';
import QuoteDetailsComm from './QuoteDetailsComm';
import QuoteDetailsPP from './QuoteDetailsPP';
import PendingQuoteItemList from './PendingQuoteItemList';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    formControl: {
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        minWidth: 120,
    },
}));

const Quotes = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails?.role;
    const currentUserId = currentUserDetails?.id;
    const inputLabel = React.useRef(null);
    const classes = useStyles();

    const [state, setState] = useState((role === roles.managingDirector || role === roles.gmc || role === roles.managerPurchaseGCQuotes) ?
        'All Quotes' : "myquotes");
    const [quotes, setQuotes] = useState(null);
    const [showCreateQuote, setCreateQuote] = useState(false);
    const [showQuoteDetails, setQuoteDetails] = useState(false);
    const [editQuoteDetails, setEditQuoteDetails] = useState(false);
    const [quoteId, setQuoteId] = useState(-1);
    const [snack, setSnack] = useState({ open: false, message: '' })
    const [quoteStatus, setQuoteStatus] = useState((role === roles.managingDirector || role === roles.gmc || role === roles.managerPurchaseGCQuotes) ? "All Quotes" : "myquotes");
    const [statusList, setStatusList] = useState([]);
    const [filter, setFilter] = useState("");
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [labelWidth, setLabelWidth] = React.useState(0);

    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data?.map(v => formattedData.push({ label: v[key], value: v[key] }))
        return formattedData;
    }
    const fetchquoteStatuses = async () => {
        try {
            let response = await getQuotesInfo({ type: "listquotationstatus", "loggedinuserid": getCurrentUserDetails()?.id, });
            const existingOptions = [{ label: 'All Quotes', value: 'All Quotes' },
            { label: 'My Quotes', value: 'myquotes' },
            { label: 'Pending Negative Margin Quotelines', value: 'PendingNegativeMarginQuotelines' },
            ]
            setStatusList(existingOptions.concat(formatToSelection(response, "status", "id")))
        }
        catch (error) {
            setSnack({ open: true, message: error, severity: 'error' });
            setTimeout(({
                open: false,
                message: 'Server Error. Please contact administrator', //e.response?.data
            }))
        }
    }
    const getData = async (filter, state) => {
        console.log("Val ", filter, state);

        let filterString = "";
        if ((role !== roles.managingDirector && role !== roles.gmc && role !== roles.managerPurchaseGCQuotes) || state === "myquotes") {
            filterString = filterString + `createdbyuserid = '${currentUserId}'`
        }
        if (state !== "All Quotes" && state !== "myquotes") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if(state === 'GC Price Requested') {
            filterString = 'GcPriceRequested';
        }
        if(state === 'GC Price Received') {
            filterString = 'GcPriceReceived';
        }
        if(state === 'Packing Price Requested') {
            filterString = 'PackingPriceRequested';
        }
        if(state === 'Packing Price Received') {
            filterString = 'PackingPriceReceived';
        }
        if(state === 'Price Rejected') {
            filterString = 'PriceRejected';
        }
        if(state === 'Price Requested') {
            filterString = 'PriceRequested';
        }
        if(state === 'Price Approved') {
            filterString = 'PriceApproved';
        }
        if(state === 'Base Price Requested' ) {//&& currentUserDetails.role === roles.BusinessDevelopmentManager
            filterString = `status = '${state}'`;
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let filterStringPending = state;
        let data = { filter: state === 'PendingNegativeMarginQuotelines' ? filterStringPending : filterString, loggedinuserid: currentUserId }

        try {
            let response = await getQuotes(data);
            console.log("Response", response);
            // if (response) {
            setQuotes(response);
            // }
        } catch (e) {
            setQuotes([]);
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }


    };
    useEffect(() => {
        if (!showQuoteDetails || !editQuoteDetails || !showCreateQuote)
            getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, filter, showQuoteDetails, editQuoteDetails, showCreateQuote]);
    useEffect(() => {
        fetchquoteStatuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleChange = (event) => {
        setState(event.target.value);
        setFilter(null)
    };

    const ShowCreateQuoteHandler = () => {
        setCreateQuote(true);
    };

    const HideCreateQuoteHandler = () => {
        setCreateQuote(false);
    };

    const ShowQuoteDetailsHandler = (event, quoteNumber, quoteStatus) => {
        setQuoteDetails(true);
        setQuoteStatus(quoteStatus);
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

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const ShowQuoteItemDetailsHandler = (event, quoteItemId) => {
        setQuoteDetails(true);
        setQuoteId(quoteItemId);
    };

    let component;

    if (showCreateQuote) {
        component = <CreateQuote back={HideCreateQuoteHandler}></CreateQuote>
    } else if (showQuoteDetails) {//quoteStatus === "New" || currentUserDetails.role === "Marketing Executive" || 
        if (currentUserDetails.role === roles.managingDirector && (state === 'Price Requested' || state === 'Price Approved')) {
            // md devApiUrl: 'https://c30j81s4jj.execute-api.ap-south-1.amazonaws.com/dev/dev-'
            component = <QuoteDetailsMD back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) =>
                EditQuoteDetailsHandler(event, quoteNumber)}></QuoteDetailsMD>
        } else if (currentUserDetails.role === roles.managerPurchaseGC) {
            // purchase team
            component = <QuoteDetailsPT back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) =>
                EditQuoteDetailsHandler(event, quoteNumber)}></QuoteDetailsPT>
        } else if (currentUserDetails.role === roles.packingExecutive) {
            // Manager Purchase Packing
            component = <QuoteDetailsPP back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) =>
                EditQuoteDetailsHandler(event, quoteNumber)}></QuoteDetailsPP>
        } else if (currentUserDetails.role === roles.BusinessDevelopmentManager) {
            // commercial
            component = <QuoteDetailsComm back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus}></QuoteDetailsComm>
        } else {
            component = <QuoteDetails back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) =>
                EditQuoteDetailsHandler(event, quoteNumber)}></QuoteDetails>
        }
        //else if (quoteStatus === "Pending with GC rates") {
    // } else if (showQuoteDetails) {
        // if (quoteStatus === "New" || currentUserDetails.role === "Marketing Executive" || currentUserDetails.role === "Managing Director") {
        // component = <QuoteDetails back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) =>
            // EditQuoteDetailsHandler(event, quoteNumber)}></QuoteDetails>
        // } else if (quoteStatus === "Pending with GC rates") {
        // component = <ERPQuotePendingGCEdit back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) => EditQuoteDetailsHandler(event, quoteNumber)}></ERPQuotePendingGCEdit>
        // }
        // else {
        // component = <ERPQuotationEdit back={HideQuoteDetailsHandler} id={quoteId} status={quoteStatus} edit={(event, quoteNumber) => EditQuoteDetailsHandler(event, quoteNumber)}></ERPQuotationEdit>
        // }
    } else if (editQuoteDetails) {
        component = <EditQuote back={HideEditQuoteHandler} id={quoteId}></EditQuote>
    } else {
        component = (<>
            <Grid container direction="row">
                <Grid xs={6} item>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel shrink ref={inputLabel} htmlFor="outlined-age-always-notched">View</InputLabel>
                        <Select
                            native
                            value={state}
                            onChange={handleChange}
                            label="View"
                            input={
                                <OutlinedInput
                                    notched
                                    labelWidth={labelWidth}
                                    name="age"
                                    id="outlined-age-always-notched"
                                />
                            }
                        >
                            {statusList.map((item, index) => {
                                if (role !== roles.managingDirector && role !== roles.gmc && role !== roles.managerPurchaseGCQuotes && item?.value === "All Quotes") {
                                    return null
                                } else if(currentUserDetails.role === roles.managerPurchaseGC) {
                                    return (item.label === 'GC Price Requested' || item.label === 'GC Price Received' || item.label === 'My Quotes') ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                } else if(currentUserDetails.role === roles.packingExecutive) {
                                    return (item.label === 'Packing Price Requested' || item.label === 'Packing Price Received' || item.label === 'My Quotes') ? <option value={item?.value} key={index}>{item?.label}</option> : null
                                }else {
                                    return <option value={item?.value} key={index}>{item?.label}</option>
                                }
                                    
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                {state === 'PendingNegativeMarginQuotelines' ? <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}></Grid> :
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {quotes !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                            // variant="extended"
                            />
                        }
                        {role !== roles.managerPurchaseGCQuotes ?
                            <Fab onClick={ShowCreateQuoteHandler} label={"Create Quote"} variant="extended" /> : null}
                    </Grid>}
            </Grid>
            {showDownloadExcel === true &&
                <DownloadExcel tableData={quotes} tableName='Quotes' />
            }
            {state === 'PendingNegativeMarginQuotelines' ?
                <PendingQuoteItemList data={quotes} quoteItemDetails={(event, quoteItemId) => ShowQuoteItemDetailsHandler(event, quoteItemId)} />
                :
                <QuotesList selectedAdvancedFilters={(val) => setFilter(val)} currentState={state}
                    clearAdvancedFilters={() => setFilter(null)} data={quotes} quoteDetails={(event, quoteNumber, quoteStatus) => ShowQuoteDetailsHandler(event, quoteNumber, quoteStatus)} />}
        </>)
    }

    return (
        <Container className={classes.root}>
            {snack.open && <Snackbar {...snack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            {component}
        </Container>
    )
}

export default Quotes;