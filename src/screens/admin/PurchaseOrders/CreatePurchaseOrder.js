import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { getPOCreationInfo, getPoCreationInfo, getQuotesInfo, createGCPurchaseOrders, getGCApprovedQuotes, getTopApprovedPOs, getTopMrinDetails, getPortAndOriginForPo, getBalQuoteQtyForPoOrder } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';
import useToken from '../../../hooks/useToken';
import SimpleModal from '../../../components/Modal';
import { colors } from '../../../constants/colors';
import { numberWithCommas } from '../../common';
import Utility from '../../../utils/utility';
import { useNavigate } from 'react-router-dom';
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

const CreatePurchaseOrder = (props) => {
    const documents = ["Invoice", "Packing List", "Bill of Lading", "Phytosanitory Certificate",
        "Fumigation Certificate", "Certificate of Origin", "ICO Certificate of Origin", "Weight Certificate", "Quality Certificate", "Inspection and Stuffing Certificate", "Bill of Entry",
        "Dispatch Note", "Transaction Certificate", "Scope Certificate"]
    const classes = useStyles();
    const navigate = useNavigate();
    const [purchaseDetails, setPurchaseDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [supplier, setSupplier] = useState(null);
    const [greencType, setgreencType] = useState(null);
    const [disableSupplier, setDisableSupplier] = useState(true);
    const [validationModal, setValidationModal] = useState(false);
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
    const [billingAddressList, setBillingAddressList] = useState([]);
    const [deliveryAddressList, setDeliveryAddressList] = useState([]);
    const [billingAtList, setBillingAtList] = useState([]);
    const [deliveryAtList, setDeliveryAtList] = useState([]);
    const [quotationList, setQuotationList] = useState([]);
    const [dispatchList, setDispatchList] = useState([]);
    const [dispatchTableData, setDispatchTableData] = useState([]);
    const [currency, setCurrency] = useState([]);
    const [categorySelectedType, setCategorySelectedType] = useState('');
    const [containerTypes, setContainerTypes] = useState([]);
    const [incoterms, setIncoTerms] = useState([]);
    const [loadingPortList, setLoadingPortList] = useState([]);
    const [destinationPortList, setDestinationPortList] = useState([]);
    const [originList, setOriginList] = useState([]);
    const [chargesList, setChargesList] = useState([]);
    const [taxesList, setTaxesList] = useState([]);
    const [domesticTaxesList, setDomesticTaxesList] = useState([]);
    const [domesticAllTaxesList, setDomesticAllTaxesList] = useState([])
    const [transportList, setTransportList] = useState([]);
    const [packingType, setPackingType] = useState([]);
    const [insuranceList, setInsuranceList] = useState([]);
    const [showQuoteInfo, setShowQuoteInfo] = useState(false);
    const [showCategory, setShowCategory] = useState(true);
    const [showContractInfo, setShowContractInfo] = useState(false);
    const [showDispatchInfo, setShowDispatchInfo] = useState(false);
    const [showNoDispatchInfo, setShowNoDispatchInfo] = useState(false);
    const [showDispatchTableInfo, setShowDispatchTableInfo] = useState(false);
    const [confirmationCatChange, setConfirmationCatChange] = useState(false);
    const [currencyCodes, setCurrencyCodes] = useState([]);
    const [purchase_qty, setPurchase_qty] = useState('0');
    const [dispatchTotal, setDispatchTotal] = useState('0');
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [openTaxCharges, setOpenTaxCharges] = useState(false);
    const [taxList, setTaxList] = useState([]);
    const [otherChargesList, setOtherChargesList] = useState([]);
    const [tempOtherChargesList, setTempOtherChargesList] = useState([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }]);
    const [tempTaxChargesList, setTempTaxChargesList] = useState([{ tax_id: "", perc: "" }]);
    // const [otherCharges, setOtherCharges] = useState({});
    // const [otherCharge, setOtherCharge] = useState({});
    const [documentsection, setDocumentSection] = useState(documents.map(val => {
        return {
            doc_kind: val,
            required: false,
        }
    }));
    // const [otherChargesRate, setOtherChargesRate] = useState(""); 
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");
    const [loading, setLoading] = useState(false);
    const [disableCreate, setDisableCreate] = useState(false);
    const { getCurrentUserDetails } = useToken();

    useEffect(() => {
        getPOCreationInfo({ "type": "posubcategory" }).then(res => {
            setTypeList(formatToSelection(res, "supplier_type_name", "supplier_type_id"));
        });
        getPOCreationInfo({ "type": "getDomesticTaxes" }).then(res => {
            console.log('res::tax', res);
            setDomesticTaxesList(formatToSelection(res, "tax_name", "tax_id"))
            setDomesticAllTaxesList(formatToSelection(res, "tax_name", "tax_id"))
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
        getPOCreationInfo({ "type": "getTaxes" }).then(res => {
            setTaxesList(formatToSelection(res, "tax_name", "tax_id"))
        });
        getPOCreationInfo({ "type": "miscCharges" }).then(res => {
            setChargesList(formatToSelection(res, "misc_charges_name", "misc_id"))
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
        setTransportList(formatToSelection([{ id: "By Sea", label: "By Sea" }, { id: "By Air", label: "By Air" }, { id: "By Road", label: "By Road" }], "label", "id"))
        setPackingType(formatToSelection([{ id: "Bulk", label: "Bulk" }, { id: "Bags", label: "Bags" }], "label", "id"))
        setInsuranceList(formatToSelection([{ id: "By Supplier", label: "By Supplier" }, { id: "By Self", label: "By Self" }], "label", "id"))
        setDispatchList(formatToSelection([{ id: "Single", label: "Single" }, { id: "Multiple", label: "Multiple" }], "label", "id"));
        setPurchaseTypeList(formatToSelection([{ id: "Fixed", label: "Fixed" }, { id: "Differential", label: "Differential" }], "label", "id"))
        getQuotesInfo({ "type": "incoterms" }).then(res => setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));
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
            ...purchaseDetails,
            [key]: val
        }
        setPurchaseDetails(data);
    };

    const handleCategoryChange = (event, key) => {
        getPOCreationInfo({
            "type": "greencoffee", item_type: event.target.value,
            po_subcategory: purchaseDetails.type === '1002' ? 'Domestic' : 'Import'
        }).then(res => {
            setgcTypeList(res === null ? [] : res);
        });

        if (purchaseDetails.gcType !== undefined && purchaseDetails.gcType !== '') {
            setCategorySelectedType(event.target.value)
            setConfirmationCatChange(true);
            return
        } else {
            let data = {};
            if (event.target.value === "ORM") {
                data = {
                    ...purchaseDetails,
                    [key]: event.target.value,
                    "bookedTerminalRate": purchaseDetails.purchasePrice,
                    "bookedDifferential": 0,
                    "fixedTerminalRate": purchaseDetails.purchasePrice,
                    "fixedDifferential": 0
                }
            } else {
                data = {
                    ...purchaseDetails,
                    [key]: event.target.value
                }
            }
            getPOCreationInfo({
                "type": "allsuppliers", "supplier_type_id": purchaseDetails.type,
                item_type: event.target.value
            }).then(res => {
                setSupplierList(res);
            });
            setPurchaseDetails(data);
        }
    };

    const clearGreenCoffee = () => {
        setgreencType(null);
        let data = {};
        if (categorySelectedType === "ORM") {
            data = {
                ...purchaseDetails,
                "category": categorySelectedType,
                "bookedTerminalRate": purchaseDetails.purchasePrice,
                "bookedDifferential": 0,
                "fixedTerminalRate": purchaseDetails.purchasePrice,
                "fixedDifferential": 0,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
        } else {
            data = {
                ...purchaseDetails,
                'category': categorySelectedType,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
        }

        setPurchaseDetails(data);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);
        setConfirmationCatChange(!confirmationCatChange)
    }

    const handleTypeChange = (event, key) => {

        getPOCreationInfo({ "type": "greencoffee", item_type: purchaseDetails.category, po_subcategory: event.target.value === '1002' ? 'Domestic' : 'Import' }).then(res => {
            res === null ? setgcTypeList([]) : setgcTypeList(res);
        });
        let datas = {
            // ...purchaseDetails,
            // "gcType": '',
            // "gcCompositions": [],
            // "quotation": '',
            // "quotationDate": null,
            [key]: event.target.value,
            // "supplierName": '',
            // "supplierId": '',
            // "supplierAddress": '',
            "currency": event.target.value === '1002' ? 'HO-101' : '',
            "importCurrency": event.target.value === '1001' ? 'HO-102' : ''
        }
        setPurchaseDetails(datas);
        setgreencType(null);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);

        getPOCreationInfo({ "type": "allsuppliers", "supplier_type_id": event.target.value }).then(res => {
            setSupplierList(res);
        });
        // let data = {
        //     ...purchaseDetails,
        //     [key]: event.target.value,           
        //     "supplierName": '',
        //     "supplierId": '',
        //     "supplierAddress": '',
        //     "currency": event.target.value === '1002' ? 'HO-101' : ''
        // }
        // setPurchaseDetails(data);
        setSupplier(null);
        setShowCategory(false);
        setDisableSupplier(false);
        if (event.target.value === "1001") {
            setShowContractInfo(true);
        } else {
            setShowContractInfo(false);
        }
    };

    const formatPriceInfo = (payload = []) => {
        const updatedPayload = payload?.forEach(element => {
            element.po_createddt = element.po_createddt ? formatDate(element.po_createddt) : '';
            element.price = element.price ? numberWithCommas(parseFloat(element.price).toFixed(2)) : '';
            return element;
        })
        return updatedPayload ?? [];
    };

    const handleSupplierChange = async (event, value) => {
        if (!value) {
            setSupplier(null);
            let data = {
                ...purchaseDetails,
                "supplierName": '',
                "supplierId": '',
                "supplierAddress": ''
            }
            setPurchaseDetails(data);
            return;
        }
        setSupplier(value);
        setgreencType(null);
        let temp = {
            ...purchaseDetails,
            "gcType": '',
            "gcCompositions": [],
            "quotation": '',
            "quotationDate": null
        }
        // setPurchaseDetails(data);
        setShowQuoteInfo(false);
        setShowDispatchInfo(false);
        setShowNoDispatchInfo(false);
        setShowDispatchTableInfo(false);

        getPOCreationInfo({ "type": "supplierinfo", "supplier_id": value.supplier_id }).then(res => {
            let data = {
                ...temp,
                "supplierName": res.supplier_name,
                "supplierId": res.supplier_id,
                "supplierAddress": res.supplier_address,
                "currency": res.supplier_type === "Domestic" ? "HO-101" : '',
                "tds": res?.tds,
            }
            setPurchaseDetails(data);
            getTopApprovedPOs({
                "type": "top3apprPosforselectedvendor",
                "vendor_id": value.supplier_id,
                "gcitem_id": ''
            }).then(res => {
                setVendorPriceList(formatPriceInfo(res));
            });
        });
    };
    console.log("Vendor price list is", vendorPriceList);
    const handleAddressChange = (event, key,) => {
        let data = {};
        if (key === "billingAt") {
            let res = billingAddressList.find(loc => loc.billing_at_id === event.target.value)
            let resArray = [res?.billing_com_name, res?.billing_at_addressline1, res?.billing_at_addressline2,
            [res?.billing_state, res?.billing_country, res?.billing_zipcode].filter(Boolean).join(', '),
            [res?.billing_at_gstno, res?.billing_at_panno].filter(Boolean).join(', '),
            ].filter(Boolean).join('\n');
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "billingAddress": resArray
            }
        } else if (key === "deliveryAt") {
            let res = deliveryAddressList.find(loc => loc.delivery_at_id === event.target.value)
            let resArray = [res?.delivery_com_name, res?.delivery_at_addressline1, res?.delivery_at_addressline2,
            [res?.delivery_state, res?.delivery_country, res?.delivery_zipcode].filter(Boolean).join(', '),
            [res?.delivery_at_gstno, res?.delivery_at_panno].filter(Boolean).join(', '),
            ].filter(Boolean).join('\n');
            data = {
                ...purchaseDetails,
                [key]: event.target.value,
                "deliveryAddress": resArray
            }
        }
        setPurchaseDetails(data);
    };
    const formatGCCompositions = (compostion = {}) => {
        return [
            { composition_name: "Density(Gm/Cc)", composition_rate: compostion.density },
            { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
            { composition_name: "Sound Beans (%)", composition_rate: compostion.soundbeans },
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

    const handleGCTypeChange = (event, value) => {
        let data;
        if (!value) {
            setgreencType(null);

            data = {
                ...purchaseDetails,
                "gcType": '',
                "gcCompositions": [],
                "quotation": '',
                "quotationDate": null
            }
            setPurchaseDetails(data);
            setShowQuoteInfo(false);
            setShowDispatchInfo(false);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(false);
            return;
        }

        setgreencType(value);

        getPOCreationInfo({ "type": "gccomposition", "item_id": value.item_id }).then(res => {
            data = {
                ...purchaseDetails,
                "gcType": value.item_id,
                "gcCompositions": res ? formatGCCompositions(res[0]) : null,
                "quotation": '',
                "quotationDate": null,
                "qty": '',
                "price": '',
                "dispatch": '',
                "dispatchCount": ''
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
                "po_date": currentPODate(),
            }).then(res => {
                setQuotationList(res);
                setShowQuoteInfo(true);
            });
        } else {
            setShowQuoteInfo(false);
        }
        getTopApprovedPOs({
            "type": "top3apprPosforselectedvendor",
            "vendor_id": purchaseDetails.supplierId,
            "gcitem_id": value.item_id
        }).then(res => {
            setVendorPriceList(formatPriceInfo(res));
        });
        getTopApprovedPOs({
            "type": "top3apprPosforothervendor",
            "vendor_id": purchaseDetails.supplierId,
            "gcitem_id": value.item_id
        }).then(res => {
            setOtherVendorPriceList(formatPriceInfo(res));
        });
        getTopMrinDetails({
            "type": "topmrinrecord",
            "gcitem_id": value.item_id,
            "po_date": purchaseDetails.poDate || new Date()
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
    const calculateTotalPrice = (data, otherChargesList = []) => {
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_tax_rate || 0);
            return total;
        }, 0)
        const purPrice = purchaseDetails.type === "1001" ? data?.purchasePrice : data?.purchasePriceInr;
        console.log("Purc price", purPrice, data.qty);
        const amount = parseFloat(purPrice || 0) *
            (purchaseDetails.type === "1001" ? (parseFloat(data.qty || 0) / 1000) : parseFloat(data.qty));
        console.log('Amount is', amount);
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tds || 0) / 100));
        console.log('Tds price', tdsDeductedPrice);
        // const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0);
        const tax = parseFloat(taxList.reduce((total, currentValue) => total = total + currentValue.perc, 0));
        console.log("Tax is", tax);

        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        console.log("Taxed price", taxedPrice);
        return taxedPrice + parseFloat(otherCharge);
    }

    console.log("Purchase details are", purchaseDetails);
    const handleQuantityChange = (event, key,) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        let totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList);
        if (purchaseDetails.quotation !== '') {
            if (parseFloat(val) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
            } else {
                if (parseFloat(val) !== parseFloat(dispatchTotal)) {
                    setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                    setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
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
        let data = {
            ...purchaseDetails,
            [key]: val,
            "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(val)),
            "totalPrice": purchaseDetails.type === "1002" ? totalPriceInr :
                ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(val / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
        }
        if (val > 0) {
            setShowDispatchInfo(true);
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
            var totalDispatchQty = dispatchTableData?.map(row => parseInt(row["dispatchqty"])).reduce((sum, i) => sum + i, 0);
            if (parseFloat(val) > parseFloat(totalDispatchQty)) {
                setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            } else {
                if (parseFloat(purchaseDetails.qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
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

    // const handleOtherChargesChange = (event, key) => {
    //     let temp = chargesList.find(data => data.value === event.target.value)
    //     setOtherCharges({
    //         ...otherCharges,
    //         "item": event.target.value,
    //         "label": temp.label
    //     })
    // }

    // const handleOtherRateChange = (event, key) => {
    //     setOtherCharges({
    //         ...otherCharges,
    //         "rate": event.target.value
    //     })
    // }

    // const handleRateChange = (event, key) => {
    //     const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: event.target.value }, otherChargesList)
    //     let data = {
    //         ...purchaseDetails,
    //         "totalPrice": purchaseDetails.type === "1002" ? totalPriceInr :
    //             ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(purchaseDetails.qty / 1000)) + (event.target.value ? parseFloat(event.target.value) : 0)),
    //         [key]: event.target.value
    //     }
    //     setPurchaseDetails(data);
    // }

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

    const calculatePurchasePrice = (terminalRate, differentialRate) => {
        return parseFloat(terminalRate || 0) + parseFloat(differentialRate || 0);
    }
    const calculateGrossPrice = (purchasePrice, qty) => {
        return parseFloat(purchasePrice || 0) * parseFloat(qty || 0) / 1000;
    }
    const calculateTotalPriceImport = (grossPrice, taxes, otherChargesList) => {
        let otherCharges = (otherChargesList)?.reduce((total, current) => {
            total = total + parseFloat(current.total_tax_rate || 0);
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
        else if (purchaseType === "Differential" && fixedTerminal)
            return fixedTerminal
        else return bookedTerminal;
    }
    const handleTerminalRateChange = (event, key) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        const marketPrice = val;
        const purchaseType = purchaseDetails?.purchaseType;
        const fixedTerminalValue = key === "fixedTerminalRate" ? event.target.value : purchaseDetails?.fixedTerminalRate;
        const bookedTerminalValue = key === "bookedTerminalRate" ? event.target.value : purchaseDetails?.bookedTerminalRate;
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseType, fixedTerminalValue, bookedTerminalValue),
            purchaseType === "Fixed" ? purchaseDetails?.fixedDifferential :
                purchaseDetails?.bookedDifferential);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(marketPrice, purchasePrice);
        let data = {
            ...purchaseDetails,
            "purchasePrice": purchasePrice,
            "marketPrice": marketPrice,
            "grossPrice": grossPrice,
            "poMargin": poMargin,
            "totalPrice": totalPrice,
            [key]: val
        }

        setPurchaseDetails(data);
    };
    const handlePurchaseTypeChange = (event, key) => {
        const marketPrice = event.target.value === "Fixed" ?
            purchaseDetails?.fixedTerminalRate : purchaseDetails?.bookedTerminalRate
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseDetails?.purchaseType, purchaseDetails?.fixedTerminalRate,
            purchaseDetails?.bookedTerminalRate), event.target.value === "Fixed" ?
            purchaseDetails?.fixedDifferential : purchaseDetails?.bookedDifferential);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.marketPrice, purchasePrice);
        let data = {
            ...purchaseDetails,
            [key]: event.target.value,
            "purchasePrice": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "poMargin": poMargin,
            "marketPrice": marketPrice
        }
        setPurchaseDetails(data);
    }
    const handleDifferentialChange = (event, key) => {
        // var val = event.target.value >= 0 ? event.target.value : 0;
        const purchaseType = purchaseDetails?.purchaseType;
        const purchasePrice = calculatePurchasePrice(getTerminalValue(purchaseType,
            purchaseDetails?.fixedTerminalRate, purchaseDetails?.bookedTerminalRate), event.target.value);
        const grossPrice = calculateGrossPrice(purchasePrice, purchaseDetails?.qty);
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.marketPrice, purchasePrice);
        let data = {
            ...purchaseDetails,
            "purchasePrice": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "poMargin": poMargin,
            "fixedDifferential": event.target.value,
            "bookedDifferential": event.target.value
        }
        setPurchaseDetails(data);
    };

    const handleQuantityChangeImport = (event, key) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        const grossPrice = calculateGrossPrice(purchaseDetails?.purchasePrice, val)
        const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList);
        const poMargin = calculatePOMargin(purchaseDetails?.marketPrice, purchaseDetails?.purchasePrice);
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
                    setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                    setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
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
            var totalDispatchQty = dispatchTableData?.map(row => parseInt(row["dispatchqty"])).reduce((sum, i) => sum + i, 0);
            if (parseFloat(event.target.value) > parseFloat(totalDispatchQty)) {
                setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
                setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            } else {
                if (parseFloat(purchaseDetails.qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
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

    const handlePurchasePriceInrChange = (event, key) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        const totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList)
        const qty = parseFloat(purchaseDetails.qty === undefined ? 0 : purchaseDetails.qty);
        let data = {
            ...purchaseDetails,
            "grossPrice": parseFloat(val) * (purchaseDetails?.type === "1001" ? qty / 1000 : qty),
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
            tabledata[0] = { "number": (1).toString(), "dispatch_quantity": 0, "date": new Date() };
            setDispatchTableData(tabledata);
            setShowNoDispatchInfo(false);
            setShowDispatchTableInfo(true);
        }
        setPurchaseDetails(data);

    };

    const handlecurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'currency': value
        }
        setPurchaseDetails(data);
    }

    const handleDispatchCountChange = (event, key) => {
        let data = {
            ...purchaseDetails,
            [key]: Utility.convertToPositive(event.target.value)
        }
        setPurchaseDetails(data);
        if (event.target.value > 99 || event.target.value < 1) {
            setValidationError({ dispatchCount: 'Please enter valid details: 1 - 99' });
            return;
        } else {
            if (validationError.dispatchCount) {
                let error = { ...validationError };
                delete error.dispatchCount;
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
                "dispatch_quantity": dispatchTableData?.[index]?.dispatch_quantity || 0,
                "date": dispatchTableData?.[index]?.date || new Date()
            };
        }
        setDispatchTableData(tabledata);
    }
    const handleQuotationChange = (event, value) => {
        const totalPriceInr = calculateTotalPrice(purchaseDetails, otherChargesList)
        getBalQuoteQtyForPoOrder({ "type": "getBalqtyforPo", "quotation_no": value?.quotation_no }).then((res) => {
            var qty_gc = (res.order_qty === '') ? value?.qty : (value?.qty - res.order_qty);
            setPurchase_qty(qty_gc);
            let data = {
                ...purchaseDetails,
                'quotation': value?.quotation_no,
                'quotationId': value?.quotation_id,
                'quotationDate': value?.quotation_date,
                'price': value?.price,
                'qty': qty_gc,
                "grossPrice": (parseFloat(purchaseDetails.purchasePriceInr === undefined ? 0 : purchaseDetails.purchasePriceInr) * parseFloat(value?.qty)),
                'totalPrice': purchaseDetails.type === "1002" ? totalPriceInr :
                    ((parseFloat(purchaseDetails.purchasePrice === undefined ? 0 : purchaseDetails.purchasePrice) * parseFloat(value?.qty / 1000)) + (purchaseDetails.rate ? parseFloat(purchaseDetails.rate) : 0)),
            }
            if (value?.qty > 0) {
                setShowDispatchInfo(true);
            }
            setPurchaseDetails(data);
            setQuoteNumber(value);
        });
    };

    const dispatchDataUpdate = (total) => {
        setDispatchTotal(total);
        if (parseFloat(purchaseDetails.qty) !== parseFloat(total)) {
            setValidationError({ ...validationError, "qty": 'Total Dispatch Quatity not matches Quantity entered' });
            setErrorValidationMessage('Total Dispatch Quatity not matches Quantity entered')
            return;
        } else {
            if (parseFloat(purchaseDetails.qty) > parseFloat(purchase_qty) && parseFloat(purchase_qty) !== 0) {
                setValidationError({ ...validationError, "qty": `You cannot enter value more than ${purchase_qty} for this PO` });
                setErrorValidationMessage(`You cannot enter value more than ${purchase_qty} for this PO`);
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

    const rateUpdate = (total, otherChargesList) => {
        // const totalPrice = purchaseDetails?.type === "1001" ?
        //     calculateTotalPriceImport(purchaseDetails?.grossPrice, purchaseDetails?.taxes, otherChargesList) :
        //     calculateTotalPrice(purchaseDetails, otherChargesList)
        let data = {
            ...purchaseDetails,
            // 'totalPrice': totalPrice,
        }
        setPurchaseDetails(data);
    }

    const taxrateUpdate = (total, otherChargesList) => {
        // const totalPrice =  calculateTotalPrice(purchaseDetails, otherChargesList)
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
        console.log("index::", index, taxList)
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
            setTaxList(state);
        }
        // console.log("rate::", state?.map(row => parseInt(row.perc)).reduce((sum, i) => sum + i, 0), state)
        if (state.length === 0) {
            // const totalPrice = calculateTotalPriceTax(0, otherChargesList);
            // console.log('totalPrice::', state, totalPrice)
            let data = {
                ...purchaseDetails,
                // 'totalPrice': totalPrice,
            }
            setPurchaseDetails(data);
        } else {
            // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
            // console.log('totalPrice::', state, totalPrice)
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
            total = total + parseFloat(current.total_tax_rate || 0);
            return total;
        }, 0)
        const purPrice = purchaseDetails.type === "1001" ? data?.purchasePrice : data?.purchasePriceInr;
        console.log("Purc price", purPrice, data.qty);
        const amount = parseFloat(purPrice || 0) *
            (purchaseDetails.type === "1001" ? (parseFloat(data.qty || 0) / 1000) : parseFloat(data.qty));
        console.log('Amount is', amount);
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tds || 0) / 100));
        console.log('Tds price', tdsDeductedPrice);
        // const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0);
        const tax = datas === 0 ? 0 : parseFloat(datas.reduce((total, currentValue) => total = total + currentValue.perc, 0));
        console.log("Tax is", tax);

        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        console.log("Taxed price", taxedPrice);
        return taxedPrice + parseFloat(otherCharge);
    }

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getFullYear();
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

    const createActionForCatChange = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Confirmation
            </h2>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={6} md={10} container direction="column">
                    If you change PO Category, then Green Coffee Details will reset. <br /><br />
                    Are You want to change PO category?
                </Grid>
            </Grid>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Yes" onClick={() => clearGreenCoffee()} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setConfirmationCatChange(!confirmationCatChange)} />
                </Grid>
            </Grid>
        </Container>
    );

    const currentDate = () => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date();
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
    }

    const currentPODate = () => {
        // 2019-07-25 17:31:46.967
        var dateVal = new Date();
        return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate();
    }

    const payload = [
        {
            label: 'PO date',
            type: 'datePicker',
            required: true,
            error: validationError?.poDate,
            helperText: validationError?.poDate,
            value: purchaseDetails.poDate ? purchaseDetails.poDate : currentDate(),
            onChange: (e) => handleDateChange(e, 'poDate'),
            sm: 12
        },
        {
            label: 'PO category *',
            type: 'select',
            value: purchaseDetails.category || '',
            required: true,
            disabled: showCategory,
            error: validationError?.category,
            helperText: validationError?.category,
            options: categoryList || [],
            onChange: (e) => handleCategoryChange(e, 'category'),
            sm: 12
        },
    ];

    const payload17 = [{
        label: 'PO sub category *',
        type: 'select',
        required: true,
        error: validationError?.type,
        helperText: validationError?.type,
        value: purchaseDetails.type || '',
        options: typeList || [],
        onChange: (e) => handleTypeChange(e, 'type'),
        sm: 12
    }];

    const payload16 = [{
        label: 'Contract no',
        type: 'input',
        value: purchaseDetails.contract,
        onChange: (e) => handleChange(e, 'contract'),
        sm: 12
    }];

    const payload1 = [
        {
            label: 'Supplier',
            type: 'autocomplete',
            value: supplier,
            labelprop: "supplier_name",
            options: supplierList || [],
            disabled: disableSupplier,
            onChange: handleSupplierChange,
        },
        {
            label: 'Supplier id',
            type: 'input',
            disabled: true,
            required: true,
            error: validationError?.supplierId,
            helperText: validationError?.supplierId,
            value: purchaseDetails.supplierId || ''
        },
        {
            label: 'Supplier name',
            type: 'input',
            disabled: true,
            value: purchaseDetails.supplierName || ''
        },
        {
            label: 'Supplier address',
            type: 'input',
            disabled: true,
            rows: 3,
            multiline: true,
            value: purchaseDetails.supplierAddress || ''
        }
    ];

    const payload2 = [
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: 'label',
            options: currency || [],
            value: purchaseDetails.currency || '',
            onChange: handlecurrencyChange
        },
        {
            label: 'Advance type',
            type: 'select',
            value: purchaseDetails.advanceType || '',
            options: advanceTypeList || [],
            onChange: (e) => handleChange(e, 'advanceType'),
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
            label: 'NO of days IOM can be generated from date of invoice',
            type: 'number',
            required: true,
            error: validationError?.iom,
            helperText: validationError?.iom,
            value: purchaseDetails.iom || '',
            onChange: (e) => handleChangeNumber(e, 'iom'),
        }
    ];

    const payload3 = [
        {
            label: 'Billing at *',
            type: 'select',
            value: purchaseDetails.billingAt || '',
            options: billingAtList || [],
            required: true,
            error: validationError?.billingAt,
            helperText: validationError?.billingAt,
            onChange: (e) => handleAddressChange(e, 'billingAt'),
        },
        {
            label: 'Delivery at *',
            type: 'select',
            value: purchaseDetails.deliveryAt || '',
            options: deliveryAtList || [],
            required: true,
            error: validationError?.deliveryAt,
            helperText: validationError?.deliveryAt,
            onChange: (e) => handleAddressChange(e, 'deliveryAt'),
        },
        {
            label: 'Billing address',
            type: 'input',
            rows: 6,
            multiline: true,
            value: purchaseDetails.billingAddress || '',
            onChange: (e) => handleChange(e, 'billingAddress'),
        },
        {
            label: 'Delivery address',
            type: 'input',
            rows: 6,
            multiline: true,
            value: purchaseDetails.deliveryAddress || '',
            onChange: (e) => handleChange(e, 'deliveryAddress'),
        },
    ];
    const payload4 = [
        {
            label: purchaseDetails?.category === "ORM" ? "ORM type" : 'Green coffee type',
            type: 'autocomplete',
            labelprop: 'item_name',
            value: greencType,
            options: gcTypeList || [],
            required: true,
            error: validationError?.gcType,
            helperText: validationError?.gcType,
            onChange: handleGCTypeChange,
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload5 = [
        {
            label: 'Quotation no',
            type: 'autocomplete',
            labelprop: 'quotation_no',
            value: quoteNumber,
            options: quotationList || [],
            onChange: handleQuotationChange,
            md: 12,
            sm: 12,
            xs: 12
        },
        // {
        //     label: 'Quotation Id',                                                         
        //     type: 'input',           
        //     value: purchaseDetails.quotationId || '',
        //     disabled: true,
        //     md: 12,
        //     sm:12,
        //     xs:12
        // },
        {
            label: 'Quotation date',
            type: 'datePicker',
            value: purchaseDetails.quotationDate || null,
            disabled: true,
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: 'Price',
            type: 'float',
            value: purchaseDetails.price || '',
            onChange: (e) => handleChangeNumber(e, 'price'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload7 = [
        {
            label: 'Quantity(Kgs)*',
            format: 'thousandSeperator',
            type: 'number',
            value: purchaseDetails.qty === 0 ? '0' : purchaseDetails.qty,
            error: validationError?.qty,
            helperText: validationError?.qty,
            onChange: purchaseDetails?.type === "1001" ?
                (e) => handleQuantityChangeImport(e, 'qty') : (e) => handleQuantityChange(e, 'qty'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload8 = [
        {
            label: 'Dispatch type*',
            type: 'select',
            value: purchaseDetails.dispatch || '',
            options: dispatchList || [],
            error: validationError?.dispatch,
            helperText: validationError?.dispatch,
            onChange: (e) => handleDispatchChange(e, 'dispatch'),
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload9 = [
        {
            label: 'Dispatch count*',
            type: 'number',
            value: purchaseDetails.dispatchCount || '',
            error: validationError?.dispatchCount,
            helperText: validationError?.dispatchCount,
            onChange: (e) => handleDispatchCountChange(e, 'dispatchCount'),
            onBlur: (e) => handleDispatchLinesChange(e),
            md: 12,
            sm: 12,
            xs: 12
        }
    ];

    const payload10 = [
        {
            label: 'Taxes & Duties',
            type: 'input',
            value: purchaseDetails.taxesDuties || '',
            onChange: (e) => handleChange(e, 'taxesDuties'),
        },
        {
            label: 'Mode of transport',
            type: 'input',
            value: purchaseDetails.modeOfTransport || '',
            onChange: (e) => handleChange(e, 'modeOfTransport'),
        },
        {
            label: 'Transit insurance',
            type: 'input',
            value: purchaseDetails.transitInsurance || '',
            onChange: (e) => handleChange(e, 'transitInsurance'),
        },
        {
            label: 'Packing & Forwarding',
            type: 'input',
            value: purchaseDetails.packing || '',
            onChange: (e) => handleChange(e, 'packing'),
        }
    ];

    const payload15 = [
        {
            label: 'Purchase type',
            type: 'select',
            value: purchaseDetails.type === "1002" ? 'Fixed' : purchaseDetails.purchaseType || '',
            options: purchaseTypeList || [],
            disabled: purchaseDetails.type === "1002" ? true : false,
            onChange: (e) => handlePurchaseTypeChange(e, 'purchaseType'),
        },
        {
            label: 'Terminal month',
            type: 'datePicker',
            format: "MM/yyyy",
            views: ['year', 'month'],
            value: purchaseDetails.terminalMonth || null,
            onChange: (e) => handleDateChange(e, 'terminalMonth'),
        }
    ];
    // const handleORMPurchasePriceChange = (e) => {
    //     const grossPrice = calculateGrossPrice(e.target.value, purchaseDetails?.qty);
    //     const totalPrice = calculateTotalPriceImport(grossPrice, purchaseDetails?.taxes, otherChargesList)
    //     const data = {...purchaseDetails, grossPrice:}
    // }

    //dbo.sales_quotation_details_rawmeterial_rates_new
    const payload11 = [
        {
            label: 'Booked terminal rate',
            type: 'float',
            disabled: !_.isEmpty(purchaseDetails?.fixedTerminalRate) || purchaseDetails?.purchaseType === "Fixed",
            value: purchaseDetails.bookedTerminalRate,
            onChange: (e) => handleTerminalRateChange(e, 'bookedTerminalRate'),
        },
        // {
        //     label: 'Fixed date',
        //     type: 'datePicker',
        //     value: purchaseDetails.fixedDate,
        //     onChange: (e) => handleDateChange(e, 'fixedDate'),
        // },
        {
            label: 'Booked differential',
            type: 'float',
            value: purchaseDetails.bookedDifferential || '',
            disabled: purchaseDetails?.purchaseType === "Fixed",
            onChange: (e) => handleDifferentialChange(e, 'bookedDifferential'),
        },
        {
            label: 'Fixed terminal rate',
            type: 'float',
            value: purchaseDetails.fixedTerminalRate || '',
            onChange: (e) => handleTerminalRateChange(e, 'fixedTerminalRate'),
        },
        {
            label: 'Fixed differential',
            type: 'float',
            value: purchaseDetails?.fixedDifferential || '',
            onChange: (e) => handleDifferentialChange(e, 'fixedDifferential'),
        },
        {
            label: "Purchase Price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails?.purchasePrice || '',
            required: true,
            disabled: true,
            error: validationError?.purchasePrice,
            helperText: validationError?.purchasePrice,
        },
        {
            label: "Market price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails?.marketPrice || '',
            required: true,
            disabled: true,
            error: validationError?.marketPrice,
            helperText: validationError?.marketPrice,
            // onChange: (e) => handleMPChange(e, 'marketPrice'),
        },
        {
            label: 'PO margin',
            type: 'float',
            value: purchaseDetails.poMargin || '',
            disabled: true,
            onChange: (e) => handleChangeNumber(e, 'poMargin'),
        },
        {
            label: "Gross price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.grossPrice || '',
            disabled: true,
            required: true,
            error: validationError?.grossPrice,
            helperText: validationError?.grossPrice,
            onChange: (e) => handleChangeNumber(e, 'grossPrice'),
        },
        {
            label: "Total price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
            type: 'float',
            value: purchaseDetails.totalPrice || '',
            required: true,
            disabled: true,
            error: validationError?.totalPrice,
            helperText: validationError?.totalPrice,
            onChange: (e) => handleChangeNumber(e, 'totalPrice'),
        },
    ];
    const ormPurchasePayload = [{
        label: "Purchase Price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails?.purchasePrice || '',
        required: true,
        onChange: (e) => handlePurchasePriceInrChange(e, "purchasePrice"),
        error: validationError?.purchasePrice,
        helperText: validationError?.purchasePrice,
    },
    {
        label: "Gross price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails.grossPrice || '',
        disabled: true,
        required: true,
        error: validationError?.grossPrice,
        helperText: validationError?.grossPrice,
    },
    {
        label: "Total price" + (purchaseDetails.category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
        type: 'float',
        value: purchaseDetails.totalPrice || '',
        required: true,
        disabled: true,
        error: validationError?.totalPrice,
        helperText: validationError?.totalPrice,
    }]

    const payload36 = [
        {
            label: 'Fixation date',
            type: 'datePicker',
            value: purchaseDetails.fixation || null,
            onChange: (e) => handleDateChange(e, 'fixation'),
        }
    ];

    const payload14 = [
        {
            label: 'Purchase price (INR/KG)',
            type: 'float',
            value: purchaseDetails.purchasePriceInr || '',
            onChange: (e) => handlePurchasePriceInrChange(e, 'purchasePriceInr'),
            sm: 6
        },
        {
            label: 'Gross price (INR)',
            type: 'float',
            disabled: true,
            value: purchaseDetails.grossPrice || '',
            sm: 6
        },
        {
            label: 'PO Value (INR)',
            type: 'float',
            disabled: true,
            value: purchaseDetails.totalPrice || '',
            sm: 6
        }
    ];
    const terminalPricePayload = [{
        label: 'Terminal (USD)',
        type: 'float',
        value: purchaseDetails.terminalPrice || '',
        onChange: (e) => handleChangeNumber(e, 'terminalPrice'),
        sm: 6,
    }];

    const payload12 = [
        // {
        //     label: 'SGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.sgst,
        //     error: validationError?.sgst,
        //     helperText: validationError?.sgst,
        //     onChange: (e) => handleTaxChange(e, 'sgst'),
        //     disabled: !_.isEmpty(purchaseDetails?.igst),
        // },
        // {
        //     label: 'CGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.cgst,
        //     error: validationError?.cgst,
        //     helperText: validationError?.cgst,
        //     onChange: (e) => handleTaxChange(e, 'cgst'),
        //     disabled: !_.isEmpty(purchaseDetails?.igst),
        // },
        // {
        //     label: 'IGST (%)',
        //     type: 'float',
        //     value: purchaseDetails.igst,
        //     onChange: (e) => handleTaxChange(e, 'igst'),
        //     disabled: !_.isEmpty(purchaseDetails?.sgst) || !_.isEmpty(purchaseDetails?.cgst)
        // },
        {
            label: 'TDS (%)',
            type: 'float',
            disabled: true,
            value: purchaseDetails.tds || '',
            onChange: (e) => handleTaxChange(e, 'tds'),
        }
    ];

    const handleimportCurrencyChange = (e, value) => {
        let data = {
            ...purchaseDetails,
            'importCurrency': value
        }
        setPurchaseDetails(data);
    }

    const handleincotermsidChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'incoterm': value
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
            'portOfLoading': value
        }
        setPurchaseDetails(data);
    };
    const handleDestinationChange = (event, value) => {
        let data = {
            ...purchaseDetails,
            'destination': value
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
            'containerType': value
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
            value: purchaseDetails.incoterm,
            options: incoterms || [],
            onChange: handleincotermsidChange
        },
        {
            label: 'Origin',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.origin,
            options: originList || [],
            onChange: handleoriginChange
        },
        {
            label: 'Port of loading',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.portOfLoading,
            options: loadingPortList || [],
            onChange: handleportsChange
        },
        {
            label: 'Mode of transport',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.mode_of_transport,
            options: transportList || [],
            onChange: handlemode_of_transportChange
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
            onChange: handleinsuranceChange
        },
        {
            label: 'Destination Port',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.destination,
            options: destinationPortList || [],
            onChange: handleDestinationChange //(e) => handleChange(e, 'destination'),
        },
        {
            label: 'Forwarding',
            type: 'input',
            value: purchaseDetails.forwarding,
            onChange: (e) => handleChange(e, 'forwarding'),
        },
        {
            label: 'Currency',
            type: 'autocomplete',
            labelprop: 'label',
            value: purchaseDetails.importCurrency,
            options: currency || [],
            onChange: handleimportCurrencyChange,
        },
        {
            label: 'No of bags',
            type: 'number',
            value: purchaseDetails.noofbags,
            onChange: (e) => handleChangeNumber(e, 'noofbags'),
        },
        {
            label: 'Net weight',
            type: 'float',
            value: purchaseDetails.netweight,
            onChange: (e) => handleChangeNumber(e, 'netweight'),
        },
        {
            label: 'No of containers',
            type: 'number',
            value: purchaseDetails.noofContainers,
            onChange: (e) => handleChangeNumber(e, 'noofContainers'),
        },
        {
            label: 'Payment terms',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.paymentTerms,
            onChange: (e) => handleChange(e, 'paymentTerms'),
        },
        {
            label: 'Container type',
            type: 'autocomplete',
            labelprop: "label",
            value: purchaseDetails.containerType,
            options: containerTypes || [],
            onChange: handlecontainer_typeChange
        },
        {
            label: 'Comments',
            type: 'input',
            rows: 3,
            multiline: true,
            value: purchaseDetails.comments,
            onChange: (e) => handleChange(e, 'comments'),
        },
    ];



    const payload20 = [
        {
            label: 'Comments',
            type: 'input',
            rows: 4,
            multiline: true,
            value: purchaseDetails.comments || '',
            onChange: (e) => handleChange(e, 'comments'),
        },
    ];
    const handleDocSectionChange = (label) => {
        const tempDocuments = _.cloneDeep(documentsection);
        const index = tempDocuments.findIndex(doc => doc.doc_kind === label);
        tempDocuments[index].required = !tempDocuments[index]?.required
        setDocumentSection(tempDocuments);
    }
    const payload21 = documents.map(document => {
        return {
            label: document,
            type: "checkbox",
            checked: !!documentsection.find(doc => doc.doc_kind === document)?.required,
            onChange: () => handleDocSectionChange(document),

        }
    })
    let domesticDoc = documents;
    domesticDoc = domesticDoc.filter(item => item === "Invoice" || item === "Weight Certificate");
    const payload21D = domesticDoc.map(domesticDoc => {
        return {
            label: domesticDoc,
            type: "checkbox",
            checked: !!documentsection.find(doc => doc.doc_kind === domesticDoc)?.required,
            onChange: () => handleDocSectionChange(domesticDoc),

        }
    })
    const handleTempOtherChargeChange = (event, key, index) => {
        var value = (key === "rate" || key === "taxRate") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempOtherChargesList);
        // let doesItemExist;
        // if (key === "item") {
        // doesItemExist = temp.findIndex(val => val.item === value);
        // if (doesItemExist > -1) {
        //     temp[index].error = "Item name already exists";
        // }
        // else {
        temp[index].error = null;
        // }
        // }
        temp[index][key] = value;
        setTempOtherChargesList(temp);
    }
    const handleTempTaxChargeChange = (event, key, index) => {
        var value = (key === "perc") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempTaxChargesList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempTaxChargesList(temp);
    }

    const handleOtherCharge = (add, index) => {
        let temp = _.cloneDeep(tempOtherChargesList);
        if (add) {
            const emptyItemIndex = temp.findIndex(charge => !charge.taxRate || charge.taxRate === "");
            if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
            else temp.push({ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" });
        }
        else {
            temp.splice(index, 1)
        }
        setTempOtherChargesList(temp);
    }

    const handleTaxCharge = (add, index, charges) => {
        let temp = _.cloneDeep(tempTaxChargesList);
        var cgstVal = domesticTaxesList.find(val => val.label === 'CGST')?.value;
        var sgstVal = domesticTaxesList.find(val => val.label === 'SGST')?.value;
        var igstVal = domesticTaxesList.find(val => val.label === 'IGST')?.value;

        var iscgst = temp.findIndex(val => val.tax_id === cgstVal);
        var issgst = temp.findIndex(val => val.tax_id === sgstVal);
        var isigst = temp.findIndex(val => val.tax_id === igstVal);

        if (add) {
            const emptyItemIndex = temp.findIndex(charge => !charge.tax_id || charge.perc === "");
            if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
            else {
                let temp1 = [...domesticTaxesList];
                let filterTemp = [];

                filterTemp = temp1.filter(function (el) { return el.value !== charges?.tax; });
                console.log('temp::123', iscgst, issgst);
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

    const getOtherChargesPayload = (charge, index) => {
        return [
            {
                label: 'Other Charges/Vehicle',
                type: 'select',
                value: charge.item,
                options: chargesList || [],
                //  className: classes.modalSelect,         
                // onChange: (e) => handleChange(e, 'otherCharges'), 
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
                // onChange: (e) => handleRateChange(e, 'rate'),
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
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempOtherChargeChange(e, 'tax', index),
                key: index,
                sm: 3
            },
            {
                label: 'Tax(%)',
                type: 'number',
                value: charge.taxRate,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
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

    // const payload18 = [
    //     {
    //         label: 'Other Charges/Vehicle',
    //         type: 'select',
    //         value: otherCharge.item,
    //         options: chargesList || [],
    //         //  className: classes.modalSelect,         
    //         // onChange: (e) => handleChange(e, 'otherCharges'), 
    //         onChange: (e) => handleOtherChargesChange(e, 'item'),
    //         sm: 3
    //     },
    //     {
    //         label: purchaseDetails.type === '1002' ? 'Rate(INR)' : 'Rate',
    //         type: 'number',
    //         value: otherCharge?.rate,
    //         className: classes.otherModal,
    //         // onChange: (e) => handleRateChange(e, 'rate'),
    //         onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         sm: 2
    //     },
    //     {
    //         label: 'Taxes',
    //         type: 'select',
    //         options: [],
    //         value: otherCharges.rate,
    //         className: classes.otherModal,
    //         // onChange: (e) => handleRateChange(e, 'rate'),
    //         onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         sm: 3
    //     },
    //     {
    //         label: purchaseDetails.type === '1002' ? 'Rate(INR)' : 'Rate',
    //         type: 'number',
    //         value: otherCharges.rate,
    //         className: classes.otherModal,
    //         // onChange: (e) => handleRateChange(e, 'rate'),
    //         onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         sm: 2
    //     },
    //     {
    //         label: 'Add',
    //         type: 'button',
    //         // value: "",
    //         className: classes.button,
    //         onClick: () => handleOtherCharge(true),
    //         sm: 1
    //     },
    // ];

    // const payload19 = [
    //     {
    //         label: 'Other Charges/Vehicle',
    //         type: 'autocomplete',
    //         labelprop: 'label',
    //         value: purchaseDetails.otherCharges,
    //         options: chargesList || [],
    //         onChange: handleChangeotherCharges
    //         // onChange: (e) => handleOtherChargesChange(e, 'item'),          
    //     },
    //     {
    //         label: purchaseDetails.type === '1002' ? 'Rate(INR)' : 'Rate',
    //         type: 'number',
    //         value: purchaseDetails.rate,
    //         className: classes.otherModal,
    //         onChange: (e) => handleRateChange(e, 'rate'),
    //         // onChange: (e) => handleOtherRateChange(e, 'rate'),
    //         // sm:12
    //     },
    // ];

    // eslint-disable-next-line
    const gcTableColumns = [
        { id: 'composition_name', label: 'Item', },
        { id: 'composition_rate', label: 'Composition' }
    ];

    const dispatchTableColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'dispatch_quantity', label: 'Dispatch quantity(Kgs)', type: 'number', isEditable: true },
        { id: 'date', label: 'Dispatch date', isEditable: true, type: 'date', disablePastDates: true }
    ];

    const gcTableVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO', clickable: true, onClick: (poid) => { props.ShowPurchaseDetailsHandler(null, poid) } },
        { id: 'po_createddt', label: 'PO date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const gcTableOtherVendorPriceColumns = [
        { id: 'po_no', label: 'PO NO', clickable: true, onClick: (poid) => { props.ShowPurchaseDetailsHandler(null, poid) } },
        { id: 'po_createddt', label: 'PO date' },
        { id: 'vendor_name', label: 'Vendor' },
        { id: 'price', label: 'Price' }
    ];

    const taxColumns = [
        { id: 'number', label: 'SNo' },
        { id: 'mrin_date', label: 'MRIN date' },
        { id: 'cgst_per', label: 'Tax (%)' },
    ];

    const ocTableColumns = [
        { id: 'label', label: 'Item', },
        { id: 'rate', label: 'Value', type: "number" },//, isEditable: true
        { id: 'taxLabel', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'taxRate', label: 'Tax Value', type: "number" },//, isEditable: true
        { id: "total_tax_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", handler: { handleClick } }
    ];

    const taxTableColumns = [
        { id: 'tax_name', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'perc', label: 'Tax Value(%)', type: "number" },//, isEditable: true
        { id: "total_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
    ];
    const createPurchaseAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        setValidationError(errorObj);
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.advance)) {
            errorObj = { ...errorObj, advance: message };
        }
        else {
            delete errorObj.advance
        }
        // if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.cgst) && !_.isEmpty(purchaseDetails.sgst)) {
        //     errorObj = { ...errorObj, cgst: message };
        // }
        // else {
        //     delete errorObj.cgst
        // }
        // if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.sgst) && !_.isEmpty(purchaseDetails.cgst)) {
        //     errorObj = { ...errorObj, sgst: message };
        // }
        // else {
        //     delete errorObj.sgst
        // }
        if ((purchaseDetails.type !== "1002" && purchaseDetails?.category !== "ORM") && _.isEmpty(purchaseDetails.marketPrice?.toString())) {
            errorObj = { ...errorObj, marketPrice: message };
        }
        else {
            delete errorObj.marketPrice
        }
        if ((purchaseDetails.type !== "1002" && purchaseDetails?.category !== "ORM") && _.isEmpty(purchaseDetails.purchasePrice?.toString())) {
            errorObj = { ...errorObj, purchasePrice: message };
        }
        else {
            delete errorObj.purchasePrice
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.purchasePriceInr)) {
            errorObj = { ...errorObj, purchasePriceInr: message };
        } else {
            delete errorObj.purchasePriceInr
        }
        if (purchaseDetails.type !== "1002" && _.isEmpty(purchaseDetails.totalPrice?.toString())) {
            errorObj = { ...errorObj, totalPrice: message };
        }
        else {
            delete errorObj.totalPrice
        }
        if (_.isEmpty(purchaseDetails.type)) {
            errorObj = { ...errorObj, type: message };
        }
        else {
            delete errorObj.type
        }
        if (!_.isEmpty(purchaseDetails.gcType) && _.isEmpty(purchaseDetails.qty)) {
            errorObj = { ...errorObj, qty: message };
        }
        else {
            delete errorObj.qty
        }
        if (_.isEmpty(purchaseDetails.gcType)) {
            errorObj = { ...errorObj, gcType: message };
        }
        else {
            delete errorObj.gcType
        }
        if (_.isEmpty(purchaseDetails.category)) {
            errorObj = { ...errorObj, category: message };
        }
        else {
            delete errorObj.category
        }
        if (_.isEmpty(purchaseDetails.dispatch)) {
            errorObj = { ...errorObj, dispatch: message };
        }
        else {
            delete errorObj.dispatch
        }
        if (purchaseDetails.dispatch === 'Multiple' && _.isEmpty(purchaseDetails.dispatchCount)) {
            errorObj = { ...errorObj, dispatchCount: message };
        }
        else {
            delete errorObj.dispatchCount
        }
        if (purchaseDetails.billingAt === undefined) {
            errorObj = { ...errorObj, billingAt: message };
        }
        else {
            delete errorObj.billingAt
        }
        if (purchaseDetails.deliveryAt === undefined) {
            errorObj = { ...errorObj, deliveryAt: message };
        }
        else {
            delete errorObj.deliveryAt
        }
        if (purchaseDetails.type === "1002" && _.isEmpty(purchaseDetails.iom)) {
            errorObj = { ...errorObj, iom: message };
        }
        else {
            delete errorObj.iom
        }
        if (purchaseDetails.supplierId === undefined) {
            errorObj = { ...errorObj, supplierId: message };
        }
        else {
            delete errorObj.supplierId
        }// eslint-disable-next-line
        if (purchaseDetails.qty != dispatchTableData?.map(row => parseInt(row["dispatch_quantity"])).reduce((sum, i) => sum + i, 0)) {
            errorObj = { ...errorObj, dispatch_quantity: 'Total Dispatch Quatity not matches Quantity entered' }
        }
        else {
            delete errorObj.dispatch_quantity
        }
        if (!_.isEmpty(errorObj)) {
            setValidationError(errorObj);
            setValidationModal(true);
        } else {
            setValidationModal(false);
            dispatchTableData.forEach((row) => {
                row.dispatch_date = row.date;
            })
            let data =
            {
                "po_create": true,
                "quotation_id": purchaseDetails.quotationId,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "destination_port_id": purchaseDetails.destination?.value,
                "delivery_at_id": purchaseDetails.deliveryAt?.toString(),
                "billing_at_id": purchaseDetails.billingAt?.toString(),
                "incoterms": purchaseDetails.incoterm?.value,
                "origin": purchaseDetails.origin?.value,
                "ports": purchaseDetails.portOfLoading?.value,
                "payment_terms": purchaseDetails.paymentTerms,
                "container_type": purchaseDetails.containerType?.value,
                "payment_terms_days": purchaseDetails.iom,
                "forwarding": purchaseDetails.forwarding,
                "no_of_containers": purchaseDetails.noofContainers?.toString(),
                "no_of_bags": purchaseDetails.noofbags,
                "net_weight": purchaseDetails.netweight,
                "comments": purchaseDetails.comments,
                "po_date": purchaseDetails.poDate || new Date(),
                "po_category": purchaseDetails.category,
                "supplier_id": purchaseDetails.supplierId,
                "quot_no": purchaseDetails.quotation?.toString(),
                "quot_price": purchaseDetails.price?.toString(),
                "quot_date": purchaseDetails.quotationDate || null,
                "advance": purchaseDetails.advance?.toString(),
                "advance_type": purchaseDetails.advanceType?.toString(),
                "currency_id": purchaseDetails.type === "1002" ? purchaseDetails.currency?.value : purchaseDetails.importCurrency?.value,
                "taxes_duties": purchaseDetails.taxesDuties,
                "mode_of_transport": purchaseDetails.type === "1002" ? purchaseDetails.modeOfTransport : purchaseDetails.mode_of_transport?.value,
                "packing_type": purchaseDetails.packing_type?.value,
                "insurance": purchaseDetails.insurance?.value,
                "transit_insurance": purchaseDetails.transitInsurance,
                "packing_forwarding": purchaseDetails.packing,
                "dispatch_type": purchaseDetails.dispatch,
                "dispatch_count": purchaseDetails.dispatchCount,
                "item_dispatch": dispatchTableData,
                "supplier_type": purchaseDetails.type,
                "item_id": purchaseDetails.gcType,
                "cgst": purchaseDetails.cgst,
                "igst": purchaseDetails.igst,
                "sgst": purchaseDetails.sgst,
                "tds": purchaseDetails.tds,
                "purchase_type": purchaseDetails.purchaseType,
                "terminal_month": purchaseDetails.terminalMonth || null,
                "fixation_date": purchaseDetails.fixation || null,
                "terminalPrice": purchaseDetails.terminalPrice?.toString(),
                "marketPriceInr": purchaseDetails.marketPriceInr?.toString(),
                "purchasePriceInr": purchaseDetails.purchasePriceInr?.toString(),
                "grossPrice": purchaseDetails.grossPrice?.toString(),
                "totalPrice": purchaseDetails.totalPrice?.toString(),
                "booked_terminal_rate": purchaseDetails.bookedTerminalRate?.toString(),
                "fixedDate": purchaseDetails.fixedDate,
                "booked_differential": purchaseDetails.bookedDifferential?.toString(),
                "fixed_terminal_rate": purchaseDetails.fixedTerminalRate?.toString(),
                "fixed_differential": purchaseDetails.fixedDifferential?.toString(),
                "purchase_price": purchaseDetails.purchasePrice?.toString(),
                "market_price": purchaseDetails.marketPrice?.toString(),
                "po_margin": purchaseDetails.poMargin?.toString(),
                "createduserid": getCurrentUserDetails().id,
                "loggedinuserid": getCurrentUserDetails()?.id,
                "total_quantity": purchaseDetails.qty?.toString(),
                "contract": purchaseDetails.contract,
                "taxes_misc_charges": otherChargesList?.map(charge => {
                    return {
                        taxid: charge?.tax,
                        tax_percentage: charge?.taxRate?.toString(),
                        misc_id: charge?.name,
                        misc_charge_rate: charge?.rate,
                        total_tax_rate: charge?.total_tax_rate,
                    }
                }),
                "rate": purchaseDetails.rate?.toString(),
                "domestic_taxes": taxList,
                "documentsection": documentsection.length > 0 ? documentsection : null
            }
            setLoading(true);
            setDisableCreate(true);
            try {
                let response = await createGCPurchaseOrders(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "GC Purchase Order created successfully",
                    });
                    setTimeout(() => {
                        navigate(routeBuilder('purchase-order', response, 'view'),
                            { replace: true })
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

    const OtherChargesAction = async () => {
        let splicedList = tempOtherChargesList;
        splicedList.splice(tempOtherChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            return {
                name: list.item, label: _.find(chargesList, { value: list.item })?.label, rate: list.rate,
                tax: list.tax, taxLabel: _.find(taxesList, { value: list.tax })?.label, taxRate: list.taxRate,
                total_tax_rate: ((1 + parseFloat(list.taxRate || 0) / 100) * parseFloat(list.rate || 0)).toFixed(2)
            }
        })
        let data = { ...purchaseDetails };
        // eslint-disable-next-line
        state.map((item, index) => {
            data[item.name] = item.rate;
        })
        // const totalPrice = purchaseDetails?.type === "1001" ?
        //     calculateTotalPriceImport(purchaseDetails?.grossPrice, purchaseDetails?.taxes, state) :
        //     calculateTotalPrice(data, state)
        // await setPurchaseDetails({ ...data, totalPrice });
        setOtherChargesList(state);
        setTempOtherChargesList([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }])
        setOpenOtherCharges(!openOtherCharges)
        // rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0));

    }

    const TaxChargesAction = async () => {
        let splicedList = tempTaxChargesList;
        splicedList.splice(tempTaxChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            return {
                // name: list.item, label: _.find(domesticTaxesList, { value: list.item })?.label, rate: list.rate,
                tax_id: list.tax_id, tax_name: _.find(domesticTaxesList, { value: list.tax_id })?.label.toLowerCase(), perc: list.perc, total_rate: ((parseFloat(purchaseDetails?.grossPrice) * parseFloat(list.perc)) / 100).toString(),
                // total_tax_rate: ((1 + parseFloat(list.taxRate || 0) / 100) * parseFloat(list.rate || 0)).toFixed(2)
            }
        })

        // let data = { ...purchaseDetails };
        // eslint-disable-next-line
        // state.map((item, index) => {
        //     data[item.tax_name] = item.perc;
        // })
        // const totalPrice = calculateTotalPrice(data, otherChargesList);
        // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
        // console.log('totalPrice::11', state, totalPrice)
        let data = {
            ...purchaseDetails,
            // 'totalPrice': totalPrice,
        }
        setPurchaseDetails(data);

        // let totalPriceInr = calculateTotalPrice({ ...purchaseDetails, [key]: val }, otherChargesList);
        await setPurchaseDetails({
            ...data,
            // totalPrice 
        });
        setTaxList(state);
        setTempTaxChargesList([{ tax_id: "", perc: "" }])
        // let tempstate = state.push({ tax_id: "", perc: "" });
        // console.log('state::1', state)
        // setTempTaxChargesList(state);
        setOpenTaxCharges(!openTaxCharges)
        // rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0));
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

    const taxChargesHandler = () => (
        <Container className={classes.modal1}>
            <h2 id="simple-modal-title">Tax Details</h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={8} md={12} container direction="column">
                    {console.log('temp::23', tempTaxChargesList)}
                    {tempTaxChargesList.map((charge, index) => <Template payload={getTaxChargesPayload(charge, index)} key={index} justify={"space-around"} align={"center"} />)}
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

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
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
                purchaseDetails.type === "1002" &&
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
                purchaseDetails.type === "1001" &&
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
                            <Typography>{purchaseDetails?.category === "ORM" ? "ORM Infomation" : "Green coffee information"}</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container md={12} xs={12}>
                        <Grid item md={6} xs={12}>
                            <Template payload={payload4} />
                            {
                                showQuoteInfo &&
                                <Template payload={payload5} />
                            }
                            {
                                purchaseDetails.gcType &&
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
                                    <BasicTable rows={dispatchTableData} columns={dispatchTableColumns} hasTotal={true} totalColId="dispatch_quantity" onUpdate={dispatchDataUpdate}></BasicTable>
                                </Grid>
                            }
                            {
                                purchaseDetails.gcType && purchaseDetails?.category !== "ORM" &&
                                <Grid item style={{ marginTop: 15, marginRight: 30 }}>
                                    <Accordion defaultExpanded={false}>
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

                        <Grid item md={6} xs={12}>
                            {
                                purchaseDetails.gcType &&
                                <>
                                    <Grid item md={12} xs={12} className='item' style={{ marginRight: 25 }}>
                                        <Typography>Historical price data for selected vendor</Typography>
                                    </Grid>
                                    <BasicTable rows={vendorPriceList} columns={gcTableVendorPriceColumns}></BasicTable>
                                </>
                            }
                            {
                                purchaseDetails.gcType &&
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
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid id="top-row" container style={{ margin: 6 }}>
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Price information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container md={12} xs={12}>
                        <Grid item md={12} xs={12}>
                            {purchaseDetails?.category !== "ORM" && <Template payload={payload15} />}
                            {
                                purchaseDetails.type === "1001" && purchaseDetails?.category !== "ORM" &&
                                <Template payload={payload11} />
                            }
                            {
                                purchaseDetails.type === "1001" && purchaseDetails?.category === "ORM" &&
                                <Template payload={ormPurchasePayload} />
                            }
                            {
                                purchaseDetails?.category !== "ORM" && <Template payload={payload36} />
                            }
                            {
                                purchaseDetails.type === "1002" &&
                                <Template payload={purchaseDetails?.category === "ORM" ? payload14 : terminalPricePayload.concat(payload14)} />
                            }
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            {
                purchaseDetails.gcType && purchaseDetails.type === "1002" &&
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
                purchaseDetails.type === "1002" &&
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Tax information</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>

                        <Grid item md={12} xs={12}>
                            <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                                <Button label="Add Tax Information" onClick={addTaxHandler} />
                            </Grid>
                            <BasicTable rows={taxList} columns={taxTableColumns} colSpan={2} onUpdate={taxrateUpdate} hasTotal={true} totalColId='total_rate' ></BasicTable>
                            <Template payload={payload12} />
                            {/* {purchaseDetails.type === "1001" && <Template payload={payload19} />} */}
                            {/* <Template payload={payload20} /> */}
                        </Grid>

                    </AccordionDetails>
                </Accordion>
            }
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
                            <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} totalColId="total_tax_rate" colSpan={4} onUpdate={rateUpdate}></BasicTable>
                        </>
                        {/* {purchaseDetails.type === "1001" && <Template payload={payload19} />} */}
                        <Template payload={payload20} />
                    </Grid>
                </AccordionDetails>
            </Accordion>


            {purchaseDetails.type !== "1001" && (
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

            {(purchaseDetails.type === "1001" || purchaseDetails.type === "1002") && (
                <Accordion defaultExpanded={true}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Documents Required</Typography>
                            </Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Template payload={purchaseDetails.type === "1001" ? payload21 : payload21D} />
                    </AccordionDetails>
                </Accordion>
            )}

            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button disabled={disableCreate} label={loading ? "Loading..." : "Save"} onClick={createPurchaseAction} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => navigate(-1)} />
                </Grid>
            </Grid>
            <SimpleModal open={validationModal} handleClose={() => setValidationModal(!validationModal)} body={createAction} />
            <SimpleModal open={confirmationCatChange} handleClose={() => setConfirmationCatChange(!confirmationCatChange)} body={createActionForCatChange} />
            <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />
            <SimpleModal open={openTaxCharges} handleClose={() => setOpenTaxCharges(!openTaxCharges)} body={taxChargesHandler} />
        </form>
    )
}
export default CreatePurchaseOrder;