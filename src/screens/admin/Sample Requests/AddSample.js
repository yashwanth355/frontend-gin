import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { getQuotesInfo, getProductAndCategory, createSample } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import _ from 'lodash';
import useToken from '../../../hooks/useToken'
import roles from '../../../constants/roles';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%',
        },
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& #top-row': {
            marginTop: 10,
            marginBottom: 5
        }
    }
}));


const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr) : new Date();
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
}

const currentDate = () => {
    // 2019-07-25 17:31:46.967
    var dateVal = new Date();
    return dateVal.getFullYear() + "-" + (dateVal.getMonth() + 1) + "-" + dateVal.getDate() + " " + dateVal.getHours() + ":" + dateVal.getMinutes() + ":" + dateVal.getSeconds();
}

const AddSample = (props) => {
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    let currentUserDetails = getCurrentUserDetails();
    const userRole = currentUserDetails?.role;
    const userId = currentUserDetails?.id;
    // const currentUserEmail = JSON.parse(localStorage.getItem('preference')).name;
    const classes = useStyles();
    const [sample, setSampleInfo] = useState({});
    const [accountName, setAccountName] = useState([]);
    const [contactList, setContactList] = useState([]);
    // eslint-disable-next-line
    const [productType, setProductType] = useState([]);
    // const [validationError, setValidationError] = useState({});
    // eslint-disable-next-line
    const [sampleCategoryList, setSampleCategoryList] = useState([]);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    const [disableCreate, setDisableCreate] = useState(false);
    const [allShippingAddresses, setAllShippingAddresses] = useState([]);

    const formatToSelection = (data = [], key, id) => {
        let formattedData = [];
        data.map((v) =>
            formattedData.push({ label: v[key], value: v[id] || v[key] })
        );
        return formattedData;
    };

    async function fetchData() {
        const createdUser = userRole !== roles.managingDirector ? { "type": "accountdetailsforsamplerequest", "createdbyuserid": userId } : { "type": "accountdetailsforsamplerequest" };
        getQuotesInfo(createdUser).then(res => {
            let account = res;
            setAccountName(account !== null ? account : []);
        });

        let data = await getProductAndCategory({});
        setProductType(formatToSelection(data.product_type, 'product_name', 'product_id'));
        setSampleCategoryList(formatToSelection(data.sample_category, 'sample_category', 'samplecat_id'));
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    // const formatSampleDetails = (viewPayload, contacts = {}) => ({
    //     ...sample,
    //     'account': viewPayload.account_id || '',   
    //     'address': viewPayload.billing_address || '',
    //     'contactList': contacts,
    // })

    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setSampleInfo({
            ...sample,
            [key]: value,
        })
    }
    const handleChangeContact = async (e, value) => {
        if (!value) {
            return;
        } else {
            // setS ...sample,
            //     'contact': value,
            // })ampleInfo({

            getQuotesInfo({ "type": "shippingaddressoncontacts", "account_id": sample?.account?.account_id?.toString(), "contact_id": value?.contact_id?.toString() }).then(contacts => {
                const unformattedAddressArray = [];
                const addressArray = [];
                contacts?.map(contact =>
                    contact?.shipping_address?.map(address => {
                        unformattedAddressArray.push(address);
                        addressArray.push(address)
                        return null;
                    }
                    )
                )
                setAllShippingAddresses(addressArray);
                let tempQuoteDetails = _.cloneDeep(sample);
                tempQuoteDetails.address =
                    unformattedAddressArray?.find(address =>
                        address?.primary_address) || unformattedAddressArray?.[0];
                tempQuoteDetails.contact = value;
                tempQuoteDetails.contact_id = value?.contact_id;
                setSampleInfo(tempQuoteDetails);

                // var defaultAddress = {};
                // if(response !== undefined) {
                //   setAllShippingAddresses(response !== null ? response[0]?.shipping_address : []);
                //   defaultAddress = (response !== null && response[0]?.shipping_address !== null) ? response[0]?.shipping_address?.find(e => e.primary_address === true) : null;

                // }
                //  setSampleInfo({
                //     ...sample,
                //     'address': defaultAddress !== null ? defaultAddress : {},
                //     'contact': value,
                //     'contact_id': value?.contact_id
                // })
            })
        }
    }

    const handleAddressChange = (e, value) => {
        if (!value) {
            return
        } else {
            setSampleInfo({
                ...sample,
                'address': value,
            })
        }
    }

    const handleChangeAccount = async (e, value) => {
        if (!value) {
            return;
        } else {
            setContactList(value.contact_details === null ? [] : value.contact_details)
            // setSampleInfo(formatSampleDetails(value, value.contact_details));

            setSampleInfo({
                ...sample,
                'account': value,
                'contact': '',
                'contactList': value.contact_details
                // 'account': value.account_id,
                // 'address': value.billing_address
            })
        }
    }

    // const handleProductChange = (e, value) => {
    //     setSampleInfo({
    //         ...sample,
    //         'product': value,
    //     });
    // };
    // const handleCategoryChange = (e, value) => {
    //     setSampleInfo({
    //         ...sample,
    //         'category': value,
    //     });
    // };

    const handlemasterstatusChange = (e, value) => {
        setSampleInfo({
            ...sample,
            'masterstatus': value,
        })
    }

    let masterstatusList = [
        { label: 'New', value: 'New' },
        { label: 'Pending with QC', value: 'Pending with QC' },
        { label: 'Approved', value: 'Approved' }
    ]

    const payload = [
        {
            label: 'Record type',
            type: 'input',
            disabled: true,
            value: "CCL"
        },
        {
            label: 'Account name',
            type: 'autocomplete',
            labelprop: "account_name",
            value: sample.account,
            options: accountName || [],
            onChange: handleChangeAccount,
        },
        {
            label: 'Contact name',
            type: 'autocomplete',
            labelprop: "contact_name",
            value: sample.contact,
            options: contactList || [],
            onChange: handleChangeContact
        },
        {
            label: 'Shipping address',
            type: 'autocomplete',
            labelprop: "address",
            options: allShippingAddresses !== null ? allShippingAddresses : [],
            value: sample.address || '',
            onChange: handleAddressChange,
        },

        {
            label: 'Status',
            type: 'autocomplete',
            labelprop: "label",
            value: sample.masterstatus || '',
            options: masterstatusList,
            onChange: handlemasterstatusChange,
        },
        {
            label: 'Created date',
            type: 'input',
            disabled: true,
            value: formatDate(sample.creationDate) || formatDate("")
        },
        {
            label: 'Remarks',
            type: 'input',
            multiline: true,
            rows: 6,
            value: sample.remarks || '',
            onChange: (e) => handleChange(e, 'remarks'),
        },
        // {
        //     label: 'Shipping address',
        //     type: 'input',
        //     multiline: true,
        //     rows: 3,            
        //     value: sample.address || '',           
        //     onChange: (e) => handleChange(e, 'address'),
        // },   
        // {
        //     label: "Product type",
        //     type: 'autocomplete',
        //     labelprop: "label",
        //     required: true,
        //     rows: 6,
        //     value: sample.product,
        //     error: validationError?.product,
        //     helperText: validationError?.product,
        //     options: productType || [],
        //     onChange: handleProductChange,
        // },
        // {
        //     label: "Target",
        //     type: "radio",
        //     value: sample.target,
        //     defaultValue: 'No',
        //     options: [
        //         { label: "Yes", value: "Yes" },
        //         { label: "No", value: "No" },
        //     ],
        //     onChange: (e) => handleChange(e, "target"),
        //     sm: 6,
        // },

        // {
        //     label: sample.target === "Yes" ? "Target Price" : "No Target Price",
        //     type: "input",
        //     disabled: sample.target === "Yes" ? false : true,
        //     value: sample.targetprice,
        //     onChange: (e) => handleChange(e, "targetprice"),
        // },

        // {
        //     label: "Sample category",
        //     type: 'autocomplete',
        //     labelprop: "label",
        //     required: true,
        //     value: sample.category,
        //     error: validationError?.category,
        //     helperText: validationError?.category,
        //     options: sampleCategoryList || [],
        //     onChange: handleCategoryChange,
        // },
        // {
        //     label: "Description",
        //     type: "input",
        //     multiline: true,
        //     rows: 3,
        //     value: sample.description || "",
        //     error: validationError?.description,
        //     helperText: validationError?.description,
        //     required: true,
        //     onChange: (e) => handleChange(e, "description"),
        // },




    ];

    const submitContact = async () => {
        let data = {
            "account_id": sample.account?.account_id?.toString(),
            "contact_id": sample.contact_id ? sample?.contact_id?.toString() : '',
            "createddate": currentDate(),
            "username": localStorage.getItem("currentUserName"),
            "CreatedUserid": localStorage.getItem("currentUserId"),
            "masterstatus": "New",
            "shipping_address": sample?.address?.shipping_id,
            "loggedinuserid": getCurrentUserDetails()?.id,
            "remarks": sample.remarks || ''
        };

        // // console.log("Data is", data);
        // console.log('Account names are', accountName);
        // console.log("Contact Name are", contactList);
        // console.log("all shippin", allShippingAddresses);
        // let error = {}, errorMessage = "Please fill valid details";
        // if (!sample.category || sample.category === '') {
        //     error = { ...error, category: errorMessage };
        // }
        // if (!sample.product || sample.product === '') {
        //     error = { ...error, product: errorMessage };
        // }
        // if (!sample.description || sample.description === '') {
        //     error = { ...error, description: errorMessage };
        // }

        // if (!_.isEmpty(error)) {
        //     setValidationError(error);
        //     return
        // }
        // const account_name = accountName.find(account => account?.account_id === sample?.account?.account_id?.toString())?.account_name;
        // const contact_name = contactList.find(contact => contact?.contact_id === sample?.contact_id?.toString())?.contact_name;
        // const shipping_address = allShippingAddresses.find(address => address?.shipping_id === sample?.address?.shipping_id)?.address;
        // const subject = ` Sample Request from ${account_name}`
        // const message = ` A new sample is requested. <br /> Account Name: ${account_name}, <br /> Contact Name: ${contact_name} ,
        // <br /> Shipping Address: ${shipping_address}, <br /> Sample Requested by ${localStorage.getItem("currentUserName")} on ${currentDate()}.<br /> Sample Details are Product Type: ${sample?.product?.label}. <br /> Target: ${sample?.target},

        // <br /> Target Price: ${sample?.targetprice}, <br />Sample Category ${sample?.category?.label}, <br /> Remarks are ${sample.remarks}. <br /> Description: ${sample?.description} `;
        // setLoading(true);

        // for (let email of ["pkonidena@dignosolutions.com", "it.infra@continental.coffee", "qcteam@continental.coffee",currentUserEmail]) {//currentUserEmail 

        //     const data = {
        //         "to_email": email,
        //         "subject": subject,
        //         "message": message
        //     }
        setDisableCreate(true);
        try {
            let response = await createSample(data)
            // let response = await sendMail(data);
            if (response) {
                setSnack({
                    open: true,
                    message: "Sample requested successfully",
                });
                setTimeout(() => {
                    setLoading(false);
                    //TODO: navigate to details page. Response should return sampleId
                    //navigate(routeBuilder('sample-request', sampleId,'view'))
                }, 2000)
            }
        } catch (e) {
            setLoading(false);
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
            setDisableCreate(false);
        }
    }

    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Sample request information
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload} />
            {/* <Template payload={payload2} /> */}
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => navigate(-1, { replace: true })} />
                </Grid>
                <Grid item>
                    <Button disabled={disableCreate} label={loading ? 'Loading ...' : 'Request Sample'}
                        onClick={submitContact} />
                </Grid>
            </Grid>
        </form>
    )
}

export default AddSample;