import React, { useEffect, useState, useRef } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import { Container, Typography, Card, CardContent, CardHeader, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SimpleStepper from '../../../components/SimpleStepper';
import SimplePopper from '../../../components/Popper';
import Button from '../../../components/Button';
import { getPODetails, getTopMrinDetails, poDocumentsUpload, updateGCPoStatus, getMrinListForPoDetails } from '../../../apis';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import Snackbar from '../../../components/Snackbar';
import BasicTable from '../../../components/BasicTable';
import DispatchList from './PoDispatchList';
import DocumentList from './DocumentList';
import AuditLog from './AuditLog';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useToken from '../../../hooks/useToken';

const useStyles = makeStyles((theme) => ({
    popover: {
        padding: theme.spacing(2, 4, 3),
    },
    labelheading: {
        marginTop: 20,
        display: "inline-block"
    }
}));

const formatGCCompositions = (compostion = {}) => {
    return [
        { composition_name: "Density(Gm/Cc)", composition_rate: compostion.density },
        { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
        { composition_name: 'Sound Beans (%)', composition_rate: composition.soundbeans },
        { composition_name: "Browns (%)", composition_rate: compostion.browns },
        { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
        { composition_name: "Broken & bits (%)", composition_rate: compostion.brokenbits },
        { composition_name: "Insected beans (%)", composition_rate: compostion.insectedbeans },
        { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
        { composition_name: "Husk (%)", composition_rate: compostion.husk },
        { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
        { composition_name: "Stones (%)", composition_rate: compostion.stones },
        { composition_name: "Beans retained on 5mm mesh during sieve analysis", composition_rate: compostion.beansretained }

    ];
}

const PurchaseOrderDetails = (props) => {
    const classes = useStyles();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [mrinTableData, setMrinTableData] = useState([]);
    const [mrinList, setMrinList] = useState([]);
    const [logData, setLogData] = useState([]);
    const [dispatchData, setDispatchData] = useState([]);
    const [compositions, setCompositions] = useState([]);
    const [documents, setDocuments] = useState([]);
    const dispatchInfoRef = useRef(null);
    const [isloadingPdf, setIsloadingPdf] = useState(false);
    const [activeStep, setActiveStep] = React.useState(-1);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const { getCurrentUserDetails } = useToken();
    const fetchData = async () => {
        let response = await getMrinListForPoDetails({ "type": "mrinsonponoforview", "po_no": props.id?.toString() });
        let temp = [];
        // eslint-disable-next-line
        response?.map((item, index) => {
            temp.push({
                apStatus: item?.apStatus,
                balance_quantity: numberWithCommas(item?.balance_quantity),
                delivered_quantity: numberWithCommas(item?.delivered_quantity),
                dispatch_id: item?.dispatch_id,
                expected_quantity: numberWithCommas(item?.expected_quantity),
                item_id: item?.item_id,
                mrin_id: item?.mrin_id,
                mrindate: item?.mrindate,
                po_no: item?.po_no,
                qcStatus: item?.qcStatus,
                related_detid: item?.related_detid,
                type: item?.type,
            })
        })
        setMrinTableData(temp);
        await getPODetails({

            "po_no": (props.id?.toString())
        }).then(res => {
            setPurchaseDetails(res);
            setActiveStep(parseInt(res.status) - 1);
            setLogData(res.audit_log_gc_po);
            setCompositions(formatGCCompositions(res));
            setDispatchData(res.item_dispatch?.length > 0 ? res.item_dispatch : null)
            getTopMrinDetails({
                "type": "topmrinrecord",
                "gcitem_id": res.item_id,
                "po_date": new Date(res.po_date)
            }).then(res => {
                if (res?.gcitem_id) {
                    let data = {
                        ...res,
                        "number": 1
                    }
                    setMrinList([data]);
                } else {
                    setMrinList(null);
                }
            });

            let documentsEnum = {
                document1: "Invoice",
                document2: "Packing List",
                document3: "Bill of Lading",
                document4: "Phytosanitory Certificate",
                document5: "Fumigation Certificate",
                document6: "Certificate of Origin",
                document7: "ICO Certificate of Origin",
                document8: "Weight Certificate",
                document9: "Quality Certificate",
                document10: "Inspection and Stuffing Certificate",
                document11: "Bill of Entry",
                document12: "Dispatch Note",
                document13: "Transaction Certificate",
                document14: "Scope Certificate"
            }
            let documents = [];
            poDocumentsUpload({
                "type": "getDocumentsOnPo",
                "po_id": res.poid
            }).then(response => {
                Object.values(documentsEnum).forEach(doc => {
                    var poDoc = response?.find(x => x.doc_kind === doc);
                    if (poDoc) {
                        documents.push({
                            upload: true,
                            file_name: poDoc.file_name,
                            document_name: poDoc.document_name,
                            doc_kind: poDoc.doc_kind
                        });
                    } else {
                        documents.push({
                            upload: false,
                            doc_kind: doc
                        });
                    }
                })
                setDocuments(documents);
            });
        });
    }
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, []);

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
    }

    const payload3 = [
        {
            type: 'label',
            value: "Supplier",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.supplier_name,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Supplier email",
            bold: true,
            className: classes.labelheading,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.supplier_email || '-',
            sm: '12',
            md: '12'
        }

    ];

    const payload4 = [
        {
            type: 'label',
            value: "Supplier id",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails?.supplier_id,
            sm: '12',
            md: '12'
        },
    ];
    const payload5 = [
        {
            type: 'label',
            value: "Supplier address",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.supplier_address,
            sm: '12',
            md: '12'
        },
    ];

    const payload6 = [
        {
            type: 'label',
            value: "Taxes & Duties",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.taxes_duties || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Packaging & Forwarding",
            bold: true,
            sm: '12',
            md: '12',
            className: classes.labelheading
        },
        {
            type: 'label',
            value: purchaseDetails.packing_forwarding || '-',
            sm: '12',
            md: '12'
        },

    ];

    const payload7 = [
        {
            type: 'label',
            value: "Mode of transport",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.mode_of_transport || '-',
            sm: '12',
            md: '12'
        },
    ];

    const payload8 = [
        {
            type: 'label',
            value: "Transit insurance",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.transit_insurance || '-',
            sm: '12',
            md: '12'
        },
    ];

    const payload9 = [
        {
            type: 'label',
            value: "Currency",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.currency_name,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "No of days IOM can  be generated from date of invoice",
            bold: true,
            sm: '12',
            className: classes.labelheading,
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.payment_terms_days,
            sm: '12',
            md: '12'
        },

    ];

    const payload10 = [
        {
            type: 'label',
            value: "Advance type",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.advance_type,
            sm: '12',
            md: '12'
        },
    ];

    const payload11 = [
        {
            type: 'label',
            value: "Advance",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: parseFloat(purchaseDetails.advance).toFixed(2),
            sm: '12',
            md: '12'
        },
    ];

    const payload12 = [
        {
            type: 'label',
            value: "Incoterm",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.incoterms || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Mode of transport",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.mode_of_transport || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Forwarding",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.forwarding || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Payment terms",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.payment_terms || '-',
            sm: '12',
            md: '12'
        },
    ];

    const payload13 = [
        {
            type: 'label',
            value: "Origin",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.origin || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Insurance",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.transit_insurance || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Currency",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.currency_name,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Comments",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.comments || '-',
            sm: '12',
            md: '12'
        },
    ];

    const payload14 = [
        {
            type: 'label',
            value: "Port of loading",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.ports || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Destination Port",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.destination_port_name || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "No of containers",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.no_of_containers || "-",
            sm: '12',
            md: '12'
        },
    ];

    const payload15 = [
        {
            type: 'label',
            value: "Billing at",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.billing_at_name,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Billing address",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.billing_at_address,
            sm: '12',
            md: '12'
        },

    ];

    const payload16 = [
        {
            type: 'label',
            value: "Delivery at",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.delivery_at_name,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Delivery address",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.delivery_at_address,
            sm: '12',
            md: '12'
        },
    ];

    const payload18 = [
        {
            type: 'label',
            value: "Green coffee type",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.item_name,
            sm: '12',
            md: '12'
        }
    ];

    const payload19 = [
        {
            type: 'label',
            value: "Quotation no",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.quot_no,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Quotation date",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.quot_date ? formatDate(purchaseDetails.quot_date) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Price",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.quot_price ? parseFloat(purchaseDetails.quot_price).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
    ];

    const payload20 = [
        {
            type: 'label',
            value: "Quantity",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.item_dispatch?.map(dispatch => parseInt(dispatch.dispatch_quantity)).reduce((sum, i) => sum + i, 0),
            sm: '12',
            md: '12'
        },
    ];

    const payload21 = [
        {
            type: 'label',
            value: "Dispatch type",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.item_dispatch?.length > 1 ? "Multiple" : "Single",
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Dispatch count",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.item_dispatch?.length,
            sm: '12',
            md: '12'
        },
    ];

    const payload30 = [
        {
            type: 'label',
            value: "Purchase type",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.purchase_type || '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Terminal month",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.terminal_month ? formatDate(purchaseDetails.terminal_month) : '-',
            sm: '12',
            md: '12'
        },

    ]
    const payload22 = [
        {
            type: 'label',
            value: "Booked differential",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.booked_differential ? parseFloat(purchaseDetails.booked_differential).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Total price (USD/MT)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.final_price ? parseFloat(purchaseDetails.final_price).toFixed(2) : '-',
            sm: '12',
            md: '12'
        }
    ];

    const payload23 = [

        {
            type: 'label',
            value: "Fixed terminal rate",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.fixed_terminal_rate ? parseFloat(purchaseDetails.fixed_terminal_rate).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Market price (USD/MT)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.market_price ? parseFloat(purchaseDetails.market_price).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Purchase price (USD/MT)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.purchase_price ? parseFloat(purchaseDetails.purchase_price).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },

    ];

    const payload24 = [
        {
            type: 'label',
            value: "Booked terminal rate",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.booked_terminal_rate ? parseFloat(purchaseDetails.booked_terminal_rate).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Fixed differential",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.fixed_differential ? parseFloat(purchaseDetails.fixed_differential).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "PO margin",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.po_margin ? parseFloat(purchaseDetails.po_margin).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },

    ];

    const payload28 = [
        {
            type: 'label',
            value: "Terminal price(USD)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.terminalPrice ? purchaseDetails.terminalPrice : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Market price (INR/KG)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.marketPriceInr ? parseFloat(purchaseDetails.marketPriceInr).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },

    ]

    const payload29 = [
        {
            type: 'label',
            value: "Purchase price (INR/KG)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.purchasePriceInr ? parseFloat(purchaseDetails.purchasePriceInr).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: "Total price (INR/KG)",
            className: classes.labelheading,
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: purchaseDetails.totalPriceInr ? parseFloat(purchaseDetails.totalPriceInr).toFixed(2) : '-',
            sm: '12',
            md: '12'
        },
    ]

    const payload25 = [
        {
            type: 'label',
            value: "SGST (%)",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: parseFloat(purchaseDetails.sgst).toFixed(2),
            sm: '12',
            md: '12'
        }
    ];

    const payload26 = [
        {
            type: 'label',
            value: "CGST (%)",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: parseFloat(purchaseDetails.cgst).toFixed(2),
            sm: '12',
            md: '12'
        }
    ];

    const payload27 = [
        {
            type: 'label',
            value: "IGST (%)",
            bold: true,
            sm: '12',
            md: '12'
        },
        {
            type: 'label',
            value: parseFloat(purchaseDetails.igst).toFixed(2),
            sm: '12',
            md: '12'
        }
    ];

    const purchaseSteps = ['Req Approval', 'Approve', 'In Progress', 'Shipped', 'Close Order'];

    const getActiveStep = () => {
        // if(purchaseDetails.status === '1')
        return "0";
    }

    const dispatchInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Dispatch information</Typography>
                </Grid>
            </Grid>
            <DispatchList data={dispatchData} mrin={mrinTableData} />
        </Container>
    );

    const downloadFileHandler = async (e, fileName, docName) => {
        try {
            let response = await poDocumentsUpload({
                "type": "downloadDocument",
                "file_name": fileName,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            console.log("Response", response);
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
                severity: 'error',
            })
        }
    }

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const taxColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'mrin_date', label: 'MRIN Date' },
        { id: 'cgst_per', label: 'Tax (%)' },
    ];

    const mrinTableColumns = [
        { id: 'mrindate', label: 'Date' },
        { id: 'mrin_id', label: 'MRIN' },
        { id: 'dispatch_id', label: 'Dispatch' },
        { id: 'expected_quantity', label: 'Expected(Kgs)' },
        { id: 'delivered_quantity', label: 'Delivered(Kgs)' },
        { id: 'balance_quantity', label: 'Balance Quantity(Kgs)' },
        { id: 'related_detid', label: 'Parent Dispatch' },
    ];

    const generatePdf = async () => {
        const showDiv = document.getElementById("showPDf");
        showDiv.style.display = "block";
        setIsloadingPdf(true);
        const input = document.getElementById("po_view_main");

        html2canvas(input).then((canvas) => {
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
                position = (heightLeft - imgHeight);
                doc.addPage();
                doc.addImage(imgData, "JPG", 0, (position * i), imgWidth, imgHeight);
            }

            var blob = doc.output("blob");
            var blobURL = URL.createObjectURL(blob);
            window.open(blobURL);
            setIsloadingPdf(false);
            showDiv.style.display = "none";

            // var pageCount = Math.ceil(htmlHeight / pdfHeight) - 1;
            // let offsetTop = 10;
            // if (offsetTop + imgHeight > doc.internal.pageSize.getHeight()) {
            //   offsetTop = 10;
            //   position = offsetTop;
            // }

            // for (var i = 1; i <= pageCount; i++) {
            //   doc.addPage();
            //   doc.addImage(imgData, 'JPEG', 0, position, htmlWidth, htmlHeight);
            // }

            // while (heightLeft >= 0) {
            //   position = heightLeft - imgHeight;
            //   doc.addPage();
            //   doc.addImage(imgData,"JPEG", 0, position, imgWidth, imgHeight + 30);
            //   heightLeft -= pageHeight;
            // }

            // var imgHeight1 = (canvas1.height * imgWidth) / canvas1.width
            // var heightLeft1 = imgHeight + 50;
            // doc.addPage()
            // doc.addImage(imgData1, "PNG", 0, 0, imgWidth, imgHeight1+30)

            // doc.addPage()
            // doc.addImage(imgData1, "PNG", 0, position, imgWidth, imgHeight+30)

        });



    };

    const approvePo = async (e) => {       //changeToPendingStatus
        try {
            let status = parseInt(purchaseDetails.status) === 1 ? "changeToPendingStatus" : parseInt(purchaseDetails.status) === 3 ? "changeToInprogessStatus" : "changeToclosedStatus";
            let response = await updateGCPoStatus({
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "type": status,
                "po_id": purchaseDetails.poid,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                setSnack({
                    open: true,
                    message: getActiveStep() === "0" ? "PO sent for request approval" : "PO approved successfully",
                });
                setTimeout(() => {
                    props.back("purchase_details", getActiveStep() === "0" ? "pendingwithapprovalpos" : "inprogresspos")
                }, 2000)
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }

    const otherFields = (val) => {
        console.log('key::', val)
    }

    return (<>
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Card className="page-header">
            <CardHeader
                title=" Purchase Order Details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={12}>
                    <Grid container md={8}>
                        <Grid item md={4} xs={12}>
                            <Typography variant="h7">PO no</Typography>
                            <Typography>{props.id}</Typography>
                        </Grid>
                        <Grid item md={2} xs={12}>
                            <Typography variant="h7">PO date</Typography>
                            <Typography>
                                {formatDate(purchaseDetails?.po_date)}
                            </Typography>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <Typography variant="h7">PO category</Typography>
                            <Typography>{purchaseDetails?.po_category}</Typography>
                        </Grid>
                        <Grid item md={3} xs={12}>
                            <Typography variant="h7">PO sub category</Typography>
                            <Typography>{purchaseDetails?.supplier_type}</Typography>
                        </Grid>
                    </Grid>

                    {parseInt(purchaseDetails.status) === 1 && (
                        <Grid
                            container
                            md={2}
                            justify="flex-end"
                            style={{ display: "flex" }}
                        >
                            <Grid item>
                                <Button label="Request Approval" onClick={approvePo} />
                            </Grid>
                        </Grid>
                    )}
                    {parseInt(purchaseDetails.status) === 2 && (
                        <Grid
                            container
                            md={2}
                            justify="flex-end"
                            style={{ display: "flex" }}
                        >
                            <Grid item>
                                <Button label="Approve" onClick={approvePo} />
                            </Grid>
                        </Grid>
                    )}
                    {parseInt(purchaseDetails.status) === 4 && (
                        <Grid
                            container
                            md={2}
                            justify="flex-end"
                            style={{ display: "flex" }}
                        >
                            <Grid item>
                                <Button label="Close Order" onClick={approvePo} />
                            </Grid>
                        </Grid>
                    )}
                    <div id="myMm" style={{ height: "1mm" }} />
                    <Grid
                        container
                        md={2}
                        justify="flex-end"
                        style={{ display: "flex" }}
                    >
                        <Grid item>
                            <Button
                                disabled={isloadingPdf}
                                label={`${isloadingPdf ? "PDF Generating ..." : "Generate PDF"
                                    }`}
                                onClick={generatePdf}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container md={12}>
                    <Grid item md={3} xs={6} >
                        <SimplePopper linkLabel="Dispatch Information" body={dispatchInfo} linkRef={dispatchInfoRef}></SimplePopper>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Card className="page-header">
            <CardContent>
                <Grid container md={12}>
                    <Grid item md={12} xs={12} >
                        {activeStep !== -1 ?
                            <SimpleStepper activeStep={activeStep} completeStep={activeStep} steps={purchaseSteps}></SimpleStepper> : 'Loading ...'
                        }
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Vendor/Supplier information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={3} container direction="column">
                        <Template payload={payload3} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={3} container direction="column">
                        <Template payload={payload4} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload5} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        {
            purchaseDetails.supplier_type_id === "1002" &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Currency & Advance information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid id="top-row" container >
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload9} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload10} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload11} />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        {
            purchaseDetails.supplier_type_id === "1001" &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Currency & Incoterms</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid id="top-row" container >
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload12} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload13} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload14} />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Billing & Delivery information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload15} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload16} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Green coffee information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid id="top-row" container >
                    <Grid container xs={12} md={12}>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload18} />
                            {
                                purchaseDetails.gc_type === "speciality" &&
                                <Template payload={payload19} />
                            }
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload20} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload21} />
                        </Grid>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>

        {purchaseDetails.gc_type && (
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Specification information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <BasicTable rows={compositions} columns={gcTableColumns} hasTotal={false}></BasicTable>
                </AccordionDetails>
            </Accordion>
        )}

        <Accordion defaultExpanded={true} ref={dispatchInfoRef}>
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

        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Price information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        <Template payload={payload30} />
                        {
                            purchaseDetails.supplier_type_id === "1001" &&
                            <Template payload={payload22} />
                        }
                    </Grid>
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        {
                            purchaseDetails.supplier_type_id === "1001" &&
                            <Template payload={payload23} />
                        }
                        {
                            purchaseDetails.supplier_type_id === "1002" &&
                            <Template payload={payload28} />
                        }
                    </Grid>
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        {
                            purchaseDetails.supplier_type_id === "1001" &&
                            <Template payload={payload24} />
                        }
                        {
                            purchaseDetails.supplier_type_id === "1002" &&
                            <Template payload={payload29} />
                        }
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        {
            purchaseDetails.gc_type && purchaseDetails.type === "1002" &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Previous tax information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <BasicTable rows={mrinList} columns={taxColumns}></BasicTable>
                </AccordionDetails>
            </Accordion>
        }
        {
            purchaseDetails.supplier_type_id === "1002" &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Tax information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid id="top-row" container >
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload25} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload26} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={4} container direction="column">
                            <Template payload={payload27} />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Other information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        <Template payload={payload6} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        <Template payload={payload7} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={4} container direction="column">
                        <Template payload={payload8} />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        {
            purchaseDetails.supplier_type_id === "1001" &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Document information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <DocumentList data={documents} otherFields={otherFields} details={true} downloadFile={(event, fileName, docName) => downloadFileHandler(event, fileName, docName)} />
                </AccordionDetails>
            </Accordion>
        }
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Audit log information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <AuditLog data={logData} />
            </AccordionDetails>
        </Accordion>
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button label="Back" onClick={props.back} />
            </Grid>
        </Grid>
    </>);
}
export default PurchaseOrderDetails;