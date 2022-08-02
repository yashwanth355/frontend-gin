import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import PurchaseOrderList from './PurchaseOrderList';
import SimpleModal from '../../../components/Modal';
import Button from '../../../components/Button';
import { roles } from '../../../constants/roles';
import { getAllPurchaseOrders } from '../../../apis';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import _ from 'lodash';
import { colors } from '../../../constants/colors';
import { useNavigate } from 'react-router-dom';
import { routeBuilder } from '../../../utils/routeBuilder';

import useToken from '../../../hooks/useToken';
import Snackbar from '../../../components/Snackbar';
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
    modal: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto',
        top: "50%",
        right: "50%",
        transform: "translate(50%, -50%)",
        width: 500,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #fefefe',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const formatToSelection = (data = [], key) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v.id || v[key] }))
    return formattedData;
}

const PurchaseOrders = (props) => {
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails.role;
    const currentUserId = currentUserDetails.id;
    const [state, setState] = useState('allpos');
    const [filter, setFilter] = useState(null);
    const classes = useStyles();
    const [purchases, setPurchases] = useState(null); 
    const [openCreate, setCreate] = useState(false);
    const [action, setAction] = useState(-1);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const createActionList = formatToSelection([
        { type: "Green Coffee", id: 1 },
        { type: "Packing", id: 2 },
        { type: "M & E", id: 3 },
        { type: "Canteen", id: 4 },
        { type: "Others", id: 5 },
        { type: "Capital", id: 6 },
        { type: "CSR", id: 7 }], "type", "id");

    const createActionList_MPGC = formatToSelection([
        { type: "Green Coffee", id: 1 }], "type", "id");

    const getData = async (filter, state) => {
        console.log("Val ", filter, state);

        let filterString = "";
        // if (role !== roles.managingDirector && role !== roles.accountsManager) {
        //     filterString = filterString + `createdbyuserid = '${currentUserId}'`
        // }
        if (state === "Shipped" || state === "In progress" ||
            state === "Closed" || state === "Pending with approval" ||
            state === "New" || state === "Approved"
        ) {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (state === "GC" || state === "ORM") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `pocat = '${state}'`
        }
        if (state === "IMPORT" || state === "DOMESTIC") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `vendortype = '${state}'`
        }
        if (state === "specialgcpos") {
            if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
            filterString = filterString + `cat_type = 'speciality'`;
        }
        if (state === "advancepayments") {
            if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
            filterString = filterString + `advance>0`;
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: filterString, loggedinuserid: currentUserId }



        try {
            let response = await getAllPurchaseOrders(data);
            if (response !== undefined) {
                console.log("Response", response);
                setPurchases(response);
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
        getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, state]);

    const handleChange = (event) => {
        setState(event.target.value);
        setFilter(null);
    };

    const ShowCreateGCPurchaseHandler = () => {
        navigate(routeBuilder('purchase-order'))
    };

    // write function 
    // setSupplier(true)


    const handleChange1 = (e, value) => {
        e.preventDefault();
        setAction(value);
    }

    const payload = [
        {
            label: 'Select creation type',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            value: action || '',
            options: role !== roles.managerPurchaseGC ? createActionList : createActionList_MPGC || [],
            onChange: handleChange1,
            xs: 12,
            sm: 12
        }
    ];

    const ClearFormCancle = () => {
        setAction(-1);
        setCreate(!openCreate);
    }

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 style={{ color: colors.orange, fontWeight: "700", alignSelf: 'center', margin: "0 0 1rem 0" }}>
                Select Purchase Order Type
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} container spacing={100}>
                    <Template payload={payload}></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center" style={{ margin: "2rem 0 0 0" }}>
                <Grid item>
                    <Button label="Proceed" onClick={createRedirection} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={ClearFormCancle} />
                </Grid>
            </Grid>
        </Container>
    );

    const createRedirection = () => {
        setCreate(false);
        if (action.value === 1) {
            ShowCreateGCPurchaseHandler();
        } else if (action.value === 2) {
            ShowCreateGCPurchaseHandler();
        }
    };
    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    return (
        <Container className={classes.root}>
            <>
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Grid container direction="row">
                    <Grid xs={6} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
                            <Select
                                native
                                value={state}
                                onChange={handleChange}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simple',
                                }}
                            >
                                <option value="allpos">All GC Purchase Orders</option>
                                <option value="New">New GC Purchase Orders</option>
                                <option value="Pending with approval">Pending GC Purchase Orders</option>
                                <option value="In progress">In-Progress GC Purchase Orders</option>
                                <option value="Shipped">Shipped GC Purchase Orders</option>
                                <option value="Closed">Closed GC Purchase Orders</option>
                                <option value="GC">GC Purchase Orders</option>
                                <option value="ORM">ORM Purchase Orders</option>
                                <option value="DOMESTIC">Domestic Purchase Orders</option>
                                <option value="IMPORT">Import Purchase Orders</option>
                                <option value="specialgcpos">Special GC Purchase Orders</option>
                                <option value="advancepayments">Advance Payments</option>
                                <option value="Approved">Approved Purchase Orders</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    {
                        currentUserDetails.role !== "GC Stores Executive" &&
                        <Grid xs={6} item justify="flex-end" alignItems="center"
                            style={{ display: 'flex' }}>
                            {purchases !== null &&
                                <RoundButton
                                    onClick={() => exportExcel()}
                                    label='Export to excel'
                                // variant="extended"
                                />
                            }
                            {currentUserDetails?.role !== roles.accountsManager &&
                                <Fab onClick={() => setCreate(!openCreate)}
                                    label={"Create Purchase Order"} variant="extended" />}
                        </Grid>
                    }
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={purchases} tableName='Purchase Orders' />
                }
                <PurchaseOrderList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={() => setFilter(null)} data={purchases}
                    purchaseDetails={(event, purchaseId) => navigate(routeBuilder('purchase-order', purchaseId, 'view'))} />
            </>
            <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} />
        </Container>
    )
}

export default PurchaseOrders;