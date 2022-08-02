import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid, Typography} from '@material-ui/core';
//import { getSampleRequests } from "../../../apis";
import SampleList from './sampleList'
import SampleDetails from './SampleDetails';
import Fab from '../../../components/Fab';
//import RoundButton from '../../../components/RoundButton';
//import { DownloadExcel } from '../../../components/DownloadExcel';
import _ from 'lodash';
import useToken from "../../../hooks/useToken";
import {roles} from '../../../constants/roles';
import Snackbar from '../../../components/Snackbar';
import { withStyles } from "@material-ui/core/styles";
const WhiteTextTypography = withStyles({
    root: {
      color: "#F05A30"
    }
  })(Typography);
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
       background:'#fff',
       paddingRight:'10px'
    },
}));
let sampleBlendFilter = [
    { label: 'Master Blend', value: 'master' },
    { label: 'Alternate samples Blend', value: 'alternate' },
    { label: 'Customer samples Blend', value: 'customer' },
]


let sampleFilters ={
    master:[
        { label: 'All Master Samples', value: 'all' },
        { label: 'Pending samples', value: 'Pending' },
        { label: 'Approved samples', value: 'Approved' },
    ],
    alternate:[
        { label: 'All Alternate Samples', value: 'all' },
        { label: 'Pending samples', value: 'Pending' },
        { label: 'Approved samples', value: 'Approved' },
    ],
    customer:[
        { label: 'All Customer Samples', value: 'all' },
        { label: 'Pending samples', value: 'Pending' },
        { label: 'Approved samples', value: 'Approved' },
    ],
}
const Samples = (props) => {
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const classes = useStyles();
    const role = currentUserDetails?.role;
    const currentUserId = currentUserDetails?.id;
    const [blendValue, setBlendValue] = React.useState(role === roles.managingDirector || roles.marketingExecutive ? 'master' : "Master Blend");

    const [filteredValue, setFilteredValue] = React.useState(role === roles.managingDirector ? 'all' : "mysamples");
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [filter, setFilter] = useState("");
    const [sampleRequests, setSampleRequests] = useState(null);
    const [showSampleDetails, setSampleDetails] = useState(false);
    const [showSampleAdd, setSampleAdd] = useState(false);
    //const [showSampleEdit, setSampleEdit] = useState(false);
    const [sampleId, setSampleId] = useState(-1);
    const clearAdvancedFilters = async () => {
        setFilter("");
    }
    const ShowSampleDetailsHandler = (event, sampleId) => {
        setSampleDetails(true);
        setSampleId(sampleId);
    };
    const HideSampleDetailsHandler = () => {
        setSampleDetails(false);

    };

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
       // let data = { filter: filterString, loggedinuserid: currentUserId }

        try {
           // let response = await getSampleRequests(data);
           let response =[
     {samplecode:'46646456', product:'test', category:'tst', sampledate:'20-04-2022', status:'New'},
     {samplecode:'26646456', product:'N test', category:'coffee', sampledate:'20-03-2022', status:'New'}
           ]
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
        // eslint-disable-next-line
        //if (!showSampleAdd || !showSampleEdit)
        if (!showSampleAdd)
            getData(filter, filteredValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredValue, filter, showSampleAdd]);

    let component;

    if (showSampleDetails) {
        component = <SampleDetails back={HideSampleDetailsHandler} id={sampleId} ></SampleDetails>
    }
else{

    return (
       <>
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}         
                <Grid container direction="row">

                <Grid item md={12} xs={12}>
                <WhiteTextTypography variant="h5">{blendValue==='master' ? 'Master Blend': blendValue==='alternate' ? 'Alternate Sample Blend' :'Customer Sample Blend'}</WhiteTextTypography>
          </Grid>

                <Grid xs={3} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel className={classes.label} htmlFor="outlined-age-native-simples">Select type of blend</InputLabel>
                            <Select
                                native
                                value={blendValue}
                                onChange={(event) => { setBlendValue(event.target.value); setFilter("") }}
                                label="View"
                                
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simples',
                                }}
                            >
                                {sampleBlendFilter.map((item, index) => {
                                    if (item?.value === "all" && role !== roles.managingDirector) {
                                        return null
                                    }
                                    else return <option value={item.value}>{item.label}</option>
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                <Grid xs={3} item>
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
                                {sampleFilters[blendValue].map((item, index) => {
                                    if (item?.value === "all" && (role !== roles.managingDirector && role !== roles.marketingExecutive)) {
                                    //    debugger
                                        return null
                                    }
                                   
                                    else return <option value={item.value}>{item.label}</option>
                                    
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                       
                        <Fab onClick={() => setSampleAdd(true)} label={"Sample"} variant="extended" />
                    </Grid>
                </Grid>


                <SampleList selectedAdvancedFilters={(val) => setFilter(val)}
                    clearAdvancedFilters={clearAdvancedFilters} data={sampleRequests} sampleDetails={(event, sampleId) => ShowSampleDetailsHandler(event, sampleId)} />
         
                    </>
    )
}
return (
    <Container className={classes.root}>
        {component}
    </Container>
)
}

export default Samples;