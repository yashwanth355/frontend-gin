import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardHeader, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { getinsertOrEditGCDebitNoteDetail, getMrinCreationDetail, getGCDebitNoteCreationInfo, getupdateGcDebitNoteStatus, releaseDebitNoteGC, getviewGCDebitNoteDetail } from '../../../apis';
import VendorPDF from "./PdfDownload/VendorPDF";
import AccountPDF from "./PdfDownload/AccountPDF";
import SimpleStepper from "../../../components/SimpleStepper";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import _ from 'lodash';
import AuditLog from './AuditLog';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useToken from '../../../hooks/useToken';
import { useParams, useNavigate } from 'react-router-dom';

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

// const formatDate = (datestr) => {
//     let dateVal = datestr ? new Date(datestr): new Date();
//     return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear(); 
// }            

const currentDate = () => {
    // 2019-07-25 17:31:46.967
    var dateVal = new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr) : new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
}

const EditDebitNoteGc = (props) => {
    const navigate = useNavigate();
    const { debitNoteId } = useParams();
    const classes = useStyles();
    const [debitNoteGC, setDebitNoteGC] = useState(null);
    const [entityList, setEntityList] = useState([]);
    // eslint-disable-next-line
    const [validationError, setValidationError] = useState({});
    const [vendorList, setVendorList] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [logData, setLogData] = useState([]);
    const [mrinList, setMrinList] = useState([]);
    const [activeStep, setActiveStep] = React.useState(-1);
    // eslint-disable-next-line
    const [stepProgress, setStepProgress] = useState("100%");
    const [statusLabel, setStatusLabel] = useState("");
    const [isloadingPdf, setIsloadingPdf] = useState(false);
    const { getCurrentUserDetails } = useToken();
    const debitSteps = [
        "Pending request",
        "Pending approval",
        "Approved",
        "Account verified",
    ];

    async function fetchData(data = {}) {
        let res = await getGCDebitNoteCreationInfo({ "type": "allVendors" });
        setVendorList(res);


    }

    useEffect(() => {
        fetchData();
    }, []);
    // eslint-disable-next-line
    useEffect(async () => {
        if (debitNoteId) {
            let temp = await getviewGCDebitNoteDetail({ "debit_noteid": debitNoteId });
            let response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": temp.entity_id,
                "vendor_id": temp.vendor_id,
                "debit_notedate": formatDate(temp.debit_notedate)
            });

            let response1 = await getMrinCreationDetail({ "type": "allEntities" });
            response1.length && setEntityList(formatToSelection(response1, 'entity_name', 'entity_id'));
            temp.mrins = response;
            const tempentity = response1.find(i => i.entity_id === temp.entity_id);
            temp.entity_id = { label: tempentity?.entity_name, value: tempentity?.entity_id };
            temp.vendor = { vendor_id: temp.vendor_id, vendor_name: temp.vendor_name };
            response !== null && response.length && setMrinList(formatToSelection(response, 'mrin_no', 'mrin_id'));
            // const tempmrin = response1.find(i => i.mrin_id === temp.mrin_id);
            temp.mrin_id = { label: temp.mrin_no, value: temp.mrin_id };

            setActiveStep(debitSteps.indexOf(temp.status));
            setStatusLabel(debitSteps[debitSteps.indexOf(temp.status) + 1]);

            setDebitNoteGC(temp);

            setLogData(temp.audit_log_gc);
        }
        // eslint-disable-next-line
    }, [debitNoteId]);

    const handleChange = (event, key) => {
        setDebitNoteGC({
            ...debitNoteGC,
            [key]: event.target.value,
        })
    }

    const handleMrinChange = (event, value) => {
        var value1 = debitNoteGC?.mrins.filter(val => val.mrin_id === value.value);

        if (value1.length > 0) {
            setDebitNoteGC({
                ...debitNoteGC,
                "gcitem_name": value1[0].gc_itemname,
                "hsc_code": value1[0].hsn_code,
                "husk": value1[0].husk,
                "invoice_no": value1[0].invoice_no,
                "invoice_qty": value1[0].invoice_quantity,
                "item_id": value1[0].item_id,
                "moisture": value1[0].moisture,
                "stones": value1[0].stones,
                "mrin_id": value,
                "mrin_no": value1[0].mrin_no,
                "netrecd": value1[0].net_weightrecorded,
            })
        }
    }

    const handleVendorChange = async (e, value) => {
        if (!value) {
            return;
        } else {
            let response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": debitNoteGC?.entity_id,
                "vendor_id": value.vendor_id,
                "debit_notedate": formatDate(debitNoteGC?.debit_notedate)
            });
            setMrinList(formatToSelection(response, 'mrin_no', 'mrin_id'));

            setDebitNoteGC({
                ...debitNoteGC,
                'mrins': response,
                'vendor': value,
                'vendor_id': value.vendor_id,
                'vendor_name': value.vendor_name
            })
        }
    }

    const handleEntityChange = async (event, value) => {
        let response = [];
        if (debitNoteGC?.vendor_id && debitNoteGC?.vendor_id !== '') {
            response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": value.value,
                "vendor_id": debitNoteGC?.vendor_id,
                "debit_notedate": formatDate(debitNoteGC?.debit_notedate)
            });
            setMrinList(formatToSelection(response, 'mrin_no', 'mrin_id'));
        }
        setDebitNoteGC({
            ...debitNoteGC,
            'mrins': response,
            'entity_id': value.value,
        })
    }

    const handleDateChange = async (date, key) => {
        let response = [];
        if (debitNoteGC?.vendor_id && debitNoteGC?.vendor_id !== '' && debitNoteGC?.entity_id && debitNoteGC?.entity_id !== '') {
            response = await getGCDebitNoteCreationInfo({
                "type": "mrinsOnVendor",
                "entity_id": debitNoteGC?.entity_id,
                "vendor_id": debitNoteGC?.vendor_id,
                "debit_notedate": formatDate(debitNoteGC?.debit_notedate)
            });
            setMrinList(formatToSelection(response, 'mrin_no', 'mrin_id'));
        }

        let data = {
            ...debitNoteGC,
            'mrins': response,
            [key]: date
        }
        setDebitNoteGC(data);
    };

    const payload = [
        {
            label: 'Debit Note date',
            type: 'datePicker',
            value: debitNoteGC?.debit_notedate === '' ? currentDate() : debitNoteGC?.debit_notedate,
            onChange: (e) => handleDateChange(e, 'debit_notedate')
        },
        {
            label: 'Entity',
            type: 'autocomplete',
            labelprop: "label",
            value: debitNoteGC?.entity_id ? debitNoteGC?.entity_id : '',
            options: entityList || [],
            onChange: handleEntityChange
        },
    ];

    const payload1 = [
        {
            label: 'Vendor',
            type: 'autocomplete',
            labelprop: "vendor_name",
            value: debitNoteGC?.vendor ? debitNoteGC?.vendor : '',
            options: vendorList || [],
            onChange: handleVendorChange,
        },
        {
            label: 'Vendor Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.vendor_id ? debitNoteGC?.vendor_id : '',
            onChange: (e) => handleChange(e, 'vendor_id'),
        },
        {
            label: 'Vendor Name',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.vendor_name ? debitNoteGC?.vendor_name : '',
            onChange: (e) => handleChange(e, 'vendor_name'),
        }
    ];

    const payload2 = [
        {
            label: 'Remarks',
            type: 'input',
            rows: 4,
            multiline: true,
            value: debitNoteGC?.remarks || '',
            onChange: (e) => handleChange(e, 'remarks'),
        },
    ]

    const payload3 = [
        {
            label: 'Select MRIN',
            required: true,
            type: 'autocomplete',
            labelprop: "label",
            // labelprop: "mrin_no",
            error: validationError?.mrin_no,
            helperText: validationError?.mrin_no,
            value: debitNoteGC?.mrin_id ? debitNoteGC?.mrin_id : '',
            options: mrinList || [],
            onChange: (e) => handleMrinChange(e, 'mrin_id'),
            sm: 12
        },
        {
            label: 'Invoice No.',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.invoice_no || '',
            sm: 12
        },
        {
            label: 'MRIN Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.mrin_id?.value || '',
            sm: 12
        },
        {
            label: 'Invoice Qty',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.invoice_qty || '',
            sm: 12
        },
        {
            label: 'Husk',
            type: 'number',
            value: debitNoteGC?.husk ? debitNoteGC?.husk : '',
            onChange: (e) => handleChange(e, 'husk'),
            sm: 12
        },
        {
            label: 'Moisture',
            type: 'number',
            value: debitNoteGC?.moisture || '',
            onChange: (e) => handleChange(e, 'moisture'),
            sm: 12
        },
        {
            label: 'Stones',
            type: 'number',
            value: debitNoteGC?.stones || '',
            onChange: (e) => handleChange(e, 'stones'),
            sm: 12
        },

    ]

    const payload4 = [
        {
            label: 'Item Id',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.item_id || '',
            sm: 12
        },
        {
            label: 'Item Name',
            type: 'input',
            disabled: true,
            value: debitNoteGC?.gcitem_name || '',
            sm: 12
        },
        {
            label: 'H S Code',
            type: 'input',
            value: debitNoteGC?.hsc_code || '',
            onChange: (e) => handleChange(e, 'hsc_code'),
            sm: 12
        },
        {
            label: 'Net WT RECD',
            type: 'number',
            value: debitNoteGC?.netrecd || '',
            onChange: (e) => handleChange(e, 'netrecd'),
            sm: 12
        },
        {
            label: 'Others',
            type: 'input',
            value: debitNoteGC?.others || '',
            onChange: (e) => handleChange(e, 'others'),
            sm: 12
        },
        {
            label: 'Quality',
            type: 'number',
            value: debitNoteGC?.quality || '',
            onChange: (e) => handleChange(e, 'quality'),
            sm: 12
        },
        {
            label: 'Debit Amount',
            type: 'number',
            value: debitNoteGC?.debit_amount || '',
            onChange: (e) => handleChange(e, 'debit_amount'),
            sm: 12
        },
    ]

    const payload5 = [
        {
            type: "label",
            value: "Debit Note GC id",
            bold: true,
            sm: "3",
        },
        {
            type: "label",
            value: "Debit Note GC Number",
            bold: true,
            sm: "3",
        },
    ];

    const payload6 = [
        {
            type: "label",
            value: debitNoteGC?.debit_noteid,
            sm: "3",
        },
        {
            type: "label",
            value: debitNoteGC?.debit_noteno,
            sm: "3",
        },
    ];

    const exportPDF = async () => {
        const showVendor = document.getElementById("vendor");
        const showAccount = document.getElementById("account");
        showVendor.style.display = "block";
        showAccount.style.display = "block";

        setIsloadingPdf(true);
        const input = document.getElementById("po_view_main");

        // vendor
        html2canvas(input).then(async (canvas) => {
            var vendor = "";
            var account = "";

            var imgData = canvas.toDataURL("image/jpeg", 1.0);

            var imgHeight = 0;
            var imgWidth = 210;
            var pageHeight = 295;
            imgHeight = (canvas.height * imgWidth) / canvas.width;
            var heightLeft = imgHeight;

            var totalPages = Math.ceil(imgHeight / pageHeight) - 1;
            var doc = new jsPDF("p", "mm", [pageHeight, imgWidth]);
            var position = 0;

            doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            for (var i = 1; i <= totalPages; i++) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, "JPG", 0, position * i, imgWidth, imgHeight);
            }

            var out = doc.output(); //"data:application/pdf;base64,"
            vendor = btoa(out);

            var blobURL = doc.output('bloburl');
            window.open(blobURL);

            setIsloadingPdf(false);
            showVendor.style.display = "none";
            // account
            const input1 = document.getElementById("po_view_main_acc");
            html2canvas(input1).then(async (canvas) => {
                var imgData = canvas.toDataURL("image/jpeg", 1.0);

                var imgHeight = 0;
                var imgWidth = 210;
                var pageHeight = 295;
                imgHeight = (canvas.height * imgWidth) / canvas.width;
                var heightLeft = imgHeight;

                var totalPages = Math.ceil(imgHeight / pageHeight) - 1;
                var doc1 = new jsPDF("p", "mm", [pageHeight, imgWidth]);
                var position = 0;

                doc1.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                for (var i = 1; i <= totalPages; i++) {
                    position = heightLeft - imgHeight;
                    doc1.addPage();
                    doc1.addImage(imgData, "JPG", 0, position * i, imgWidth, imgHeight);
                }

                var out = doc1.output(); //"data:application/pdf;base64,"
                account = btoa(out);

                var blobURL1 = doc1.output('bloburl');
                window.open(blobURL1);

                setIsloadingPdf(false);
                showAccount.style.display = "none";
                if (debitNoteGC?.released_debitnotes !== null)
                    return
                let payloadData = {
                    debit_noteid: debitNoteGC?.debit_noteid,
                    debit_notedate: debitNoteGC?.debit_notedate,
                    vendor_id: debitNoteGC?.vendor_id,
                    mrin_id: debitNoteGC?.mrin_id,
                    generated_by: localStorage.getItem("currentUserId"),
                    doc_kind_account: "Debit_Note_Release_CCL_Accounts",
                    docid_accounts:
                        "Debit_Note_Release_CCL_Accounts-" +
                        debitNoteGC?.debit_noteid,
                    document_content_accounts: account,
                    document_name_accounts: "Debit_Note_Release_CCL_Accounts.pdf",
                    doc_kind_vendor: "Debit_Note_Release_Vendor",
                    docid_vendor:
                        "Debit_Note_Release_Vendor-" + debitNoteGC?.debit_noteid,
                    document_content_vendor: vendor,
                    dispatch_num: debitNoteGC?.dispatch_num,
                    document_name_vendor: "Debit_Note_Release_Vendor.pdf",
                };
                let response = await releaseDebitNoteGC(payloadData);
                if (response) {
                    setDebitNoteGC({
                        ...debitNoteGC, released_debitnotes: [{
                            doc_kind: "",
                            docid: "",
                            document_content_accounts: "",
                            document_content_vendor: "",
                            document_name_accounts: "Debit_Note_Release_CCL_Accounts.pdf",
                            document_name_vendor: "Debit_Note_Release_Vendor.pdf",
                            file_name: ""
                        }]
                    })
                    console.log("fd::", payloadData, response);
                }

            });
        });
    };


    const submitContact = async () => {
        // const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(debitNoteGC?.mrin_no))
            errorObj.mrin_no = "MRIN cannot be empty"
        // if (_.isEmpty(debitNoteGC?.debitnotedate?.toString())) {
        //     errorObj = { ...errorObj, debitnotedate: message };
        // } 
        try {
            if (!_.isEmpty(errorObj)) {
                setValidationError(errorObj);
                const error = { message: "Please fill all mandatory fields" };
                throw error;
            } else {
                let data = {
                    "update": true,
                    "others": debitNoteGC.others,
                    "debit_notedate": debitNoteGC?.debit_notedate,
                    "vendor_id": debitNoteGC?.vendor_id,
                    "remarks": debitNoteGC?.remarks,
                    "invoice_no": debitNoteGC?.vendor_id,
                    "invoice_qty": debitNoteGC?.invoice_qty,
                    "entity_id": debitNoteGC?.entity_id?.value,
                    "mrin_id": debitNoteGC?.mrin_id?.value,
                    "mrin_no": debitNoteGC?.mrin_no,
                    "item_id": debitNoteGC?.item_id,
                    "debit_amount": debitNoteGC?.debit_amount ? debitNoteGC?.debit_amount : '0',
                    "hsc_code": debitNoteGC?.hsc_code,
                    "husk": debitNoteGC?.husk ? debitNoteGC?.husk : '0',
                    "quality": debitNoteGC?.quality ? debitNoteGC?.quality : '0',
                    "netrecd": debitNoteGC?.netrecd ? debitNoteGC?.netrecd : '0',
                    "moisture": debitNoteGC?.moisture ? debitNoteGC?.moisture : '0',
                    "stones": debitNoteGC?.stones ? debitNoteGC?.stones : '0',
                    "debit_noteid": debitNoteId,
                    "updated_by": localStorage.getItem('currentUserId'),
                    "loggedinuserid": getCurrentUserDetails()?.id,
                };
                setLoading(true);
                let response = await getinsertOrEditGCDebitNoteDetail(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Debit note updated successfully",
                    });
                    setTimeout(() => {
                        navigate(-1, { replace: true })
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

    const StatusChange = async () => {
        try {
            let status =
                debitNoteGC?.status === 'Pending request'
                    ? "changeToPendingStatus"
                    : debitNoteGC?.status === 'Pending approval'
                        ? "changeToApprovedStatus"
                        : debitNoteGC?.status === 'Approved'
                            ? "changeToAccountVerifiedStatus"
                            : "";

            let response = await getupdateGcDebitNoteStatus({
                "type": status,
                "debit_noteid": debitNoteId,
                "updated_by": localStorage.getItem('currentUserId'),
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                setSnack({
                    open: true,
                    message:
                        debitNoteGC?.status === 'Pending request'
                            ? "Debit note sent for pending approval"
                            : debitNoteGC?.status === 'Pending approval'
                                ? "Debit note sent for approved"
                                : "Debit note sent for account verified"
                });
                setTimeout(() => {
                    navigate(-1, { replace: true })
                }, 2000);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: "error",
            });
        }
    }

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}

            <Card className="page-header">
                <CardHeader title="Debit Note GC details" className="cardHeader" />
                <CardContent>
                    <Grid id="top-row" container>
                        <Grid id="top-row" xs={8} md={8} container direction="column">
                            <Template payload={payload5} />
                        </Grid>
                        <Grid id="top-row" xs={4} md={4} container direction="column">
                        </Grid>
                        <Grid id="top-row" xs={8} md={8} container direction="column">
                            <Template payload={payload6} />
                        </Grid>
                        <Grid id="top-row" xs={2} md={2} container direction="column">
                            {statusLabel !== undefined &&
                                <Grid item>
                                    <Button label={statusLabel} onClick={StatusChange} />
                                </Grid>
                            }
                        </Grid>
                        <Grid id="top-row" xs={2} md={2} container direction="column">
                            <Grid item>
                                <Button
                                    disabled={isloadingPdf}
                                    label={`${isloadingPdf ? (debitNoteGC?.released_debitnotes === null ? "Sending ..." : "Generating...") : debitNoteGC?.released_debitnotes === null ?
                                        "Send Debit Note" : "Generate PDF"
                                        }`}
                                    onClick={exportPDF}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="page-header">
                <CardContent>
                    <Grid container md={12}>
                        <Grid item md={12} xs={12}>
                            {activeStep !== -1 ? (
                                <SimpleStepper
                                    activeStep={activeStep}
                                    completeStep={activeStep}
                                    steps={debitSteps}
                                    activeStepProgress={stepProgress}
                                ></SimpleStepper>
                            ) : (
                                "Loading ..."
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

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



            <Accordion defaultExpanded={true}>
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
            </Accordion>

            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? 'Loading ...' : 'Save'} onClick={submitContact} />
                </Grid>
            </Grid>

            {debitNoteGC !== null &&
                <>
                    <div id="vendor" style={{ display: "none" }}>
                        <VendorPDF id={debitNoteId} debitNoteGcDetails={debitNoteGC} />
                    </div>
                    <div id="account" style={{ display: "none" }}>
                        <AccountPDF id={debitNoteId} debitNoteGcDetails={debitNoteGC} />
                    </div>
                </>
            }

        </form>
    )
}

export default EditDebitNoteGc;
