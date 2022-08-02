import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid } from '@material-ui/core';
// eslint-disable-next-line
import { getAllPackingRequests } from "../../../apis";
import PackagingList from './PackagingList'
//import Fab from '../../../components/Fab';
import RoundButton from '../../../components/RoundButton';
//import { DownloadExcel } from '../../../components/DownloadExcel';
import _ from 'lodash';
import useToken from "../../../hooks/useToken";
// import { roles } from '../../../constants/roles';
import Snackbar from '../../../components/Snackbar';
// import { withStyles } from "@material-ui/core/styles";
import { useNavigate } from 'react-router-dom';
import { routeBuilder } from '../../../utils/routeBuilder'
// const WhiteTextTypography = withStyles({
//     root: {
//         color: "#F05A30"
//     }
// })(Typography);
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
    label: {
        background: '#fff',
        paddingRight: '10px'
    },
}));
// let newPackFilter = [
//     { label: 'New Pack type request for quote', value: 'newpackrequest' },
//     { label: 'New Brand Request', value: 'newbrandrequest' }
// ]

let newPackFilters = [
    { label: 'All New Pack type Requests', value: "" },
    { label: 'Approved New Pack Type Requests', value: 'Approved' },
    { label: 'Rejected New Pack Type Requests', value: 'Rejected' },
    { label: 'Pending with Packaging', value: 'Pending with Packaging' },
    { label: 'Pending with QC', value: 'Pending with QC' },

]

const Packaging = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const classes = useStyles();
    // const role = currentUserDetails?.role;
    const navigate = useNavigate();
    const currentUserId = currentUserDetails?.id;
    // const [packValue, setPackValue] = React.useState(role === roles.managingDirector || roles.marketingExecutive ? 'master' : "Master Blend");

    const [filteredValue, setFilteredValue] = React.useState(null);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [filter, setFilter] = useState("");
    // eslint-disable-next-line
    const [packitemdata, setPackitemdata] = useState(null);
    //const [showSampleAdd, setSampleAdd] = useState(false);
    //const [showSampleEdit, setSampleEdit] = useState(false);
    const clearAdvancedFilters = async () => {
        setFilter("");
    }

    const getData = async (filter, state) => {
        let filterString = "";
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: state === "" ? null : state, loggedinuserid: currentUserId }

        try {
            let response = await getAllPackingRequests(data);
            setPackitemdata(response);
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    };
    const exportExcel = () => {

    }
    useEffect(() => {
        getData(filter, filteredValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredValue, filter]);
    return (
        <Container className={classes.root}>
            <>
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Grid container direction="row" justifyContent='space-between'>

                    {/* <Grid item md={12} xs={12}>
                        <WhiteTextTypography variant="h5">{packValue === 'newpackrequest' ? 'New Pack type request for quote' : 'New Brand Request'}</WhiteTextTypography>
                    </Grid>

                    <Grid xs={3} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel className={classes.label} htmlFor="outlined-age-native-packaging">Select new pack type</InputLabel>
                            <Select
                                native
                                value={packValue}
                                onChange={(event) => { setPackValue(event.target.value); setFilter("") }}
                                label="View"

                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-packaging',
                                }}
                            >
                                {newPackFilter.map((item, index) => {
                                    if (item?.value === null && role !== roles.managingDirector) {
                                        return null
                                    }
                                    else return <option value={item.value}>{item.label}</option>
                                })}
                            </Select>
                        </FormControl>
                    </Grid> */}
                    <Grid xs={3} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-packaging">View</InputLabel>
                            <Select
                                native
                                value={filteredValue}
                                onChange={(event) => { setFilteredValue(event.target.value); setFilter("") }}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-packaging',
                                }}
                            >
                                {newPackFilters.map((item, index) => {
                                    console.log("Item is", item);
                                    // if (item?.value === null && (role !== roles.managingDirector && role !== roles.marketingExecutive)) {
                                    //     return null
                                    // }

                                    return <option value={item.value}>{item.label}</option>

                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={6} item justify="flex-end" alignItems="center"
                        style={{ display: 'flex' }}>

                        <RoundButton
                            onClick={() => exportExcel()}
                            label='Export to excel'
                        // variant="extended"
                        />

                    </Grid>
                </Grid>
                <PackagingList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={clearAdvancedFilters} data={packitemdata}
                    packingDetails={(packingId) => {
                        navigate(routeBuilder('packaging', packingId, 'view'));
                    }} />
            </>
        </Container>
    )
}

export default Packaging;