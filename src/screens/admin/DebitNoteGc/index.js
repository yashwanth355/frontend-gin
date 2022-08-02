import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DebitNoteGcRequestList from './DebitNoteGcRequestList';
import { Container, Grid } from '@material-ui/core';
import Template from '../../../components/Template';
import { getlistGCDebitNoteDetails } from "../../../apis";
import Button from '../../../components/Button';
import Fab from '../../../components/Fab';
import SimpleModal from '../../../components/Modal';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import useToken from '../../../hooks/useToken';
import { colors } from '../../../constants/colors';
// import {roles} from '../../../constants/roles';
import _ from 'lodash';
import Snackbar from '../../../components/Snackbar';
import roles from '../../../constants/roles';
import { routeBuilder } from '../../../utils/routeBuilder';
import { useNavigate } from 'react-router-dom';

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

let sampleFilter = [
    { label: 'All', value: 'all' },
    { label: 'Pending Request', value: 'Pending request' },
    { label: 'Pending Approval', value: 'Pending approval' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Account Verified', value: 'Account verified' },
    { label: 'Released', value: 'Released' },
]

const formatToSelection = (data = [], key) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v.id || v[key] }))
    return formattedData;
}

const DebitNoteGc = (props) => {
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    // const role = currentUserDetails.role;
    const currentUserId = currentUserDetails.id;
    const [state, setState] = useState('all');
    const [filter, setFilter] = useState(null);
    const classes = useStyles();
    const [debitNoteGcRequests, setDebitNoteGcRequests] = useState(null);
    const [openCreate, setCreate] = useState(false);
    const [action, setAction] = useState(-1);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const createActionList = formatToSelection([
        { type: "Green Coffee", id: 1 },
        { type: "Packing", id: 2 },
        { type: "M & E", id: 3 },
        { type: "Capital", id: 4 }
    ], "type", "id");
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);

    const getData = async (filter, state) => {

        let filterString = "";
        // if (role !== roles.managingDirector) {
        //     filterString = filterString + `createdbyuserid = '${currentUserId}'`
        // }
        if (state !== "all") {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: filterString, loggedinuserid: currentUserId }



        try {
            let response = await getlistGCDebitNoteDetails(data);
            console.log("Response", response);
            if (response) {
                setDebitNoteGcRequests(response);
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

    const handleChange = async (event) => {
        setState(event.target.value);
        setFilter(null);
    };

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
            options: createActionList || [],
            onChange: handleChange1,
            xs: 12,
            sm: 12,
        }
    ]

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 style={{ color: colors.orange, fontWeight: "700", alignSelf: 'center', margin: "0 0 1rem 0" }}>
                Select Debit Note Type
            </h2>
            <Grid id="top-row" container>
                <Grid id="top-row" item sm={12}>
                    <Template payload={payload} ></Template>
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center" style={{ margin: "2rem 0px 0px 0px" }}>
                <Grid item>
                    <Button label="Proceed" disabled={action?.value === 1 ? false : true} onClick={() => navigate(routeBuilder('debit-note-gc'))} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={ClearFormCancle} />
                </Grid>
            </Grid>
        </Container>
    );


    const ClearFormCancle = () => {
        setAction(-1);
        setCreate(false);
    }

    const CreateDebitNote = () => {
        setCreate(true)
    }

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
                                {sampleFilter.map((item, index) => {
                                    return (
                                        <option value={item.value}>{item.label}</option>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {debitNoteGcRequests !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                            // variant="extended"
                            />
                        }
                        {currentUserDetails.role !== roles?.accountsManager && <Fab onClick={CreateDebitNote} label={"Debit Note GC Request"} variant="extended" />}
                    </Grid>
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={debitNoteGcRequests} tableName='Debit Note GC' />
                }
                <DebitNoteGcRequestList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={() => setFilter(null)} data={debitNoteGcRequests} sampleDetails={(event, debitNoteId) => navigate(routeBuilder('debit-note-gc', debitNoteId, 'view'))} />
                <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} />
            </>
        </Container>
    )
}

export default DebitNoteGc;