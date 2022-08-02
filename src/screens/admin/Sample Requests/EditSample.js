import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { createSample, getQuotesInfo, viewSampleRequest } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import AuditLog from "./AuditLog";
import useToken from '../../../hooks/useToken'
import { roles } from '../../../constants/roles';
import { useParams, useNavigate } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    root: {
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
    }
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

let masterstatusList = [
    { label: 'New', value: 'New' },
    { label: 'Pending with QC', value: 'Pending with QC' },
    { label: 'Approved', value: 'Approved' }
]

const currentDate = () => {
    // 2019-07-25 17:31:46.967
    var dateVal = new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const EditSample = (props) => {
    const navigate = useNavigate();
    const { sampleId } = useParams();
    const classes = useStyles();
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;

    const [sample, setSampleInfo] = useState({});
    const [accountName, setAccountName] = useState([]);
    const [allShippingAddresses, setAllShippingAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [logData, setLogData] = useState([]);

    useEffect(() => {
        try {
            viewSampleRequest({ "type": "viewsample", "sample_id": parseInt(sampleId) }).then((res) => {
                if (res) {//accountdetails
                    const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforsamplerequest", "createdbyuserid": userId } : { "type": "accountdetailsforsamplerequest" };
                    getQuotesInfo(createdUser).then(response => {
                        if (response) {
                            let account = response.find(acc => acc.account_id.toString() === res.account_id.toString());
                            setAccountName(response);//formatToSelection(response, 'account_name', "account_id")
                            let contactList = ((account?.contact_details ? formatToSelection(account.contact_details, "contact_name", "contact_id") : []));
                            setLogData(res.audit_log);
                            setSampleInfo({
                                account: { account_name: res.account_name, account_id: res.account_id },
                                address: response !== null ? { address: res.shipping_address, shipping_id: res.shipping_id } : '',
                                contact: { label: res.contact_firstname, value: res.contact_id },
                                contactList: contactList,
                                createddate: res.samplereq_date,
                                masterstatus: { label: res.masterstatus, value: res.masterstatus },
                                remarks: res.remarks,
                                samplerequestid: res.samplereq_number,
                            });
                            getQuotesInfo({ "type": "shippingaddressoncontacts", "account_id": res.account_id?.toString(), "contact_id": res.contact_id?.toString() }).then(response1 => {
                                if (response1) {
                                    setAllShippingAddresses(response1 !== null ? response1[0]?.shipping_address : [])
                                }
                            })
                        }
                    });
                }
            })
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
        // });         
        // eslint-disable-next-line
    }, [sampleId]);

    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setSampleInfo({
            ...sample,
            [key]: value,
        })
    }
    const handlemasterstatusChange = (e, value) => {
        setSampleInfo({
            ...sample,
            'masterstatus': value,
        })
    }
    const handleaccountChange = (e, value) => {
        if (!value) {
            return
        } else {
            setSampleInfo({
                ...sample,
                'account': value,
                'contact': {},
                'contactList': formatToSelection(value.contact_details, "contact_name", "contact_id")
            })
        }
    }
    const handleAddressChange = (e, value) => {
        if (!value) {
            return
        } else {
            setSampleInfo({
                ...sample,
                'address': value,
            })
        }
    }

    const handlecontactChange = (e, value) => {
        if (!value) {
            return
        } else {
            setSampleInfo({
                ...sample,
                'contact': value,
            })
            getQuotesInfo({ "type": "shippingaddressoncontacts", "account_id": sample?.account?.account_id?.toString(), "contact_id": value?.value?.toString() }).then(contacts => {
                const unformattedAddressArray = [];
                const addressArray = [];
                contacts?.map(contact =>
                    contact?.shipping_address?.map(address => {
                        unformattedAddressArray.push(address);
                        addressArray.push(address)
                        return null;
                    }
                    )
                )
                setAllShippingAddresses(addressArray);
                let tempQuoteDetails = _.cloneDeep(sample);
                tempQuoteDetails.address =
                    unformattedAddressArray?.find(address =>
                        address?.primary_address) || unformattedAddressArray?.[0];
                tempQuoteDetails.contact = value;
                setSampleInfo(tempQuoteDetails);
            })
        }
    }
    const payload = [
        {
            label: 'Sample request number',
            type: 'input',
            disabled: true,
            value: sample.samplerequestid || '',
        },
        {
            label: 'Record type',
            type: 'input',
            disabled: true,
            value: sample.recordtype || 'CCL',
        },
        {
            label: 'Account name',
            type: 'autocomplete',
            labelprop: "account_name",
            value: sample.account || '',
            options: accountName || [],
            onChange: handleaccountChange
        },
        {
            label: 'Contact name',
            type: 'autocomplete',
            labelprop: "label",
            value: sample.contact || '',
            options: sample.contactList || [],
            onChange: handlecontactChange,
        },
        {
            label: 'Shipping address',
            type: 'autocomplete',
            labelprop: "address",
            options: allShippingAddresses ? allShippingAddresses : [],
            value: sample.address || '',
            onChange: handleAddressChange,
        },
        // {
        //     label: 'Shipping address',
        //     type: 'input',
        //     multiline: true,
        //     rows:3,
        //     value: sample.address || '',        
        //     onChange: (e) => handleChange(e, 'address'),
        // }, 
        {
            label: 'Remarks',
            type: 'input',
            multiline: true,
            rows: 3,
            value: sample.remarks || '',
            onChange: (e) => handleChange(e, 'remarks'),
        },
        {
            label: 'Status',
            type: 'autocomplete',
            labelprop: "label",
            value: sample.masterstatus || '',
            options: masterstatusList,
            onChange: handlemasterstatusChange,
        },
        {
            label: 'Created date',
            type: 'input',
            value: sample.createddate || '',
            disabled: true
        },
    ];

    const submitSample = async () => {
        setLoading(true);
        let data = {
            "update": true,
            "sample_id": parseInt(sampleId),
            "account_id": sample.account?.account_id?.toString(),
            "contact_id": sample.contact?.value?.toString(),
            "modifieddate": currentDate(),
            "username": localStorage.getItem("currentUserName"),
            "modifieduserid": localStorage.getItem("currentUserId"),
            "masterstatus": sample.masterstatus?.value,
            "shipping_address": sample?.address?.shipping_id,
            "loggedinuserid": getCurrentUserDetails()?.id,
            // "shipping_id": sample?.address?.shipping_id,
            "remarks": sample.remarks
        }

        try {
            let response = await createSample(data)
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "Sample updated successfully",
                });

                setTimeout(() => {
                    setLoading(false);
                    navigate(-1, { replace: true })
                }, 2000)

            }
        } catch (e) {
            setLoading(false);
            console.log('error::123', e.response?.data)
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Sample request information
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload} />

            <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                    <Typography>Audit log information</Typography>
                </Grid>
            </Grid>
            <AuditLog data={logData} />

            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? 'Loading ...' : 'Save'} onClick={submitSample} />
                </Grid>
            </Grid>
        </form>
    )
}

export default EditSample;
