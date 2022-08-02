import React, {useState, useEffect, useRef} from 'react';
import Template from '../../../components/Template';
import Button from '../../../components/Button';
import {Container, Grid, Typography, Card, CardContent, CardHeader} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Snackbar from '../../../components/Snackbar';
import ERPQuotationHistory from './ERPQuotationHistory';
import SimplePopper from '../../../components/Popper';
import ERPQuoteItemSampleList from './ERPQuoteItemSampleList';
import ERPQuoteItemSampleConfig from './ERPQuoteItemSampleConfig';
// import ERPQuoteItemPackageCosts from './ERPQuoteItemPackageCosts';
// import ERPQuoteItemFactorCosts from './ERPQuoteItemFactorCosts';
import { getQuoteItemSystemInfo, getQuoteItemSystemPackInfo, getQuotationInfo, quoteSamples, quoteSamplePricing } from "../../../apis";
import '../../common.css'
const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginTop: 10,
        },
        '& .MuiFormControl-fullWidth': {
            width: '95%'          
        },      
        flexGrow: 1,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        '& .MuiTypography-root':{
            fontSize: '1.2rem',            
        }
      },     
    popover: {
        padding: theme.spacing(2, 4, 3),
    },       
    card:{
       boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        marginBottom: 5
    }
  }));

  const formatQuoteItem = (systemDetails, packDetails = {}) => ({
    role: systemDetails.role,
    sample_no: systemDetails.sample_no,
    reference_id: systemDetails.reference_id,
    quotation_no: systemDetails.quotation_no,
    customer: systemDetails.customer,
    currency_code: systemDetails.currency_code,
    conversion_factor: systemDetails.conversion_factor,
    final_client: systemDetails.final_client,
    sample_mgmt_tasks: systemDetails.sample_mgmt_tasks,
    pack_type_mgmt_tasks: systemDetails.pack_type_mgmt_tasks,
    sample_code: packDetails.sample_code,
    description: packDetails.description,
    product_code: packDetails.product_code,
    additional_packing_details: packDetails.additional_packing_details,
    aroma: packDetails.aroma,
    aroma_quantity: packDetails.aroma_quantity,
    packing_type: packDetails.packing_type,   
    additional_requirements: packDetails.additional_requirements,
    customer_brand_name: packDetails.customer_brand_name,
    expected_order_quantity: packDetails.expected_order_quantity 
})

