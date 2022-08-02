import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import _ from 'lodash';
import { createAccountContact, getLeadsInfo } from '../../../apis';
import Button from '../../../components/Button';
import Snackbar from '../../../components/Snackbar';
import '../../common.css'
import useToken from '../../../hooks/useToken';
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
      '& #top-row':{
        marginTop: 10,
        marginBottom: 5
      }
    }   
}));

const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key]}))
    return formattedData;
}

const EditContact = (props) => {
    const classes = useStyles();
    const [ contact, setContactInfo ] = useState({});             
    const [ salutation, setSalutation ] = useState([]);   
    const [ validationError, setValidationError ] = useState({});
    const [ showSnack, setSnack ] = useState({ open: false, message: '', severity: '' });  
    const [loading, setLoading] = useState(false);
    const { getCurrentUserDetails } = useToken();  
    useEffect(() => {        
        getLeadsInfo({ "type":"salutations" }).then(res => setSalutation(formatToSelection(res, 'salutation', "id"))); 
        createAccountContact({
            "view": true,
            "contactid": props.id.toString()
          }).then(res => {
              console.log("res::", res)
            setContactInfo(res);
        });
// eslint-disable-next-line
    }, [props.id]);
   
    const handleChange = (e, key) => {
        e.preventDefault();
        const value = e.target.value;
        setContactInfo({
            ...contact,
            [key]: value,
        })
    }

    const handlesalutationidChange = (e, value) => {
        setContactInfo({
            ...contact,
            'salutationid': value,
        })
    }
   
    const payload = [
        {
            label: 'Salutation',
            type: 'autocomplete', 
            labelprop: "label",            
            value: contact.salutationid ? contact.salutationid : '',
            options: salutation,
            onChange: handlesalutationidChange
        },            
        {
            label: 'First name',
            type: 'input',
            value: contact.firstname || '',           
            onChange: (e) => handleChange(e, 'firstname'),
        },
        {
            label: 'Last name',
            type: 'input',
            value: contact.lastname || '',        
            onChange: (e) => handleChange(e, 'lastname'),
        },
        {
            label: 'Email',
            type: 'input',
            value: contact.email  || '',        
            onChange: (e) => handleChange(e, 'email'),
        },       
        {
            label: 'Phone',
            type: 'number',
            value: contact.phone  || '',   
            error: validationError?.phone,
            helperText: validationError?.phone,     
            onChange: (e) => handleChange(e, 'phone'),
        },        
        {
            label: 'Mobile',
            type: 'number',
            value: contact.mobile  || '',      
            error: validationError?.mobile,
            helperText: validationError?.mobile,   
            onChange: (e) => handleChange(e, 'mobile'),
        },  
        {
            label: 'Current sales number',
            type: 'input',
            value: contact.current_sales_no  || '',                   
            onChange: (e) => handleChange(e, 'current_sales_no'),
        }, 
        {
            label: 'Past sales number',
            type: 'input',
            value: contact.past_sales_no || '',                   
            onChange: (e) => handleChange(e, 'past_sales_no'),
        },      
    ]      


    const submitContact = async () => {       
        let error = {};
        let lengthMessage = "Exceeded maximum length";                   
        if(!_.isEmpty(contact.phone) && contact.phone.length > 10) {
            error = { ...error, phone: lengthMessage };
        }
        if(!_.isEmpty(contact.mobile) && contact.mobile.length > 10) {
            error = { ...error, mobile: lengthMessage };
        }
               
        if(!_.isEmpty(error)) {
            setValidationError(error);
        }
        else {
            let data = {
                "update": true,
                "contactid": props.id.toString(),
                "salutationid": parseInt(contact.salutationid?.value),
                "firstname":contact.firstname || '',
                "lastname":contact.lastname || '',
                "email":contact.email || '',
                "position":contact.position || '',
                "phone":contact.phone?.toString() || '',
                "mobile":contact.mobile?.toString() || '',
                
"loggedinuserid": getCurrentUserDetails()?.id,
              }
            setLoading(true);
            try {
                let response = await createAccountContact(data)
                console.log("Response", response);
                if(response) {
                    setSnack({
                        open: true,
                        message: "Contact updated successfully",
                    });
                    setTimeout(() => {
                        props.back()
                    }, 2000)
                }
            } catch(e) {
                console.log('error', e.response?.data)
                setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
            finally{
                setLoading(false);
            }
        }
    }
    return (
        <form className={classes.root} noValidate autoComplete="off">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: ''})} />}
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>
                        Contact details
                    </Typography>
                </Grid>
            </Grid>
            <Template payload={payload} />            
            <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                <Grid item>
                    <Button label="Back" onClick={() => props.back()} />
                </Grid>
                <Grid item>
                    <Button disabled={loading} label={loading ? "Loading...":"Save"} onClick={submitContact} />
                </Grid>
            </Grid>
        </form>
    )
}

export default EditContact;