import React, {useState, useEffect, useRef} from 'react';
import Template from '../../../components/Template';
import Button from '../../../components/Button';
import {Container, Grid, Typography, Card, CardContent, CardHeader} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { getQuotesInfo, getCountryNames, getQuotationInfo, quoteRequestGCRates, currencyConversion } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import SimplePopper from '../../../components/Popper';
import SimpleStepper from '../../../components/SimpleStepper';
import ERPQuotationItemList from './ERPQuotationItemList';
import ERPQuoteItemEdit from './ERPQuoteItemEdit';
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
        '& .page-header':{
            width: '100%',
            marginBottom: 15,
        },        
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      },     
      popover: {        
        padding: theme.spacing(2, 4, 3),
      }     
  }));

  const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key]}))
    return formattedData;
}

const ERPQuotationEdit = (props) => {
    const classes = useStyles();    
    const [quoteDetails, setQuoteDetails] = useState({});    
    const [quoteItems, setQuoteItems] = useState([{}]);    
    const [ finalClient, setFinalClient ] = useState([]);
    const [ incoterms, setIncoTerms ] = useState([]);   
    const [ currency, setCurrency ] = useState([]);
    const [ loadingPorts, setLoadingPorts ] = useState([]);
    const [ destinationPorts, setDestinationports ] = useState([]);
    const [ countries, setCountries ] = useState([]);
    const [ customer, setCustomer ] = useState([]);
    const [ quoteItemId, setQuoteItemId ] = useState(-1);   
    const [sampleCode, setSampleCode] = useState(-1);
    const [showEditQuoteItem, setEditQuoteItem] = useState(false);          
    const productInfoRef = useRef(null)     
    const { getCurrentUserDetails } = useToken();

    const [ showSnack, setSnack ] = useState({ open: false, message: '', severity: '' });   
    useEffect(() => {
        getCountryNames().then(res => setCountries(formatToSelection(res, 'country')));  
        getQuotesInfo({ "type":"currencies" }).then(res => setCurrency(formatToSelection(res, 'currencyname', 'currencycode')));   
        getQuotesInfo({ "type":"incoterms" }).then(res => setIncoTerms(formatToSelection(res, 'incoterms', 'incotermsid')));        
        getQuotesInfo({ "type":"loadingports" }).then(res => setLoadingPorts(formatToSelection(res, "portloading_name", 'id')));
        getQuotesInfo({ "type":"destinationports" }).then(res => setDestinationports(formatToSelection(res, 'destination_port', 'id')));
        getQuotesInfo({ "type":"accountdetails" }).then(res => {
           // setAccountDetails(res);            
            setFinalClient(formatToSelection(res, 'account_name', "account_id"));            
        });  
        getQuotationInfo({
            "type":"erpQuoteInformation",
            "quote_number": props.id.toString()
        }).then(response => {                                              
               currencyConversion({
                "customer_currencycode": response.currencycode || 'AUD'
                }).then(curres => {
                    let data = {
                        ...response,
                        "currencycode": response.currencycode || 'AUD',
                        "customercurrency": curres.corporate_currency,
                        "currencyrate": curres.conv_factor
                    }  
                    setQuoteDetails(data);  
                });                
               setCustomer(formatToSelection([{"customerid": response.customerid, "customername": response.customername }], 'customername', 'customerid'));
            getQuotationInfo({
                "type": "erpQuoteLineItems",
                "quote_number": response.erpquotation_id
            }).then(res => {
                setQuoteItems(res);
            });
        });  
                       
               
         // eslint-disable-next-line 
    }, []);
    
    const handleChange = (event, key,) => {        
        let portloading, destinationport;
        let data = {
            ...quoteDetails,
            [key]: event.target.value
        }
        if (key === 'loadingPort') {
            portloading = loadingPorts.find(port => port.value === event.target.value);
            data = {
                ...data,
                "portLoadingName": portloading?.label
            }
        } else if (key === 'destinationPort') {
            destinationport = destinationPorts.find(port => port.value === event.target.value);
            data = {
                ...data,
                "destinationPortName": destinationport?.label,
            }
        }
        setQuoteDetails(data);
        console.log(data);    
    };
    const handleincotermsidChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'incotermsid': value.value
        }
        setQuoteDetails(data);
    };      
    const handleportloadingidChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'portloadingid': value.value
        }
        setQuoteDetails(data);
    };   
    const handledestination_countryidChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'destination_countryid': value.value
        }
        setQuoteDetails(data);
    };
    const handledestinationidChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'destinationid': value.value
        }
        setQuoteDetails(data);
    };     
    const handlefinalcustomerChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'finalcustomer': value.value
        }
        setQuoteDetails(data);
    }; 
    const handlecustomerChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'customer': value.value
        }
        setQuoteDetails(data);
    };  
    const handlefinalclientaccountidChange = (event, value) => {
        let data = {
            ...quoteDetails,
            'finalclientaccountid': value.value
        }
        setQuoteDetails(data);
    };     
    

    const handleDateChange = (date, key,) => {        
        let data = {
            ...quoteDetails,
            [key]: date
        }  
        setQuoteDetails(data);
        console.log(data);    
      }; 
      
      const handleCurrencyChange = async (event, value) => {                       
        try {                                                     
            let response = await currencyConversion({
                "customer_currencycode": value.value,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
          console.log("Response", response);
           if(response) {
                let data = {
                    ...quoteDetails,
                    'currencycode': value.value,
                    "customercurrency": response.corporate_currency,
                    "currencyrate": response.conv_factor
                }  
                setQuoteDetails(data);              
           }
        } catch(e) {  
            console.log("error", e);          
        }   
      }; 
      
    const quoteSteps = ['Req GC Rates','Rec GC Rates','Req Price Approval','Rec Price Approval','Approval Status'];    

    const payload2 = [
        {
            label: 'Customer',                                                         
            type: 'autocomplete', 
            labelprop: "label",            
            value: quoteDetails.customerid || '',            
            options: customer,
            onChange: handlecustomerChange,
        },
        {
            label: 'Customer id',
            type: 'input',                                               
            disabled: true,             
            value: quoteDetails.customerid || ''            
        },
        {
            label: 'Party name',
            type: 'input',                            
            value: quoteDetails.customername || '',
            onChange: (e) => handleChange(e, 'customername')             
        } ,
        {
            label: 'Party address',
            type: 'input',                            
            value: quoteDetails.customer_address || '',
            multiline: true,
            rows:4,
            onChange: (e) => handleChange(e, 'customer_address')             
        }                                
    ]

    const payload3 = [
        {
            label: 'Final client',                                                         
            type: 'autocomplete', 
            labelprop: "label",           
            value: quoteDetails.finalclientid || '',            
            options: finalClient,
            onChange: handlefinalclientaccountidChange,
        },
        {
            label: 'Final client id',
            type: 'input',                                               
            disabled: true,             
            value: quoteDetails.finalclientid || ''            
        },
        {
            label: 'Final client name',
            type: 'input',                            
            value: quoteDetails.finalclientname || '',
            onChange: (e) => handleChange(e, 'finalclientname')             
        } ,
        {
            label: 'Final customer',                                                         
            type: 'autocomplete', 
            labelprop: "label",          
            value: quoteDetails.finalcustomer || '',            
            options: [],
            onChange: handlefinalcustomerChange
        },                             
    ]

    const payload4 = [
        {
            label: 'Incoterms',                                                         
            type: 'autocomplete', 
            labelprop: "label",
            value: quoteDetails.incotermsid || '',            
            options: incoterms,
            onChange: handleincotermsidChange,
        },
        {
            label: 'Port of loading',                                                         
            type: 'autocomplete', 
            labelprop: "label",         
            value: quoteDetails.portloadingid || '',            
            options: loadingPorts,
            onChange: handleportloadingidChange,
        },
        {
            label: 'Detination(old data)',                                                         
            type: 'autocomplete', 
            labelprop: "label",
            value: quoteDetails.destinationid || '',            
            options: countries,
            onChange: handledestinationidChange,
        }                                  
    ]

    const payload5 = [
        {
            label: 'Destination country',                                                         
            type: 'autocomplete', 
            labelprop: "label",          
            value: quoteDetails.destination_countryid || '',            
            options: countries,
            onChange: handledestination_countryidChange,
        },
        {
            label: 'Destination port',                                                         
            type: 'autocomplete', 
            labelprop: "label",          
            value: quoteDetails.destinationid || '',            
            options: destinationPorts,
            onChange: handledestinationidChange
        }                                       
    ]
   
    const payload6 = [ {
        label: 'Dispatch period From',                                                         
        type: 'datePicker',           
        value: quoteDetails.fromdate || null,               
        onChange: (date) => handleDateChange(date, 'fromdate'),
        sm: 3       
    },
    {
        label: 'Dispatch period To',                                                         
        type: 'datePicker',           
        value: quoteDetails.todate || null,               
        onChange: (date) => handleDateChange(date, 'todate') ,
        sm: 3         
    }, 
    {
        label: 'Payment terms',
        type: 'input',                                               
        disabled: true,             
        value: quoteDetails.payment_terms || ''            
    },
]

const payload7 = [   
    {
        label: 'Currency',                                                         
        type: 'autocomplete', 
        labelprop: "label",          
        value:  quoteDetails.currencycode || '',            
        options: currency,
        onChange: handleCurrencyChange
    },
    {
        label: 'Corporate currency (Dollar to Rupees)',
        type: 'input',                                               
        disabled: true,             
        value: quoteDetails.customercurrency || ''            
    },   
    {
        label: 'Currency for rate calculation (Rupees)',
        type: 'input',                                               
        disabled: true,             
        value: quoteDetails.currencyrate || ''            
    },
]

const ShowEditQuoteItemHandler = (event, quoteItemId, sampleCode) => {    
    setEditQuoteItem(true);
    setQuoteItemId(quoteItemId);
    setSampleCode(sampleCode);
};

const HideEditQuoteItemHandler = () => {       
    setEditQuoteItem(false);                      
};

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr): new Date();
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear(); 
  }
  

  const productInfo = () => (
      <Container className={classes.popover}>
          <Grid id="top-row" container >
              <Grid item md={12} xs={12} className='item'>
                  <Typography>Product information</Typography>
              </Grid>
          </Grid>
          <ERPQuotationItemList data={quoteItems} quoteItemEdit={(event, quoteItemId, sampleCode) => ShowEditQuoteItemHandler(event, quoteItemId, sampleCode)} />        
      </Container>    
  );

  const approveQuote = async (e) => {      
    try {                                                     
        let response = await quoteRequestGCRates({
            "type":"requestforgcprice",
            "quote_number": props.id.toString(),
            "loggedinuserid": getCurrentUserDetails()?.id,
        });
      console.log("Response", response);
       if(response) {
            setSnack({
                open: true,
                message: "Requested GC Price for Quote successfully",
            }); 
            setTimeout(() => {
                props.back()
            }, 2000)
       }
    } catch(e) {
        setSnack({
            open: true,
            message: 'Server Error. Please contact administrator', //e.response?.data
            severity: 'error',
        })
    }
}

