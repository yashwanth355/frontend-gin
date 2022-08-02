import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { getinsertOrEditGCDebitNoteDetail, getMrinCreationDetail, getGCDebitNoteCreationInfo } from '../../../apis';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import _ from 'lodash';
import useToken from '../../../hooks/useToken';
import { useNavigate } from 'react-router-dom';
// import AuditLog from './AuditLog';

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
        '& .MuiAccordion-root': {
            width: '100%'
        },
        '& .dispatchTable': {
            maxHeight: '400px',
            overflowY: "auto",
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    modal: {
        position: 'absolute',
        margin: '0 auto',
        top: '30%',
        right: '10%',
        left: '10%',
        width: 700,
        textAlign: 'center',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr) : new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
}
// 2021-10-08       

const currentDate = () => {
    // 2019-07-25 17:31:46.967
    var dateVal = new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

// const currentOnlyDate = () => {
//     // 2019-07-25
//     var dateVal = new Date();
//     return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
// }

const AddDebitNoteGc = (props) => {
    const classes = useStyles();
    const [debitNoteGC, setDebitNoteGC] = useState({});
    const [entityList, setEntityList] = useState([]);
    // eslint-disable-next-line
    const [validationError, setValidationError] = useState({});
    const [vendorList, setVendorList] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    // const [ logData, setLogData ] = useState([]);
    const [mrinList, setMrinList] = useState([]);
    const [mrinNo, setMrinNo] = useState(null);
    const { getCurrentUserDetails } = useToken();
    const navigate = useNavigate();

    async function fetchData(data = {}) {
        setMrinList([]);

        let res = await getGCDebitNoteCreationInfo({ "type": "allVendors" });
        setVendorList(res);

        let response1 = await getMrinCreationDetail({ "type": "allEntities" });
        setEntityList(formatToSelection(response1, 'entity_name', 'entity_id'));
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (event, key) => {
        setDebitNoteGC({
            ...debitNoteGC,
            [key]: event.target.value,
        })
    }

    const handleMrinChange = (e, value) => {
        if (!value) {
            return;
        } else {
            setMrinNo(value);
            setDebitNoteGC({
                ...debitNoteGC,
                "gc_itemname": value.gc_itemname,
                "hsn_code": value.hsn_code,
                "husk": value.husk,
                "invoice_no": value.invoice_no,
                "invoice_quantity": value.invoice_quantity,
                "item_id": value.item_id,
                "moisture": value.moisture,
                "mrin_id": value.mrin_id,
                "mrin_no": value.mrin_no,
                "net_weightrecorded": value.net_weightrecorded,
                "stones": value.stones,
            })
            //       }
            //     }
            //   );
        }
    }

    const handleVendorChange = async (e, value) => {
        if (!value) {
            return;
        } else {
            let response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": debitNoteGC.entity,
                "vendor_id": value.vendor_id,
                "debit_notedate": formatDate(debitNoteGC.debitnotedate)
            });
            setMrinList(response);

            setDebitNoteGC({
                ...debitNoteGC,
                'vendorid': value.vendor_id,
                'vendorname': value.vendor_name
            })
        }
    }

    const handleEntityChange = async (event, value) => {
        if (debitNoteGC.vendorid && debitNoteGC.vendorid !== '') {
            let response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": value.value,
                "vendor_id": debitNoteGC.entity,
                "debit_notedate": formatDate(debitNoteGC.debitnotedate)
            });
            setMrinList(response);
        }
        setDebitNoteGC({
            ...debitNoteGC,
            'entity': value.value,
        })
    }

    const payload = [
        {
            label: 'Debit Note date',
            type: 'datePicker',
            value: debitNoteGC.debitnotedate === '' ? currentDate() : debitNoteGC.debitnotedate,
            onChange: (e) => handleChange(e, 'debitnotedate')
        },
        {
            label: 'Entity',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            error: validationError?.entity,
            helperText: validationError?.entity,
            value: debitNoteGC.entity,
            options: entityList || [],
            onChange: handleEntityChange
        },
    ];

    const payload1 = [
        {
            label: 'Vendor',
            type: 'autocomplete',
            labelprop: "vendor_name",
            value: debitNoteGC.vendor,
            options: vendorList || [],
            onChange: handleVendorChange,
        },
        {
            label: 'Vendor Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC.vendorid ? debitNoteGC.vendorid : '',
            onChange: (e) => handleChange(e, 'vendorid'),
        },
        {
            label: 'Vendor Name',
            type: 'input',
            disabled: true,
            value: debitNoteGC.vendorname ? debitNoteGC.vendorname : '',
            onChange: (e) => handleChange(e, 'vendorname'),
        }
    ];

    const payload2 = [
        {
            label: 'Remarks',
            type: 'input',
            rows: 4,
            multiline: true,
            value: debitNoteGC.remarks || '',
            onChange: (e) => handleChange(e, 'remarks'),
        },
    ]

    const payload3 = [
        {
            label: 'Select MRIN',
            required: true,
            type: 'autocomplete',
            labelprop: "mrin_no",
            value: mrinNo,
            options: mrinList || [],
            error: validationError?.mrin_no,
            helperText: validationError?.mrin_no,
            onChange: handleMrinChange,
            sm: 12
        },
        {
            label: 'Invoice No.',
            type: 'input',
            disabled: true,
            value: debitNoteGC.invoice_no || '',
            sm: 12
        },
        {
            label: 'MRIN Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC.mrin_id || '',
            sm: 12
        },
        {
            label: 'Invoice Qty',
            type: 'input',
            disabled: true,
            value: debitNoteGC.invoice_quantity || '',
            sm: 12
        },
        {
            label: 'Husk',
            type: 'number',
            value: debitNoteGC.husk ? debitNoteGC.husk : '',
            onChange: (e) => handleChange(e, 'husk'),
            sm: 12
        },
        {
            label: 'Moisture',
            type: 'number',
            value: debitNoteGC.moisture ? debitNoteGC.moisture : '',
            onChange: (e) => handleChange(e, 'moisture'),
            sm: 12
        },
        {
            label: 'Stones',
            type: 'number',
            value: debitNoteGC.stones ? debitNoteGC.stones : '',
            onChange: (e) => handleChange(e, 'stones'),
            sm: 12
        },

    ]


    const payload4 = [
        {
            label: 'Item Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC.item_id || '',
            sm: 12
        },
        {
            label: 'Item Name',
            type: 'input',
            disabled: true,
            value: debitNoteGC.gc_itemname || '',
            sm: 12
        },
        {
            label: 'H S Code',
            type: 'input',
            value: debitNoteGC.hsn_code || '',
            onChange: (e) => handleChange(e, 'hsn_code'),
            sm: 12
        },
        {
            label: 'Net WT RECD',
            type: 'number',
            value: debitNoteGC.net_weightrecorded || '',
            onChange: (e) => handleChange(e, 'net_weightrecorded'),
            sm: 12
        },
        {
            label: 'Others',
            type: 'input',
            value: debitNoteGC.others || '',
            onChange: (e) => handleChange(e, 'others'),
            sm: 12
        },
        {
            label: 'Quality',
            type: 'number',
            value: debitNoteGC.quality || '',
            onChange: (e) => handleChange(e, 'quality'),
            sm: 12
        },
        {
            label: 'Debit Amount',
            type: 'number',
            value: debitNoteGC.debitamt || '',
            onChange: (e) => handleChange(e, 'debitamt'),
            sm: 12
        },
    ]

    const createDebit = async () => {
        // const message = 'Please enter valid details';
        try {
            let errorObj = {};
            if (_.isEmpty(debitNoteGC?.mrin_no)) {
                errorObj.mrin_no = "MRIN cannot be empty"
            }
            if (_.isEmpty(debitNoteGC?.entity)) {
                errorObj.entity = "Entity cannot be empty"
            }
            setValidationError(errorObj);
            if (!_.isEmpty(errorObj)) {
                setValidationError(errorObj);
                const error = { message: "Please fill all mandatory fields" };
                throw error;
            } else {
                let data = {
                    // "debit_notedate":"2019-08-08",
                    "debit_notedate": formatDate(debitNoteGC?.debitnotedate),
                    "others": debitNoteGC?.others,
                    "vendor_id": debitNoteGC?.vendorid,
                    "remarks": debitNoteGC?.remarks,
                    "invoice_no": debitNoteGC?.invoice_no,
                    "invoice_qty": debitNoteGC?.invoice_quantity,
                    // "invoice_qty":'12',
                    "entity_id": debitNoteGC.entity,
                    "mrin_id": debitNoteGC?.mrin_id,
                    "mrin_no": debitNoteGC?.mrin_no,
                    "item_id": debitNoteGC?.item_id,
                    "debit_amount": debitNoteGC?.debitamt ? debitNoteGC?.debitamt?.toString() : '0',
                    "hsc_code": debitNoteGC?.hsn_code?.toString(),
                    "husk": debitNoteGC.husk ? debitNoteGC?.husk?.toString() : '0',
                    "quality": debitNoteGC.quality ? debitNoteGC?.quality?.toString() : '0',
                    "netrecd": debitNoteGC.net_weightrecorded ? debitNoteGC?.net_weightrecorded?.toString() : '0',
                    "moisture": debitNoteGC?.moisture ? debitNoteGC?.moisture?.toString() : '0',
                    "stones": debitNoteGC?.stones ? debitNoteGC?.stones?.toString() : '0',
                    "created_by": localStorage.getItem('currentUserId'),
                    "loggedinuserid": getCurrentUserDetails()?.id,
                };
                setLoading(true);
                let response = await getinsertOrEditGCDebitNoteDetail(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Debit note created successfully",
                    });
                    setTimeout(() => {
                        //TODO: response should give debitNoteId
                        // navigate('debit-note-gc', response, 'view')
                        setLoading(false);
                    }, 2000)
                }
            }
        } catch (e) {
            setLoading(false);
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
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>System Information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload} />
                </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Vendor Details</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload1} />
                </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>MRIN Information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid item md={6} xs={6} className='item'>
                        <Template payload={payload3} />
                    </Grid>
                    <Grid item md={6} xs={6} className='item'>
                        <Template payload={payload4} />
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Other Information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload2} />
                </AccordionDetails>
            </Accordion>



            {/* <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className="item">
                            <Typography>Audit log information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <AuditLog data={logData} />
                </AccordionDetails>
            </Accordion> */}

            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? 'Loading ...' : 'Create'} onClick={createDebit} />
                </Grid>
            </Grid>
        </form>
    )
}

export default AddDebitNoteGc;