const ERPQuoteItemEdit = (props) => {
    const classes = useStyles();    
    const [quoteItemDetails, setQuoteItemDetails] = useState({});        
    const [ showSnack, setSnack ] = useState({ open: false, message: '', severity: '' }); 
    const [quoteItemsHistory, setQuoteItemsHistory] = useState([{}]);   
    const [quoteItemSamples, setquoteItemSamples] = useState([{}]); 
    const [quoteItemAltSamples, setquoteItemAltSamples] = useState([]);   
    // const [quoteItemSamplePricing, setquoteItemSamplePricing] = useState([]);    
    // const [quoteItemSamplePackagingCost, setquoteItemSamplePackagingCost] = useState([]);    
    const historyInfoRef = useRef(null);
    const sampleInfoRef = useRef(null);
    const { getCurrentUserDetails } = useToken();
        
    useEffect(() => {
        getQuoteItemSystemInfo({
            "role":"Marketing Executive",
            "quotation_no":props.quoteId.toString(),
            "sample_no":props.sampleCode                      
            }).then(res => {
                getQuoteItemSystemPackInfo({            
                    "sample_no":props.sampleCode                      
                    }).then(response => {
                        setQuoteItemDetails(formatQuoteItem(res, response));            
                });                         
        }); 
        
        getQuotationInfo({
            "type":"topapprovedquotelines"            
        }).then(response => {                    
            setQuoteItemsHistory(response); 
        });        
        
        quoteSamples({
            "quotation_no":props.quoteId.toString()
        }).then(res => {
              setquoteItemSamples(
                  {
                    "quotation_no":"296",
                    "sample_information":[
                    {
                      "msample_code":"D-SDNA-AR-SCC-A34",
                      "item_information": [{"item_id":"FAC-101","item_name":"VANILLA NATURAL POWDER","item_ratio":"24","item_percentage":"50","item_pformula":"100"}]
                    },
                    {
                      "msample_code":"D-SDNA-AR-SCC-A32",
                      "item_information": [{"item_id":"FAC-101","item_name":"VANILLA NATURAL POWDER","item_ratio":"24","item_percentage":"50","item_pformula":"100"}]
                    }
                ]
            });                      
        }); 

        // quoteSamplePricing({
        //     "type":"getsamples",
        //     "det_ref": props.quoteId.toString()          
        // }).then(res => {     
        //     if(res){
        //         setquoteItemAltSamples(res);
        //     }                                                                     
        // }); 
                  
         // eslint-disable-next-line 
    }, []);               

    const payload = [
        {            
            type: 'label',           
            value: 'Reference id(System Purpose)',   
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.reference_id || '',  
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Quotation id',  
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.quotation_no || '',      
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Customer',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.customer || '13th March',  
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Currency code',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.currency_code || 'USD'     ,  
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Conversion factor',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.conversion_factor || '0',  
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Final client',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.final_client || '13th March',  
            sm: '6'          
        }                                                                                                         
    ]

    const payload1 = [
        {            
            type: 'label',           
            value: 'Sample code',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.sample_no || '',  
            sm: '6'          
        } , 
        {            
            type: 'label',           
            value: 'Description',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.description || '',  
            sm: '6'          
        } ,       
        {            
            type: 'label',           
            value: 'Product code',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.product_code || 'PREMIX',  
            sm: '6'          
        } , 
        {            
            type: 'label',           
            value: 'Product sub title',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.producttitle || '',  
            sm: '6'          
        } ,               
        {            
            type: 'label',           
            value: 'Aroma',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.aroma || '',  
            sm: '6'          
        } ,  
        {            
            type: 'label',           
            value: 'Aroma quantity',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.aroma_quantity || '0',  
            sm: '6'          
        }       
    ]

    const payload2 = [
        {            
            type: 'label',           
            value: 'Packaging type', 
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.packing_type || '6*200 GMS PET Jars(With CAP style Matte finish)',  
            sm: '6'          
        },
        {            
            type: 'label',           
            value: 'Additional packaging details',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.additional_packing_details || '',  
            sm: '6'          
        }, 
        {            
            type: 'label',           
            value: 'Additional requirements',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.additional_requirements || 'Test26April',  
            sm: '6'          
        },         
        {            
            type: 'label',           
            value: 'Customer brand name',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.customer_brand_name || 'Test26April',  
            sm: '6'          
        },  
        {            
            type: 'label',           
            value: 'Exp. order Qty(KGS)',
            bold: true,
            sm: '6'         
        },
        {           
            type: 'label',            
            value: quoteItemDetails.expected_order_quantity || '6000.00',  
            sm: '6'          
        }                                   
    ]   

    const historyInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Previous quotation rates </Typography>
                </Grid>
            </Grid>
            <ERPQuotationHistory data={quoteItemsHistory} />   
        </Container>    
    );

    const sampleInfo = () => (
        <Container className={classes.popover}>
            <Grid id="top-row" container>
                <Grid item md={12} xs={12} className='item'>
                    <Typography>List of available master & alternate samples with GC configuration</Typography>
                </Grid>
            </Grid>
            <Card className={classes.card}>
                <Grid id="top-row" container>
                    <Grid item md={12} xs={12}>
                    <ERPQuoteItemSampleList data={quoteItemSamples.sample_information}></ERPQuoteItemSampleList>               
                    </Grid>
                </Grid> 
            </Card>  
        </Container>    
    );

    const AddSampleForPriceHandler = (event, sample) => {        
        setquoteItemAltSamples([...quoteItemAltSamples, sample]);
    };

    const RemoveSampleForPriceHandler = (event, sample) => { 
        var array = [...quoteItemAltSamples]; 
        var index = array.indexOf(sample)
        if (index !== -1) {
          array.splice(index, 1);
          setquoteItemAltSamples(array);
        }        
    };    

    const formatSampleItem = (sampleItem) => ({
        det_ref: props.quoteId.toString(),
        item_id: sampleItem.item_id,
        perc: sampleItem.item_percentage,
        ratio: sampleItem.item_ratio,
        rm_rate:"10"
    })

    const requestSamplePricing = async (e) => {      
        try {                                  
            let items = [];
            quoteItemAltSamples.forEach(sample => { 
                sample.item_information.forEach(item => {
                    items.push(formatSampleItem(item));
                })                               
            });            
            let response = await quoteSamplePricing({
                "type":"updatesampleconfiguration",
                "rawmaterial_rates": items,
                "loggedinuserid": getCurrentUserDetails()?.id,
            });
          console.log("Response", response);
           if(response) {
                setSnack({
                    open: true,
                    message: "Quote Item updated successfully",
                }); 
           }
        } catch(e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
    }

    //TODO: Code related to package costs& other factor costs
    // const updateCosts = async (e) => {
    //     try {                                                         
    //         let response = await quoteSamplePricing({
    //             "type":"updateotherfactors",
    //             "updated_factors": quoteItemSamplePackagingCost
    //         });
    //        console.log("Response", response);
    //         if(response) { 
    //             setSnack({
    //                 open: true,
    //                 message: "updated successfully",
    //             });                         
    //        }
    //     } catch(e) {
    //         setSnack({
    //             open: true,
    //             message: e.message,
    //             severity: 'error',
    //         })
    //     }
    // }

    // const updateOtherFactors = async (e) => {
    //     try {                                                         
    //         let response = await quoteSamplePricing({
    //             "type":"updateotherfactors",
    //             "updated_factors": quoteItemSamplePricing
    //         });
    //        console.log("Response", response);
    //         if(response) { 
    //             setSnack({
    //                 open: true,
    //                 message: "updated successfully",
    //             });                         
    //        }
    //     } catch(e) {
    //         setSnack({
    //             open: true,
    //             message: e.message,
    //             severity: 'error',
    //         })
    //     }
    // }

return (<>   
    {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: ''})} />}           
    <Card className="page-header">
            <CardHeader            
            title=" Quotation Item Details"
            className='cardHeader'            
            />                     
            <CardContent>                          
            <Grid container md={6}>
                <Grid item md={3} xs={12} >
                    <Typography variant="h7">Quote number</Typography>
                    <Typography>{quoteItemDetails.quotation_no}</Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                    <Typography variant="h7">Quote item id</Typography>
                    <Typography>{props.id}</Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                    <Typography variant="h7">Sample code</Typography>
                    <Typography>{(quoteItemDetails.sample_no)}</Typography>
                </Grid>                
            </Grid>            
            <Grid container md={6}>                
                <Grid item md={3} xs={6} >               
                <SimplePopper linkLabel="Previous Rates" body={historyInfo} linkRef={historyInfoRef}></SimplePopper>             
                </Grid> 
                <Grid item md={3} xs={6} >               
                <SimplePopper linkLabel="List of Samples" body={sampleInfo} linkRef={sampleInfoRef}></SimplePopper>             
                </Grid>                
            </Grid>
           </CardContent>               
        </Card>
        <form className={classes.root} noValidate autoComplete="off">                                          
            <Grid id="top-row" container >
                <Grid id="top-row"  xs={12} md={6} container direction="column">
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>System & Master information</Typography>
                    </Grid>                  
                    <Template payload={payload} />                     
                </Grid> 
                <Grid id="top-row"  xs={12} md={6} container direction="column">
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>Sample details</Typography>
                    </Grid>               
                    <Template payload={payload1} />                      
                </Grid> 
            </Grid>                        
            <Grid id="top-row" container >
                <Grid id="top-row"  xs={12} md={12} container direction="column">
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>Packing details</Typography>
                    </Grid> 
                    <Grid item md={6} xs={12}>
                        <Template payload={payload2} />        
                    </Grid>                                             
                </Grid>                                  
            </Grid>                                                                        
        </form>   
        <Grid id="historyInfo" container ref={historyInfoRef}>
            <Grid item md={12} xs={12}  className='item'>
                <Typography>Previous quotation rates </Typography>
            </Grid>
        </Grid>
        <ERPQuotationHistory data={quoteItemsHistory} />  
        <Grid id="top-row" container ref={sampleInfoRef}>
            <Grid item md={12} xs={12}  className='item'>
                <Typography>List of available master & alternate samples with GC configuration</Typography>
            </Grid>
        </Grid>
        <Card className={classes.card}>
            <Grid id="top-row" container>
                <Grid item md={12} xs={12}>
                <ERPQuoteItemSampleList data={quoteItemSamples.sample_information} addSampleForPrice={(e, sample) => {AddSampleForPriceHandler(e, sample)}}></ERPQuoteItemSampleList>               
                </Grid>
            </Grid> 
        </Card>  
        <Grid id="top-row" container>
            {
                 quoteItemAltSamples.length > 0 && 
                 <Grid item md={12} xs={12}  className='item'>
                    <Typography>Alternate samples and configuration request for prices</Typography>
                </Grid>
            }            
        </Grid>  
        <Card className={classes.card}>
            <Grid id="top-row" container>
                <Grid item md={12} xs={12}>
                <ERPQuoteItemSampleConfig data={quoteItemAltSamples} removeSampleForPrice={(e, sample) => {RemoveSampleForPriceHandler(e, sample)}}></ERPQuoteItemSampleConfig>               
                </Grid>
                {
                    quoteItemAltSamples.length > 0 && 
                    <Grid item>
                        <Button label="Confirm" onClick={requestSamplePricing}/>
                    </Grid>
                }
            </Grid>  
        </Card>            
        {/* TODO: Code related to package costs & other factor costs            */}
        {/* {
            quoteItemSamplePackagingCost.length > 0 &&
            <>
                <Grid id="top-row" container>
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>Packaging/Pallet Costs</Typography>
                    </Grid>
                </Grid>
                <Card className={classes.card}>
                    <Grid item md={12} xs={12}>
                        <ERPQuoteItemPackageCosts data={quoteItemSamplePackagingCost}></ERPQuoteItemPackageCosts>
                    </Grid>
                    <Grid item>
                        <Button label="Update Packaging Costs" onClick={updateCosts} />
                    </Grid>
                </Card>
            </>
        } */}
        {/* {
            quoteItemSamplePricing.length > 0 &&
            <>               
            <Grid id="top-row" container>
                 <Grid item md={12} xs={12}  className='item'>
                    <Typography>List of Other Factors Their Costings</Typography>               
                </Grid>  
            </Grid>
            <Card className={classes.card}>
                <Grid item md={12} xs={12}>
                    <ERPQuoteItemFactorCosts data={quoteItemSamplePricing}></ERPQuoteItemFactorCosts>               
                </Grid>
                <Grid item>
                    <Button label="Update Other Factors" onClick={updateOtherFactors}/>
                </Grid>
            </Card>                   
            </>  
        }    */}
        
        <Grid container xs={12} md={12} style={{margin:24}} justify="center">               
            <Grid item>
                <Button label="Back" onClick={props.back} />
            </Grid>
        </Grid>         
    </>
);
}
export default ERPQuoteItemEdit;