import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SampleRequestList from './SampleRequestList';
import { Container, Grid } from '@material-ui/core';
import { getSampleRequests } from "../../../apis";
import Fab from '../../../components/Fab';
import RoundButton from '../../../components/RoundButton';
import { DownloadExcel } from '../../../components/DownloadExcel';
import _ from 'lodash';
import useToken from "../../../hooks/useToken";
import { roles } from '../../../constants/roles';
import Snackbar from '../../../components/Snackbar';
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
}));

let sampleFilter = [
    { label: 'All sample requests', value: 'all' },
    { label: 'My sample requests', value: 'mysamples' },
    { label: 'New sample requests', value: 'New' },
    { label: 'Pending with QC sample requests', value: 'Pending with QC' },
    { label: 'Dispatched to HO sample requests', value: 'Samples Dispatched to HO' },
    { label: 'Dispatched to customer sample requests', value: 'Samples Dispatched to Customer' },
    { label: 'Approved sample requests', value: 'Approved' },
]

const SampleRequest = (props) => {
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails?.role;
    const currentUserId = currentUserDetails?.id;
    const [filteredValue, setFilteredValue] = React.useState(role === roles.managingDirector ? 'all' : "mysamples");
    const [filter, setFilter] = useState("");
    const classes = useStyles();
    const [sampleRequests, setSampleRequests] = useState(null);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // async function fetchData() {
    //     let response = await getSampleRequests({});
    //     setSampleRequests(response);
    //     // let response1 = await getUserDetails();
    //     // setCurrentUser(response1);
    // }
    const getData = async (filter, state) => {
        let filterString = "";
        if (role !== roles.managingDirector || state === "mysamples") {
            filterString = filterString + `createdbyuserid = '${currentUserId}'`
        }
        if (state !== "all" && state !== "mysamples") {
            console.log("Filter ", filterString);
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + ` status = '${state}'`
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        console.log("Filter string is", filterString);
        let data = { filter: filterString, loggedinuserid: currentUserId }

        try {
            let response = await getSampleRequests(data);
            console.log("Response", response);
            if (response) {
                setSampleRequests(response);
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
        getData(filter, filteredValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredValue, filter]);



    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const clearAdvancedFilters = async () => {
        setFilter("");
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
                                value={filteredValue}
                                onChange={(event) => { setFilteredValue(event.target.value); setFilter("") }}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simple',
                                }}
                            >
                                {sampleFilter.map((item, index) => {
                                    if (item?.value === "all" && role !== roles.managingDirector) {
                                        return null
                                    }
                                    else return <option value={item.value}>{item.label}</option>
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        {sampleRequests !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                            // variant="extended"
                            />
                        }
                        <Fab onClick={() => navigate(routeBuilder('sample-request'))} label={"Sample Request"} variant="extended" />
                    </Grid>
                </Grid>

                {showDownloadExcel === true &&
                    <DownloadExcel tableData={sampleRequests} tableName='Sample Request' />
                }

                <SampleRequestList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={clearAdvancedFilters} data={sampleRequests} sampleDetails={(event, sampleId) => navigate(routeBuilder('sample-request', sampleId, 'view'))} />
            </>
        </Container>
    )
}

export default SampleRequest;