import React, { useState, useEffect, useRef } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Container, Card, CardContent, CardHeader, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SimpleStepper from '../../../components/SimpleStepper';
import SimplePopper from '../../../components/Popper';
import Button from '../../../components/Button';
import { getPOCreationInfo, getPoCreationInfo, updateGCPurchaseOrders, updateGCPoStatus, poDocumentsUpload, getQuotesInfo, getPODetails, getGCApprovedQuotes, getTopApprovedPOs, getTopMrinDetails, getPortAndOriginForPo, getMrinListForPoDetails, getBalQuoteQtyForPoOrder } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import DispatchList from './DispatchList';
import DispatchDetails from './DispatchDetails';
// import DocumentList from './DocumentList';
import AuditLog from './AuditLog';
import SimpleModal from '../../../components/Modal';
import { numberWithCommas } from '../../common';
import { colors } from '../../../constants/colors';
import useToken from '../../../hooks/useToken';
import Utility from '../../../utils/utility';
import { useNavigate, useParams } from 'react-router-dom';
import { routeBuilder } from '../../../utils/routeBuilder';

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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto',
        top: "50%",
        right: "50%",
        transform: "translate(50%, -50%)",
        width: 1000,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #fefefe',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflowY: 'scroll',
        maxHeight: '90vh',
        maxWidth: "90vw",
    },
    modal1: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto',
        top: "50%",
        right: "50%",
        transform: "translate(50%, -50%)",
        width: 600,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #fefefe',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflowY: 'scroll',
        maxHeight: '90vh',
        maxWidth: "90vw",
    },
    otherModal: {
        marginTop: '8px',
        marginBottom: '8px'
    },
    button: {
        margin: theme.spacing(1),
        backgroundColor: colors.orange,
        color: colors.white,
        minWidth: 50,
        textTransform: 'capitalize',

        '&:hover': {
            backgroundColor: colors.orange,
            opacity: 0.8,
        },
        '& $MuiButton-label': {
            margin: 0,
        }
    },
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}


