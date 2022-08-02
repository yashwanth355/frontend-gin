import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SimpleModal from "../../../components/Modal";
import '../../common.css'
import { createOrUpdateMRINDetail, getMRINDetail, updateMRINGCSpec, getPOCreationInfo, } from "../../../apis";
import useToken from '../../../hooks/useToken';
import BasicTable from '../../../components/BasicTable';
import { roles } from '../../../constants/roles';
import { colors } from '../../../constants/colors';
import AuditLog from './AuditLog';

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
    control: {
        marginTop: 3,
        marginBottom: 3
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

const formatGCCompositions = (delivered_spec, dispatched_spec, expected_spec) => {
    return [
        {
            composition_name: "Density(Gm/Cc)",
            key: "del_density",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_density : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_density : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_density : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_density - delivered_spec[0].del_density) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_density : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_density : 0
        },
        {
            composition_name: "Moisture (%)",
            key: "del_moisture",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_moisture : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_moisture : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_moisture : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_moisture - delivered_spec[0].del_moisture) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_moisture : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_moisture : 0
        },
        {
            composition_name: "Sound Beans (%)",
            key: "del_soundbeans",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_soundbeans : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_soundbeans : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_soundbeans : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_soundbeans - delivered_spec[0].del_soundbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_soundbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_soundbeans : 0
        },
        {
            composition_name: "Browns (%)",
            key: "del_browns",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_browns : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_browns : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_browns : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_browns - delivered_spec[0].del_browns) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_browns : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_browns : 0
        },
        {
            composition_name: "Blacks (%)",
            key: "del_blacks",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_blacks : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_blacks : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_blacks : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_blacks - delivered_spec[0].del_blacks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_blacks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_blacks : 0
        },
        {
            composition_name: "Broken & Bits (%)",
            key: "del_brokenbits",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_brokenbits : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_brokenbits : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_brokenbits : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_brokenbits - delivered_spec[0].del_brokenbits) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_brokenbits : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_brokenbits : 0
        },
        {
            composition_name: "Insected beans (%)",
            key: "del_insectedbeans",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_insectedbeans : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_insectedbeans : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_insectedbeans : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_insectedbeans - delivered_spec[0].del_insectedbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_insectedbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_insectedbeans : 0
        },
        {
            composition_name: "Bleached (%)",
            key: "del_bleached",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_bleached : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_bleached : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_bleached : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_bleached - delivered_spec[0].del_bleached) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_bleached : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_bleached : 0
        },
        {
            composition_name: "Husk (%)",
            key: "del_husk",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_husk : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_husk : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_husk : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_husk - delivered_spec[0].del_husk) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_husk : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_husk : 0
        },
        {
            composition_name: "Sticks (%)",
            key: "del_sticks",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_sticks : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_sticks : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_sticks : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_sticks - delivered_spec[0].del_sticks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_sticks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_sticks : 0
        },
        {
            composition_name: "Stones (%)",
            key: "del_stones",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_stones : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_stones : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_stones : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_stones - delivered_spec[0].del_stones) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_stones : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_stones : 0
        },
        {
            composition_name: "Beans retained on 5mm mesh during sieve analysis",
            key: "del_beansretained",
            expected_spec: expected_spec !== null ? expected_spec[0].exp_beansretained : 0,
            dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_beansretained : 0,
            delivered_spec: delivered_spec !== null ? delivered_spec[0].del_beansretained : 0,
            difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_beansretained - delivered_spec[0].del_beansretained) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_beansretained : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_beansretained : 0
        },
    ];
};