const getActiveStep = () => {
    if(props.status === "Pending with GMC" || props.status === "New"){
        return "0";
    }else if(props.status === "Pending with GC rates"){
        return "1";
    }    
}

let component;
if(showEditQuoteItem){
    component = <ERPQuoteItemEdit back={HideEditQuoteItemHandler} id={quoteItemId} quoteId={props.id} sampleCode={sampleCode}></ERPQuoteItemEdit>
} else{
    component = (<>   
    {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: ''})} />}           
        <form className={classes.root} noValidate autoComplete="off"> 
        <Card className="page-header">
            <CardHeader            
            title=" Quotation Details"
            className='cardHeader'            
            />                     
            <CardContent>   
            <Grid container md={12}>
                <Grid container md={6}>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quotation no</Typography>
                        <Typography>{quoteDetails.erpquotationno_id}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quotation id</Typography>
                        <Typography>{quoteDetails.erpquotation_id}</Typography>
                    </Grid>               
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Marketing rep name</Typography>
                        <Typography>{quoteDetails.createdby}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Quote creation</Typography>
                        <Typography>{formatDate(quoteDetails.createddate)}</Typography>
                    </Grid>               
                </Grid>    
                <Grid container md={6} justify="flex-end" style={{ display: 'flex' }}>
                { 
                    (props.status === "Pending with GMC" || props.status === "New") &&  <Button label="Request GC Rates" onClick={approveQuote} />  
                 }                                       
                </Grid>               
            </Grid>                                                   
            <Grid container md={12}>
                <Grid item md={3} xs={6} >               
                <SimplePopper linkLabel="Product Information" body={productInfo} linkRef={productInfoRef}></SimplePopper>             
                </Grid>                                           
            </Grid>
           </CardContent>               
        </Card>
        <Card className="page-header">                     
            <CardContent>                                                  
            <Grid container md={12}>
                <Grid item md={12} xs={12} >               
                    <SimpleStepper activeStep={getActiveStep()} steps={quoteSteps} stepClick={(e) => { console.log(e); }}></SimpleStepper>             
                </Grid>                
            </Grid>
           </CardContent>               
        </Card>                             
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}  className='item'>
                    <Typography>Customer & Party details</Typography>
                </Grid>
            </Grid>
            <Template payload={payload2} /> 
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}   className='item'>
                    <Typography>Final client details</Typography>
                </Grid>
            </Grid>
            <Template payload={payload3} /> 
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}  className='item'>
                    <Typography>Incoterms, Port & Destination</Typography>
                </Grid>
            </Grid>
            <Template payload={payload4} />  
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}   className='item'>
                    <Typography>Destination country & Port</Typography>
                </Grid>
            </Grid>
            <Template payload={payload5} />    
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}   className='item'>
                    <Typography>Dispatch period & payment terms</Typography>
                </Grid>
            </Grid>
            <Template payload={payload6} />   
            <Grid id="top-row" container >
                <Grid item md={12} xs={12}  className='item'>
                    <Typography>Currency management</Typography>
                </Grid>
            </Grid>
            <Template payload={payload7} />              
            <Grid id="productInfo" ref={productInfoRef} container >
              <Grid item md={12} xs={12}  className='item'>
                  <Typography>Product information</Typography>
              </Grid>
          </Grid>
          <ERPQuotationItemList data={quoteItems} quoteItemEdit={(event, quoteItemId) => ShowEditQuoteItemHandler(event, quoteItemId)} />                      
          <Grid container xs={12} md={12} style={{margin:24}} justify="center">
                <Grid item>
                    <Button label="Save" />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={props.back} />
                </Grid>
            </Grid>
        </form> 
        </>
)
}
return (<>
    {component}  
    </>
);
}
export default ERPQuotationEdit;