const EditPurchaseOrder = (props) => {
    const navigate = useNavigate();
    const { poid } = useParams();
    const classes = useStyles();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [validationModal, setValidationModal] = useState(false);
    const [supplier, setSupplier] = useState(null);
    const [gc, setGc] = useState(null);
    const [disableSupplier, setDisableSupplier] = useState(true);
    const [quoteNumber, setQuoteNumber] = useState(null);
    const [supplierList, setSupplierList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [typeList, setTypeList] = useState([]);
    const [advanceTypeList, setAdvanceTypeList] = useState([]);
    const [gcTypeList, setgcTypeList] = useState([]);
    const [vendorPriceList, setVendorPriceList] = useState([]);
    const [otherVendorPriceList, setOtherVendorPriceList] = useState([]);
    const [mrinList, setMrinList] = useState([]);
    const [purchaseTypeList, setPurchaseTypeList] = useState([]);
    const [packingType, setPackingType] = useState([]);
    const [billingAddressList, setBillingAddressList] = useState([]);
    const [deliveryAddressList, setDeliveryAddressList] = useState([]);
    const [billingAtList, setBillingAtList] = useState([]);
    const [deliveryAtList, setDeliveryAtList] = useState([]);
    const [quotationList, setQuotationList] = useState([]);
    const [dispatchList, setDispatchList] = useState([]);
    const [dispatchTableData, setDispatchTableData] = useState([]);
    const [mrinTableData, setMrinTableData] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [destinationPortList, setDestinationPortList] = useState([]);
    const [containerTypes, setContainerTypes] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [loadingPortList, setLoadingPortList] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [transportList, setTransportList] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);
    const [chargesList, setChargesList] = useState([]);
    const [documents, setDocuments] = useState([]);
    const dispatchInfoRef = useRef(null)
    const [showQuoteInfo, setShowQuoteInfo] = useState(false);
    const [showContractInfo, setShowContractInfo] = useState(false);
    const [showDispatchInfo, setShowDispatchInfo] = useState(false);
    const [showNoDispatchInfo, setShowNoDispatchInfo] = useState(false);
    const [showDispatchTableInfo, setShowDispatchTableInfo] = useState(false);
    const [showDispatchDetails, setShowDispatchDetails] = useState(false);
    const [dispatchDetails, setDispatchDetails] = useState({});
    const [logData, setLogData] = useState([]);
    const [purchase_qty, setPurchase_qty] = useState('0');
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [activeStep, setActiveStep] = React.useState(-1);
    const [stepProgress, setStepProgress] = useState("100%");
    const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");
    const [dispatchTotal, setDispatchTotal] = useState('0');
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [otherChargesList, setOtherChargesList] = useState([]);
    // const [otherCharges, setOtherCharges] = useState({});
    const [loading, setLoading] = useState(false);
    const [taxesList, setTaxesList] = useState([]);
    const [tempTaxChargesList, setTempTaxChargesList] = useState([{ tax_id: "", perc: "" }]);
    const [domesticTaxesList, setDomesticTaxesList] = useState([]);
    const [domesticAllTaxesList, setDomesticAllTaxesList] = useState([])
    const [taxList, setTaxList] = useState([]);
    const [openTaxCharges, setOpenTaxCharges] = useState(false);

    const [tempOtherChargesList, setTempOtherChargesList] = useState([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }]);
    const documentsRequired = ["Invoice", "Packing List", "Bill of Lading", "Phytosanitory Certificate",
        "Fumigation Certificate", "Certificate of Origin", "ICO Certificate of Origin", "Weight Certificate", "Quality Certificate", "Inspection and Stuffing Certificate", "Bill of Entry", "Dispatch Note"]
    const { getCurrentUserDetails } = useToken();
    const fetchDocumnetData = (poid) => {
        // let documentsEnum = {
        //     document1: "Invoice",
        //     document2: "Packing list",
        //     document3: "Bill of lading",
        //     document4: "Phytosanitory certificate",
        //     document5: "Fumigation certificate",
        //     document6: "Certificate of origin",
        //     document7: "ICO certificate of origin",
        //     document8: "Weight certificate",
        //     document9: "Quality certificate",
        //     document10: "Inspection and stuffing certificate",
        //     document11: "Bill of Entry",
        //     document12: "Dispatch Note",
        // }
        poDocumentsUpload({
            "type": "getDocumentsOnPo",
            "po_id": poid
        }).then(res => {
            // Object.values(documentsEnum).forEach(doc => {
            //     var poDoc = res !== null ? res.find(x => x.doc_kind === doc) : '';
            //     if (poDoc && poDoc !== '') {

            let docs = [];
            documentsRequired?.map(doc => {
                const index = res?.findIndex(document => document?.doc_kind === doc)
                if (index > -1) {
                    docs.push({
                        upload: !!res[index]?.file_name,
                        file_name: res[index]?.file_name,
                        document_name: res[index]?.document_name,
                        doc_kind: res[index]?.doc_kind,
                        required: res[index]?.required,
                        docid: res[index]?.docid,
                    })
                }
                else {
                    docs.push({
                        upload: false,
                        file_name: "",
                        document_name: "",
                        doc_kind: doc,
                        required: false,
                        docid: null,
                    })
                }
                return null;
            })
            setDocuments(docs);
        });
    };

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    const formatPriceInfo = (payload = []) => {
        const updatedPayload = payload?.forEach(element => {
            element.po_createddt = element.po_createddt ? formatDate(element.po_createddt) : '';
            element.price = element.price ? numberWithCommas(parseFloat(element.price).toFixed(2)) : '';
            return element;
        })
        return updatedPayload ?? [];
    };

    const formatDate1 = (datestr) => {
        if (_.isEmpty(datestr))
            return ""

        var validDt = new Date(datestr).getDate();

        if (isNaN(validDt) === true) {
            var dt = datestr.toString(); //;
            let dateVal = dt.replace(new RegExp(escapeRegExp('-'), 'g'), '/') //datestr ? '14-3-2022'.replace('-', '/') : '-'; //moment(datestr).format("DD/MM/YYYY")
            var dateVal1 = dateVal?.split('/')[1] + '/' + dateVal?.split('/')[0] + '/' + dateVal?.split('/')[2];
            return dateVal1;
        } else {
            // eslint-disable-next-line
            var dt = new Date(datestr);
            var dateVal = (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear();
            return dateVal;
        }

    }

    useEffect(() => {
        getPOCreationInfo({ "type": "posubcategory" }).then(res => {
            setTypeList(formatToSelection(res, "supplier_type_name", "supplier_type_id"));
        });
        getQuotesInfo({ "type": "currencies" }).then(res => {
            setCurrency(formatToSelection(res, 'currencyname', 'currencyid'));
            var currencyCodes = {};
            res.forEach((cur, i) => {
                currencyCodes[cur.currencyid] = cur.currencycode;
            });
            setCurrencyCodes(currencyCodes);
        }
        );



        getPoCreationInfo({ "type": "containerTypes" }).then(res => setContainerTypes(formatToSelection(res, 'conttype_name', 'conttype_name')));
        setCategoryList(formatToSelection([{ category: "GC", id: "GC" }, { category: "ORM", id: "ORM" }], "category", "id"));
        getPOCreationInfo({ "type": "deliveryinfo" }).then(res => {
            setDeliveryAddressList(res);
            setDeliveryAtList(formatToSelection(res, 'delivery_at_name', "delivery_at_id"));
        });
        getPOCreationInfo({ "type": "billinginfo" }).then(res => {
            setBillingAddressList(res);
            setBillingAtList(formatToSelection(res, 'billing_at_name', "billing_at_id"));
        });
        setAdvanceTypeList(formatToSelection([{ advance: "Percentage", id: 101 }, { advance: "Amount", id: 102 }], "advance", "id"))

        getPortAndOriginForPo({
            "type": "portLoadingDetails"
        }).then(res => {
            setLoadingPortList(formatToSelection(res, "Ports", "Ports"));
        });
        getPortAndOriginForPo({
            "type": "destinationports"
        }).then(res => {
            setDestinationPortList(res === null ? [] : formatToSelection(res, "destination_port_name", "destination_port_id"));
        });

        getPortAndOriginForPo({
            "type": "originDetails"
        }).then(res => {
            setOriginList(formatToSelection(res, "origin", "origin"));
        });
        getPOCreationInfo({ "type": "getTaxes" }).then(res => {
            setTaxesList(formatToSelection(res, "tax_name", "tax_id"))
        });
        getPOCreationInfo({ "type": "miscCharges" }).then(res => {
            setChargesList(formatToSelection(res, "misc_charges_name", "misc_id"))
        });
        setTransportList(formatToSelection([{ id: "By Sea", label: "By Sea" }, { id: "By Air", label: "By Air" }, { id: "By Road", label: "By Road" }], "label", "id"))
        setInsuranceList(formatToSelection([{ id: "By Supplier", label: "By Supplier" }, { id: "By Self", label: "By Self" }], "label", "id"))
        setDispatchList(formatToSelection([{ id: "Single", label: "Single" }, { id: "Multiple", label: "Multiple" }], "label", "id"));
        setPackingType(formatToSelection([{ id: "Bulk", label: "Bulk" }, { id: "Bags", label: "Bags" }], "label", "id"));
        setPurchaseTypeList(formatToSelection([{ id: "Fixed", label: "Fixed" }, { id: "Differential", label: "Differential" }], "label", "id"));
        getQuotesInfo({ "type": "incoterms" }).then(res => setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));

        getMrinListForPoDetails({ "type": "mrinsonponoforview", "po_no": poid }).then(response => {
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
        });

        getPODetails({
            "po_no": (poid)
        }).then(res => {
            setPurchaseDetails({
                ...res,
                'currency_id': { label: res.currency_name, value: res.currency_id },
                'packing_type': { label: res.packing_type, value: res.packing_type },
                "gcCompositions": res ? formatGCCompositions(res) : null,
                "advance_type": res.advance_type === "Amount" ? "102" : "101",
                "destination_port_name": { label: res.destination_port_name, value: res.destination_port_id },
                "po_qty": res.total_quantity,
                "incotermsid": { label: res.incoterms, value: res.incotermsid },
                "origin": { label: res.origin, value: res.origin },
                "ports": { label: res.ports, value: res.ports },
                "mode_of_transport": res?.supplier_type_id === '1002' ? res.mode_of_transport : { label: res.mode_of_transport, value: res.mode_of_transport },
                "insurance": { label: res.insurance, value: res.insurance },
                "container_type": { label: res.container_type, value: res.container_type },
                "otherCharges": { label: res.otherCharges, value: res.otherCharges },
                "billing_at_address": res.billing_com_name + ' - ' + res.billing_at_addressline1 + ", "
                    + [res.billing_at_addressline2, res?.billing_zipcode].filter(Boolean).join(', ')
                    + [res.billing_state, res?.billing_country].filter(Boolean).join(', '),
                "delivery_at_address": res.delivery_com_name + ' - ' + res.delivery_at_addressline1 + ", "
                    + [res.delivery_at_addressline2, res?.delivery_zipcode].filter(Boolean).join(', ')
                    + [res.delivery_state, res?.delivery_country].filter(Boolean).join(', '),
                // "po_margin":(parseFloat(res.market_price === undefined ? 0 : res.market_price) - parseFloat(res.purchase_price)),           
                // "totalPrice": (parseFloat(res.purchase_price) * parseFloat(res.po_qty === undefined ? 0 : res.po_qty)),
            });

            getPOCreationInfo({ "type": "getDomesticTaxes" }).then(res1 => {
                // setDomesticTaxesList(formatToSelection(res, "tax_name", "tax_id"))
                setDomesticAllTaxesList(formatToSelection(res1, "tax_name", "tax_id"))

                let tampDomestic = formatToSelection(res1, "tax_name", "tax_id");
                if (res?.domestic_taxes !== null) {
                    let temp = _.cloneDeep(res?.domestic_taxes);
                    var cgstVal = tampDomestic.find(val => val.label === 'CGST')?.value;
                    var sgstVal = tampDomestic.find(val => val.label === 'SGST')?.value;
                    var igstVal = tampDomestic.find(val => val.label === 'IGST')?.value;

                    var iscgst = temp.findIndex(val => val.tax_id === cgstVal);
                    var issgst = temp.findIndex(val => val.tax_id === sgstVal);
                    var isigst = temp.findIndex(val => val.tax_id === igstVal);

                    let temp1 = [...tampDomestic];
                    let filterTemp = [];
                    // eslint-disable-next-line
                    res?.domestic_taxes.map((item, index) => {
                        filterTemp = temp1.filter(function (el) { return el.value !== item?.tax; });
                    })

                    if (iscgst !== -1 || issgst !== -1) {
                        filterTemp = temp1.filter(function (el) { return el.label !== "IGST"; });
                    }
                    if (isigst !== -1) {
                        filterTemp = temp1.filter(function (el) { return el.label !== "SGST" && el.label !== "CGST"; });
                    }
                    console.log('filterTemp::', filterTemp, iscgst, issgst, isigst, tampDomestic)
                    setDomesticTaxesList(filterTemp);
                } else {
                    setDomesticTaxesList(tampDomestic);
                }

                // setTempTaxChargesList(filterTemp)
            });

            //let tamp = res.domestic_taxes;
            // let tamp = res.domestic_taxes!=null ? res.domestic_taxes :[];
            // tamp.push({perc: res?.tds, tax_id: "1", tax_name: "TDS"});
            let tamp = res.domestic_taxes != null ? res.domestic_taxes.map((item, index) => {
                return { ...item, total_rate: (parseFloat(res?.grossPrice) * parseFloat(item?.perc)) / 100 }
            }) : [];

            //   tamp.push({perc: res?.tds, tax_id: "1", tax_name: "TDS", total_rate: (parseFloat(res.totalPrice)*parseFloat(res?.tds ? res?.tds : 0))/100});
            setTaxList(tamp);
            setOtherChargesList(res?.taxes_misc_charges ?
                res?.taxes_misc_charges?.map(charge => {
                    return {
                        label: charge?.misc_charge_name,
                        name: charge?.misc_id,
                        taxLabel: charge?.tax_name,
                        tax: charge?.taxid,
                        rate: charge?.misc_charge_rate,
                        taxRate: charge?.tax_percentage?.toString(),
                        total_price: ((1 + (charge.tax_percentage !== '' ? parseFloat(charge.tax_percentage) : 0.00) / 100) * parseFloat(charge?.misc_charge_rate)).toFixed(2) //charge?.total_tax_rate !== '' ? charge?.total_tax_rate : 0.00,
                    }
                }) : []);
            // setOtherChargesRate(0)
            if (res.supplier_type_id === "1001") {
                setShowContractInfo(true);
            }
            setActiveStep(parseInt(res.status) - 1);
            if (res.status === "4" || res.status === "3") {
                var delivered = res.item_dispatch
                    ?.map((dispatch) => (dispatch.delivered_quantity ? parseInt(dispatch.delivered_quantity) : 0))
                    .reduce((sum, i) => sum + i, 0);
                setStepProgress(((delivered / res.total_quantity) * 100) + "%");
            }
            getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": res.supplier_type_id }).then(response => {
                setSupplierList(response);
                setSupplier({ "supplier_id": res.supplier_id, "supplier_name": res.supplier_name, "tds": res.tds });
                setDisableSupplier(false);
            });
            getPOCreationInfo({ item_type: "GC", "type": "greencoffee" }).then(response => {
                setgcTypeList(response === null ? [] : response);
                setGc({ "item_id": res.item_id, "item_name": res.item_name });

                if (res.coffee_type === "speciality") {
                    getGCApprovedQuotes({
                        "type": "approvedqtlines",
                        "gc_type": res.item_id,
                        "po_date": currentPODate(purchaseDetails.po_date || new Date()),
                    }).then(quotes => {
                        setQuotationList(quotes);
                        setQuoteNumber(quotes?.find(r => r.qtline_item === res.quot_no));
                        setShowQuoteInfo(true);
                    });
                } else {
                    setShowQuoteInfo(false);
                }
                setShowDispatchInfo(true);
                setShowNoDispatchInfo(true);
                setShowDispatchTableInfo(true);
                getTopApprovedPOs({
                    "type": "top3apprPosforselectedvendor",
                    "vendor_id": res.supplier_id,
                    "gcitem_id": res.item_id
                }).then(pos => {
                    setVendorPriceList(formatPriceInfo(pos));
                });
                getTopApprovedPOs({
                    "type": "top3apprPosforothervendor",
                    "vendor_id": res.supplier_id,
                    "gcitem_id": res.item_id
                }).then(pos => {
                    setOtherVendorPriceList(formatPriceInfo(pos));
                });
                getTopMrinDetails({
                    "type": "topmrinrecord",
                    "gcitem_id": res.item_id,
                    "po_date": res.po_date
                }).then(mrin => {
                    if (mrin?.gcitem_id) {
                        let data = {
                            ...mrin,
                            "number": 1
                        }
                        setMrinList([data]);
                    } else {
                        setMrinList(null);
                    }
                });
                setLogData(res.audit_log_gc_po);
            });

            // setCompositions(formatGCCompositions(res));  
            if (res.item_dispatch?.length > 0) {
                res.item_dispatch.forEach((dispatch, i) => {
                    dispatch.number = ++i;
                    // var date = dispatch.dispatch_date?.split("-");
                    // if (date) {
                    //     dispatch.date = new Date(date[2], date[1], date[0])
                    // }
                    dispatch.dispatch_date = formatDate1(dispatch.dispatch_date);
                });
                // debugger
                setDispatchTableData(res.item_dispatch);
            } else {
                setDispatchTableData(null)
            }
            fetchDocumnetData(res.poid);
        });
        // eslint-disable-next-line 
    }, []);

    const handleChange = (event, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleChangeNumber = (event, key,) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        let data = {
            ...purchaseDetails, [key]: val
        }
        setPurchaseDetails(data);
    };
    const handleCategoryChange = (event, key) => {
        let data = {};
        if (event.target.value === "ORM") {
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "booked_terminal_rate": purchaseDetails.purchase_price,
                "booked_differential": 0,
                "fixed_terminal_rate": purchaseDetails.purchase_price,
                "fixed_differential": 0
            }
        } else {
            data = {
                ...purchaseDetails,
                [key]: event.target.value
            }
        }
        setPurchaseDetails(data);
    };

    const handleTypeChange = (event, key) => {
        getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": event.target.value }).then(res => {
            setSupplierList(res);
        });
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "supplier_name": '',
            "supplier_id": '',
            "supplier_address": '',
        }
        setPurchaseDetails(data);
        setSupplier(null);
        setDisableSupplier(false);
    };

    const handleSupplierChange = (event, value) => {
        if (!value) {
            setSupplier(null);
            let data = {
                ...purchaseDetails,
                "supplier_name": '',
                "supplier_id": '',
                "supplier_address": '',
                'tds': '0',
            }
            setPurchaseDetails(data);
            return;
        }
        setSupplier(value);

        getPOCreationInfo({ "type": "supplierinfo", "supplier_id": value.supplier_id }).then(res => {
            let data = {
                ...purchaseDetails,
                "supplier_name": res.supplier_name,
                "supplier_id": res.supplier_id,
                "supplier_address": res.supplier_address,
                "currency_id": res.supplier_type === "Domestic" ? "HO-101" : '',
                'tds': res?.tds,
            }
            setPurchaseDetails(data);
            getTopApprovedPOs({
                "type": "top3apprPosforselectedvendor",
                "vendor_id": value.supplier_id,
                "gcitem_id": purchaseDetails.item_id
            }).then(res => {
                setVendorPriceList(formatPriceInfo(res));
            });
        });
    };

    const handleAddressChange = (event, key,) => {
        let data = {};
        if (key === "billing_at_id") {
            let res = billingAddressList.find(loc => loc.billing_at_id === event.target.value)
            let resArray = [res?.billing_com_name, res?.billing_at_addressline1, res?.billing_at_addressline2,
            [res?.billing_state, res?.billing_country, res?.billing_zipcode].filter(Boolean).join(', '),
            [res?.billing_at_gstno, res?.billing_at_panno].filter(Boolean).join(', '),
            ].filter(Boolean).join('\n');
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "billing_at_address": resArray
            }
        } else if (key === "delivery_at_id") {
            let res = deliveryAddressList.find(loc => loc.delivery_at_id === event.target.value);
            let resArray = [res?.delivery_com_name, res?.delivery_at_addressline1, res?.delivery_at_addressline2,
            [res?.delivery_state, res?.delivery_country, res?.delivery_zipcode].filter(Boolean).join(', '),
            [res?.delivery_at_gstno, res?.delivery_at_panno].filter(Boolean).join(', '),
            ].filter(Boolean).join('\n');
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "delivery_at_address": resArray
            }
        }
        setPurchaseDetails(data);
    };

    const formatGCCompositions = (compostion = {}) => {
        return [
            { composition_name: "Density(Gm/Cc)", composition_rate: compostion.density },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Sound Beans (%)", composition_rate: compostion.soundBeans },
            { composition_name: "Browns (%)", composition_rate: compostion.browns },
            { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
            { composition_name: "Broken & Bits (%)", composition_rate: compostion.brokenbits },
            { composition_name: "Insected Beans (%)", composition_rate: compostion.insectedbeans },
            { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
            { composition_name: "Husk (%)", composition_rate: compostion.husk },
            { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
            { composition_name: "Stones (%)", composition_rate: compostion.stones },
            { composition_name: "Beans retained on 5mm mesh during sieve analysis", composition_rate: compostion.beansretained }

        ];
    }

    const currentPODate = (date) => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date(date);
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
    }

    const handleGCTypeChange = (event, value) => {
        let data;
        if (!value) {
            data = {
                ...purchaseDetails,
                "item_id": '',
                "gcCompositions": [],
                "quot_no": '',
                "quot_date": null
            }
            setPurchaseDetails(data);
            setShowQuoteInfo(false);
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
            return;
        }
        setGc({ "item_id": value.item_id, "item_name": value.item_name });
        getPOCreationInfo({ "type": "gccomposition", "item_id": value.item_id }).then(res => {
            data = {
                ...purchaseDetails,
                "item_id": value.item_id,
                "gcCompositions": res ? formatGCCompositions(res[0]) : null,
                "quot_no": '',
                "quot_date": null,
                "po_qty": '',
                "quot_price": '',
                "dispatch_type": '',
                "dispatch_count": ''
            }
            setPurchaseDetails(data);
        });
        setQuoteNumber(null);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);
        if (value.gc_type === "speciality") {
            getGCApprovedQuotes({
                "type": "approvedqtlines",
                "gc_type": value.item_id,
                "po_date": currentPODate(purchaseDetails.po_date || new Date()),
            }).then(res => {
                setQuotationList(res);
                setShowQuoteInfo(true);
            });
        } else {
            setShowQuoteInfo(false);
        }
        getTopApprovedPOs({
            "type": "top3apprPosforselectedvendor",
            "vendor_id": purchaseDetails.supplier_id,
            "gcitem_id": value.item_id
        }).then(res => {
            setVendorPriceList(res);
        });
        getTopApprovedPOs({
            "type": "top3apprPosforothervendor",
            "vendor_id": purchaseDetails.supplier_id,
            "gcitem_id": value.item_id
        }).then(res => {
            setOtherVendorPriceList(res);
        });
        getTopMrinDetails({
            "type": "topmrinrecord",
            "gcitem_id": value.item_id,
            "po_date": purchaseDetails.po_date || new Date()
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
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: date
        }
        setPurchaseDetails(data);
    };

    const handleQuantityChange = (event, key) => {
        let error = { ...validationError };
        delete error.po_qty;
        setValidationError(error);

        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList);
        if (parseFloat(purchase_qty) !== 0 && parseFloat(event.target.value) > parseFloat(purchase_qty)) {
        } else {
            if (parseFloat(event.target.value) !== parseFloat(dispatchTotal)) {
            } else {
                if (validationError.po_qty) {
                    let error = { ...validationError };
                    delete error.po_qty;
                    setValidationError(error);
                }
            }
        }
        //  }
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "grossPrice": (parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(event.target.value)),//purchasePriceInr
            "totalPrice": purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(event.target.value)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
        }
        if (event.target.value > 0) {
            setShowDispatchInfo(true);
        } else {
            data = {
                ...data,
                'dispatch_type': '',
                'dispatch_count': ''
            }
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
        }
        setPurchaseDetails(data);
        if (dispatchTableData) {
            let error = { ...validationError };
            delete error.qty;
            setValidationError(error);
            var totalDispatchQty = dispatchTableData?.map(row => parseInt(row["dispatch_quantity"])).reduce((sum, i) => sum + i, 0);

            if (parseFloat(event.target.value) !== parseFloat(totalDispatchQty)) {
                // setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered22' });
                // setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered22')
            } else {
                if (parseFloat(purchaseDetails.po_qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                    setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                    setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
                } else {
                    if (validationError.qty) {
                        let error = { ...validationError };
                        delete error.qty;
                        setValidationError(error);
                    }
                }
            }

        }
    };

    const handlePurchasePriceInrChange = (event, key) => {
        const val = event.target.value >= 0 ? event.target.value : 0;
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList);

        const qty = parseFloat(purchaseDetails.po_qty === undefined ? 0 : purchaseDetails.po_qty);
        let data = {
            ...purchaseDetails,
            "grossPrice": parseFloat(val) * (purchaseDetails?.supplier_type_id === "1001" ? qty / 1000 : qty),
            "totalPrice": totalPriceInr,
            [key]: val
        }
        setPurchaseDetails(data);
    };
    const handleDispatchChange = (event, key,) => {
        let data = {
            ...purchaseDetails,
            [key]: event.target.value
        }
        if (event.target.value === "Multiple") {
            setShowNoDispatchInfo(true);
        } else {
            let tabledata = [];
            tabledata[0] = { "number": (1).toString(), "dispatch_quantity": 0, "dispatch_date": new Date() };
            setDispatchTableData(tabledata);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(true);
        }
        setPurchaseDetails(data);
    };

    const handleDispatchCountChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            [key]: Utility.convertToPositive(event.target.value)
        }
        setPurchaseDetails(data);
        if (event.target.value > 99 || event.target.value < 1) {
            setValidationError({ dispatch_count: 'Please enter valid details: 1 - 99' });
            return;
        } else {
            if (validationError.dispatch_count) {
                let error = { ...validationError };
                delete error.dispatch_count;
                setValidationError(error);
            }
        }
        if (event.target.value < 1) {
            setShowDispatchTableInfo(false);
            return;
        }
        setShowDispatchTableInfo(true);
    };
    const handleDispatchLinesChange = (event) => {
        let tabledata = [];
        for (let index = 0; index < event.target.value; index++) {
            tabledata[index] = {
                "number": (index + 1).toString(),
                "dispatch_quantity": dispatchTableData[index]?.dispatch_quantity || 0,
                "dispatch_date": formatDate1(dispatchTableData[index]?.dispatch_date) || new Date(),
            };
        }
        setDispatchTableData(tabledata);
    }

    const handleTaxChange = (event, key) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList);
        let data = {
            ...purchaseDetails,
            "totalPrice": totalPriceInr,
            [key]: val
        }
        setPurchaseDetails(data);
    }

    const handleQuotationChange = (event, value) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        getBalQuoteQtyForPoOrder({ "type": "getBalqtyforPo", "quotation_no": value?.quotation_no }).then((res) => {
            var qty_gc = (res.order_qty === '') ? value?.qty : (value?.qty - res.order_qty);
            setPurchase_qty(value?.qty);
            let data = {
                ...purchaseDetails,
                'quot_no': value?.quotation_no,
                'quotation_id': value?.quotation_id,
                'quot_date': value?.quotation_date,
                'quot_price': value?.price,
                'po_qty': qty_gc,
                "grossPrice": (parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(value?.qty)),//purchasePriceInr
                'totalPrice': purchaseDetails.supplier_type_id === "1002" ? totalPriceInr :
                    ((parseFloat(purchaseDetails.purchase_price === undefined ? 0 : purchaseDetails.purchase_price) * parseFloat(value?.qty)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            }
            if (value?.qty > 0) {
                setShowDispatchInfo(true);
            }
            setPurchaseDetails(data);
            setQuoteNumber(value);
        });
    };

    const dispatchDataUpdate = (total) => {
        let error = { ...validationError };
        delete error.po_qty;
        setValidationError(error);
        setDispatchTotal(total);
        if (parseFloat(purchaseDetails.po_qty) !== total) {
            // setValidationError({ ...validationError, "po_qty": 'Total Dispatch Quatity not matches Quantity entered33' });
            // setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered33')
            return;
        } else {
            if (validationError.po_qty) {
                let error = { ...validationError };
                delete error.po_qty;
                setValidationError(error);
            }
        }
    }

    const rateUpdate = (total, otherChargesList) => {
        // const totalPrice = purchaseDetails?.supplier_type_id === "1001" ?
        //     calculateTotalPriceImport(purchaseDetails?.grossPrice, purchaseDetails?.taxes, otherChargesList) :
        //     calculateTotalPrice(purchaseDetails, otherChargesList)
        let data = {
            ...purchaseDetails,
            // 'totalPrice': totalPrice,
        }
        setPurchaseDetails(data);
    }


    const handleClick = (index) => {
        let state = [...otherChargesList];
        // eslint-disable-next-line       
        state.map((item, index1) => {
            if (index1 === index) {
                let temp = { ...purchaseDetails };
                delete purchaseDetails[item.name];
                setPurchaseDetails(temp);
            }
        })
        if (index !== -1) {
            state.splice(index, 1);
            setOtherChargesList(state);
        }

        if (state.length === 0) {
            rateUpdate(0, state);
        } else {

            rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0), state);
        }
    }
    const createPurchaseAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        // setValidationError(errorObj);
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.advance)) {
            errorObj = { ...errorObj, advance: message };
        } else {
            delete errorObj.advance
        }
        // if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.cgst) && !_.isEmpty(purchaseDetails.sgst)) {
        //     errorObj = { ...errorObj, cgst: message };
        // } else {
        //     delete errorObj.cgst
        // }
        // if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.sgst) && !_.isEmpty(purchaseDetails.cgst)) {
        //     errorObj = { ...errorObj, sgst: message };
        // } else {
        //     delete errorObj.sgst
        // }
        if ((purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category !== "ORM")
            && _.isEmpty(purchaseDetails.market_price?.toString())) {
            errorObj = { ...errorObj, market_price: message };
        } else {
            delete errorObj.market_price
        }
        if (purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category !== "ORM" && _.isEmpty(purchaseDetails.purchase_price?.toString())) {
            errorObj = { ...errorObj, purchase_price: message };
        } else {
            delete errorObj.purchase_price
        }
        // if (purchaseDetails.supplier_type_id === "1002"
        //     && _.isEmpty(purchaseDetails.purchasePriceInr?.toString())) {
        //     errorObj = { ...errorObj, purchasePriceInr: message };
        // } else {
        //     delete errorObj.purchasePriceInr
        // }
        if (_.isEmpty(purchaseDetails.supplier_type_id)) {
            errorObj = { ...errorObj, supplier_type_id: message };
        } else {
            delete errorObj.supplier_type_id
        }
        if (_.isEmpty(purchaseDetails.po_category)) {
            errorObj = { ...errorObj, po_category: message };
        } else {
            delete errorObj.po_category
        }
        if (purchaseDetails.status === "1" && purchaseDetails.status === "2" && _.isEmpty(purchaseDetails.dispatch_type)) {
            errorObj = { ...errorObj, dispatch_type: message };
        } else {
            delete errorObj.dispatch_type
        }
        if (purchaseDetails.status === "1" && purchaseDetails.status === "2" && purchaseDetails.dispatch_type === 'Multiple' && _.isEmpty(purchaseDetails.dispatch_count)) {
            errorObj = { ...errorObj, dispatch_count: message };
        } else {
            delete errorObj.dispatch_count
        }
        if (purchaseDetails.billing_at_id === undefined) {
            errorObj = { ...errorObj, billing_at_id: message };
        } else {
            delete errorObj.billing_at_id
        }
        if (purchaseDetails.delivery_at_id === undefined) {
            errorObj = { ...errorObj, delivery_at_id: message };
        } else {
            delete errorObj.delivery_at_id
        }
        if (purchaseDetails.supplier_type_id === "1002" && _.isEmpty(purchaseDetails.payment_terms_days)) {
            errorObj = { ...errorObj, payment_terms_days: message };
        } else {
            delete errorObj.payment_terms_days
        }
        if (purchaseDetails.supplier_id === undefined) {
            errorObj = { ...errorObj, supplier_id: message };
        } else {
            delete errorObj.supplier_id
        }
        // eslint-disable-next-line
        // if(purchaseDetails.supplier_type_id === "1002"){
        if (parseFloat(purchaseDetails.po_qty) !== parseFloat(dispatchTableData?.map(row => parseInt(row["dispatch_quantity"])).reduce((sum, i) => sum + i, 0))) {
            errorObj = { ...errorObj, dispatch_quantity: 'Total Dispatch Quatity not matches Quantity entered' }
            setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered');
        }
        else {
            delete errorObj.dispatch_quantity
            delete errorObj.po_qty
        }
        // } else {
        //     if (purchaseDetails.qty != dispatchTableData?.map(row => parseInt(row["dispatch_quantity"])).reduce((sum, i) => sum + i, 0)) {
        //         errorObj = { ...errorObj, dispatch_quantity: 'Total Dispatch Quatity not matches Quantity entered12' }
        //     }
        //     else {
        //         delete errorObj.dispatch_quantity 
        //         delete errorObj.qty
        //     }
        // }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
            setValidationModal(true);
        } else {
            let data =
            {
                "createduserid": localStorage.getItem('currentUserId'),
                "loggedinuserid": getCurrentUserDetails()?.id,
                "modified_byuserid": localStorage.getItem('currentUserId'),
                "po_update": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "po_no": purchaseDetails.po_no,
                "quotation_id": purchaseDetails.quotation_id,
                "destination_port_id": purchaseDetails.destination_port_name?.value,
                "delivery_at_id": purchaseDetails.delivery_at_id?.toString(),
                "billing_at_id": purchaseDetails.billing_at_id?.toString(),
                "incoterms": purchaseDetails.incotermsid?.value,
                "origin": purchaseDetails.origin?.value,
                "ports": purchaseDetails.ports?.value,
                "payment_terms": purchaseDetails.payment_terms,
                "container_type": purchaseDetails.container_type?.value,
                "payment_terms_days": purchaseDetails.payment_terms_days,
                "forwarding": purchaseDetails.forwarding,
                "no_of_bags": purchaseDetails.no_of_bags,
                "net_weight": purchaseDetails.net_weight,
                "no_of_containers": purchaseDetails.no_of_containers?.toString(),
                "comments": purchaseDetails.comments,
                "po_date": purchaseDetails.po_date,
                "po_category": purchaseDetails.po_category,
                "supplier_id": purchaseDetails.supplier_id,
                "quot_no": purchaseDetails.quot_no,
                "quot_price": purchaseDetails.quot_price?.toString(),
                "quot_date": purchaseDetails.quot_date || null,
                "advance": purchaseDetails.advance?.toString(),
                "advance_type": purchaseDetails.advance_type?.toString(),
                "currency_id": purchaseDetails.currency_id?.value,
                "taxes_duties": purchaseDetails.taxes_duties,
                "mode_of_transport": purchaseDetails.supplier_type_id === "1001" ? purchaseDetails.mode_of_transport?.value : purchaseDetails.mode_of_transport,
                "packing_type": purchaseDetails.packing_type?.value,
                "insurance": purchaseDetails.insurance?.value,
                "transit_insurance": purchaseDetails.transit_insurance,
                "packing_forwarding": purchaseDetails.packing_forwarding,
                "supplier_type": purchaseDetails.supplier_type_id,
                "cgst": purchaseDetails.cgst,
                "igst": purchaseDetails.igst,
                "sgst": purchaseDetails.sgst,
                'tds': purchaseDetails?.tds,
                "purchase_type": purchaseDetails.supplier_type_id === "1002" ? 'Fixed' : purchaseDetails.purchase_type,
                "terminal_month": purchaseDetails.terminal_month || null,
                "fixation_date": purchaseDetails.fixation_date || null,
                "booked_terminal_rate": purchaseDetails.booked_terminal_rate?.toString(),
                "fixedDate": purchaseDetails.fixedDate,
                "booked_differential": purchaseDetails.booked_differential?.toString(),
                "fixed_terminal_rate": purchaseDetails.fixed_terminal_rate?.toString(),
                "fixed_differential": purchaseDetails.fixed_differential?.toString(),
                "purchase_price": purchaseDetails.purchase_price?.toString(),
                "market_price": purchaseDetails.market_price?.toString(),
                "po_margin": purchaseDetails.po_margin?.toString(),
                "terminalPrice": purchaseDetails.terminalPrice?.toString(),
                "marketPriceInr": purchaseDetails.marketPriceInr?.toString(),
                "purchasePriceInr": purchaseDetails.purchase_price?.toString(),//purchasePriceInr
                "totalPrice": purchaseDetails.totalPrice?.toString(),
                "grossPrice": purchaseDetails.grossPrice?.toString(),
                "total_quantity": purchaseDetails.po_qty?.toString(),
                "contract": purchaseDetails.contract,
                "domestic_taxes": taxList.filter(val => val.tax_id !== '1'),
                "taxes_misc_charges": otherChargesList?.map(charge => {
                    return {
                        taxid: charge?.tax,
                        tax_percentage: charge?.taxRate,
                        misc_id: charge?.name,
                        misc_charge_rate: charge?.rate,
                        total_price: ((1 + (charge.taxRate !== '' ? parseFloat(charge.taxRate) : 0.00) / 100) * parseFloat(charge?.rate)).toFixed(2) //charge?.total_tax_rate !== '' ? charge?.total_tax_rate : 0.00,
                    }
                }),
                "rate": purchaseDetails.rate?.toString(),
                "dispatch_type": purchaseDetails.dispatch_type,
                "dispatch_count": purchaseDetails.dispatch_count,
                "item_dispatch": dispatchTableData,
                "item_id": purchaseDetails.item_id,
                "poid": purchaseDetails?.poid,
                "packing_forward_charges": purchaseDetails.packing_forward_charges ? purchaseDetails.packing_forward_charges.toString() : '',
                "installation_charges": purchaseDetails.installation_charges ? purchaseDetails.installation_charges.toString() : '',
                "freight_charges": purchaseDetails.freight_charges ? purchaseDetails.freight_charges.toString() : '',
                "handling_charges": purchaseDetails.handling_charges ? purchaseDetails.handling_charges.toString() : '',
                "misc_charge": purchaseDetails.misc_charge ? purchaseDetails.misc_charge.toString() : '',
                "hamali_charge": purchaseDetails.hamali_charge ? purchaseDetails.hamali_charge.toString() : '',
                "mandifee_charges": purchaseDetails.mandifee_charges ? purchaseDetails.mandifee_charges.toString() : '',
                "fulltax_charges": purchaseDetails.fulltax_charges ? purchaseDetails.fulltax_charges.toString() : '',
                "insurance_charges": purchaseDetails.insurance_charges ? purchaseDetails.insurance_charges.toString() : '',
                "documentsection": documents.length > 0 ? documents : null
            }
            console.log('data::11', data);
            // return;
            setLoading(true);
            try {
                let response = await updateGCPurchaseOrders(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "GC Purchase Order updated successfully",
                    });
                    setTimeout(() => {
                        navigate(-1, { replace: true })
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
    }

    const createAction = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Validation
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    {errorValidationMessage}
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Ok" onClick={() => setValidationModal(!validationModal)} />
                </Grid>
            </Grid>
        </Container>
    );
    const handleDocumentsRequiredChange = (val) => {
        const tempDocuments = _.cloneDeep(documents);
        const index = tempDocuments.findIndex(doc => doc.doc_kind === val);
        if (index > -1)
            tempDocuments[index].required = !tempDocuments[index]?.required
        setDocuments(tempDocuments);
    }
    const calculatePurchasePrice = (terminalRate, differentialRate) => {
        return parseFloat(terminalRate || 0) + parseFloat(differentialRate || 0);
    }
    const calculateGrossPrice = (purchasePrice, qty) => {
        return parseFloat(purchasePrice || 0) * parseFloat(qty || 0) / 1000;
    }
    const calculateTotalPriceImport = (grossPrice, taxes, otherChargesList) => {
        let otherCharges = (otherChargesList)?.reduce((total, current) => {
            total = total + parseFloat(current.total_price || 0);
            return total;
        }, 0)
        return parseFloat(grossPrice || 0) + parseFloat(taxes || 0) + parseFloat(otherCharges || 0);
    }
    const calculatePOMargin = (marketPrice, purchasePrice) => {
        return parseFloat(marketPrice) - parseFloat(purchasePrice);
    }
    const getTerminalValue = (purchaseType, fixedTerminal, bookedTerminal) => {
        if (purchaseType === "Fixed") {
            return fixedTerminal
        }
        else if (purchaseType === "Differential" && !_.isEmpty(fixedTerminal))
            return fixedTerminal
        else return bookedTerminal;
    }
    const handleTerminalRateChange = (event, key) => {
        const marketPrice = event.target.value >= 0 ? event.target.value : 0;
        const purchaseType = purchaseDetails?.purchase_type;
        const fixedTerminalValue = key === "fixed_terminal_rate" ? event.target.value : purchaseDetails?.fixed_terminal_rate;
        const bookedTerminalValue = key === "booked_terminal_rate" ? event.target.value : purchaseDetails?.booked_terminal_rate;
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseType, fixedTerminalValue, bookedTerminalValue),
            purchaseType === "Fixed" ? purchaseDetails?.fixed_differential :
                purchaseDetails?.booked_differential);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.po_qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(marketPrice, purchasePrice);
        let data = {
            ...purchaseDetails,
            "purchase_price": purchasePrice,
            "market_price": marketPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "totalPrice": totalPrice,
            [key]: event.target.value
        }

        setPurchaseDetails(data);
    };
    const handlePurchaseTypeChange = (event, key) => {
        const marketPrice = event.target.value === "Fixed" ?
            purchaseDetails?.fixed_terminal_rate : purchaseDetails?.booked_terminal_rate;
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseDetails?.purchase_type, purchaseDetails?.fixed_terminal_rate,
            purchaseDetails?.booked_terminal_rate), event.target.value === "Fixed" ?
            purchaseDetails?.fixed_differential : purchaseDetails?.booked_differential);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.po_qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.market_price, purchasePrice);
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "purchase_price": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "market_price": marketPrice
        }
        setPurchaseDetails(data);
    }
    const handleDifferentialChange = (event, key) => {
        const purchaseType = purchaseDetails?.purchase_type;
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseType,
            purchaseDetails?.fixed_terminal_rate, purchaseDetails?.booked_terminal_rate), event.target.value);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.po_qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.market_price, purchasePrice);
        let data = {
            ...purchaseDetails,
            "purchase_price": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "fixed_differential": event.target.value,
            "booked_differential": event.target.value,
        }
        setPurchaseDetails(data);
    };

    const payload = [
        {
            label: 'PO date',
            type: 'datePicker',
            required: true,
            disabled: true,
            error: validationError?.po_date,
            helperText: validationError?.po_date,
            value: purchaseDetails.po_date || new Date(),
            maxDate: new Date(),
            onChange: (e) => handleDateChange(e, 'po_date'),
            sm: 12
        },
        {
            label: 'PO category *',
            type: 'select',
            value: purchaseDetails.po_category || '',
            required: true,
            disabled: true,
            error: validationError?.po_category,
            helperText: validationError?.po_category,
            options: categoryList || [],
            onChange: (e) => handleCategoryChange(e, 'po_category'),
            sm: 12
        },

    ]

    const payload17 = [{
        label: 'PO sub category *',
        type: 'select',
        required: true,
        disabled: true,
        error: validationError?.supplier_type_id,
        helperText: validationError?.supplier_type_id,
        value: purchaseDetails.supplier_type_id || '',
        options: typeList || [],
        onChange: (e) => handleTypeChange(e, 'supplier_type_id'),
        sm: 12
    }]

    const payload16 = [{
        label: 'Contract no',
        type: 'input',
        value: purchaseDetails.contract,
        onChange: (e) => handleChange(e, 'contract'),
        sm: 12
    }]

    const payload1 = [
        {
            label: 'Supplier',
            type: 'autocomplete',
            value: supplier,
            labelprop: "supplier_name",
            options: supplierList || [],
            disabled: disableSupplier || parseInt(purchaseDetails.status) >= 3 ? true : false,
            onChange: handleSupplierChange,
        },
        {
            label: 'Supplier id',
            type: 'input',
            disabled: true,
            required: true,
            error: validationError?.supplier_id,
            helperText: validationError?.supplier_id,
            value: purchaseDetails.supplier_id || ''
        },
        {
            label: 'Supplier name',
            type: 'input',
            disabled: true,
            value: purchaseDetails.supplier_name || ''
        },
        {
            label: 'Supplier address',
            type: 'input',
            disabled: true,
            rows: 3,
            multiline: true,
            value: purchaseDetails.supplier_address_line1 + ', ' + purchaseDetails.supplier_address_line2 + ', ' + purchaseDetails.supplier_country + ', ' + purchaseDetails.supplier_state + ', ' + purchaseDetails.supplier_pincode + ', phone: ' + purchaseDetails.supplier_phone + ', mobile: ' + purchaseDetails.supplier_mobile + ', PAN no.: ' + purchaseDetails.supplier_panno + ', GST no.: ' + purchaseDetails.supplier_gstno || ''
        }
    ]
    const payload21 = documentsRequired.map(doc => {
        return {
            label: doc,
            type: "checkbox",
            checked: !!documents.find(val => val.doc_kind === doc)?.required,
            onChange: () => handleDocumentsRequiredChange(doc)
        }
    })
    let domesticDoc = documentsRequired;
    domesticDoc = domesticDoc.filter(item => item === "Invoice" || item === "Weight Certificate");
    const payload21D = domesticDoc.map(domesticDoc => {
        return {
            label: domesticDoc,
            type: "checkbox",
            checked: !!documents.find(doc => doc.doc_kind === domesticDoc)?.required,
            onChange: () => handleDocumentsRequiredChange(domesticDoc),

        }
    })

    const handlecurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'currency_id': value
        }
        setPurchaseDetails(data);
    }

    const handleQuantityChangeImport = (event, key) => {
        let error = { ...validationError };
        delete error.qty;
        setValidationError(error);

        var val = event.target.value >= 0 ? event.target.value : 0;
        const grossPrice = calculateGrossPrice(purchaseDetails?.purchase_price, val)
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.market_price, purchaseDetails?.purchase_price);
        let data = {
            ...purchaseDetails,
            "poMargin": poMargin,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            [key]: val
        }
        if (purchaseDetails.quotation !== '') {
            if (parseFloat(event.target.value) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
            } else {
                if (parseFloat(event.target.value) !== parseFloat(dispatchTotal)) {
                    // setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered 44' });
                    // setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered 44')
                } else {
                    if (validationError.qty) {
                        let error = { ...validationError };
                        delete error.qty;
                        setValidationError(error);
                        setValidationModal(false);
                    }
                }
            }
        }
        if (event.target.value > 0) {
            setShowDispatchInfo(true);
            setShowNoDispatchInfo(true);
            setShowDispatchTableInfo(true);
        } else {
            data = {
                ...data,
                'dispatch': '',
                'dispatchCount': ''
            }
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
        }
        setPurchaseDetails(data);
        if (dispatchTableData && showDispatchTableInfo) {
            let error = { ...validationError };
            delete error.qty;
            setValidationError(error);

            var totalDispatchQty = dispatchTableData?.map(row => parseInt(row["dispatch_quantity"])).reduce((sum, i) => sum + i, 0);
            if (parseFloat(event.target.value) !== parseFloat(totalDispatchQty)) {
            } else {
                if (parseFloat(purchaseDetails.po_qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                    setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                    setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
                } else {
                    if (validationError.qty) {
                        let error = { ...validationError };
                        delete error.qty;
                        setValidationError(error);
                    }
                }
            }
        }
        setPurchaseDetails(data);
    }
    const payload2 = [
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: 'label',
            options: currency || [],
            value: purchaseDetails.currency_id,
            onChange: handlecurrencyChange,
        },
        {
            label: 'Advance type',
            type: 'select',
            value: purchaseDetails.advance_type || '',
            options: advanceTypeList || [],
            onChange: (e) => handleChange(e, 'advance_type'),
        },
        {
            label: 'Advance',
            type: 'float',
            required: true,
            error: validationError?.advance,
            helperText: validationError?.advance,
            value: purchaseDetails.advance || '',
            onChange: (e) => handleChangeNumber(e, 'advance'),
        },
        {
            label: 'No of days IOM can be generated from date of invoice',
            type: 'number',
            required: true,
            error: validationError?.payment_terms_days,
            helperText: validationError?.payment_terms_days,
            value: purchaseDetails.payment_terms_days || '',
            onChange: (e) => handleChange(e, 'payment_terms_days'),
        }
    ];
    const payload3 = [
        {
            label: 'Billing at *',
            type: 'select',
            value: purchaseDetails.billing_at_id || '',
            options: billingAtList || [],
            required: true,
            error: validationError?.billing_at_id,
            helperText: validationError?.billing_at_id,
            onChange: (e) => handleAddressChange(e, 'billing_at_id'),
        },
        {
            label: 'Delivery at *',
            type: 'select',
            value: purchaseDetails.delivery_at_id || '',
            options: deliveryAtList || [],
            required: true,
            error: validationError?.delivery_at_id,
            helperText: validationError?.delivery_at_id,
            onChange: (e) => handleAddressChange(e, 'delivery_at_id'),
        },
        {
            label: 'Billing address',
            type: 'input',
            rows: 6,
            multiline: true,
            value: purchaseDetails.billing_at_address || '',
            onChange: (e) => handleChange(e, 'billing_at_address'),
        },
        {
            label: 'Delivery address',
            type: 'input',
            rows: 6,
            multiline: true,
            value: purchaseDetails.delivery_at_address || '',
            onChange: (e) => handleChange(e, 'delivery_at_address'),
        },
    ];

    const payload4 = [
        {
            label: purchaseDetails?.po_category === "ORM" ? "ORM Type" : 'Green coffee Type',
            type: 'autocomplete',
            labelprop: 'item_name',
            value: gc,
            options: gcTypeList || [],
            onChange: handleGCTypeChange,
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            required: true,
            error: validationError?.gcType,
            helperText: validationError?.gcType,
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload5 = [
        {
            label: 'Quotation no',
            type: 'autocomplete',
            labelprop: 'quotation_no',
            value: quoteNumber,
            options: quotationList || [],
            onChange: handleQuotationChange,
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Quotation date',
            type: 'datePicker',
            value: purchaseDetails.quot_date || null,
            onChange: (e) => handleDateChange(e, 'quot_date'),
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Price',
            type: 'float',
            value: purchaseDetails.quot_price || '',
            onChange: (e) => handleChangeNumber(e, 'quot_price'),
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload7 = [
        {
            label: 'Quantity(Kgs)',
            type: 'number',
            value: purchaseDetails.po_qty || '',
            error: validationError?.po_qty,
            helperText: validationError?.po_qty,
            onChange: purchaseDetails?.supplier_type_id === "1001" ?
                (e) => handleQuantityChangeImport(e, 'po_qty') : (e) => handleQuantityChange(e, 'po_qty'),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload8 = [
        {
            label: 'Dispatch type*',
            type: 'select',
            value: purchaseDetails?.dispatch_type === '' ? purchaseDetails.item_dispatch?.length > 1 ? "Multiple" : "Single" : purchaseDetails.dispatch_type,
            options: dispatchList || [],
            error: validationError?.dispatch_type,
            helperText: validationError?.dispatch_type,
            onChange: (e) => handleDispatchChange(e, 'dispatch_type'),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload9 = [
        {
            label: 'Dispatch count*',
            type: 'number',
            value: purchaseDetails.dispatch_count === '' ? purchaseDetails.item_dispatch?.length : purchaseDetails.dispatch_count,
            error: validationError?.dispatch_count,
            helperText: validationError?.dispatch_count,
            onChange: (e) => handleDispatchCountChange(e, 'dispatch_count'),
            onBlur: (e) => handleDispatchLinesChange(e),
            disabled: (purchaseDetails.status !== "1" && purchaseDetails.status !== "2"),
            md: 12,
            sm: 12,
            xs: 12
        }
    ]

    const payload10 = [
        {
            label: 'Taxes & Duties',
            type: 'input',
            value: purchaseDetails.taxes_duties || '',
            onChange: (e) => handleChange(e, 'taxes_duties'),
        },
        {
            label: 'Mode of transport',
            type: 'input',
            value: purchaseDetails.mode_of_transport || '',
            onChange: (e) => handleChange(e, 'mode_of_transport'),
        },
        {
            label: 'Transit insurance',
            type: 'input',
            value: purchaseDetails.transit_insurance || '',
            onChange: (e) => handleChange(e, 'transit_insurance'),
        },
        {
            label: 'Packing & Forwarding',
            type: 'input',
            value: purchaseDetails.packing_forwarding || '',
            onChange: (e) => handleChange(e, 'packing_forwarding'),
        }
    ]

    const payload15 = [
        {
            label: 'Purchase type',
            type: 'select',
            value: purchaseDetails.supplier_type_id === "1002" ? 'Fixed' : purchaseDetails.purchase_type || '',
            options: purchaseTypeList || [],
            disabled: purchaseDetails.supplier_type_id === "1002" ? true : false,
            onChange: (e) => handlePurchaseTypeChange(e, 'purchase_type'),
        },
        {
            label: 'Terminal month',
            type: 'datePicker',
            views: ['year', 'month'],
            format: "MM/yyyy",
            value: purchaseDetails.terminal_month || null,
            onChange: (e) => handleDateChange(e, 'terminal_month'),
        },
    ]
    const payload11 = [
        {
            label: 'Booked terminal Rate',
            type: 'float',
            value: purchaseDetails.booked_terminal_rate === undefined ? '' : purchaseDetails.booked_terminal_rate,
            disabled: !_.isEmpty(purchaseDetails?.fixed_terminal_rate) || purchaseDetails?.purchaseType === "Fixed",
            onChange: (e) => handleTerminalRateChange(e, 'booked_terminal_rate'),
        },
        {
            label: 'Booked differential',
            type: 'float',
            value: purchaseDetails.booked_differential,
            disabled: purchaseDetails.purchase_type === 'Fixed' ? true : false,
            onChange: (e) => handleDifferentialChange(e, 'booked_differential'),
        },
        {
            label: 'Fixed terminal Rate',
            type: 'float',
            value: purchaseDetails.fixed_terminal_rate === undefined ? '' : purchaseDetails.fixed_terminal_rate,
            onChange: (e) => handleTerminalRateChange(e, 'fixed_terminal_rate'),
        },
        {
            label: 'Fixed differential',
            type: 'float',
            value: purchaseDetails.fixed_differential,
            onChange: (e) => handleDifferentialChange(e, 'fixed_differential'),
        },
        {
            label: "Purchase price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.purchase_price || '',
            required: true,
            disaled: true,
            error: validationError?.purchase_price,
            helperText: validationError?.purchase_price,
            // onChange: (e) => handlePurchasePriceChange(e, 'purchase_price'),
        },
        {
            label: "Market price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.market_price || '',
            required: true,
            disabled: true,
            error: validationError?.market_price,
            helperText: validationError?.market_price,
            // onChange: (e) => handleMPChange(e, 'market_price'),
        },
        {
            label: 'PO margin',
            type: 'float',
            disabled: true,
            value: purchaseDetails.po_margin || '',
            onChange: (e) => handleChangeNumber(e, 'po_margin'),
        },
        {
            label: "Gross price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + ")" : "") : " (USD)"),
            type: 'float',
            value: purchaseDetails.grossPrice || '',
            disabled: true,
            required: true,
            error: validationError?.grossPrice,
            helperText: validationError?.grossPrice,
            onChange: (e) => handleChangeNumber(e, 'grossPrice'),
        },
        {
            label: "Total price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + ")" : "") : ' (USD)'),
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            required: true,
            disabled: true,
            error: validationError?.totalPrice,
            helperText: validationError?.totalPrice,
            onChange: (e) => handleChangeNumber(e, 'totalPrice'),
        },

    ]

    const payload14 = [
        // {
        //     label: 'Market price (INR/KG)',                                                         
        //     type: 'float',           
        //     value: purchaseDetails.marketPriceInr || '',                                   
        //     onChange: (e) => handleChange(e, 'marketPriceInr'),
        // }, 
        {
            label: 'Purchase price (INR/KG)',
            type: 'float',
            required: true,
            error: validationError?.purchase_price,
            helperText: validationError?.purchase_price,
            value: purchaseDetails.purchase_price || '',
            onChange: (e) => handlePurchasePriceInrChange(e, 'purchase_price'),
        },
        {
            label: 'Gross price (INR)',
            type: 'float',
            value: purchaseDetails.grossPrice || '',
            onChange: (e) => handleChangeNumber(e, 'grossPrice'),
        },
        {
            label: 'PO Value (INR)',
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            onChange: (e) => handleChangeNumber(e, 'totalPrice'),
        },
    ]
    const terminalPricePayload = [{
        label: 'Terminal (USD)',
        type: 'float',
        value: purchaseDetails.terminalPrice || '',
        onChange: (e) => handleChangeNumber(e, 'terminalPrice'),
        sm: 6,
    }]

    // eslint-disable-next-line
    const payload12 = [
        // {
        //     label: 'SGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.sgst,
        //     error: validationError?.sgst,
        //     helperText: validationError?.sgst,
        //     disabled: !_.isEmpty(purchaseDetails?.igst),
        //     onChange: (e) => handleTaxChange(e, 'sgst'),
        // },
        // {
        //     label: 'CGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.cgst,
        //     error: validationError?.cgst,
        //     helperText: validationError?.cgst,
        //     disabled: !_.isEmpty(purchaseDetails?.igst),
        //     onChange: (e) => handleTaxChange(e, 'cgst'),
        // },
        // {
        //     label: 'IGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.igst,
        //     disabled: !_.isEmpty(purchaseDetails?.cgst) || !_.isEmpty(purchaseDetails?.sgst),
        //     onChange: (e) => handleTaxChange(e, 'igst'),
        // },
        {
            label: 'TDS (%)',
            type: 'float',
            disabled: true,
            value: purchaseDetails.tds,
            onChange: (e) => handleTaxChange(e, 'tds'),
        }
    ];

    const handleincotermsidChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'incotermsid': value
        }
        setPurchaseDetails(data);
    };
    const handleinsuranceChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'insurance': value
        }
        setPurchaseDetails(data);
    };
    const handleDestinationChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'destination_port_name': value
        }
        setPurchaseDetails(data);
    };


    const handleoriginChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'origin': value
        }
        setPurchaseDetails(data);
    };
    const handleportsChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'ports': value
        }
        setPurchaseDetails(data);
    };
    const handlemode_of_transportChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'mode_of_transport': value
        }
        setPurchaseDetails(data);
    };
    const handlemode_of_packingChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'packing_type': value
        }
        setPurchaseDetails(data);
    };

    const handlecontainer_typeChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'container_type': value
        }
        setPurchaseDetails(data);
    };
    // const handleChangeotherCharges = (event, value) => {
    //     let data = {
    //         ...purchaseDetails,
    //         'otherCharges': value
    //     }
    //     setPurchaseDetails(data);
    // };

    const payload13 = [
        {
            label: 'Incoterm',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.incotermsid,
            options: incoterms || [],
            onChange: handleincotermsidChange,
        },
        {
            label: 'Origin',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.origin,
            options: originList || [],
            onChange: handleoriginChange,
        },
        {
            label: 'Port of loading',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.ports,
            options: loadingPortList || [],
            onChange: handleportsChange,
        },
        {
            label: 'Mode of transport',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.mode_of_transport,
            options: transportList || [],
            onChange: handlemode_of_transportChange,
        },
        {
            label: 'Type of packing',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails?.packing_type || 'Bags',
            options: packingType || [],
            onChange: handlemode_of_packingChange
        },
        {
            label: 'Insurance',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.insurance,
            options: insuranceList || [],
            onChange: handleinsuranceChange,
        },
        {
            label: 'Destination Port',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.destination_port_name,
            options: destinationPortList || [],
            onChange: handleDestinationChange //(e) => handleChange(e, 'destination'),
        },
        // {
        //     label: 'Destination Port',
        //     type: 'input',
        //     value: purchaseDetails.destination_port_name,
        //     onChange: (e) => handleChange(e, 'destination_port_name'),
        // },
        {
            label: 'Forwarding',
            type: 'input',
            value: purchaseDetails.forwarding,
            onChange: (e) => handleChange(e, 'forwarding'),
        },
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.currency_id,
            options: currency || [],
            onChange: handlecurrencyChange,
        },
        {
            label: 'No of bags',
            type: 'number',
            value: purchaseDetails.no_of_bags,
            onChange: (e) => handleChangeNumber(e, 'no_of_bags'),
        },
        {
            label: 'Net weight',
            type: 'float',
            value: purchaseDetails.net_weight,
            onChange: (e) => handleChangeNumber(e, 'net_weight'),
        },
        {
            label: 'No of containers',
            type: 'number',
            value: purchaseDetails.no_of_containers,
            onChange: (e) => handleChangeNumber(e, 'no_of_containers'),
        },
        {
            label: 'Payment terms',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.payment_terms,
            onChange: (e) => handleChange(e, 'payment_terms'),
        },
        {
            label: 'Container type',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.container_type,
            options: containerTypes || [],
            onChange: handlecontainer_typeChange,
        },
        {
            label: 'Comments',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.comments,
            onChange: (e) => handleChange(e, 'comments'),
        },
    ]
    // const payload18 = [
    //     {
    //         label: 'Other Charges/Vehicle',
    //         type: 'autocomplete',
    //         labelprop: 'label',
    //         value: otherCharges.item || '',
    //         options: chargesList || [],
    //         //    className: classes.modalSelect,             
    //         // onChange: (e) => handleChange(e, 'otherCharges'),
    //         onChange: handleOtherChargesChange,
    //         sm: 6
    //     },
    //     {
    //         label: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
    //         type: 'number',
    //         value: otherCharges.rate || '',
    //         className: classes.otherModal,
    //         // onChange: (e) => handleRateChange(e, 'rate'),
    //         onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         sm: 6
    //     },
    // ]

    // const payload19 = [
    //     {
    //         label: 'Other Charges/Vehicle',
    //         type: 'autocomplete',
    //         labelprop: "label",
    //         value: purchaseDetails.otherCharges || '',
    //         options: chargesList || [],
    //         onChange: handleChangeotherCharges,
    //         // onChange: (e) => handleOtherChargesChange(e, 'item'), 
    //         sm: 6
    //     },
    //     {
    //         label: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
    //         type: 'number',
    //         value: purchaseDetails.rate || '',
    //         className: classes.otherModal,
    //         onChange: (e) => handleRateChange(e, 'rate'),
    //         // onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         sm: 6
    //     },
    // ]
    const ormPurchasePayload = [{
        label: "Purchase Price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails?.purchase_price || '',
        required: true,
        onChange: (e) => handlePurchasePriceInrChange(e, "purchase_price"),
        error: validationError?.purchase_price,
        helperText: validationError?.purchase_price,
    },
    {
        label: "Gross price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails.grossPrice || '',
        disabled: true,
        required: true,
        error: validationError?.grossPrice,
        helperText: validationError?.grossPrice,
        onChange: (e) => handleChangeNumber(e, 'grossPrice'),
    },
    {
        label: "Total price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails.totalPrice || '',
        required: true,
        disabled: true,
        error: validationError?.totalPrice,
        helperText: validationError?.totalPrice,
        onChange: (e) => handleChangeNumber(e, 'totalPrice'),
    }]
    const payload36 = [
        {
            label: 'Fixation date',
            type: 'datePicker',
            value: purchaseDetails.fixation_date || null,
            onChange: (e) => handleDateChange(e, 'fixation_date'),
        }
    ];
    const payload20 = [
        {
            label: 'Comments',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.comments || '',
            onChange: (e) => handleChange(e, 'comments'),
            md: 6,
            sm: 6,
            xs: 6
        },
    ]

    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const dispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch Quantity(Kgs)', isEditable: true, type: 'number' },
        { id: 'dispatch_date', label: 'Dispatch Date', isEditable: true, type: 'date' }//, disablePastDates: true
    ];

    const displaydispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch Quantity(Kgs)' },
        { id: 'dispatch_date', label: 'Dispatch Date' }//, disablePastDates: true
    ];

    const gcTableVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO', clickable: true, onClick: (poid) => { navigate(routeBuilder('purchase-order', poid, 'view')) } },
        { id: 'po_createddt', label: 'PO Date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const gcTableOtherVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO', clickable: true, onClick: (poid) => { navigate(routeBuilder('purchase-order', poid, 'view')) } },
        { id: 'po_createddt', label: 'PO Date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const handleTaxClick = (index) => {
        let state = [...taxList];
        // eslint-disable-next-line
        // state.map((item, index1) => {
        //     if (index1 === index) {
        //         let temp = { ...purchaseDetails };
        //         delete purchaseDetails[item.name];
        //         setPurchaseDetails(temp);
        //     }
        // })
        // var isigst = taxList.findIndex((val, index1) => index1 === index);
        if (taxList[index]?.tax_name === 'igst') {
            setDomesticTaxesList(domesticAllTaxesList);
        }
        if (taxList[index]?.tax_name === 'cgst' && taxList.findIndex(val => val.tax_name === 'sgst') === -1) {
            setDomesticTaxesList(domesticAllTaxesList);
        }
        if (taxList[index]?.tax_name === 'sgst' && taxList.findIndex(val => val.tax_name === 'cgst') === -1) {
            setDomesticTaxesList(domesticAllTaxesList);
        }

        if (index !== -1) {
            state.splice(index, 1);
            console.log("index::", index, state)
            setTaxList(state);
        }

        if (state.length === 0) {
            // const totalPrice = calculateTotalPriceTax(0, otherChargesList);
            let data = {
                ...purchaseDetails,
                // 'totalPrice': totalPrice,
            }
            setPurchaseDetails(data);
        } else {
            // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
            let data = {
                ...purchaseDetails,
                // 'totalPrice': totalPrice,
            }
            setPurchaseDetails(data);
        }

    }
    // eslint-disable-next-line
    const calculateTotalPriceTax = (datas, otherChargesList = []) => {
        var data = purchaseDetails;
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_price || 0);
            return total;
        }, 0)
        const purPrice = data?.purchase_price; //purchaseDetails.supplier_type_id === "1001" ? data?.purchase_price : data?.purchasePriceInr;
        const amount = parseFloat(purPrice || 0) * (purchaseDetails.supplier_type_id === "1001" ? (parseFloat(data.po_qty || 0) / 1000) : parseFloat(data.po_qty));
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tds || 0) / 100));
        const tax = datas === 0 ? 0 : parseFloat(datas.reduce((total, currentValue) => total = total + currentValue.perc, 0));
        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        return taxedPrice + parseFloat(otherCharge);//
    }

    const taxTableColumns = [
        { id: 'tax_name', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'perc', label: 'Tax Value(%)', type: "number" },//, isEditable: true
        { id: "total_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
    ];

    const taxColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'mrin_date', label: 'MRIN Date' },
        { id: 'cgst_per', label: 'Tax (%)' },
    ];

    const mrinTableColumns = [
        { id: 'mrin_date', label: 'Date' },
        { id: 'mrin_no', label: 'MRIN' },
        { id: 'dispatch', label: 'Dispatch' },
        { id: 'expectedqty', label: 'Expected(Kgs)' },
        { id: 'deliveredqty', label: 'Delivered(Kgs)' },
        { id: 'balance_quantity', label: 'Balance Quantity(Kgs)' },
        { id: 'related_detid', label: 'Parent dispatch' },
        { id: 'apStatus', label: 'AP Status' },
        { id: 'qcStatus', label: 'QC Status' },
    ];

    const ocTableColumns = [
        { id: 'label', label: 'Item', },
        { id: 'rate', label: 'Value', type: "number" },//, isEditable: true
        { id: 'taxLabel', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'taxRate', label: 'Tax Value', type: "number" },//, isEditable: true
        { id: "total_price", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", handler: { handleClick } }
    ];
    const calculateTotalPrice = (data, otherChargesList = []) => {
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_price || 0);
            return total;
        }, 0)
        const purPrice = data?.purchase_price; //purchaseDetails.supplier_type_id === "1001" ? data?.purchase_price : data?.purchasePriceInr;
        const amount = parseFloat(purPrice || 0) * (purchaseDetails.supplier_type_id === "1001" ? (parseFloat(data.po_qty || 0) / 1000) : parseFloat(data.po_qty));
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tds || 0) / 100));
        // const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0); taxList
        const tax = parseFloat(taxList.reduce((total, currentValue) => total = total + currentValue.perc, 0));
        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        return taxedPrice + parseFloat(otherCharge);
    }
    const OtherChargesAction = async () => {
        let splicedList = tempOtherChargesList;
        splicedList.splice(tempOtherChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            return {
                name: list.item, label: _.find(chargesList, { value: list.item })?.label, rate: list.rate,
                tax: list.tax, taxLabel: _.find(taxesList, { value: list.tax })?.label, taxRate: list.taxRate,
                total_price: ((1 + parseFloat(list.taxRate || 0) / 100) * parseFloat(list.rate || 0)).toFixed(2)
            }
        })
        let data = { ...purchaseDetails };
        // eslint-disable-next-line
        state.map((item, index) => {
            data[item.name] = item.rate;
        })
        // const totalPrice = purchaseDetails?.supplier_type_id === "1001" ?
        //     calculateTotalPriceImport(purchaseDetails?.grossPrice, purchaseDetails?.taxes, state) :
        //     calculateTotalPrice(data, state)
        // await setPurchaseDetails({ ...data, totalPrice });
        setOtherChargesList(state);
        setTempOtherChargesList([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }])
        setOpenOtherCharges(!openOtherCharges)
        // rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0));

    }
    const getOtherChargesPayload = (charge, index) => {
        return [
            {
                label: 'Other Charges/Vehicle',
                type: 'select',
                value: charge.item,
                options: chargesList || [],
                error: !!charge.error,
                helperText: charge.error,
                onChange: (e) => handleTempOtherChargeChange(e, 'item', index),
                key: index,
                sm: 3
            },
            {
                label: purchaseDetails.type === '1002' ? 'Value(INR)' : 'Value',
                type: 'number',
                value: charge.rate,
                className: classes.otherModal,
                onChange: (e) => handleTempOtherChargeChange(e, 'rate', index),
                key: index,
                sm: 2
            },
            {
                label: 'Taxes',
                type: 'select',
                options: taxesList || [],
                value: charge.tax,
                className: classes.otherModal,
                onChange: (e) => handleTempOtherChargeChange(e, 'tax', index),
                key: index,
                sm: 3
            },
            {
                label: 'Tax(%)',
                type: 'number',
                value: charge.taxRate,
                className: classes.otherModal,
                onChange: (e) => handleTempOtherChargeChange(e, 'taxRate', index),
                sm: 2,
                key: index,
            },
            {
                label: tempOtherChargesList.length === index + 1 ? 'Add' : 'Delete',
                type: 'button',
                className: classes.button,
                onClick: tempOtherChargesList.length === index + 1 ? () => handleOtherCharge(true) :
                    () => handleOtherCharge(false, index),
                disabled: !!charge.error && tempOtherChargesList.length === index + 1,
                sm: 1
            },
        ]
    }
    const handleOtherCharge = (add, index) => {
        let temp = _.cloneDeep(tempOtherChargesList);
        if (add) {
            // const index = temp.find(val => val.item === otherCharge.item);
            // if (index > -1) {
            //     temp[index] = otherCharge;
            // }
            // else {
            //     temp.push(otherCharge);
            // }
            temp.push({ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" });
            // setOtherCharge({ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" });
        }
        else {
            temp.splice(index, 1)
        }
        setTempOtherChargesList(temp);
    }
    const handleTempOtherChargeChange = (event, key, index) => {
        var value = (key === "rate" || key === "taxRate") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempOtherChargesList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempOtherChargesList(temp);
    }
    const otherChargesHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Other Charges/Vehicle</h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={6} md={12} container direction="column">
                    {tempOtherChargesList.map((charge, index) => <Template payload={getOtherChargesPayload(charge, index)} key={index} justify={"space-around"} align={"center"} />)}
                    {/* <Template payload={payload18} /> */}
                </Grid>
            </Grid>
            <Grid
                id="top-row"
                container
                spacing={24}
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button label="Save" onClick={OtherChargesAction} disabled={tempOtherChargesList.some(charge =>
                        !!charge.error)} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => {
                        setTempOtherChargesList([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }]);
                        setOpenOtherCharges(!openOtherCharges);
                    }} />
                </Grid>
            </Grid>
        </Container>
    );
    const addOtherChargesHandler = () => {
        let tempOtherCharges = _.cloneDeep(otherChargesList)?.map(charge => {
            return {
                item: charge.name,
                rate: charge.rate,
                tax: charge.tax,
                taxRate: charge.taxRate,

            }
        });
        setTempOtherChargesList([...tempOtherCharges, ...tempOtherChargesList]);
        setOpenOtherCharges(!openOtherCharges)
    }

    const handleTempTaxChargeChange = (event, key, index) => {
        var value = (key === "perc") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempTaxChargesList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempTaxChargesList(temp);
    }

    const getTaxChargesPayload = (charge, index) => {
        return [
            {
                label: 'Taxes',
                type: 'select',
                options: domesticTaxesList || [],
                value: charge.tax_id,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempTaxChargeChange(e, 'tax_id', index),
                key: index,
                sm: 6
            },
            {
                label: 'Tax(%)',
                type: 'number',
                value: charge.perc,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempTaxChargeChange(e, 'perc', index),
                sm: 3,
                key: index,
            },
            {
                label: tempTaxChargesList.length === index + 1 ? 'Add' : 'Delete',
                type: 'button',
                className: classes.button,
                onClick: tempTaxChargesList.length === index + 1 ? () => handleTaxCharge(true, index, charge) :
                    () => handleTaxCharge(false, index, charge),
                disabled: !!charge.error && tempTaxChargesList.length === index + 1,
                sm: 3
            },
        ]
    }

    const handleTaxCharge = (add, index, charges) => {
        let temp = _.cloneDeep(tempTaxChargesList);

        if (tempTaxChargesList.find(val => val.tax_id !== '1')) {
            var cgstVal = domesticTaxesList.find(val => val.label === 'CGST')?.value;
            var sgstVal = domesticTaxesList.find(val => val.label === 'SGST')?.value;
            var igstVal = domesticTaxesList.find(val => val.label === 'IGST')?.value;

            var iscgst = temp.findIndex(val => val.tax_id === cgstVal);
            var issgst = temp.findIndex(val => val.tax_id === sgstVal);
            var isigst = temp.findIndex(val => val.tax_id === igstVal);

            if (add) {
                const emptyItemIndex = temp.findIndex(charge => charge.tax_id !== '1' && (charge.tax_id === "" || charge.perc === ""));
                // console.log('temp::223', tempTaxChargesList.find(val => val.tax_id !== '1'), emptyItemIndex, temp);
                if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
                else {
                    let temp1 = [...domesticTaxesList];
                    let filterTemp = [];

                    filterTemp = temp1.filter(function (el) { return el.value !== charges?.tax; });
                    if (iscgst !== -1 || issgst !== -1) {

                        filterTemp = temp1.filter(function (el) { return el.label !== "IGST"; });
                    }
                    if (isigst !== -1) {
                        filterTemp = temp1.filter(function (el) { return el.label !== "SGST" && el.label !== "CGST"; });
                    }

                    setDomesticTaxesList(filterTemp);
                    temp.push({ tax_id: "", perc: "" });
                }
            } else {
                console.log('temp11::', domesticTaxesList, charges, tempTaxChargesList)
                let domTemp = domesticTaxesList.find(val => val.value === charges.tax)?.label;
                if (domTemp === 'IGST') {
                    setDomesticTaxesList(domesticAllTaxesList);
                }
                if (domTemp === 'CGST' && issgst === -1) {
                    setDomesticTaxesList(domesticAllTaxesList);
                }
                if (domTemp === 'SGST' && iscgst === -1) {
                    setDomesticTaxesList(domesticAllTaxesList);
                }
                temp.splice(index, 1);
            }
            setTempTaxChargesList(temp);
        }
    }

    const taxChargesHandler = () => (
        <Container className={classes.modal1}>
            <h2 id="simple-modal-title">Tax Details</h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={8} md={12} container direction="column">
                    {/* eslint-disable-next-line               */}
                    {tempTaxChargesList.map((charge, index) => {
                        if (charge.tax_id !== "1") {
                            console.log('temp::2223', charge, charge.tax_id)
                            return (
                                <Template payload={getTaxChargesPayload(charge, index)} key={index} justify={"space-around"} align={"center"} />
                            )
                        }
                    })}
                    {/* <Template payload={payload18} /> */}
                </Grid>
            </Grid>
            <Grid
                id="top-row"
                container
                spacing={24}
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button label="Save" onClick={TaxChargesAction} disabled={tempTaxChargesList.some(charge =>
                        !!charge.error)} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => {
                        setTempTaxChargesList([{ tax_id: "", perc: "" }]);
                        setOpenTaxCharges(!openTaxCharges);
                    }} />
                </Grid>
            </Grid>
        </Container>
    );

    const TaxChargesAction = async () => {
        let splicedList = tempTaxChargesList;
        splicedList.splice(tempTaxChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            if (list.tax_id !== '1') {
                return {
                    // name: list.item, label: _.find(domesticTaxesList, { value: list.item })?.label, rate: list.rate,
                    tax_id: list.tax_id, tax_name: _.find(domesticTaxesList, { value: list.tax_id })?.label.toLowerCase(), perc: list.perc, total_rate: ((parseFloat(purchaseDetails?.grossPrice) * parseFloat(list.perc)) / 100).toString(),
                    // total_tax_rate: ((1 + parseFloat(list.taxRate || 0) / 100) * parseFloat(list.rate || 0)).toFixed(2)
                }
            } else {
                return { tax_id: '1', tax_name: 'tds', perc: list.perc }
            }
        })
        console.log('state::', state)
        // let data = { ...purchaseDetails };
        // eslint-disable-next-line
        // state.map((item, index) => {
        //     data[item?.tax_name] = item?.perc;
        // })
        // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
        // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
        let data = {
            ...purchaseDetails,
            // 'totalPrice': totalPrice,
        }
        setPurchaseDetails(data);

        // let totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList);
        // await setPurchaseDetails({ ...data, totalPrice });
        setTaxList(state);
        setTempTaxChargesList([{ tax_id: "", perc: "" }])
        // let tempstate = state.push({ tax_id: "", perc: "" });
        // console.log('state::1', state)
        // setTempTaxChargesList(state);
        setOpenTaxCharges(!openTaxCharges)
        // rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0));
    }
    const approvePo = async (e) => {
        try {
            let status = parseInt(purchaseDetails.status) === 1 ? "changeToPendingStatus" : parseInt(purchaseDetails.status) === 3 ? "changeToclosedStatus" : "changeToInprogessStatus";
            let response = await updateGCPoStatus({
                "type": status,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "po_id": purchaseDetails.poid,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                setSnack({
                    open: true,
                    message: parseInt(purchaseDetails.status) === 1 ? "PO sent for request approval" : parseInt(purchaseDetails.status) === 3 ? "PO closed successfully" : "PO approved successfully",
                });
                setTimeout(() => {
                    navigate(-1, { replace: true })
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

    const sendEmail = async (e) => {
        try {
            let response = await updateGCPoStatus({
                "notify_email": true,
                "vendor_email": JSON.parse(localStorage.getItem('preference')).name,
                po_id: purchaseDetails.poid,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "Email Sent Successfully"
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

    const purchaseSteps = ['Req Approval', 'Approve', 'In Progress', 'Shipped', 'Close Order'];

    const dispatchInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Dispatch information</Typography>
                </Grid>
            </Grid>
            <DispatchList data={dispatchTableData} mrin={mrinTableData} dispatchDetails={(event, data) => ShowDispatchDetailsHandler(event, data)} />
        </Container>
    );
    const ShowDispatchDetailsHandler = (event, data) => {
        setShowDispatchDetails(true);
        setDispatchDetails(data)
    };

    const HideDispatchDetailsHandler = (event, data) => {
        setShowDispatchDetails(false);
    };

    const taxrateUpdate = (total, otherChargesList) => {
        // const totalPrice =  calculateTotalPrice(total, otherChargesList)
        let data = {
            ...purchaseDetails,
            // 'totalPrice': totalPrice,
        }
        setPurchaseDetails(data);
    }

    const addTaxHandler = () => {
        let tempTaxCharges = _.cloneDeep(taxList)?.map(charge => {
            return {
                tax_id: charge.tax_id,
                perc: charge.perc,

            }
        });
        console.log('state::2', tempTaxCharges)
        setTempTaxChargesList([...tempTaxCharges, ...tempTaxChargesList]);
        setOpenTaxCharges(!openTaxCharges)
    }

    let component;
    if (showDispatchDetails) {
        component = <DispatchDetails details={dispatchDetails} expComposition={purchaseDetails.gcCompositions} back={HideDispatchDetailsHandler}></DispatchDetails>
    } else {
        component = (
            <form className={classes.root} noValidate autoComplete="off">
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Card className="page-header">
                    <CardHeader
                        title=" Purchase Order Details"
                        className='cardHeader'
                    />
                    <CardContent>
                        <Grid container md={12}>
                            <Grid container md={8}>
                                <Grid item md={4} xs={12} >
                                    <Typography variant="h7">PO no</Typography>
                                    <Typography>{poid}</Typography>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography variant="h7">PO date</Typography>
                                    <Typography>{formatDate((purchaseDetails?.po_date))}</Typography>
                                </Grid>
                                <Grid item md={4} xs={12}>
                                    <Typography variant="h7">PO category</Typography>
                                    <Typography>{(purchaseDetails?.po_category)}</Typography>
                                </Grid>
                            </Grid>
                            {parseInt(purchaseDetails.status) === 1 &&
                                <Grid container md={4} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Request Approval" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                            {parseInt(purchaseDetails.status) === 2 &&
                                <Grid container md={4} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Approve" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                            {(parseInt(purchaseDetails.status) === 3 || parseInt(purchaseDetails.status) === 4) &&
                                <Grid container md={2} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Send Email" onClick={sendEmail} />
                                    </Grid>
                                </Grid>
                            }
                            {parseInt(purchaseDetails.status) === 4 && stepProgress === "100%" &&
                                <Grid container md={2} justify="flex-end" style={{ display: 'flex' }}>
                                    <Grid item>
                                        <Button label="Close Order" onClick={approvePo} />
                                    </Grid>
                                </Grid>
                            }
                        </Grid>
                        <Grid container md={12}>
                            <Grid item md={3} xs={6} >
                                <SimplePopper linkLabel="Dispatch information" body={dispatchInfo} linkRef={dispatchInfoRef}></SimplePopper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card className="page-header">
                    <CardContent>
                        <Grid container md={12}>
                            <Grid item md={12} xs={12} >
                                {activeStep !== -1 ?
                                    <SimpleStepper activeStep={activeStep} completeStep={activeStep} steps={purchaseSteps} activeStepProgress={stepProgress}></SimpleStepper> : 'Loading ...'
                                }
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Purchase order information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={12}>
                                <Template payload={payload} />
                            </Grid>
                            <Grid item md={6} xs={12}>
                                <Template payload={payload17} />
                                {
                                    showContractInfo && <Template payload={payload16} />
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Vendor/Supplier information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Template payload={payload1} />
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
                            <Template payload={payload2} />
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
                            <Template payload={payload13} />
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
                        <Template payload={payload3} />
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>{purchaseDetails?.po_category === "ORM" ? "ORM Information" : "Green coffee information"}</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={6} xs={6}>
                                <Template payload={payload4} />
                                {
                                    showQuoteInfo &&
                                    <Template payload={payload5} />
                                }
                                {
                                    purchaseDetails.item_id &&
                                    <Template payload={payload7} />
                                }
                                {
                                    showDispatchInfo &&
                                    <Template payload={payload8} />
                                }
                                {
                                    showNoDispatchInfo &&
                                    <Template payload={payload9} />
                                }
                                {
                                    showDispatchTableInfo &&
                                    <Grid item style={{ marginTop: 15 }}>
                                        <BasicTable rows={dispatchTableData}
                                            columns={purchaseDetails.status === "1" || purchaseDetails.status === "2" ? dispatchTableColumns :
                                                displaydispatchTableColumns}
                                            hasTotal={purchaseDetails.status === "1" || purchaseDetails.status === "2" ? true : false}
                                            totalColId="dispatch_quantity" onUpdate={dispatchDataUpdate}></BasicTable>
                                    </Grid>
                                }

                                {
                                    purchaseDetails.gcType && purchaseDetails?.po_category !== "ORM" &&
                                    <Grid item style={{ marginTop: 15, marginRight: 30 }}>
                                        <Accordion defaultExpanded={true}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                                                <Grid id="top-row" container>
                                                    <Grid item md={12} xs={12} className='item'>
                                                        <Typography>Specification information</Typography>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <BasicTable rows={purchaseDetails.gcCompositions} columns={gcTableColumns} hasTotal={false}></BasicTable>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                }


                            </Grid>
                            <Grid item md={6} xs={6}>
                                {
                                    purchaseDetails.item_id &&
                                    <>
                                        <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                            <Typography>Historical price data for selected vendor</Typography>
                                        </Grid>
                                        <BasicTable rows={vendorPriceList} columns={gcTableVendorPriceColumns}></BasicTable>
                                    </>
                                }
                                {
                                    purchaseDetails.item_id &&
                                    <>
                                        <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                            <Typography>Historical price data for other vendors</Typography>
                                        </Grid>
                                        <BasicTable rows={otherVendorPriceList} columns={gcTableOtherVendorPriceColumns}></BasicTable>
                                    </>
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
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
                {
                    purchaseDetails.item_id && purchaseDetails.supplier_type_id === "1002" &&
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
                            {/* <Template payload={payload12} /> */}
                            <Grid item md={12} xs={12}>

                                <>
                                    <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                                        <Button label="Add Tax Information" onClick={addTaxHandler} />
                                    </Grid>

                                    <BasicTable rows={taxList} columns={taxTableColumns} colSpan={2} onUpdate={taxrateUpdate} hasTotal={true} totalColId='total_rate'></BasicTable>
                                </>
                                <Template payload={payload12} />
                            </Grid>

                        </AccordionDetails>
                    </Accordion>
                }
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Price information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container md={12} xs={12}>
                            <Grid item md={12} xs={12}>
                                {purchaseDetails?.po_category !== "ORM" && <Template payload={payload15} />}
                                {
                                    purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category !== "ORM" &&
                                    < Template payload={payload11} />
                                }
                                {
                                    purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category === "ORM" &&
                                    <Template payload={ormPurchasePayload} />
                                }
                                {
                                    purchaseDetails?.po_category !== "ORM" && <Template payload={payload36} />
                                }
                                {
                                    purchaseDetails.supplier_type_id === "1002" &&
                                    <Template payload={purchaseDetails?.po_category === "ORM" ? payload14 : terminalPricePayload.concat(payload14)} />
                                }
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Other Charges/Vehicle</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid item md={12} xs={12}>

                            <>
                                <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                                    <Button label="Add Other Charges" onClick={addOtherChargesHandler} />
                                </Grid>
                                <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} totalColId="total_price" rowlength={otherChargesList.length} colSpan={4} onUpdate={rateUpdate}></BasicTable>
                            </>
                            {/* {purchaseDetails.supplier_type_id === "1001" && <Template payload={payload19} />} */}
                            {/* <Template payload={payload18 }/> */}
                            <Template payload={payload20} />
                        </Grid>
                    </AccordionDetails>
                </Accordion>



                {purchaseDetails.supplier_type_id !== "1001" && (
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Other information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={payload10} />
                        </AccordionDetails>
                    </Accordion>
                )}


                {/* {purchaseDetails.supplier_type_id === "1001" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Document information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <DocumentList data={documents} edit={true} uploadFile={(event, fileContent, docName, fileName) => uploadFileHandler(event, fileContent, docName, fileName)} downloadFile={(event, fileName, docName) => downloadFileHandler(event, fileName, docName)} deleteFile={(event, fileName) => deleteFileHandler(event, fileName)} />
                        </AccordionDetails>
                    </Accordion>
                } */}
                {(purchaseDetails.supplier_type_id === "1001" || purchaseDetails.supplier_type_id === "1002") && (
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Documents Required </Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Template payload={purchaseDetails.supplier_type_id === "1001" ? payload21 : payload21D} />
                        </AccordionDetails>
                    </Accordion>
                )}
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
                        <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createPurchaseAction} />
                    </Grid>
                    <Grid item>
                        <Button label="Cancel" onClick={() => navigate(-1, { replace: true })} />
                    </Grid>
                </Grid>
                <SimpleModal open={validationModal} handleClose={() => setValidationModal(!validationModal)} body={createAction} />
                <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />
                <SimpleModal open={openTaxCharges} handleClose={() => setOpenTaxCharges(!openTaxCharges)} body={taxChargesHandler} />

            </form>
        )
    }
    return (<>
        {component}
    </>
    )
}
export default EditPurchaseOrder;