const EditMrin = (props) => {
    const classes = useStyles();
    const [mrinDetails, setMrinDetails] = useState({});
    const [locationList, setLocationList] = useState([]);
    const [disableInvoice, setDisableInvoice] = useState(false);
    const [invoiceFile, setInvoiceFile] = useState({});
    const [uploadedFile, setUploadedFile] = useState({});
    const [validationError, setValidationError] = useState({});
    const [validationErrorPaid, setValidationErrorPaid] = useState({});
    const [openApprove, setApprove] = useState(false);
    const [openPaid, setPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otherChargesList, setOtherChargesList] = useState([]);
    const [tempOtherChargesList, setTempOtherChargesList] = useState([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }]);
    const [openOtherCharges, setOpenOtherCharges] = useState(false);
    const [chargesList, setChargesList] = useState([]);
    const [logData, setLogData] = useState([]);
    const [taxesList, setTaxesList] = useState([]);
    const [tempTaxChargesList, setTempTaxChargesList] = useState([{ tax_id: "", tax_perc: "" }]);
    const [domesticTaxesList, setDomesticTaxesList] = useState([]);
    const [domesticAllTaxesList, setDomesticAllTaxesList] = useState([])
    const [taxList, setTaxList] = useState([]);
    const [openTaxCharges, setOpenTaxCharges] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const { getCurrentUserDetails } = useToken();
    // eslint-disable-next-line
    const [compositions, setCompositions] = useState([]);

    let currentUserDetails = getCurrentUserDetails();

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data?.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
        return formattedData;
    }
    const handleClick = (index) => {
        let state = [...otherChargesList];
        // eslint-disable-next-line       
        // state.map((item, index1) => {
        //     if (index1 === index) {
        //         let temp = { ...purchaseDetails };
        //         delete purchaseDetails[item.name];
        //         setPurchaseDetails(temp);
        //     }
        // })
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
        let temp = { ...props.editData };
        temp.location = { label: props.editData?.silo_name, value: props.editData?.location_id };
        setMrinDetails(temp);
        setLogData(temp.audit_log_gc_po_mrin);
        getPOCreationInfo({ "type": "getDomesticTaxes" }).then(res1 => {
            // setDomesticTaxesList(formatToSelection(res, "tax_name", "tax_id"))
            setDomesticAllTaxesList(formatToSelection(res1, "tax_name", "tax_id"))
            let temp = props.editData;
            let tampDomestic = formatToSelection(res1, "tax_name", "tax_id");
            if (temp?.po_domestic_taxes !== null) {
                let temp2 = _.cloneDeep(temp?.po_domestic_taxes);
                var cgstVal = tampDomestic.find(val => val.label === 'CGST')?.value;
                var sgstVal = tampDomestic.find(val => val.label === 'SGST')?.value;
                var igstVal = tampDomestic.find(val => val.label === 'IGST')?.value;

                var iscgst = temp2?.findIndex(val => val.tax_id === cgstVal);
                var issgst = temp2?.findIndex(val => val.tax_id === sgstVal);
                var isigst = temp2?.findIndex(val => val.tax_id === igstVal);

                let temp1 = [...tampDomestic];
                let filterTemp = [];
                // eslint-disable-next-line
                temp?.po_domestic_taxes?.map((item, index) => {
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

        let tamp = temp.po_domestic_taxes != null ? temp.po_domestic_taxes.map((item, index) => {
            return { ...item, total_rate: parseFloat(item?.tax_pro_rate)?.toFixed(2) }
        }) : [];

        //   tamp.push({perc: res?.tds, tax_id: "1", tax_name: "TDS", total_rate: (parseFloat(res.totalPrice)*parseFloat(res?.tds ? res?.tds : 0))/100});
        setTaxList(tamp);

        setCompositions(formatGCCompositions(props.editData.delivered_spec, props.editData.dispatched_spec, props.editData.expected_spec));
        getMRINDetail({ type: "getDocumentsOnMRIN", mrinid: props.id }).then((res) => {
            if (res) {
                setInvoiceFile(res[res.length - 1]);
            }
        });
        const taxesPromise = new Promise((resolve, reject) => {
            getPOCreationInfo({ type: "getTaxes" }).then((res) => {
                resolve(res)
            }).catch((err) => {
                reject(err);
            })
        })

        const otherChargesPromise = new Promise((resolve, reject) => {
            getPOCreationInfo({ type: "miscCharges" }).then((res) => {
                resolve(res)
            }).catch((err) => reject(err))
        })
        Promise.all([taxesPromise, otherChargesPromise]).then(([taxes, miscCharges]) => {
            setTaxesList(formatToSelection(taxes, "tax_name", "tax_id"))
            setChargesList(formatToSelection(miscCharges, "misc_charges_name", "misc_id"))
            setOtherChargesList(temp?.taxes_misc_charges ?
                temp?.taxes_misc_charges?.map(charge => {
                    return {
                        label: miscCharges.find(miscCharge => miscCharge.misc_id === charge?.misc_id)?.misc_charges_name,
                        name: charge?.misc_id,
                        tax: charge?.taxid,
                        taxLabel: taxes.find(tax => tax.tax_id === charge?.taxid)?.tax_name,
                        rate: charge?.misc_charge_rate,
                        taxRate: !isNaN(charge.tax_percentage) ? parseFloat(charge?.tax_percentage) : 0.00,
                        total_tax_rate: ((1 + ((charge.tax_percentage !== '' && !isNaN(charge.tax_percentage)) ? parseFloat(charge.tax_percentage) : 0.00) / 100) * (charge.misc_charge_rate !== '' ? parseFloat(charge.misc_charge_rate) : 0.00)).toFixed(2)
                    }
                }) : []);
        })
        if (currentUserDetails.role !== roles.gcStoresExecutive && currentUserDetails?.role !== roles.managingDirector) {
            setDisableInvoice(true);
        }
        setLocationList(props?.allSilos === null ? [] : formatToSelection(props?.allSilos, "silo_name", "location_id"))
        // eslint-disable-next-line 
    }, [props.editData]);

    const handleChange = (event, key,) => {

        let data = { ...mrinDetails };

        data = {
            ...mrinDetails,
            [key]: event.target.value,
        }

        setMrinDetails(data);
    };

    const handleNumberChange = (event, key,) => {
        var bal = '';
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
            bal = parseFloat(mrinDetails.expected_quantity) - (parseFloat(val) + parseFloat(mrinDetails.delivered_quantity))
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
    };

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
                value: charge.tax_perc,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempTaxChargeChange(e, 'tax_perc', index),
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
                const emptyItemIndex = temp.findIndex(charge => charge.tax_id !== '1' && (charge.tax_id === "" || charge.tax_perc === ""));
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
                    temp.push({ tax_id: "", tax_perc: "" });
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
                        setTempTaxChargesList([{ tax_id: "", tax_perc: "" }]);
                        setOpenTaxCharges(!openTaxCharges);
                    }} />
                </Grid>
            </Grid>
        </Container>
    );


    const handleTaxClick = (index) => {
        let state = [...taxList];

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
            let data = {
                ...mrinDetails,
            }
            setMrinDetails(data);
        } else {
            let data = {
                ...mrinDetails,
            }
            setMrinDetails(data);
        }

    }

    const TaxChargesAction = async () => {
        let splicedList = tempTaxChargesList;
        splicedList.splice(tempTaxChargesList.length - 1, 1);
        let state = splicedList.map(list => {
            if (list.tax_id !== '1') {
                return {
                    tax_id: list.tax_id, tax_name: _.find(domesticTaxesList, { value: list.tax_id })?.label.toLowerCase(), tax_perc: list.tax_perc, total_rate: (((parseFloat(mrinDetails?.net_mrinvalue) * parseFloat(list.tax_perc)) / 100)?.toFixed(2)).toString(),
                }
            } else {
                return { tax_id: '1', tax_name: 'tds', tax_perc: list.tax_perc }
            }
        })
        let data = {
            ...mrinDetails,
        }
        setMrinDetails(data);
        setTaxList(state);
        setTempTaxChargesList([{ tax_id: "", tax_perc: "" }])
        setOpenTaxCharges(!openTaxCharges)
    }

    const handleChangeinvoice = (event, key) => {
        let data = {
            ...mrinDetails,
            [key]: event.target.value,
        }
        setMrinDetails(data);
    };

    const handlelocationChange = (event, value) => {
        let data = {
            ...mrinDetails,
            'location': value,
        }
        setMrinDetails(data);
    };

    const handleDateChange = (date, key,) => {
        let data = {
            ...mrinDetails,
            [key]: date
        }
        setMrinDetails(data);
    };
    const calculateMRINValue = () => {
        const purchasePrice = parseFloat(mrinDetails.purchase_price || 0);
        const conversionratio = parseFloat(mrinDetails?.conversationratio || 1);
        const deliveredQuantity = parseFloat(mrinDetails.delivered_quantity);
        // const otherCharges = otherChargesList.reduce((total, current) => parseFloat(current["total_tax_rate"] || 0) + total, 0)
        const otherCharges = otherChargesList.reduce((total, current) => parseFloat(current["total_tax_rate"] || 0) + total, 0)
        const poSubCategory = mrinDetails?.po_sub_category;
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
        if (_.isEmpty(mrinDetails.invoice_date?.toString())) {
            errorObj = { ...errorObj, invoice_date: message };
        }
        else {
            delete errorObj.invoice_date
        }
        if (_.isEmpty(mrinDetails.invoiceno?.toString())) {
            errorObj = { ...errorObj, invoiceno: message };
        }
        else {
            delete errorObj.invoiceno
        }
        if (_.isEmpty(mrinDetails.vehicle_no?.toString())) {
            errorObj = { ...errorObj, vehicle_no: message };
        }
        else {
            delete errorObj.vehicle_no
        }
        // if (_.isEmpty(mrinDetails.wayBillDate)) {
        //     errorObj = { ...errorObj, wayBillDate: message };
        // }
        // else {
        //     delete errorObj.wayBillDate
        // }
        if (_.isEmpty(mrinDetails.wayBillNumber)) {
            errorObj = { ...errorObj, wayBillNumber: message };
        }
        else {
            delete errorObj.wayBillNumber
        }
        // if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntry)) {
        //     errorObj = { ...errorObj, billOfEntry: message };
        // }
        // else {
        //     delete errorObj.billOfEntry
        // }
        // if (mrinDetails.subCategory === '1001' && _.isEmpty(mrinDetails.billOfEntryDate)) {
        //     errorObj = { ...errorObj, billOfEntryDate: message };
        // }
        // else {
        //     delete errorObj.billOfEntryDate
        // }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const error = { message: 'Please fill mandatory fields to update' }
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
            setLoading(true);
            let data = {
                "update": true,
                "type": uploadedFile?.document_name ? "uploadDocument" : "",
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "doc_kind": "MRIN",
                "document_content": uploadedFile?.file ? uploadedFile?.file : '',
                "document_name": uploadedFile?.document_name ? uploadedFile?.document_name : '',
                "expected_quantity": mrinDetails.expected_quantity,
                "detid": mrinDetails.detid,
                "delivery_date": mrinDetails.delivery_date,
                "delivered_quantity": mrinDetails.delivered_quantity,
                "wayment_shortage": mrinDetails.wayment_shortage,
                "balance_quantity": mrinDetails.balance_quantity ? mrinDetails.balance_quantity?.toString() === '' ? '0' : mrinDetails.balance_quantity?.toString() : '0',
                "mrinid": props.id,
                "invoice_date": mrinDetails.invoice_date ? mrinDetails.invoice_date : currentDate(),
                "invoice_no": mrinDetails.invoiceno,
                "vehicle_no": mrinDetails.vehicle_no,
                "invoice_quantity": mrinDetails.invoice_quantity,
                "wayBillDate": mrinDetails.wayBillDate,
                "wayBillNumber": mrinDetails.wayBillNumber,
                // "billOfEntry": mrinDetails.billOfEntry,
                // "billOfEntryDate": mrinDetails.billOfEntryDate,
                "apStatus": mrinDetails.apStatus,
                "apDetails": mrinDetails.apDetails,
                "qcStatus": mrinDetails.qcStatus,
                "invoiceAmount": mrinDetails.invoiceAmount,
                "location_id": mrinDetails.location?.value,
                "invoiceStatus": mrinDetails.invoiceStatus,
                "role": localStorage.getItem('currentUserRole'),
                "loggedinuserid": getCurrentUserDetails()?.id,
                "pono": mrinDetails.pono,
                "itemid": mrinDetails.item_id,
                "taxes_misc_charges": otherChargesList?.map(charge => {
                    return {
                        taxid: charge?.tax,
                        tax_percentage: charge?.taxRate.toString(),
                        misc_id: charge?.name,
                        misc_charge_rate: charge?.rate,
                        total_tax_rate: charge?.total_tax_rate,
                    }
                }),
                "po_domestic_taxes": taxList.filter(val => val.tax_id !== '1'),
                "mrinvalue": calculateMRINValue(),
            }
            console.log('data::', data)
            try {
                let response = await createOrUpdateMRINDetail(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN updated successfully",
                    });

                    setTimeout(() => {
                        setLoading(false);
                        props.back()
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

            let data1 = {
                "update_spec": true,
                "detid": mrinDetails.detid,
                "role": localStorage.getItem('currentUserRole'),
                "itemid": mrinDetails.item_id,
                "del_density": mrinDetails?.del_density?.toString(),
                "del_moisture": mrinDetails.del_moisture?.toString(),
                "del_soundbeans": mrinDetails?.del_soundbeans?.toString(),
                "del_browns": mrinDetails.del_browns?.toString(),
                "del_blacks": mrinDetails.del_blacks?.toString(),
                "del_brokenbits": mrinDetails.del_brokenbits?.toString(),
                "del_insectedbeans": mrinDetails.del_insectedbeans?.toString(),
                "del_bleached": mrinDetails.del_bleached?.toString(),
                "del_husk": mrinDetails.del_husk?.toString(),
                "del_sticks": mrinDetails.del_sticks?.toString(),
                "del_stones": mrinDetails.del_stones?.toString(),
                "del_beansretained": mrinDetails.del_beansretained?.toString(),
                "loggedinuserid": getCurrentUserDetails()?.id,
            };
            try {
                let response = await updateMRINGCSpec(data1)
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN GC specification updated successfully",
                    });
                    setTimeout(() => {
                        setLoading(false);
                        props.back()
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
    }
    // eslint-disable-next-line
    const onUpdateOrderSpec = (val) => {
        // eslint-disable-next-line
        let temp = { ...mrinDetails };
        // eslint-disable-next-line        
        val && val.map((item, index) => {
            temp[item.key] = parseFloat(item.delivered_spec);
        })
        setMrinDetails(temp);
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
        // setInvoiceFile({
        //     file_name: e.target.files[0].name,
        //     document_name: e.target.files[0].name,
        //     file: file
        // });
        setUploadedFile({
            file_name: e.target.files[0].name,
            document_name: e.target.files[0].name,
            file: file
        });
    }
    // eslint-disable-next-line
    const gcTableColumns = [
        { id: "composition_name", label: "Item" },
        { id: "expected_spec", label: "Expected" },
        { id: "dispatched_spec", label: "Dispatched" },
        {
            id: "delivered_spec", label: "Delivered", isEditable:
                currentUserDetails?.role === roles.managingDirector || currentUserDetails?.role === roles.qcManager,
            type: 'number',
        },
        { id: "difference", label: "Difference", isEditable: false, type: 'number' },
    ];

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
            value: mrinDetails.detid || '-',
            disabled: true
        },
        {
            label: 'Expected quantity(Kgs)',
            type: 'number',
            value: mrinDetails.expected_quantity ? parseFloat(mrinDetails.expected_quantity).toFixed(4) : '-',
            disabled: true
        },
        {
            label: 'Vehicle number',
            type: 'input',
            value: mrinDetails.vehicle_no || '',
            required: true,
            error: validationError?.vehicle_no,
            helperText: validationError?.vehicle_no,
            onChange: (e) => handleChangeinvoice(e, 'vehicle_no'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Invoice number',
            type: 'input',
            value: mrinDetails.invoiceno || '',
            required: true,
            error: validationError?.invoiceno,
            helperText: validationError?.invoiceno,
            onChange: (e) => handleChangeinvoice(e, 'invoiceno'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Invoice quantity(Kgs)',
            type: 'number',
            value: mrinDetails.invoice_quantity ? parseFloat(mrinDetails.invoice_quantity) : '',
            onChange: (e) => handleNumberChange(e, 'invoice_quantity'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Invoice date',
            type: 'datePicker',
            value: mrinDetails.invoice_date || currentDate(),
            required: true,
            error: validationError?.invoice_date,
            helperText: validationError?.invoice_date,
            onChange: (e) => handleDateChange(e, 'invoice_date'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Delivery date',
            type: 'datePicker',
            value: mrinDetails.delivery_date,
            required: true,
            error: validationError?.delivery_date,
            helperText: validationError?.delivery_date,
            onChange: (e) => handleDateChange(e, 'delivery_date'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Delivered quantity(Kgs)',
            type: 'number',
            // disabled: true,
            inputProps: { min: 0 },
            value: mrinDetails.delivered_quantity ? parseFloat(mrinDetails.delivered_quantity) : '-',
            required: true,
            error: validationError?.delivered_quantity,
            helperText: validationError?.delivered_quantity,
            onChange: (e) => { handleNumberChange(e, 'delivered_quantity') }
        },
        {
            label: 'Weighment shortage',
            type: 'number',
            disabled: true,
            value: mrinDetails.wayment_shortage ? parseFloat(mrinDetails.wayment_shortage).toFixed(4) : '',
            required: true,
            error: validationError?.wayment_shortage,
            helperText: validationError?.wayment_shortage,
            onChange: (e) => { handleNumberChange(e, 'wayment_shortage') }
        },
        {
            label: 'Balance quantity(Kgs)',
            type: 'number',
            disabled: true,
            value: mrinDetails.balance_quantity ? parseFloat(mrinDetails.balance_quantity).toFixed(4) : '',
        },
        {
            label: 'Way bill number',
            type: 'input',
            disabled: true,
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
            value: mrinDetails.wayBillDate,
            required: true,
            error: validationError?.wayBillDate,
            helperText: validationError?.wayBillDate,
            onChange: (e) => handleDateChange(e, 'wayBillDate'),
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Locations',
            type: 'autocomplete',
            labelprop: "label",
            value: mrinDetails.location ? mrinDetails.location : '',
            options: locationList || [],
            onChange: handlelocationChange,
            disabled: currentUserDetails?.role !== roles.gcStoresExecutive &&
                currentUserDetails?.role !== roles.managingDirector
        },
        {
            label: 'Coffee Grade',
            type: 'input',
            disabled: true,
            value: mrinDetails.coffee_grade,
            required: true,
            error: validationError?.coffee_grade,
            helperText: validationError?.coffee_grade,
            onChange: (e) => handleChange(e, 'coffee_grade'),
            sm: 6
        },
    ]
    // eslint-disable-next-line
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
        // {
        //     label: 'Bill of entry date',
        //     type: 'datePicker',
        //     value: mrinDetails.billOfEntryDate || null,
        //     required: true,
        //     error: validationError?.billOfEntryDate,
        //     helperText: validationError?.billOfEntryDate,
        //     onChange: (e) => handleDateChange(e, 'billOfEntryDate'),
        // },
        {
            label: 'Bill of entry conversion rate',
            type: 'input',
            value: mrinDetails.conversationratio || null,
            disabled: true,
        },
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
            value: mrinDetails.apDetails || "",
            disabled: true,
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
            value: mrinDetails.qcStatus || "-",
        },
    ]

    const payload4 = [
        {
            type: "label",
            value: "Invoice file",
            bold: true,
            sm: "1",
        },
        {
            type: "label",
            value: invoiceFile.document_name,
            sm: "6",
        },
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
    //         label: 'Download attachment',
    //         type: 'button',
    //         sm: 12,
    //         onClick: (e) => downloadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]

    // const payload6 = [
    //     {
    //         label: 'Upload attachment',
    //         type: 'button',
    //         sm: 12,
    //         disabled: disableUpload,
    //         onClick: (e) => uploadFileHandler(e, 'invoiceAttachment'),
    //     },
    // ]

    const payload7 = [
        {
            label: 'AP details',
            type: 'input',
            required: true,
            error: validationError?.apDetails,
            helperText: validationError?.apDetails,
            value: mrinDetails.apDetails || "",
            onChange: (e) => handleChange(e, 'apDetails'),
            className: classes.control,
            sm: 12
        },
        {
            label: 'Invoice amount',
            type: 'number',
            value: mrinDetails.invoiceAmount || "",
            required: true,
            error: validationErrorPaid?.invoiceAmount,
            helperText: validationErrorPaid?.invoiceAmount,
            onChange: (e) => handleNumberChange(e, 'invoiceAmount'),
            className: classes.control,
            sm: 12
        },
    ]

    const paidAction = async (e) => {

        let errorObj = {};
        const message = 'Please enter valid details';
        if (_.isEmpty(mrinDetails.invoiceAmount)) {
            errorObj = { ...errorObj, invoiceAmount: message };
        }
        if (_.isEmpty(mrinDetails.apDetails)) {
            errorObj = { ...errorObj, apDetails: message };
        }
        if (!_.isEmpty(mrinDetails.invoiceAmount) && (parseFloat(mrinDetails.invoiceAmount) > parseInt(mrinDetails.totalPrice))) {
            errorObj = { ...errorObj, invoiceAmount: 'Cannot enter Invoice Amount more than PO Total Amount.' };
        }
        if (!_.isEmpty(errorObj)) {
            setValidationErrorPaid(errorObj);
        } else {
            try {
                let response = await createOrUpdateMRINDetail({
                    "type": "Paid",
                    "role": currentUserDetails.role,
                    "createduserid": currentUserDetails.id,
                    "emailid": JSON.parse(localStorage.getItem('preference')).name,
                    "mrinid": props.id,
                    "apStatus": "Paid",
                    "apDetails": mrinDetails.apDetails,
                    "invoiceAmount": mrinDetails.invoiceAmount,
                    "loggedinuserid": getCurrentUserDetails()?.id,
                });
                if (response) {
                    setSnack({
                        open: true,
                        message: "MRIN paid successfully",
                    });
                    setPaid(!openPaid);
                    setTimeout(() => {
                        props.back()
                    }, 2000);
                }
            } catch (e) {
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
        }
    }

    const approveAction = async (e) => {
        try {
            let response = await createOrUpdateMRINDetail({
                "qcStatus": "Approved",
                "type": "Approve",
                "invoiceStatus": true,
                "emailid": JSON.parse(localStorage.getItem('preference')).name,
                "role": currentUserDetails.role,
                "createduserid": currentUserDetails.id,
                "mrinno": mrinDetails.mrinno,
                "pono": mrinDetails.pono,
                "mrinid": props.id,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
            if (response) {
                setSnack({
                    open: true,
                    message: "MRIN approved successfully",
                });
                setApprove(!openApprove);
                setTimeout(() => {
                    props.back()
                }, 2000);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }

    const paidHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Paid</h2>
            <Grid id="top-row">
                <Grid id="top-row" xs={6} md={12} direction="column">
                    <Template payload={payload7} />
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
                    <Button label="Yes" onClick={paidAction} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setPaid(!openPaid)} />
                </Grid>
            </Grid>
        </Container>
    );

    const approveHandler = () => (
        <Container className={classes.modal}>
            <h2 id="simple-modal-title">Approve</h2>
            <p>You are approving the Quality and invoice attachment. Are you sure you want to approve both?</p>
            <Grid
                id="top-row"
                container
                spacing={24}
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button label="Yes" onClick={approveAction} />
                </Grid>
                <Grid item>
                    <Button label="No" onClick={() => setApprove(!openApprove)} />
                </Grid>
            </Grid>
        </Container>
    );
    const handleOtherCharge = (add, index) => {
        let temp = _.cloneDeep(tempOtherChargesList);
        if (add) {
            temp.push({ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" });
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
        // let data = {};
        // let data = { ...purchaseDetails };
        // eslint-disable-next-line
        // state.map((item, index) => {
        //     data[item.name] = item.rate;
        // })
        // const totalPrice = purchaseDetails?.type === "1001" ?
        //     calculateTotalPriceImport(purchaseDetails?.grossPrice, purchaseDetails?.taxes, state) :
        //     calculateTotalPrice(data, state)
        // await setPurchaseDetails({ ...data, totalPrice });
        setOtherChargesList(state);
        setTempOtherChargesList([{ item: "", otherCharge: "", rate: "", tax: "", taxRate: "" }])
        setOpenOtherCharges(!openOtherCharges)
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

    const calculateTotalPrice = (data, otherChargesList = []) => {
        const otherCharge = (otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_price || 0);
            return total;
        }, 0)
        const purPrice = data?.purchase_price; //purchaseDetails.supplier_type_id === "1001" ? data?.purchase_price : data?.purchasePriceInr;
        const amount = parseFloat(purPrice || 0) * parseFloat(data.po_qty);
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tax_tds || 0) / 100));
        // const tax = parseFloat(data.cgst || 0) + parseFloat(data.sgst || 0) + parseFloat(data.igst || 0); taxList
        const tax = parseFloat(taxList.reduce((total, currentValue) => total = total + currentValue.tax_perc, 0));
        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        return taxedPrice + parseFloat(otherCharge);
    }

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
            value: mrinDetails.tax_tds === ""
            ? 0
            : parseFloat(mrinDetails?.tax_tds).toFixed(2),
            onChange: (e) => handleTaxChange(e, 'tax_tds'),
        }
    ];

    const addTaxHandler = () => {
        let tempTaxCharges = _.cloneDeep(taxList)?.map(charge => {
            return {
                tax_id: charge.tax_id,
                tax_perc: charge.tax_perc,

            }
        });
        console.log('state::2', tempTaxCharges)
        setTempTaxChargesList([...tempTaxCharges, ...tempTaxChargesList]);
        setOpenTaxCharges(!openTaxCharges)
    }

    const taxTableColumns = [
        { id: 'tax_name', label: 'Tax', type: "number" },//, isEditable: true
        { id: 'tax_perc', label: 'Tax Value(%)', type: "number" },//, isEditable: true
        { id: "total_rate", label: "Total Price", type: "number" },
        { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
    ];

    const taxrateUpdate = (total, otherChargesList) => {
        // const totalPrice =  calculateTotalPrice(total, otherChargesList)
        let data = {
            ...mrinDetails,
            // 'totalPrice': totalPrice,
        }
        setMrinDetails(data);
    }

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
                    mrinDetails.po_sub_category === 'Import' &&
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

        {props?.poDetails?.po_sub_category !== "Import" &&
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
                        <BasicTable rows={(otherChargesList)} columns={ocTableColumns} hasTotal={true} rowlength={otherChargesList.length} totalColId="total_tax_rate" colSpan={4}></BasicTable>
                    </>
                    {/* {purchaseDetails.type === "1001" && <Template payload={payload19} />} */}
                    {/* <Template payload={payload20} /> */}
                </Grid>
            </AccordionDetails>
        </Accordion>
        {mrinDetails.po_category === 'GC' ?
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid id="top-row" container>
                        <Grid item md={12} xs={12} className="item">
                            <Typography>Order specification information</Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container md={12} xs={12}>
                        <BasicTable
                            rows={compositions}
                            columns={gcTableColumns}
                            hasTotal={false}
                            mrinOtherSpec={true}
                            onUpdate={onUpdateOrderSpec}
                        ></BasicTable>
                    </Grid>
                </AccordionDetails>
            </Accordion> : null}
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
                        </Grid> */}
                    </Grid>
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
                <Button disabled={loading} label={loading ? 'Loading ...' : 'Save'} onClick={createMrinAction} />
            </Grid>
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
            {
                mrinDetails.status === "Pending with QC Approval" && (currentUserDetails.role === "QC Manager" || currentUserDetails.role === roles.managingDirector) &&
                <Grid item>
                    <Button label="Approve" disabled={true} onClick={() => setApprove(!openApprove)} />
                </Grid>
            }
            {
                mrinDetails.status === "Pending with Finance" && (currentUserDetails.role === "Accounts Executive" || currentUserDetails.role === "Accounts Manager" || currentUserDetails.role === roles.managingDirector) &&
                <Grid item>
                    <Button label="Paid" disabled={true} onClick={() => setPaid(!openPaid)} />
                </Grid>
            }
        </Grid>
        <SimpleModal
            open={openApprove}
            handleClose={() => setApprove(!openApprove)}
            body={approveHandler}
        />
        <SimpleModal
            open={openPaid}
            handleClose={() => setPaid(!openPaid)}
            body={paidHandler}
        />
        <SimpleModal open={openOtherCharges} handleClose={() => setOpenOtherCharges(!openOtherCharges)} body={otherChargesHandler} />
        <SimpleModal open={openTaxCharges} handleClose={() => setOpenTaxCharges(!openTaxCharges)} body={taxChargesHandler} />
    </form>)
}
export default EditMrin;