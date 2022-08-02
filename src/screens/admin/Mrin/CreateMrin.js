import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import useToken from '../../../hooks/useToken';
import { createOrUpdateMRINDetail } from "../../../apis"; //getMRINDetail
import SimpleModal from '../../../components/Modal';
import BasicTable from '../../../components/BasicTable';
import { getPOCreationInfo, } from '../../../apis';
import { colors } from '../../../constants/colors';
import roles from '../../../constants/roles';

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

const currentDate = () => {
    return new Date();
}

const CreateMrin = (props) => {
    const classes = useStyles();
    const [mrinDetails, setMrinDetails] = useState({});
    const [locationList, setLocationList] = useState([]);
    const [validationError, setValidationError] = useState({});
    const [disableInvoice, setDisableInvoice] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [payloadData, setPayloadData] = useState({});
    const [otherChargesList, setOtherChargesList] = useState([]);
    const [tempOtherChargesList, setTempOtherChargesList] = useState([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }]);
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [chargesList, setChargesList] = useState([]);
    const [taxesList, setTaxesList] = useState([]);
    const [taxList, setTaxList] = useState([]);
    const [domesticTaxesList, setDomesticTaxesList] = useState([]);
    const [domesticAllTaxesList, setDomesticAllTaxesList] = useState([])
    const [tempTaxChargesList, setTempTaxChargesList] = useState([{ tax_id: "", perc: "" }]);
    const [openTaxCharges, setOpenTaxCharges] = useState(false);

    const handleOtherCharge = (add, index) => {
        let temp = _.cloneDeep(tempOtherChargesList);
        if (add) {
            const emptyItemIndex = temp.findIndex(charge => !charge.item || charge.item.toString() === "");
            if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
            else temp.push({ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" });
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
    const [uploadedFile, setUploadedFile] = useState({});
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data?.map(v => formattedData?.push({ label: v[key], value: v[id] || v[key] }))
        return formattedData;
    }

    const handleClick = (index) => {
        let state = [...otherChargesList];
        if (index !== -1) {
            state.splice(index, 1);
            setOtherChargesList(state);
        }
        // if (state.length === 0) {
        //     rateUpdate(0, state);
        // } else {

        //     rateUpdate(state?.map(row => parseInt(row["rate"])).reduce((sum, i) => sum + i, 0), state);
        // }
    }

    const ocTableColumns = [
        { id: 'label', label: 'Item', },
        { id: 'rate', label: 'Rate', type: "number" },//, isEditable: true
        { id: 'taxLabel', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'taxRate', label: 'Tax Rate', type: "number" },//, isEditable: true
        { id: "total_tax_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", handler: { handleClick } }
    ];
    useEffect(() => {
        if (props.createMrinData) {
            props.createMrinData.apStatus = "Pending";
            props.createMrinData.qcStatus = "Pending";
            props.createMrinData.invoiceStatus = false;
        }
        setMrinDetails(props.createMrinData);
        if (currentUserDetails.role === "QC Manager") {
            setDisableInvoice(true);
        }
        setLocationList((props?.allSilos === null || props?.allSilos === 'success') ? [] : formatToSelection(props?.allSilos, "silo_name", "location_id"))
        getPOCreationInfo({ "type": "getTaxes" }).then(res => {
            setTaxesList(formatToSelection(res, "tax_name", "tax_id"))
        });
        getPOCreationInfo({ "type": "getDomesticTaxes" }).then(res => {
            setDomesticTaxesList(formatToSelection(res, "tax_name", "tax_id"))
            setDomesticAllTaxesList(formatToSelection(res, "tax_name", "tax_id"))

            let temp = [];
            if (props?.poDetails) {
                props.poDetails?.domestic_taxes !== null &&
                // eslint-disable-next-line
                    props.poDetails?.domestic_taxes?.map(list => {
                        temp.push({
                            tax_id: list.tax_id, tax_name: res.find(v => v.tax_id === list.tax_id)?.tax_name.toLowerCase(), perc: list.perc, total_rate: ((parseFloat(props?.poDetails?.grossPrice) * parseFloat(list.perc)) / 100).toString(),
                        })
                    }) 
                // : [];
                setTaxList(temp);
            }

        });
        getPOCreationInfo({ "type": "miscCharges" }).then(res => {
            setChargesList(formatToSelection(res, "misc_charges_name", "misc_id"))
        });

        // eslint-disable-next-line 
    }, [props.createMrinData, props?.poDetails]);

    const handleChange = (event, key) => {

        let data = { ...mrinDetails };
        // if (key === "delivered_quantity") {
        //     if (parseFloat(event.target.value) > parseFloat(mrinDetails.expected_quantity)) {
        //         let errorObj = { ...validationError };
        //         errorObj = { ...errorObj, delivered_quantity: 'Delivered quantity should not be greater than Expected  quantity.' };
        //         setValidationError(errorObj);

        //         data = {
        //             ...mrinDetails,
        //             [key]: event.target.value,
        //         }
        //     } else {
        //         let errorObj = { ...validationError };
        //         delete errorObj.delivered_quantity;
        //         setValidationError(errorObj);

        //         bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(event.target.value) + parseFloat(mrinDetails.wayment_shortage || 0));
        //         data = {
        //             ...mrinDetails,
        //             [key]: event.target.value,
        //             "balance_quantity": bal === isNaN ? 0 : bal
        //         };
        //     }

        // } else if (key === "wayment_shortage") {
        //     bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(event.target.value) + parseFloat(mrinDetails.delivered_quantity));
        //     data = {
        //         ...mrinDetails,
        //         [key]: event.target.value,
        //         "balance_quantity": bal === isNaN ? 0 : bal
        //     };
        // } else {
        data = {
            ...mrinDetails,
            [key]: event.target.value,
        }
        // }
        setMrinDetails(data);
    };

    const calculateTotalPrice = (data, otherChargesList = []) => {
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_tax_rate || 0);
            return total;
        }, 0)
        const purPrice = mrinDetails.type === "1001" ? data?.purchasePrice : data?.purchasePriceInr;
        console.log("Purc price", purPrice, data.qty);
        const amount = parseFloat(purPrice || 0) *
            (mrinDetails.type === "1001" ? (parseFloat(data.qty || 0) / 1000) : parseFloat(data.qty));
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

    const handleTaxClick = (index) => {
        let state = [...taxList];
        console.log("index::", index, taxList)
        if (taxList[index]?.tax_name?.toLowerCase() === 'igst') {
            setDomesticTaxesList(domesticAllTaxesList);
        }
        if (taxList[index]?.tax_name?.toLowerCase() === 'cgst' && taxList.findIndex(val => val.tax_name?.toLowerCase() === 'sgst') === -1) {
            setDomesticTaxesList(domesticAllTaxesList);
        }
        if (taxList[index]?.tax_name?.toLowerCase() === 'sgst' && taxList.findIndex(val => val.tax_name?.toLowerCase() === 'cgst') === -1) {
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
                ...mrinDetails,
                // 'totalPrice': totalPrice,
            }
            setMrinDetails(data);
        } else {
            // const totalPrice = calculateTotalPriceTax(state, otherChargesList);
            // console.log('totalPrice::', state, totalPrice)
            let data = {
                ...mrinDetails,
                // 'totalPrice': totalPrice,
            }
            setMrinDetails(data);
        }

    }

    const handleNumberChange = (event, key) => {
        var bal = 0;
        let data = { ...mrinDetails };
        var val = event.target.value >= 0 ? event.target.value : 0;
        if (key === "delivered_quantity") {
            if (parseFloat(val) > parseFloat(mrinDetails.expected_quantity)) {
                let errorObj = { ...validationError };
                errorObj = { ...errorObj, delivered_quantity: 'Delivered quantity should not be greater than Expected  quantity.' };
                setValidationError(errorObj);

                data = {
                    ...mrinDetails,
                    [key]: val,
                }
            } else {
                let errorObj = { ...validationError };
                delete errorObj.delivered_quantity;
                setValidationError(errorObj);

                bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(val) + parseFloat(mrinDetails.wayment_shortage || 0));
                data = {
                    ...mrinDetails,
                    [key]: val,
                    "balance_quantity": bal === isNaN ? 0 : bal
                };
            }

        } else if (key === "wayment_shortage") {
            bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(val) + parseFloat(mrinDetails.delivered_quantity));
            data = {
                ...mrinDetails,
                [key]: val,
                "balance_quantity": bal === isNaN ? 0 : bal
            };
        } else {
            data = {
                ...mrinDetails,
                [key]: val,
            }
        }
        setMrinDetails(data);
    }


    const handlelocationChange = (e, value) => {
        let data = {
            ...mrinDetails,
            'location': value,
        }
        setMrinDetails(data);
    }

    const handleDateChange = (date, key) => {
        let data = {
            ...mrinDetails,
            [key]: date
        }
        setMrinDetails(data);
    };
    const calculateMRINValue = () => {
        const purchasePrice = parseFloat(props?.poDetails?.purchase_price || 0);
        const conversionratio = parseFloat(mrinDetails?.conversationratio || 1);
        const deliveredQuantity = parseFloat(mrinDetails.delivered_quantity);
        // const otherCharges = otherChargesList.reduce((total, current) => parseFloat(current["total_tax_rate"] || 0) + total, 0)
        const otherCharges = otherChargesList.reduce((total, current) => parseFloat(current["total_tax_rate"] || 0) + total, 0)
        const poSubCategory = props?.poDetails?.po_sub_category;
        if (poSubCategory === "Import") {
            return (((purchasePrice * conversionratio * deliveredQuantity) / 1000) + otherCharges).toFixed(2)
        }
        else return ((purchasePrice * deliveredQuantity) + otherCharges).toFixed(2)
    }
    const createMrinAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = { ...validationError };
        setValidationError(errorObj);
        if (_.isEmpty(mrinDetails.delivered_quantity?.toString())) {
            errorObj = { ...errorObj, delivered_quantity: message };
        }
        else {
            delete errorObj.delivered_quantity
        }
        if (_.isEmpty(mrinDetails.wayment_shortage?.toString())) {
            errorObj = { ...errorObj, wayment_shortage: message };
        }
        else {
            delete errorObj.wayment_shortage
        }
        if (_.isEmpty(mrinDetails.invoice_no?.toString())) {
            errorObj = { ...errorObj, invoice_no: message };
        }
        else {
            delete errorObj.invoice_no
        }
        if (_.isEmpty(mrinDetails.vehicle_no?.toString())) {
            errorObj = { ...errorObj, vehicle_no: message };
        }
        else {
            delete errorObj.vehicle_no
        }
        if (mrinDetails.wayBillDate === undefined) {
            errorObj = { ...errorObj, wayBillDate: message };
        }
        else {
            delete errorObj.wayBillDate
        }
        if (_.isEmpty(mrinDetails.wayBillNumber)) {
            errorObj = { ...errorObj, wayBillNumber: message };
        } else {
            delete errorObj.wayBillNumber
        }
        // if (mrinDetails.subCategory === 'Import' && _.isEmpty(mrinDetails.billOfEntry)) {
        //     errorObj = { ...errorObj, billOfEntry: message };
        // } else {
        //     delete errorObj.billOfEntry
        // }
        // if (mrinDetails.subCategory === 'Import' && _.isEmpty(mrinDetails.billOfEntryDate)) {
        //     errorObj = { ...errorObj, billOfEntryDate: message };
        // } else {
        //     delete errorObj.billOfEntryDate
        // }
        // if (mrinDetails.subCategory === 'Import' && _.isEmpty(mrinDetails.billOfEntryConversionRate)) {
        //     errorObj = { ...errorObj, billOfEntryConversionRate: message };
        // } else {
        //     delete errorObj.billOfEntryConversionRate
        // }        
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const error = { message: 'Please fill mandatory fields to save' }
                throw error
            }
            catch (err) {
                setSnack({
                    open: true,
                    message: err.response?.data,
                    severity: 'error'
                });
            }
        } else {
            let data = {
                "createmrin": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "type": "uploadDocument",
                "doc_kind": "MRIN",
                "document_content": uploadedFile?.file,
                "document_name": uploadedFile?.name,
                "createduserid": localStorage.getItem("currentUserId"),
                "loggedinuserid": localStorage.getItem("currentUserId"),
                "poid": mrinDetails.poid,
                "pono": mrinDetails.pono,
                "detid": mrinDetails.dispatch_id,
                "related_detid": mrinDetails.related_detid,
                "expected_quantity": mrinDetails.expected_quantity,
                "invoice_no": mrinDetails.invoice_no,
                "vehicle_no": mrinDetails.vehicle_no,
                "invoice_date": mrinDetails.invoice_date ? mrinDetails.invoice_date : currentDate(),
                "invoice_quantity": mrinDetails.invoice_quantity,
                "delivery_date": mrinDetails.delivery_date ? mrinDetails.delivery_date : currentDate(),
                "delivered_quantity": mrinDetails.delivered_quantity,
                "wayment_shortage": mrinDetails.wayment_shortage ? mrinDetails.wayment_shortage.toString() : '',
                "balance_quantity": mrinDetails.balance_quantity ? mrinDetails.balance_quantity.toString() === '' ? '0' : mrinDetails.balance_quantity.toString() : '0',
                "createdon": currentDate(),
                "taxes_misc_charges": otherChargesList?.map(charge => {
                    return {
                        taxid: charge?.tax,
                        tax_percentage: charge?.taxRate?.toString(),
                        misc_id: charge?.name,
                        misc_charge_name: charge?.label,
                        misc_charge_rate: charge?.rate,
                        total_tax_rate: charge?.total_tax_rate,
                        tax_name: charge?.taxLabel,
                    }
                }),
                // "domestic_taxes": taxList,
                "mrinvalue": calculateMRINValue(),
                "createdby": localStorage.getItem("currentUserName"),
                "status": 'new',
                "vendor_id": mrinDetails.vendor_id,
                "entityid": mrinDetails.entityid,
                "mrindate": currentDate(),
                "wayBillDate": mrinDetails.wayBillDate,
                "wayBillNumber": mrinDetails.wayBillNumber,
                // "billOfEntry": mrinDetails.billOfEntry,
                // "billOfEntryDate": mrinDetails.billOfEntryDate,
                // "billOfEntryConversionRate": mrinDetails.billOfEntryConversionRate,
                "apStatus": mrinDetails.apStatus,
                "qcStatus": mrinDetails.qcStatus,
                "apDetails": mrinDetails.apDetails,
                "invoiceAmount": mrinDetails.invoiceAmount,
                "location_id": mrinDetails.location?.value,
            };
            if (data.wayment_shortage === '0' && (data.balance_quantity !== '' || parseFloat(data.balance_quantity) !== 0)) {
                setLoading(true);
                var msg = 'MRIN created successfully';
                callCreateApi(data, msg);
                setShowConfirmation(false);
            } else if (data.wayment_shortage === '0') {
                setLoading(true);
                // eslint-disable-next-line
                var msg = 'MRIN created successfully';
                callCreateApi(data, msg);
                setShowConfirmation(false);
            } else if (data.wayment_shortage !== '' || parseInt(data.wayment_shortage) !== 0) {
                setPayloadData(data);
                setLoading(false);
                setShowConfirmation(true);
            }
        }
    }

    async function callCreateApi(data, msg) {
        try {
            let response = await createOrUpdateMRINDetail(data)
            if (response) {
                setSnack({
                    open: true,
                    message: msg,
                });
                setLoading(false);
                setTimeout(() => {
                    props.back();
                }, 2000)

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

    function onClickConfirm(val) {
        setLoading(true);
        setShowConfirmation(!showConfirmation);
        var msg = val === 'yes' ? 'Wayment shortage is ignored, MRIN created successfully' : 'MRIN create successfully. A new dispatch created with wayment shortage & balance quanotity';
        let temp = { ...payloadData };
        temp.wayment_shortage_flag = val === 'yes' ? true : false;
        setPayloadData(temp)
        callCreateApi(temp, msg);
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleFileChange = async (e) => {
        if (!e.target.files) {
            return;
        }
        // setDisableUpload(false);
        let file = await toBase64(e.target.files[0]);
        file = file.replace(/^data:application\/(pdf);base64,/, "")
        setUploadedFile({
            name: e.target.files[0].name,
            file: file
        });
    }

    const payload = [
        {
            label: 'PO number',
            type: 'input',
            disabled: true,
            value: mrinDetails.pono
        },
        {
            label: 'Parent dispatch',
            type: 'input',
            value: mrinDetails.related_detid || '-',
            disabled: true,
        },
        {
            label: 'Dispatch number',
            type: 'input',
            value: mrinDetails.dispatch_id || '-',
            disabled: true,
        },
        {
            label: 'Expected quantity(Kgs)',
            type: 'number',
            value: mrinDetails.expected_quantity,
            disabled: true
        },
        {
            label: 'Vehicle/BL number',
            type: 'input',
            value: mrinDetails.vehicle_no || '',
            required: true,
            error: validationError?.vehicle_no,
            helperText: validationError?.vehicle_no,
            onChange: (e) => handleChange(e, 'vehicle_no')
        },
        {
            label: 'Invoice number',
            type: 'input',
            value: mrinDetails.invoice_no || '',
            required: true,
            error: validationError?.invoice_no,
            helperText: validationError?.invoice_no,
            onChange: (e) => handleChange(e, 'invoice_no')
        },
        {
            label: 'Invoice quantity(Kgs)',
            type: 'number',
            value: mrinDetails.invoice_quantity,
            onChange: (e) => handleNumberChange(e, 'invoice_quantity')
        },
        {
            label: 'Invoice date',
            type: 'datePicker',
            value: mrinDetails.invoice_date === '' ? currentDate() : mrinDetails.invoice_date,
            onChange: (e) => handleDateChange(e, 'invoice_date')
        },
        {
            label: 'Delivery date',
            type: 'datePicker',
            value: mrinDetails.delivery_date === '' ? currentDate() : mrinDetails.delivery_date,
            onChange: (e) => handleDateChange(e, 'delivery_date')
        },
        {
            label: 'Delivered quantity(Kgs)',
            type: 'number',
            value: mrinDetails.delivered_quantity,
            required: true,
            error: validationError?.delivered_quantity,
            helperText: validationError?.delivered_quantity,
            onChange: (e) => { handleNumberChange(e, 'delivered_quantity') }
        },
        {
            label: 'Weighment shortage',
            type: 'number',
            value: mrinDetails.wayment_shortage,
            required: true,
            error: validationError?.wayment_shortage,
            helperText: validationError?.wayment_shortage,
            onChange: (e) => { handleNumberChange(e, 'wayment_shortage') }
        },
        {
            label: 'Balance quantity(Kgs)',
            type: 'number',
            value: mrinDetails.balance_quantity ? mrinDetails.balance_quantity.toFixed(4) : 0
        },
        {
            label: 'Way bill number',
            type: 'input',
            value: mrinDetails.wayBillNumber,
            required: true,
            error: validationError?.wayBillNumber,
            helperText: validationError?.wayBillNumber,
            onChange: (e) => handleChange(e, 'wayBillNumber'),
            sm: 6
        },
        {
            label: 'Way bill date',
            type: 'datePicker',
            value: mrinDetails.wayBillDate || null,
            required: true,
            error: validationError?.wayBillDate,
            helperText: validationError?.wayBillDate,
            onChange: (e) => handleDateChange(e, 'wayBillDate'),
        },
        {
            label: 'Locations',
            type: 'autocomplete',
            labelprop: "label",
            value: mrinDetails.location,
            options: locationList || [],
            onChange: handlelocationChange,
        },
        {
            label: 'Coffee Grade',
            type: 'input',
            value: mrinDetails.coffee_grade,
            required: true,
            onChange: (e) => handleChange(e, 'coffee_grade'),
            disabled: true,
            sm: 6
        },
    ];

    const payload1 = [
        // {
        //     label: 'Bill of entry number',
        //     type: 'input',
        //     value: mrinDetails.billOfEntry,
        //     required: true,
        //     error: validationError?.billOfEntry,
        //     helperText: validationError?.billOfEntry,
        //     onChange: (e) => handleChange(e, 'billOfEntry'),
        //     sm: 6
        // },
        {
            label: 'Bill of entry conversion rate',
            type: 'input',
            value: mrinDetails.conversationratio || null,
            disabled: true
        },
        // {
        //     label: 'Bill of entry date',
        //     type: 'datePicker',
        //     value: mrinDetails.billOfEntryDate || null,
        //     required: true,
        //     error: validationError?.billOfEntryDate,
        //     helperText: validationError?.billOfEntryDate,
        //     onChange: (e) => handleDateChange(e, 'billOfEntryDate'),
        // },
    ]

    const payload2 = [
        {
            label: 'AP status',
            type: 'input',
            disabled: true,
            value: mrinDetails.apStatus,
            sm: 6
        },
        {
            label: 'AP details',
            type: 'input',
            disabled: true,
            value: mrinDetails.apDetails || "",
            onChange: (e) => handleChange(e, 'apDetails'),
            sm: 6
        },
        {
            label: 'Invoice amount',
            type: 'number',
            value: mrinDetails.invoiceAmount || "",
            disabled: true,
            onChange: (e) => handleNumberChange(e, 'invoiceAmount'),
            sm: 6
        },
    ]

    const payload3 = [
        {
            label: 'QC status',
            type: 'input',
            disabled: true,
            value: mrinDetails.qcStatus || "",
        },
    ]

    const payload4 = [
        {
            type: 'file',
            disabled: disableInvoice,
            onChange: (e) => handleFileChange(e),
        },
        {
            label: 'Invoice status',
            type: 'checkbox',
            sm: 6,
            disabled: true,
            checked: mrinDetails.invoiceStatus,
        },
    ]

    // const payload5 = [         
    //     {
    //         label: 'Download Attachment',
    //         type: 'button',
    //         sm:12,
    //         onClick: (e) => downloadFileHandler(e, 'invoiceAttachment'),           
    //     },                    
    // ]

    // const payload6 = [
    //     {
    //         label: 'Upload attachment',
    //         type: uploadedFile ? 'text' : 'button',
    //         sm: 12,
    //         value: uploadedFile ? uploadedFile?.name : null,
    //         disabled: disableUpload,
    //         onClick: (e) => uploadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]
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
    const createAction = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">
                Wayment confirmation
            </h2>
            <p>Are You Ok With Wayment Shortage?</p>
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Yes" onClick={() => onClickConfirm('yes')} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => onClickConfirm('no')} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => setShowConfirmation(!showConfirmation)} />
                </Grid>
            </Grid>
        </Container>
    );
    // const payload20 = [
    //     {
    //         label: 'Comments',
    //         type: 'input',
    //         rows: 4,
    //         multiline: true,
    //         value: mrinDetails.comments || '',
    //         onChange: (e) => handleChange(e, 'comments'),
    //         md: 6,
    //         sm: 6,
    //         xs: 6
    //     },
    // ]
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
                label: 'Rate',
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

    const payload12 = [
        {
            label: 'TDS (%)',
            type: 'float',
            disabled: true,
            value: mrinDetails.tds || '',
            onChange: (e) => handleTaxChange(e, 'tds'),
        }
    ];

    const handleTaxChange = (event, key) => {
        var val = event.target.value >= 0 ? event.target.value : 0;
        const totalPriceInr = calculateTotalPrice({ ...mrinDetails, [key]: val }, otherChargesList);
        let data = {
            ...mrinDetails,
            "totalPrice": totalPriceInr,
            [key]: val
        }
        setMrinDetails(data);
    }

    const OtherChargesAction = async () => {
        let splicedList = tempOtherChargesList;
        splicedList.splice(tempOtherChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            return {
                name: list.item,
                label: _.find(chargesList, { value: list.item })?.label,
                rate: list.rate,
                tax: list.tax,
                taxLabel: _.find(taxesList, { value: list.tax })?.label,
                taxRate: list.taxRate,
                total_tax_rate: ((1 + parseFloat(list.taxRate || 0) / 100) * parseFloat(list.rate || 0)).toFixed(2)
            }
        })
        setOtherChargesList(state);
        setTempOtherChargesList([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }])
        setOpenOtherCharges(!openOtherCharges)

    }

    const taxTableColumns = [
        { id: 'tax_name', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'perc', label: 'Tax Value(%)', type: "number" },//, isEditable: true
        { id: "total_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
    ];

    const taxrateUpdate = (total, otherChargesList) => {
        let data = {
            ...mrinDetails,
        }
        setMrinDetails(data);
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

    const TaxChargesAction = async () => {
        let splicedList = tempTaxChargesList;
        splicedList.splice(tempTaxChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            console.log('list::', list.perc, mrinDetails?.grossPrice)
            return {
                tax_id: list.tax_id, tax_name: _.find(domesticTaxesList, { value: list.tax_id })?.label.toLowerCase(), perc: list.perc, total_rate: ((parseFloat(props?.poDetails?.grossPrice) * parseFloat(list.perc)) / 100).toString(),
            }
        })

        let data = {
            ...mrinDetails,
            // 'totalPrice': totalPrice,
        }
        setMrinDetails(data);
        await setMrinDetails({
            ...data,
            // totalPrice 
        });
        setTaxList(state);
        setTempTaxChargesList([{ tax_id: "", perc: "" }])
        setOpenTaxCharges(!openTaxCharges)
    }

    const handleTempTaxChargeChange = (event, key, index) => {
        var value = (key === "perc") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempTaxChargesList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempTaxChargesList(temp);
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
    return (<form className={classes.root} noValidate autoComplete="off">
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>MRIN information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Template payload={payload} />
            </AccordionDetails>
            <AccordionDetails>
                {
                    mrinDetails.subCategory === 'Import' &&
                    <Template payload={payload1} />
                }
            </AccordionDetails>
        </Accordion>
        {
            (currentUserDetails.role === "Accounts Executive" || currentUserDetails.role === "Accounts Manager" || currentUserDetails.role === roles.managingDirector) &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Finance information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload2} />
                </AccordionDetails>
            </Accordion>
        }
        {
            (currentUserDetails.role === "QC Manager" || currentUserDetails.role === roles.managingDirector
            ) &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Quality information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Template payload={payload3} />
                </AccordionDetails>
            </Accordion>
        }

        {
            props?.poDetails?.po_sub_category !== "Import" &&
            <Accordion defaultExpanded={true} style={{display: 'none'}}>
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
                        <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} totalColId="total_tax_rate" colSpan={4}></BasicTable>
                    </>
                </Grid>
            </AccordionDetails>
        </Accordion>
        {
            (currentUserDetails.role === "QC Manager" || currentUserDetails.role === roles.managingDirector
                || currentUserDetails.role === "GC Stores Executive") &&
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                    <Grid id="top-row" container >
                        <Grid item md={12} xs={12} className='item'>
                            <Typography>Invoice information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container md={12} xs={12}>
                        <Template payload={payload4} />
                        {/* <Grid item md={2} xs={12}>
                            {
                                currentUserDetails.role !== "QC Manager" &&
                                <Template payload={payload6} />
                            }
                        </Grid> */}
                        {/* <Grid item md={2} xs={12}>
                        {
                            invoiceFile && 
                            <Template payload={payload5} />
                        }  
                        </Grid>                                                                                               */}
                    </Grid>
                </AccordionDetails>
            </Accordion>
        }
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
                <Button disabled={loading} label={loading ? 'Loading ...' : 'Create'} onClick={createMrinAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>
        {<SimpleModal open={showConfirmation} handleClose={() => setShowConfirmation(!showConfirmation)} body={createAction} />}
        <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />
        <SimpleModal open={openTaxCharges} handleClose={() => setOpenTaxCharges(!openTaxCharges)} body={taxChargesHandler} />
    </form>)
}
export default CreateMrin;