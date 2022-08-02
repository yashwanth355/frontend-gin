import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Paper, AccordionSummary, AccordionDetails, Container } from '@material-ui/core'
// import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import { } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import useToken from '../../../hooks/useToken';
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
    modalSelect: {
        minWidth: '100% !important'
    }
}));


const CreatePackagingType = (props) => {
    const classes = useStyles();
    const [packageTypeDetails, setPackageTypeDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");

    // const { getCurrentUserDetails } = useToken();

    useEffect(() => {
        //api calls to fetch incomplete quote ids, packing category, packing type, secondary packing,
    }, []);

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
        return formattedData;
    }

    const handleChange = (event, key,) => {
        let data = {
            ...packageTypeDetails,
            [key]: event.target.value
        }
        setPackageTypeDetails(data);
    };

    const formatPriceInfo = (payload = []) => {
        payload?.forEach(element => {
            element.po_createddt = element.po_createddt ? formatDate(element.po_createddt) : '';
            element.price = element.price ? parseFloat(element.price).toFixed(2) : '';
        })
    };

    const formatDate = (datestr) => {
        let dateVal = new Date(datestr);
        return dateVal.getDate() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getFullYear();
    }


    const payload1 = [
        {
            label: 'Quote Line Item Id *',
            type: 'select',
            value: packageTypeDetails.quoteLineItemId || '',
            required: true,
            disabled: false,
            error: validationError?.quoteLineItemId,
            helperText: validationError?.quoteLineItemId,
            options: formatToSelection([{ "quote": "1" }, { "quote": "2" }, { "quote": "3" }], "quote"),
            onChange: (e) => handleChange(e, 'quoteLineItemId'),
            sm: 12
        },
        {
            label: 'Packaging type',
            type: 'select',
            value: packageTypeDetails.quoteLineItemId || '',
            required: true,
            disabled: false,
            error: validationError?.quoteLineItemId,
            helperText: validationError?.quoteLineItemId,
            options: formatToSelection([{ "quote": "1" }, { "quote": "2" }, { "quote": "3" }], "quote"),
            onChange: (e) => handleChange(e, 'quoteLineItemId'),
            sm: 12
        },
        {
            label: 'Secondary Packaging',
            type: 'select',
            value: packageTypeDetails.quoteLineItemId || '',
            required: true,
            disabled: false,
            error: validationError?.quoteLineItemId,
            helperText: validationError?.quoteLineItemId,
            options: formatToSelection([{ "quote": "1" }, { "quote": "2" }, { "quote": "3" }], "quote"),
            onChange: (e) => handleChange(e, 'quoteLineItemId'),
            sm: 12
        },
        {
            label: 'Capacity(Quantity Pickable in Unit)',
            type: 'input',
            disabled: false,
            required: true,
            error: validationError?.capacity,
            helperText: validationError?.capacity,
            value: packageTypeDetails.capacity || '',
            onChange: (e) => handleChange(e, 'capacity'),
            sm: 12,
        },
        {
            label: 'Packing Unit UOM',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.packingUnit || '',
            onChange: (e) => handleChange(e, 'packingUnit'),
            sm: 12
        },

        {
            label: 'Carton Mode(Number of Units in Carton)',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.cartonMode || '',
            onChange: (e) => handleChange(e, 'cartonMode'),
            sm: 12,
        },

        {
            label: 'Cap Style',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.capStyle || '',
            onChange: (e) => handleChange(e, 'capStyle'),
            sm: 12
        },
        {
            label: 'Cost of Packing Type',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.costOfPackingType || '',
            onChange: (e) => handleChange(e, 'costOfPackingType'),
            sm: 12,
        },

    ]

    const payload2 = [
        {
            label: 'Packaging Category *',
            type: 'select',
            options: [],
            disabled: false,
            value: packageTypeDetails.packagingCategory || '',
            onChange: (e) => handleChange(e, 'packagingCategory'),
            sm: 12
        },
        {
            label: 'Height',
            type: 'input',
            disabled: false,
            required: true,
            error: validationError?.height,
            helperText: validationError?.height,
            value: packageTypeDetails.height || '',
            onChange: (e) => handleChange(e, 'height'),
            type: "number",
            md: 4,
        },
        {
            label: 'Width',
            type: 'input',
            disabled: false,
            required: true,
            error: validationError?.width,
            helperText: validationError?.width,
            value: packageTypeDetails.width || '',
            onChange: (e) => handleChange(e, 'width'),
            type: "number",
            md: 4,
        },
        {
            label: 'Length',
            type: 'input',
            disabled: false,
            required: true,
            error: validationError?.length,
            helperText: validationError?.length,
            value: packageTypeDetails.length || '',
            onChange: (e) => handleChange(e, 'length'),
            type: "number",
            md: 4,
        },
        {
            label: 'Packing Weight Alias',
            type: 'input',
            disabled: false,
            required: true,
            error: validationError?.packingWeightAlias,
            helperText: validationError?.packingWeightAlias,
            value: packageTypeDetails.packingWeightAlias || '',
            onChange: (e) => handleChange(e, 'packingWeightAlias'),
            sm: 12
        },

        {
            label: 'Cap Color',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.capColor || '',
            onChange: (e) => handleChange(e, 'capColor'),
            sm: 12
        },
        {
            label: 'Carton Color',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.cartonColor || '',
            onChange: (e) => handleChange(e, "cartonColor"),
            sm: 12
        },
        {
            label: 'Paletization Required',
            type: 'select',
            options: formatToSelection([{ paletize: "Yes" }, { paletize: "No" }], "paletize"),
            value: packageTypeDetails.paletizationRequired || '',
            onChange: (e) => handleChange(e, 'paletizationRequired'),
            sm: 12,
        },
        {
            label: 'Additional Packing Description',
            type: 'input',
            disabled: false,
            rows: 3,
            multiline: true,
            value: packageTypeDetails.additionalPackingDescription || '',
            onChange: (e) => handleChange(e, 'additionalPackingDescription'),
            sm: 12
        },

        {
            label: 'Cost of Pallet if Applicable',
            type: 'input',
            disabled: false,
            value: packageTypeDetails.costOfPallet || '',
            onChange: (e) => handleChange(e, 'costOfPallet'),
            sm: 12
        },
    ]

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Packing Types Master</Typography>
                </Grid>
            </Grid>
            <Grid container md={12} xs={12}>
                <Grid item md={6} xs={12}>
                    <Template payload={payload1} />
                </Grid>
                <Grid item md={6} xs={12}>
                    <Template payload={payload2} />
                </Grid>
            </Grid>
            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button label="Save" onClick={() => alert(JSON.stringify(packageTypeDetails, null, 3))} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={props.handleClose} />
                </Grid>
            </Grid>
        </form>
    )
}
export default CreatePackagingType;