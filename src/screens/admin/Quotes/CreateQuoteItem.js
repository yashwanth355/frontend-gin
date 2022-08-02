import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import _ from 'lodash';
import { Grid, Typography, Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import useToken from '../../../hooks/useToken';
import { getQuoteItemsInfo, createQuoteItem, createQuoteItemCustom, getQuoteItems } from "../../../apis";
// import Fab from '../../../components/Fab';
// import CreatePackagingType from './CreatePackagingType';
import '../../common.css'
// import BasicTable from '../../../components/BasicTable';
// import { CheckBox } from '../../../components/CheckBox';
import { colors } from '../../../constants/colors';

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
    data?.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
}

const CreateQuoteItem = (props) => {
    const classes = useStyles();
    const [tempFactorsList, setTempFactorsList] = useState([{ factors: "", cost: "" }]);
    const [newOption, setNewOption] = useState({
        categoryId: false,
        categoryTypeId: false,
        upcId: false,
        cartonId: false,
        capId: false,
        weightId: false,
        secondaryId: false,
        secondaryTypeId: false,
    })
    // eslint-disable-next-line
    const [factorList, setFactoList] = useState([]);
    const [openFactors, setOpenFactors] = useState(false);
    const [quoteItemDetails, setQuoteItemDetails] = useState({});
    const [validationError, setValidationError] = useState({});
    const [category, setCategory] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [categoryTypeId, setCategoryTypeId] = useState(0);
    const [weightId, setWeightId] = useState(0);
    const [secondaryId, setSecondaryId] = useState(0);
    const [secondaryCountId, setSecondaryCountId] = useState(0);
    const [capTypeId, setCapTypeId] = useState(0);
    const [cartonTypeId, setCartonTypeId] = useState(0);
    const [upcId, setUpcId] = useState(0);
    const [isCategoryTypeDisabled, setCategoryTypeDisabled] = useState(true);
    const [categoryType, setCategoryType] = useState([]);
    const [isWeightDisabled, setWeightDisabled] = useState(true);
    const [isPalletizationDisabled, setPalletizationDisabled] = useState(true);
    const [isSecondaryDisabled, setSecondaryDisabled] = useState(true);
    // const [isPackingCategoryDisabled, setIsPackingCategoryDisabled] = useState(false);
    const [secondary, setSecondary] = useState([]);
    const [isSecondaryCountDisabled, setSecondaryCountDisabled] = useState(true);
    const [secondaryCount, setSecondaryCount] = useState([]);
    const [isUpcDisabled, setUpcDisabled] = useState(true);
    const [upc, setUpc] = useState([]);
    const [isCartonDisabled, setCartonDisabled] = useState(true);
    const [disableCreate, setDisableCreate] = useState(false);
    const [carton, setCarton] = useState([]);
    const [isCapDisabled, setCapDisabled] = useState(true);
    const [cap, setCap] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formobj, setFormobj] = useState({});
    const [isNewPackingType, setIsNewPackingType] = useState(false);
    // eslint-disable-next-line
    // const [isPackagingRequirementDisabled, setPackagingRequirementDisabled] = useState(true);
    const [weight, setWeight] = useState([]);
    const [sample, setSample] = useState([]);
    const [sampleCoffee, setSampleCoffee] = useState([]);
    const [quoteLineItems, setQuoteLineItems] = useState([]);
    const [clonedQuoteLineItem, setClonedQuoteLineItem] = useState('');
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    useEffect(() => {
        getQuoteItemsInfo({ "type": "allCategories", "loggedinuserid": getCurrentUserDetails()?.id, }).then(res => setCategory(formatToSelection(res, 'category_name', 'category_id')));

        getQuoteItemsInfo({
            "type": "samplecode",
            "account_id": props.accountId?.toString(),
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(res => {
            setSample(formatToSelection(res, 'sample_code', 'sample_id'))
            setSampleCoffee(res);
        });

        // eslint-disable-next-line 
    }, []);
    const handleChange = (event, key,) => {
        let data = {
            ...quoteItemDetails,
            [key]: event.target.value
        }
        setQuoteItemDetails(data);
    };

    const handleisPalletizationChange = (event, value) => {
        let data = {
            ...quoteItemDetails,
            'isPalletization': value?.value
        }
        setQuoteItemDetails(data);
    };

    const handleSampleChange = (event, value) => {
        let coffee = sampleCoffee ? sampleCoffee.find(sam => sam.sample_code === value?.label) : null;
        let data = {
            ...quoteItemDetails,
            'sampleId': value?.value,
            'coffeeType': coffee?.coffee_tyoe,
        }
        setQuoteItemDetails(data);
    };

    const fillWeight = (categoryId, typeId, isNewPackingType) => {
        setWeightId(0);
        setWeightDisabled(true);
        const payload = isNewPackingType ? { "category_id": -1, "categorytype_id": -1, "type": "weights", "newpacktype": true } :
            {
                "type": "weights",
                "newpacktype": isNewPackingType,
                "category_id": categoryId || 0,
                "categorytype_id": typeId || 0,
                "loggedinuserid": getCurrentUserDetails()?.id,
            }
        getQuoteItemsInfo(payload).then(res => {
            setWeight(formatToSelection(res, 'weight_name', 'weight_id'));
            if (res) {
                setWeightDisabled(false);
            }
        });
    }

    const fillSecondaryCount = (categoryId, typeId, weightId, secondaryId, isNewPackingType) => {
        setSecondaryCountId(0);
        setSecondaryCountDisabled(true);
        const payload = isNewPackingType ?
            {
                "type": "noofsecondarypacks",
                "category_id": -1,
                "categorytype_id": -1,
                "weight_id": -1,
                "secondary_id": -1,
                "newpacktype": true,
                "loggedinuserid": getCurrentUserDetails()?.id,
            } :
            {
                "type": "noofsecondarypacks",
                "category_id": categoryId || 0,
                "categorytype_id": typeId || 0,
                "weight_id": weightId || 0,
                "secondary_id": secondaryId || 0,
                "loggedinuserid": getCurrentUserDetails()?.id,
            }
        getQuoteItemsInfo(payload).then(res => {
            setSecondaryCount(formatToSelection(res, 'noofsecondary_name', 'noofsecondary_id'));
            if (res) {
                setSecondaryCountDisabled(false);
            }
        });
    }

    const fillUpc = (categoryId, typeId, weightId, secondaryId, isNewPackingType) => {
        setUpcId(0);
        setUpcDisabled(true);

        const payload = isNewPackingType ? {
            "type": "upcs",
            "category_id": -1,
            "categorytype_id": -1,
            "weight_id": -1,
            "secondary_id": -1,
            "newpacktype": true,
            "loggedinuserid": getCurrentUserDetails()?.id,
        } : {
            "type": "upcs",
            "category_id": categoryId,
            "categorytype_id": typeId,
            "weight_id": weightId,
            "secondary_id": secondaryId,
            "newpacktype": isNewPackingType,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setUpc(formatToSelection(res, 'upc_name', 'upc_id'));
            if (res) {
                setUpcDisabled(false);
            }
        });
    }

    const fillCap = (categoryId, isNewPackingType) => {
        setCapTypeId(0);
        setCapDisabled(true);
        if ((categoryId === 2 || categoryId === 1 || categoryId === 4 || categoryId === 5) && !isNewPackingType) {
            setCap([]);
            return;
        }
        getQuoteItemsInfo({
            "type": "captypes",
            "newpacktype": isNewPackingType,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(res => {
            setCap(formatToSelection(res, 'captype_name', 'captype_id'));
            if (res) {
                setCapDisabled(false);
            }
        });
    }

    const fillCarton = (categoryId, weightId, isNewPackingType) => {
        setCartonTypeId(0);
        setCartonDisabled(true);
        if (((categoryId === 2 && !weightId) || categoryId === 1) && !isNewPackingType) {
            setCarton([]);
            return;
        }
        getQuoteItemsInfo({
            "type": "cartontypes",
            "newpacktype": isNewPackingType,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(res => {
            setCarton(formatToSelection(res, 'cartontype_name', 'cartontype_id'));
            if (res) {
                setCartonDisabled(false);
            }
        });
    }

    const handleChangeType = (e, name) => {
        setFormobj(state => ({
            ...state,
            [name]: formobj[name] !== true ? true : false
        }))
    }


    const handleCategoryChange = (event, value) => {

        const index = category?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, categoryId: true };
        }
        else {
            newOptions = { ...newOption, categoryId: false }
        }
        setNewOption(newOptions)
        const newPackingType = Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false)
        setIsNewPackingType(newPackingType)
        setCategoryId(value?.value);
        setCategoryTypeId(0);
        setWeight([]);
        setSecondaryId(0);
        setSecondaryCountId(0);
        setSecondaryCount([]);
        setUpc([]);
        setSecondary([]);
        setCarton([]);
        setCap([]);
        setUpcDisabled(true);
        setSecondaryDisabled(true);
        setCategoryTypeDisabled(true);
        setSecondaryCountDisabled(true);
        setCartonDisabled(true);
        setCapDisabled(true);
        const payload = newPackingType ?
            {
                "type": "categoryTypes",
                "newpacktype": true,
                "category_id": -1,
                "loggedinuserid": getCurrentUserDetails()?.id,
            } : {
                "type": "categoryTypes",
                "category_id": value?.value,
                "loggedinuserid": getCurrentUserDetails()?.id,
            }
        getQuoteItemsInfo(payload).then(res => {
            setCategoryType(formatToSelection(res, 'categorytype_name', 'categorytype_id'));
            if (res) {
                setCategoryTypeDisabled(false);
            }
        });
        fillWeight(value?.value, null, index === -1 || isNewPackingType);
        fillSecondaryCount(value?.value, null, null, null, index === -1 || isNewPackingType);
        setPalletizationDisabled(false);
    };

    const handleCategoryTypeChange = (event, value) => {
        const index = categoryType?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, categoryTypeId: true };
        }
        else {
            newOptions = { ...newOption, categoryTypeId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setCategoryType(state => { return [...state, value] })
        setCategoryTypeId(value?.value);
        setWeight([]);
        setSecondaryId(0);
        setUpcId(0);
        setCartonTypeId(0);
        setCapTypeId(0);
        setSecondaryCountId(0);
        setSecondaryCount([]);
        setUpc([]);
        setSecondary([]);
        setCarton([]);
        setCap([]);
        setUpcDisabled(true);
        setSecondaryDisabled(true);
        setSecondaryCountDisabled(true);
        setCartonDisabled(true);
        setCapDisabled(true);
        fillWeight(categoryId, value?.value, index === -1 || isNewPackingType);
    };

    const handleWeightChange = (event, value) => {
        const index = weight?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, weightId: true };
        }
        else {
            newOptions = { ...newOption, weightId: false }
        }
        setNewOption(newOptions)
        const newpackingType = Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false)
        setIsNewPackingType(newpackingType)
        // setWeight(state => { return [...state, value] })
        setWeightId(value?.value);
        setSecondaryDisabled(true);
        setUpcId(0);
        setUpc([]);
        setUpcDisabled(true);
        const payload = newpackingType ? {
            "type": "secondarypackings",
            "category_id": -1,
            "categorytype_id": -1,
            "weight_id": -1,
            "newpacktype": true,
            "loggedinuserid": getCurrentUserDetails()?.id,
        } : {
            "type": "secondarypackings",
            "category_id": categoryId,
            "categorytype_id": categoryTypeId,
            "weight_id": value?.value,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setSecondary(formatToSelection(res, 'secondary_name', 'secondary_id'));
            if (res) {
                setSecondaryDisabled(false);
            }
        });
        fillUpc(categoryId, categoryTypeId, value?.value, secondaryId, index === -1 || isNewPackingType);
        if (categoryId === 2) {
            fillCarton(categoryId, value?.value, index === -1 || isNewPackingType);
        }
    };
    const handleSecondaryChange = (event, value) => {
        const index = secondary?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, secondaryId: true };
        }
        else {
            newOptions = { ...newOption, secondaryId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setSecondary(state => { return [...state, value] })
        setSecondaryId(value?.value);
        setCapTypeId(0);
        setCap([]);
        setCapDisabled(true);
        fillCarton(categoryId, null, index === -1 || isNewPackingType);
        fillUpc(categoryId, categoryTypeId, weightId, value?.value, index === -1 || isNewPackingType)
        fillSecondaryCount(categoryId, categoryTypeId, weightId, value?.value, index === -1 || isNewPackingType);
    };

    const handleSecondaryCountChange = (event, value) => {
        const index = secondaryCount?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, secondaryCountId: true };
        }
        else {
            newOptions = { ...newOption, secondaryCountId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setSecondaryCount(state => { return [...state, value] })
        setSecondaryCountId(value?.value);
        fillCarton(categoryId, null, index === -1 || isNewPackingType);
        fillCap(categoryId, index === -1 || isNewPackingType);
    };

    const handleUpcChange = (event, value) => {
        const index = upc?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, upcId: true };
        }
        else {
            newOptions = { ...newOption, upcId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setUpc(state => { return [...state, value] })
        setUpcId(value?.value);
        setCapTypeId(0);
        setCap([]);
        setCapDisabled(true);
        fillCarton(categoryId, weightId, index === -1 || isNewPackingType);
    };

    const handleCartonChange = (event, value) => {
        const index = carton?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, cartonId: true };
        }
        else {
            newOptions = { ...newOption, cartonId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setCarton(state => { return [...state, value] })
        setCartonTypeId(value?.value);
        fillCap(categoryId, index === -1 || isNewPackingType);
    };

    const handleCapChange = (event, value) => {
        const index = cap?.findIndex(val => val?.value === value?.value);
        let newOptions;
        if (index <= -1) {
            newOptions = { ...newOption, capId: true };
        }
        else {
            newOptions = { ...newOption, capId: false }
        }
        setNewOption(newOptions)
        setIsNewPackingType(Object.keys(newOptions).reduce((accumlator, current) => { return accumlator || newOptions[current] }, false))
        // setCap(state => { return [...state, value] })
        setCapTypeId(value?.value);
    };

    // const handleNewTypeChange = (event, key,) => {
    //     let data = {
    //         ...quoteItemDetails,
    //         [key]: event.target.value,
    //     }
    //     if (event.target.value === "Yes") {
    //         setIsPackingCategoryDisabled(true);
    //         handleCategoryChange(null, null);
    //         // setPackagingRequirementDisabled(false);
    //         setPalletizationDisabled(true);
    //     } else {
    //         data.taskdesc = "";
    //         setIsPackingCategoryDisabled(false);
    //         // setPackagingRequirementDisabled(true);
    //     }
    //     setQuoteItemDetails(data);
    // };

    const createQuoteItemCustomAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(quoteItemDetails?.sampleId)) {
            errorObj = { ...errorObj, sampleId: message }
        }
        if (_.isEmpty(categoryId?.toString()) || categoryId === undefined) {
            errorObj = { ...errorObj, category: message }
        }
        if (quoteItemDetails.isPalletization === undefined || _.isEmpty(quoteItemDetails.isPalletization.toString())) {
            if ((quoteItemDetails.isreqnew_packing === undefined || quoteItemDetails.isreqnew_packing === 'No')) {
                errorObj = { ...errorObj, isPalletization: message };
            }
        }
        if (!categoryId && quoteItemDetails.isreqnew_packing === "No") {
            errorObj = { ...errorObj, category: message };
        }
        // if (_.isEmpty(quoteItemDetails.orderQty)) {
        //     errorObj = { ...errorObj, orderQty: message };
        // }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.response?.data
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            let data =
            {

                "quote_id": props.quoteId,
                "quote_number": props.quoteId.toString(), //need info
                "quotelineine_number": props.quoteId.toString(), // need info
                "sample_code": quoteItemDetails.sampleId,
                "category_name": categoryId,
                "categorytype_name": categoryTypeId,
                "weight_name": weightId,
                "cartontype_name": cartonTypeId,
                "captype_name": capTypeId,
                "noofsecondary_name": secondaryCountId,
                "upc_name": upcId,
                "additional_req": quoteItemDetails.additionalRequirements,
                "isreqnew_packing": quoteItemDetails.isreqnew_packing ? quoteItemDetails.isreqnew_packing === 'Yes' ? true : false : false,
                "created_by": currentUserDetails.name,
            }
            setLoading(true);
            setDisableCreate(true);
            try {
                let response = await createQuoteItemCustom(data)
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote Item created successfully",
                    });
                    setTimeout(() => {
                        // props.back()
                    }, 2000)
                }


            } catch (e) {
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
                setDisableCreate(false);
            }
            finally {
                // setLoading(false);
            }
        }
    }
    const createQuoteItemAction = async () => {
        const message = 'Please enter valid details';
        let errorObj = {};
        if (_.isEmpty(quoteItemDetails?.sampleId)) {
            errorObj = { ...errorObj, sampleId: message }
        }
        if (_.isEmpty(categoryId?.toString()) || categoryId === undefined) {
            errorObj = { ...errorObj, category: message }
        }
        if (quoteItemDetails.isPalletization === undefined || _.isEmpty(quoteItemDetails.isPalletization.toString())) {
            if ((quoteItemDetails.isreqnew_packing === undefined || quoteItemDetails.isreqnew_packing === 'No')) {
                errorObj = { ...errorObj, isPalletization: message };
            }
        }
        if (!categoryId && quoteItemDetails.isreqnew_packing === "No") {
            errorObj = { ...errorObj, category: message };
        }
        if (_.isEmpty(quoteItemDetails.orderQty)) {
            errorObj = { ...errorObj, orderQty: message };
        }
        // if (_.isEmpty(quoteItemDetails.sampleId)) {
        //     errorObj = { ...errorObj, sampleId: message };
        // }
        if (!_.isEmpty(errorObj)) {
            try {
                setValidationError(errorObj);
                const errorMessage = { message: "Please fill all mandatory fields to save" }
                throw errorMessage
            }
            catch (err) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: err.response?.data
                })
                setTimeout(() => {
                    setSnack({
                        open: false,
                        message: "",
                    })
                }, 2000)
            }
        } else {
            let data =
            {
                "update": false,
                "quote_id": props.quoteId,
                "sample_id": quoteItemDetails.sampleId,
                "category_id": typeof categoryId !== "string" ? categoryId : null,
                "categorytype_id": typeof categoryTypeId !== "string" ? categoryTypeId : null,
                "weight_id": typeof weightId !== "string" ? weightId : null,
                "cartontype_id": typeof cartonTypeId !== "string" ? cartonTypeId : null,
                "captype_id": typeof capTypeId !== "string" ? capTypeId : null,
                "secondary_id": typeof secondaryId !== "string" ? secondaryId : null,
                "noofsecondary_id": typeof secondaryCountId !== "string" ? secondaryCountId : null,
                "upc_id": typeof upcId !== "string" ? upcId : null,
                "palletizationrequire_id": (quoteItemDetails.isreqnew_packing === undefined || quoteItemDetails.isreqnew_packing === 'No') ? quoteItemDetails.isPalletization : null,
                "customerbrand_name": quoteItemDetails.customerBrand,
                "additional_req": quoteItemDetails.additionalRequirements,
                "expectedorder_kgs": parseInt(quoteItemDetails.orderQty),
                "isreqnew_packing": quoteItemDetails.isreqnew_packing ? quoteItemDetails.isreqnew_packing === 'Yes' ? true : false : false,
                "taskdesc": quoteItemDetails.taskdesc,
                "created_date": new Date(),
                "created_by": currentUserDetails.name,
                "created_byuserid": currentUserDetails.id,
                "cloned_quoteitemid": clonedQuoteLineItem,
            }
            if (isNewPackingType) data.isreqnew_packing = true;
            setLoading(true);
            setDisableCreate(true);
            try {
                let response;
                if (isNewPackingType) {
                    await createQuoteItem(data)
                    response = await createQuoteItemCustom({
                        "quote_id": props.quoteId,
                        "quote_number": props?.quoteNumber,
                        "sample_code": quoteItemDetails?.sampleId,
                        "category_name": typeof categoryId === "string" ?
                            categoryId : category.find(val => val.value === categoryId)?.label,
                        "categorytype_name": typeof categoryTypeId === "string" ?
                            categoryTypeId : categoryType.find(val => val.value === categoryTypeId)?.label,
                        "weight_name": typeof weightId === "string" ?
                            weightId : weight.find(val => val.value === weightId)?.label,
                        "cartontype_name": typeof cartonTypeId === "string" ?
                            cartonTypeId : carton.find(val => val.value === cartonTypeId)?.label,
                        "captype_name": typeof capTypeId === "string" ?
                            capTypeId : cap.find(val => val.value === capTypeId)?.label,
                        "secondary_name": typeof secondaryId === "string" ?
                            secondaryId : secondary.find(val => val.value === secondaryId)?.label,
                        "noofsecondary_name": typeof secondaryCountId === "string" ?
                            secondaryCountId : secondaryCount.find(val => val.value === secondaryCountId)?.label,
                        "upc_name": typeof upcId === "string" ?
                            upcId : upc.find(val => val.value === upcId)?.label,
                        "additional_req": quoteItemDetails?.taskdesc,
                        "isreqnew_packing": 1,
                        "createduserid": currentUserDetails.id,
                    })
                }
                else response = await createQuoteItem(data);
                if (response) {
                    setSnack({
                        open: true,
                        message: "Quote Item created successfully",
                    });
                    setTimeout(() => {
                        // props.back()
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
    const getAutocompleteValue = (options = [], value) => {
        return options?.filter(option => option.value === value)[0]
    }
    const payload = [
        {
            label: 'Sample code',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(sample, quoteItemDetails.sampleId) || '',
            required: true,
            error: validationError?.sampleId,
            helperText: validationError?.sampleId,
            options: sample || [],
            onChange: handleSampleChange
        },
        {
            label: 'Coffee type',
            type: 'input',
            disabled: true,
            // onChange: (e) => handleChange(e, 'coffeeType'),  
            value: quoteItemDetails.coffeeType || ''
        },
        {
            label: 'Customer brand name',
            type: 'input',
            value: quoteItemDetails.customerBrand || '',
            onChange: (e) => handleChange(e, 'customerBrand')
        },
    ];
    // eslint-disable-next-line
    const payload14 = [
        {
            type: 'label',
            value: "Sample Code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.sample_code,
            sm: '6'
        },
        {
            type: 'label',
            value: "Description",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
        {
            type: 'label',
            value: "Product Code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        }
    ];
    // eslint-disable-next-line
    const payload15 = [
        {
            type: 'label',
            value: "Product Subtype",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
        {
            type: 'label',
            value: "Aroma",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        },
        {
            type: 'label',
            value: "Aroma Quantity (Litres/Hour)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: '-',
            sm: '6'
        }
    ];

    // const alternativeSample = [
    //     { id: "name", label: "Item Name" },
    //     { id: "ratio", label: "Ratio" },
    //     { id: "perc", label: "Perc" }
    // ];

    // const packingCostings = [
    //     { id: "factors", label: "Factors" },
    //     { id: "rate", label: "Rate From Purchase(Per KG)" },
    //     { id: "rate_comm", label: "Factor Rate From Commercial (Per KG)" }
    // ];

    // let packingCostingData = [
    //     {
    //         factors: 'Packing Cost',
    //         rate: '4.481',
    //         rate_comm: '4.481'
    //     },
    //     {
    //         factors: 'Packing Cost',
    //         rate: '4.481',
    //         rate_comm: '0.000'
    //     }
    // ]

    // let alternativeData = [
    //     {
    //         name: 'D-AGNA-ROCHWM-SCC-A66',
    //         checked: true,
    //         data: [
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             },
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             },
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             }
    //         ]
    //     },
    //     {
    //         name: 'D-AGNA-ROCHWM-SCC-A66',
    //         checked: true,
    //         data: [
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             },
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             },
    //             {
    //                 name: 'vietnam robusta gr-2',
    //                 ratio: '2.50',
    //                 perc: '63'
    //             }
    //         ]
    //     }
    // ];

    // const addFactors = () => {
    //     let tempFactors = _.cloneDeep(factorList)?.map(charge => {
    //         return {
    //             factors: charge.factors,
    //             cost: charge.cost,

    //         }
    //     });
    //     console.log('state::2', tempFactors)
    //     setTempFactorsList([...tempFactors, ...tempFactorsList]);
    //     setOpenFactors(!openFactors)
    // }

    // const factorTableColumns = [
    //     { id: 'factors', label: 'Factors', type: "text" },
    //     { id: 'cost', label: 'Cost', type: "number" },
    // ];

    const FactorAction = () => {

    }

    const handleFactorCharge = (add, index, charges) => {
        let temp = _.cloneDeep(tempFactorsList);

        if (add) {
            const emptyItemIndex = temp.findIndex(charge => !charge.factors || charge.cost === "");
            if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
            else {
                temp.push({ factors: "", cost: "" });
            }
        } else {
            temp.splice(index, 1);
        }

        setTempFactorsList(temp);
    }

    const handleTempFactorChange = (event, key, index) => {
        var value = (key === "cost") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempFactorsList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempFactorsList(temp);
    }

    const getFactorsPayload = (charge, index) => {
        return [
            {
                label: 'Factors',
                type: 'input',
                value: charge.factors,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempFactorChange(e, 'factors', index),
                key: index,
                sm: 6
            },
            {
                label: 'Cost',
                type: 'number',
                value: charge.cost,
                className: classes.otherModal,
                // onChange: (e) => handleRateChange(e, 'rate'),
                onChange: (e) => handleTempFactorChange(e, 'cost', index),
                sm: 3,
                key: index,
            },
            {
                label: tempFactorsList.length === index + 1 ? 'Add' : 'Delete',
                type: 'button',
                className: classes.button,
                onClick: tempFactorsList.length === index + 1 ? () => handleFactorCharge(true, index, charge) :
                    () => handleFactorCharge(false, index, charge),
                disabled: !!charge.error && tempFactorsList.length === index + 1,
                sm: 3
            },
        ]
    }
    // eslint-disable-next-line
    const factorHandler = () => (
        <Container className={classes.modal1}>
            <h2 id="simple-modal-title">Factor Details</h2>
            <Grid id="top-row" container>
                <Grid id="top-row" xs={8} md={12} container direction="column">
                    {tempFactorsList.map((charge, index) => <Template payload={getFactorsPayload(charge, index)} key={index} justify={"space-around"} align={"center"} />)}
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
                    <Button label="Save" onClick={FactorAction} disabled={tempFactorsList.some(charge =>
                        !!charge.error)} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => {
                        setTempFactorsList([{ factors: "", cost: "" }]);
                        setOpenFactors(!openFactors);
                    }} />
                </Grid>
            </Grid>
        </Container>
    );

    // const payload1 = [
    //     {
    //         label: 'Request new packaging type',
    //         type: 'radio',
    //         value: quoteItemDetails.isreqnew_packing || 'No',
    //         options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }],
    //         sm: 6,
    //         onChange: (e) => handleNewTypeChange(e, 'isreqnew_packing')
    //     },
    //     {
    //         label: 'New packaging type requirement',
    //         type: 'input',
    //         multiline: true,
    //         disabled: isPackagingRequirementDisabled,
    //         rows: 3,
    //         value: quoteItemDetails.taskdesc || '',
    //         onChange: (e) => handleChange(e, 'taskdesc')
    //     }
    // ];

    let pc =
    {
        label: 'Packaging category',
        type: 'autocompleteAdd',
        labelprop: "label",
        required: true,
        // disabled: isPackingCategoryDisabled,
        error: validationError?.category,
        helperText: validationError?.category,
        value: getAutocompleteValue(category, categoryId) || categoryId,
        options: category || [],
        onChange: handleCategoryChange,
        onClick: (e) => handleChangeType(e, 'category'),
    }
    let pt =
    {
        label: 'Packaging type',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isCategoryTypeDisabled,
        value: getAutocompleteValue(categoryType, categoryTypeId) || categoryTypeId,
        options: categoryType || [],
        onChange: handleCategoryTypeChange,
        onClick: (e) => handleChangeType(e, 'categoryType'),
    }
    let wt =
    {
        label: 'Weight',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isWeightDisabled,
        value: getAutocompleteValue(weight, weightId) || weightId,
        options: weight || [],
        onChange: handleWeightChange,
        onClick: (e) => handleChangeType(e, 'weight'),
    }
    let sp =
    {
        label: 'Secondary packaging',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isSecondaryDisabled,
        value: getAutocompleteValue(secondary, secondaryId) || secondaryId,
        options: secondary,
        onChange: handleSecondaryChange,
        onClick: (e) => handleChangeType(e, 'secondary'),
    }

    let scid =
    {
        label: 'No of secondary packs/master carton',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isSecondaryCountDisabled,
        value: getAutocompleteValue(secondaryCount, secondaryCountId) || secondaryCountId,
        options: secondaryCount || [],
        onChange: handleSecondaryCountChange,
        onClick: (e) => handleChangeType(e, 'secondaryCount'),

    }
    let upcs =
    {
        label: 'UPC',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isUpcDisabled,
        value: getAutocompleteValue(upc, upcId) || upcId,
        options: upc,
        onChange: handleUpcChange,
        onClick: (e) => handleChangeType(e, 'upc'),
    }
    let ct =
    {
        label: 'Carton type',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isCartonDisabled,
        value: getAutocompleteValue(carton, cartonTypeId) || cartonTypeId,
        options: carton || [],
        onChange: handleCartonChange,
        onClick: (e) => handleChangeType(e, 'carton'),

    }

    let caps =
    {
        label: 'Cap type',
        type: 'autocompleteAdd',
        labelprop: "label",
        disabled: isCapDisabled,
        value: getAutocompleteValue(cap, capTypeId) || capTypeId,
        options: cap || [],
        onChange: handleCapChange,
        onClick: (e) => handleChangeType(e, 'cap'),

    }
    let palletization =
    {
        label: 'Is palletization required?',
        type: 'autocomplete',
        labelprop: "label",
        disabled: isPalletizationDisabled,
        required: true,
        error: validationError?.isPalletization,
        helperText: validationError?.isPalletization,
        value: getAutocompleteValue([{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], quoteItemDetails.isPalletization) || 0,
        options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }],
        onChange: handleisPalletizationChange,
        onClick: (e) => handleChangeType(e, 'isPalletization'),
    }
    let quoteItems =
        [{
            label: 'Quote Item',
            type: 'autocomplete',
            labelprop: "label",
            value: getAutocompleteValue(quoteLineItems, clonedQuoteLineItem) || '',
            options: quoteLineItems || [],
            onChange: (event, value) => setClonedQuoteLineItem(value?.value),
        }]
    const payload2 = [
        pc,
        pt,
        wt,
        sp,
        scid,
        upcs,
        ct,
        caps,
        palletization,
        {
            label: 'Additional requirements',
            type: 'input',
            value: quoteItemDetails.additionalRequirements || '',
            multiline: true,
            onChange: (e) => handleChange(e, 'additionalRequirements'),
        },
    ]

    const payload3 = [
        {
            label: 'Expected order Qty(Kg)',
            type: 'input',
            required: true,
            error: validationError?.orderQty,
            helperText: validationError?.orderQty,
            value: quoteItemDetails.orderQty || '',
            onChange: (e) => handleChange(e, 'orderQty')
        },
    ]

    useEffect(() => {
        if (props.clonedQuoteId) {
            getQuoteItems({
                "type": "cloneQuotelineItems",
                "cloned_quoteid": props?.clonedQuoteId
            }).then(res => {
                let tempQuoteLineItems = res?.map((item) => {
                    return {
                        label: item.quotelineitem_number,
                        value: item.quotelineitem_id
                    }
                })
                setQuoteLineItems(tempQuoteLineItems)
            });
        }
    }, [props.clonedQuoteId])
    const fetchCategoryTypeIdOptions = (categoryId) => {
        if (!String(categoryId)) {
            return
        }
        const payload = {
            "type": "categoryTypes",
            "category_id": categoryId,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setCategoryType(formatToSelection(res, 'categorytype_name', 'categorytype_id'));
            if (res) {
                setCategoryTypeDisabled(false);
            }
        });
    }
    const fetchSecondaryPackingOptions = (categoryId, categoryTypeId, weightId) => {
        // if (!categoryId || !categoryTypeId || !weightId) return;
        const payload = {
            "type": "secondarypackings",
            "category_id": categoryId,
            "categorytype_id": categoryTypeId,
            "weight_id": weightId,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setSecondary(formatToSelection(res, 'secondary_name', 'secondary_id'));
            if (res) {
                setSecondaryDisabled(false);
            }
        });
    }
    const fetchSecondaryPacksCountOptions = (categoryId, categoryTypeId, weightId, secondaryId) => {
        const payload =
        {
            "type": "noofsecondarypacks",
            "category_id": categoryId || 0,
            "categorytype_id": categoryTypeId || 0,
            "weight_id": weightId || 0,
            "secondary_id": secondaryId || 0,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setSecondaryCount(formatToSelection(res, 'noofsecondary_name', 'noofsecondary_id'));
            if (res) {
                setSecondaryCountDisabled(false);
            }
        });
    }
    const fetchWeightOptions = (categoryId, categoryTypeId,) => {
        const payload = {
            "type": "weights",
            "newpacktype": isNewPackingType,
            "category_id": categoryId || 0,
            "categorytype_id": categoryTypeId || 0,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setWeight(formatToSelection(res, 'weight_name', 'weight_id'));
            if (res) {
                setWeightDisabled(false);
            }
        });
    }
    const fetchUPCOptions = (categoryId, categoryTypeId, weightId, secondaryId) => {
        // if (!categoryId || categoryTypeId || weightId, secondaryId) return
        const payload = {
            "type": "upcs",
            "category_id": categoryId,
            "categorytype_id": categoryTypeId,
            "weight_id": weightId,
            "secondary_id": secondaryId,
            "loggedinuserid": getCurrentUserDetails()?.id,
        }
        getQuoteItemsInfo(payload).then(res => {
            setUpc(formatToSelection(res, 'upc_name', 'upc_id'));
            if (res) {
                setUpcDisabled(false);
            }
        });
    }
    const fetchCapTypeOptions = () => {
        getQuoteItemsInfo({
            "type": "captypes",
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(res => {
            setCap(formatToSelection(res, 'captype_name', 'captype_id'));
            if (res) {
                setCapDisabled(false);
            }
        });
    }
    const fetchCartonTypeOptions = () => {
        getQuoteItemsInfo({
            "type": "cartontypes",
            "loggedinuserid": getCurrentUserDetails()?.id,
        }).then(res => {
            setCarton(formatToSelection(res, 'cartontype_name', 'cartontype_id'));
            if (res) {
                setCartonDisabled(false);
            }
        });
    }
    useEffect(() => {
        if (clonedQuoteLineItem)
            getQuoteItemsInfo({
                "type": "Viewquotelineitem",
                "loggedinuserid": getCurrentUserDetails()?.id,
                "quotelineitem_id": parseInt(clonedQuoteLineItem)
            }).then(res => {
                let tempSample = sample.find((item) => item.value === res?.sample_id);
                let coffee = sampleCoffee ? sampleCoffee.find(sam => sam.sample_code === tempSample?.label) : null;
                setQuoteItemDetails({
                    sampleId: res?.sample_id,
                    coffeeType: coffee?.coffee_tyoe,
                    customerBrand: res?.customerbrand_name,
                    orderQty: res?.expectedorder_kgs,
                    isPalletization: res?.palletizationrequire_id,
                    additionalRequirements: res?.additional_req,
                })

                setCategoryId(res?.category_id)
                setCategoryTypeId(res?.categorytype_id)
                setWeightId(res?.weight_id);
                setSecondaryId(res?.secondary_id);
                setSecondaryCountId(res?.noofsecondary_name);
                setUpcId(res?.upc_id);
                setCartonTypeId(res?.cartontype_id);
                setCapTypeId(res?.captype_id);
                fetchCategoryTypeIdOptions(res?.category_id);
                fetchSecondaryPackingOptions(res?.category_id, res?.categorytype_id, res?.weight_id);
                fetchSecondaryPacksCountOptions(res?.category_id,
                    res?.categorytype_id, res?.weight_id, res?.secondary_id)
                fetchWeightOptions(res?.category_id, res?.categorytype_id);
                fetchUPCOptions(res?.category_id, res?.categorytype_id, res?.weight_id, res?.secondary_id);
                fetchCapTypeOptions();
                fetchCartonTypeOptions();
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clonedQuoteLineItem]);

    useEffect(() => {
        setCategoryId(null);
        setCategoryTypeId(null);
        setWeightId(null);
        setSecondaryId(0);
        setUpcId(0);
        setCartonTypeId(0);
        setCapTypeId(0);
        setSecondaryCountId(0);
    }, [])
    return (<form className={classes.root} noValidate autoComplete="off">
        {props?.clonedQuoteId && <>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Clone Quote Item</Typography>
                </Grid>
            </Grid>
            <Template payload={quoteItems} />
        </>}
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Sample information</Typography>
            </Grid>
        </Grid>
        <Template payload={payload} />
        {/* <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>New packaging type request</Typography>
            </Grid>
        </Grid>
        <Template payload={payload1} /> */}
        <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Packaging Details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload2} />
        {/* <Template payload={payload2} /> */}
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className='item'>
                <Typography>Expected order quantity details</Typography>
            </Grid>
        </Grid>
        <Template payload={payload3} />

        {/* <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Sample Details</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload14} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload15} />
            </Grid>
        </Grid> */}

        {/* <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Grid className='item'>
                    <Typography>List Of Available Master & Alternative Samples</Typography>
                </Grid>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        {alternativeData.map((item, index) => {
                            return (
                                <Grid id="top-row" style={{ alignItems: 'center', padding: '15px' }} container >
                                    <Grid item md={10} xs={12}>
                                        <Typography>{item.name}</Typography>
                                        <BasicTable rows={item.data} columns={alternativeSample}></BasicTable>
                                    </Grid>
                                    <Grid item md={2} xs={12}>
                                        <CheckBox checked={item.checked} />
                                    </Grid>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            </Grid> 
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Grid className='item'>
                    <Typography>Packing / Pallet Costings</Typography>
                </Grid>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <BasicTable rows={packingCostingData} columns={packingCostings} hasTotal={true} totalColId='rate_comm' ></BasicTable>
                        <Button style={{ float: 'right' }} label="Update Packing Costings" />
                    </Grid>
                </Grid>

                <Grid className='item'>
                    <Typography>List Of Other Factors Their Costings</Typography>
                </Grid>
                <Grid id="top-row" container >
                    <Grid md={12} xs={12} justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                        <Button label="Other Factors Cost" onClick={addFactors} />
                    </Grid>
                    <BasicTable rows={factorList} columns={factorTableColumns} colSpan={4} ></BasicTable>
                </Grid>
            </Grid>
        </Grid> */}

        {/* <Grid id="top-row" container >
            <Grid item md={12} xs={12} className='item'>
                <Typography>Base Price Information For Different Samples In This Line Item</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={12} container direction="column">
                Data will update once prices are given and sample is confirmed & approved
            </Grid>
        </Grid> */}

        {
            Object.keys(formobj).length > 0 && (formobj.cap !== false ||
                formobj.carton !== false ||
                formobj.upc !== false ||
                formobj.secondary !== false ||
                formobj.weight !== false ||
                formobj.categoryType !== false ||
                formobj.category !== false ||
                formobj.secondaryCount !== false) ?

                <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                    <Grid item>

                        <Button disabled={disableCreate} label={loading ? "Loading..." : "Submit New Packtype"} onClick={createQuoteItemCustomAction} />
                    </Grid>
                    <Grid item>
                        <Button label="Cancel" onClick={props.back} />
                    </Grid>
                </Grid>
                :

                <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                    <Grid item>
                        <Button disabled={disableCreate} label={loading ? "Loading..." : isNewPackingType ? "Request New Pack Type" : "Save"} onClick={createQuoteItemAction} />
                    </Grid>
                    <Grid item>
                        <Button label="Cancel" onClick={props.back} />
                    </Grid>
                </Grid>
        }
        {/* <Dialog open={showNewPackingTypeForm} maxWidth={"md"}>
            <DialogContent>

                <CreatePackagingType handleClose={() => setShowNewPackingTypeForm(false)} />
            </DialogContent>
        </Dialog> */}
    </form >)
}
export default CreateQuoteItem;