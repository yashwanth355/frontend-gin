import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core';
import Button from '../../../components/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import { getMrinListForPoDetails, getDispatchDetails, updateGCPoDispatch, deleteGCPOAutoDispatch } from '../../../apis';
import DocumentList from './DocumentList';
import Snackbar from "../../../components/Snackbar";
import {
    poDocumentsUpload,
} from "../../../apis";
import SimpleModal from '../../../components/Modal';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles'
import { roles } from '../../../constants/roles';
import _ from 'lodash';
import useToken from '../../../hooks/useToken';
import { numberWithCommas } from '../../common'
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
        margin: 'auto',
        top: '25%',
        left: '25%',
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    otherModal: {
        marginTop: '8px',
        marginBottom: '8px'
    }
}));
const DispatchDetails = (props) => {

    const currentUserRole = localStorage.getItem('currentUserRole');
    const classes = useStyles();
    const { activeStep } = props;
    const { getCurrentUserDetails } = useToken();
    const [purchaseDetails, setPurchaseDetails] = useState(props.purchaseDetails);
    const [dispatchDetails, setDispatchDetails] = useState({});
    const [mrinTableData, setMrinTableData] = useState([]);
    const [editDocumentList, setEditDocumentList] = useState(false);
    const [editDispatch, setEditDispatch] = useState(false);
    const [documentFields, setdocumentFields] = useState([]);
    const [documentsdom, setDocumentsdom] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [showSnack, setSnack] = useState({
        open: false,
        message: "",
        severity: "",
    });
    // const formatDate = (datestr) => {
    //     if (_.isEmpty(datestr))
    //         return ""
    //     let dateVal = new Date(datestr);
    //     return (
    //         dateVal.getDate() +
    //         "/" +
    //         (dateVal.getMonth() + 1) +
    //         "/" +
    //         dateVal.getFullYear()
    //     );
    // };

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    const formatDate = (datestr) => {
        if (_.isEmpty(datestr))
            return ""

        var validDt = new Date(datestr).getDate();
        if (isNaN(validDt) === true) {
            var dt = datestr.toString(); //;
            let dateVal = dt.replace(new RegExp(escapeRegExp('-'), 'g'), '/') //datestr ? '14-3-2022'.replace('-', '/') : '-'; //moment(datestr).format("DD/MM/YYYY")
            return dateVal;
        } else {
            // eslint-disable-next-line
            var dt = new Date(datestr);
            var dateVal = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
            return dateVal;
        }

    }

    const fetchDocumnetData = (poid) => {
        // let documentsEnum = {
        //   document1: "Invoice",
        //   document2: "Packing list",
        //   document3: "Bill of lading",
        //   document4: "Phytosanitory certificate",
        //   document5: "Fumigation certificate",
        //   document6: "Certificate of origin",
        //   document7: "ICO certificate of origin",
        //   document8: "Weight certificate",
        //   document9: "Quality certificate",
        //   document10: "Inspection and stuffing certificate",
        //   document11: "Bill of Entry",
        //   document12: "Dispatch Note",
        // }
        let documents = [];
        poDocumentsUpload({
            "type": "getDocumentsOnPo",
            "po_id": poid
        }).then(res => {
            res?.map(doc => {
                documents.push({
                    upload: !!doc?.file_name,
                    file_name: doc?.file_name,
                    document_name: doc?.document_name,
                    doc_kind: doc?.doc_kind,
                    required: doc?.required,
                    docid: doc?.docid,
                    dispatchid: doc?.dispatchid,
                });
                return null;
            })

            let nDom = documents;
            nDom = nDom.filter(item => item.doc_kind === "Invoice" || item.doc_kind === "Weight Certificate")

            setDocumentsdom(nDom)
            setDocuments(documents);
        });
    };
    const formatGCCompositions = (compostion = {}) => {
        return [
            {
                composition_name: "Density(Gm/Cc)",
                composition_rate: compostion.density,
            },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Sound Beans (%)", composition_rate: compostion.soundbeans },
            { composition_name: "Browns (%)", composition_rate: compostion.browns },
            { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
            {
                composition_name: "Broken & Bits (%)",
                composition_rate: compostion.brokenbits,
            },
            {
                composition_name: "Insected beans (%)",
                composition_rate: compostion.insectedbeans,
            },
            { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
            { composition_name: "Husk (%)", composition_rate: compostion.husk },
            { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
            { composition_name: "Stones (%)", composition_rate: compostion.stones },
            {
                composition_name: "Beans retained on 5mm mesh during sieve analysis",
                composition_rate: compostion.beansretained,
            },
        ];
    };
    const uploadFileHandler = async (e, fileContent, docName, fileName, docid, dispatchid) => {
        if (!fileContent) {
            return;
        }
        try {
            let response = await poDocumentsUpload({
                "type": "uploadDocument",
                "document_name": fileName,
                "po_id": purchaseDetails.poid,
                "document_content": fileContent,
                "doc_kind": docName,
                "docid": docid,
                "dispatchid": dispatchid,
                "updatedBy": localStorage.getItem("currentUserId"),
                "loggedinuserid": localStorage.getItem("currentUserId"),
            });
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "File uploaded successfully",
                });
                fetchDocumnetData(purchaseDetails.poid);
                setEditDocumentList(prevState => !prevState)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }
    const deleteFileHandler = async (e, fileName, docid, dispatchid) => {
        try {
            let response = await poDocumentsUpload({
                "type": "removeDocument",
                "file_name": fileName,
                "docid": docid,
                "dispatchid": dispatchid,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "File deleted successfully",
                });
                fetchDocumnetData(purchaseDetails.poid);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }
    const downloadFileHandler = async (e, fileName, docName, docid, dispatchid) => {
        try {
            let response = await poDocumentsUpload({
                type: "downloadDocument",
                file_name: fileName,
                docid: docid,
                dispatchid: dispatchid,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                const linkSource = `data:application/pdf;base64,${response.fileData}`;
                const downloadLink = document.createElement("a");
                downloadLink.href = linkSource;
                downloadLink.download = docName;
                downloadLink.click();
                setSnack({
                    open: true,
                    message: "File downloaded successfully",
                });
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: "error",
            });
        }
    };
    const fetchData = async () => {
        getMrinListForPoDetails({ type: "viewmrinsondispatch", dispatch_id: props.details.dispatchNo }).then((res) => {
            if (res) {
                setMrinTableData(res);
            } else {
                setMrinTableData(null)
            }
        });
        getDispatchDetails({ dispatch_id: props.details.dispatchNo }).then((res) => {
            if (res.expected_composition) {
                res.expected_composition = formatGCCompositions(res.expected_composition[0]);
            }
            if (res.vendor_composition) {
                res.vendor_composition = formatGCCompositions(res.vendor_composition[0]);
            }
            setDispatchDetails(res);
            setPurchaseDetails({ ...purchaseDetails, dispatch_date: res.dispatch_date })
        });
        let documents = [];
        poDocumentsUpload({
            type: "getDocumentsOnPo",
            po_id: purchaseDetails?.poid,
        }).then((response) => {
            response?.map(doc => documents.push({
                upload: !!doc?.file_name,
                file_name: doc?.file_name,
                document_name: doc?.document_name,
                doc_kind: doc?.doc_kind,
                required: doc?.required,
                docid: doc?.docid,
                dispatchid: doc?.dispatchid,
                billofentrydate: doc?.billofentrydate,
                billofentrynumber: doc?.billofentrynumber,
                billofladdingdate: doc?.billofladdingdate,
                billofladdingnumber: doc?.billofladdingnumber,
                conversationratio: doc?.conversationratio,
                invoicedate: doc?.invoicedate,
                invoicenumber: doc?.invoicenumber,
            }))
            let nDom = documents;
            nDom = nDom.filter(item => item.doc_kind === "Invoice" || item.doc_kind === "Weight Certificate")


            setDocumentsdom(nDom)
            setDocuments(documents);
        });
    }
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, [props.details, purchaseDetails?.poid]);

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const mrinTableColumns = [
        { id: 'mrindate', label: 'Date' },
        { id: 'mrin_id', label: 'MRIN' },
        { id: 'dispatch_id', label: 'Dispatch' },
        { id: 'expected_quantity', label: 'Expected(Kgs)' },
        { id: 'delivered_quantity', label: 'Delivered(Kgs)' },
        { id: 'balance_quantity', label: 'Balance Quantity(Kgs)' },
        { id: 'related_detid', label: 'Parent dispatch' },
        { id: 'apStatus', label: 'AP Status' },
        { id: 'qcStatus', label: 'QC Status' },
    ];
    const handleChange = (e) => {
        setPurchaseDetails({ ...purchaseDetails, dispatch_date: e })
    }
    const payload2 = [
        {
            label: "Dispatch Date",
            type: "datePicker",
            value: purchaseDetails?.dispatch_date,
            onChange: (e) => handleChange(e),
            sm: 12,
        },
    ];
    const editPODispatchDetails = async () => {

        let data = {
            "dispatch_date": purchaseDetails?.dispatch_date,
            "dispatch_id": props.details.dispatchNo,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        setLoading(true)
        try {
            let response = await updateGCPoDispatch(data)
            console.log("Response", response);
            if (response) {
                setSnack({
                    open: true,
                    message: "Dispatch updated successfully",
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
        finally {
            setLoading(false);
        }
    }
    const deleteDispatchHandler = async () => {

        let data = {
            "dispatch_id": dispatchDetails.dispatch_id,
            "po_no": purchaseDetails?.po_no,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        setLoading(true)
        try {
            let response = await deleteGCPOAutoDispatch(data)
            if (response) {
                setSnack({
                    open: true,
                    message: "Dispatch deleted successfully",
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
        finally {
            setLoading(false);
        }
    }

    const otherFields = (val) => {
        let temp = [];
        // eslint-disable-next-line
        val.map((item, index) => {
            if (item.billofladdingnumber !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], billofladdingnumber: item.billofladdingnumber };
                } else {
                    temp.push({ docid: item.docid, billofladdingnumber: item.billofladdingnumber });
                }
            }
            if (item.billofladdingdate !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], billofladdingdate: item.billofladdingdate };
                } else {
                    temp.push({ docid: item.docid, billofladdingdate: item.billofladdingdate });
                }
            }
            if (item.billofentrynumber !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], billofentrynumber: item.billofentrynumber };
                } else {
                    temp.push({ docid: item.docid, billofentrynumber: item.billofentrynumber });
                }
            }
            if (item.billofentrydate !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], billofentrydate: item.billofentrydate };
                } else {
                    temp.push({ docid: item.docid, billofentrydate: item.billofentrydate });
                }
            }
            if (item.invoicenumber !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], invoicenumber: item.invoicenumber };
                } else {
                    temp.push({ docid: item.docid, invoicenumber: item.invoicenumber });
                }
            }
            if (item.invoicedate !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], invoicedate: item.invoicedate };
                } else {
                    temp.push({ docid: item.docid, invoicedate: item.invoicedate });
                }
            }
            if (item.conversationratio !== undefined) {
                // eslint-disable-next-line
                var id = temp.findIndex(val => val.docid === item.docid);
                if (id !== -1) {
                    temp[id] = { ...temp[id], conversationratio: item.conversationratio };
                } else {
                    temp.push({ docid: item.docid, conversationratio: item.conversationratio });
                }
            }
        })
        setdocumentFields(temp);
        let nDom = val;
        nDom = nDom.filter(item => item.doc_kind === "Invoice" || item.doc_kind === "Weight Certificate")
        setDocumentsdom(nDom)
        setDocuments(val);
    }

    const onClickEditDoc = async (event) => {
        try {
            let response = await poDocumentsUpload({
                "type": "updatedocumentsInfo",
                "documentsection": documentFields,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            console.log("Response", response);
            if (response) {
                // setSnack({
                //     open: true,
                //     message: "File deleted successfully",
                // });

            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
        setEditDocumentList(prevState => !prevState);

    }


    return (<>
        <Card className="page-header" >
            <CardHeader
                title=" Dispatch Details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={12}>
                    <Grid container md={8}>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Dispatch no</Typography>
                            <Typography>{dispatchDetails.dispatch_id}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Dispatch date</Typography>
                            <Typography>{formatDate(dispatchDetails.dispatch_date)}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Quantity</Typography>
                            <Typography>{numberWithCommas(dispatchDetails.dispatch_quantity)}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Delivered</Typography>
                            <Typography>{dispatchDetails.delivered_quantity || '-'}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">Balance</Typography>
                            <Typography>{dispatchDetails.balance_quantity || '-'}</Typography>
                        </Grid>
                    </Grid>
                    {(currentUserRole === roles.managerPurchaseGC || currentUserRole === roles.managingDirector)
                        && !_.isEmpty(dispatchDetails?.related_detid) && <Grid container md={4}>
                            <Button label="Edit"
                                onClick={() => setEditDispatch(true)} />
                        </Grid>}
                </Grid>
            </CardContent>
        </Card>
        {dispatchDetails.po_category !== 'ORM' ?
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Specification information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid item md={6} xs={6}>
                        <Grid item md={12} xs={12} style={{ marginRight: 25 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Expected order specification information</Typography>
                            </Grid>
                            <BasicTable rows={dispatchDetails.expected_composition ? dispatchDetails.expected_composition : null} columns={gcTableColumns} hasTotal={false}></BasicTable>
                        </Grid>
                    </Grid>
                    <Grid item md={6} xs={6}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Dispatch specification information</Typography>
                        </Grid>
                        <BasicTable rows={dispatchDetails.vendor_composition ? dispatchDetails.vendor_composition : null} columns={gcTableColumns} hasTotal={false}></BasicTable>
                    </Grid>
                </AccordionDetails>
            </Accordion> : null}
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>MRIN information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <BasicTable rows={mrinTableData} columns={mrinTableColumns}></BasicTable>
            </AccordionDetails>
        </Accordion>
        {
            (purchaseDetails.supplier_type_id === "1001" || purchaseDetails.supplier_type_id === "1002") && (
                <Accordion defaultExpanded={true} expanded={expanded} >
                    <AccordionSummary expandIcon={<ExpandMoreIcon onClick={() => setExpanded(prevState => !prevState)} />}>
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid container className="item" md={12} xs={12} direction="row" alignItems="center" justifyContent="space-between">
                                <Grid item >
                                    <Typography style={{ fontSize: '1.2rem' }}>Document information

                                    </Typography>
                                </Grid>
                                {activeStep >= 2 ? <Button
                                    label={editDocumentList ? "Done" : "Edit"}
                                    onClick={(event) => {
                                        setExpanded(prevState => prevState);
                                        onClickEditDoc()
                                    }
                                    }
                                /> : null}
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        {purchaseDetails.po_sub_category !== 'Domestic' ?
                            <DocumentList
                                data={documents.filter(document => {
                                    return document?.dispatchid === props?.details?.dispatchNo
                                }
                                )}
                                edit={editDocumentList}
                                otherFields={otherFields}
                                details={!editDocumentList}
                                downloadFile={(event, fileName, docName, docid, dispatchid) =>
                                    downloadFileHandler(event, fileName, docName, docid, dispatchid)
                                }
                                uploadFile={(event, fileContent, docName, fileName, docid, dispatchid) =>
                                    uploadFileHandler(event, fileContent, docName, fileName, docid, dispatchid)}
                                deleteFile={deleteFileHandler}
                            /> :
                            <DocumentList
                                data={documentsdom.filter(document => {
                                    return document?.dispatchid === props?.details?.dispatchNo
                                }
                                )}
                                edit={editDocumentList}
                                otherFields={otherFields}
                                details={!editDocumentList}
                                downloadFile={(event, fileName, docName, docid, dispatchid) =>
                                    downloadFileHandler(event, fileName, docName, docid, dispatchid)
                                }
                                uploadFile={(event, fileContent, docName, fileName, docid, dispatchid) =>
                                    uploadFileHandler(event, fileContent, docName, fileName, docid, dispatchid)}
                                deleteFile={deleteFileHandler}
                            />}
                    </AccordionDetails>
                </Accordion>
            )
        }
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button label="Back" onClick={props.back} />
            </Grid>
            {!_.isEmpty(dispatchDetails?.related_detid) && <Grid item>
                <Button label="Delete" onClick={deleteDispatchHandler} />
            </Grid>}
        </Grid>
        {showSnack.open && (
            <Snackbar
                {...showSnack}
                handleClose={() =>
                    setSnack({ open: false, message: "", severity: "" })
                }
            />
        )}
        <SimpleModal open={editDispatch} handleClose={() => setEditDispatch(false)}
            body={() => {
                return (
                    <Container className={classes.modal}>
                        <Grid container xs={12}><Template payload={payload2} /></Grid>
                        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                            <Grid item>
                                <Button label={loading ?
                                    "Loading..." : "Save"} disabled={loading}
                                    onClick={editPODispatchDetails} />
                            </Grid>
                            <Grid item>
                                <Button label="Cancel" onClick={() => setEditDispatch(false)} />
                            </Grid>
                        </Grid>
                    </Container>)
            }} />
    </>);
}
export default DispatchDetails;