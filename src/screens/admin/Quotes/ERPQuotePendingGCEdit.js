import React, {useState, useEffect} from 'react';
import Template from '../../../components/Template';
import Button from '../../../components/Button';
import {Grid, Typography, Card, CardContent, CardHeader, Accordion,AccordionSummary, AccordionDetails} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { getQuotationInfo } from '../../../apis';
import Snackbar from '../../../components/Snackbar';
import SimpleStepper from '../../../components/SimpleStepper';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import '../../common.css'
import BasicTable from '../../../components/BasicTable';

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
        '& .MuiAccordion-root':{
            width: '100%' 
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

const ERPQuotePendingGCEdit = (props) => {
    const classes = useStyles();    
    const [quoteDetails, setQuoteDetails] = useState({});                         
    const [ showSnack, setSnack ] = useState({ open: false, message: '', severity: '' });   
    useEffect(() => {      
        getQuotationInfo({
            "type":"erpQuoteInformation",
            "quote_number": props.id.toString()
        }).then(response => {   
            setQuoteDetails(response);                                                                                     
        });                                        
         // eslint-disable-next-line 
    }, []);
           
    const quoteSteps = ['Req GC Rates','Rec GC Rates','Req Price Approval','Rec Price Approval','Approval Status'];    

    const payload2 = [ 
        {
            label: 'Customer',                                                         
            type: 'input',           
            value: quoteDetails.customername || '',            
            disabled:true
        },       
        {
            label: 'Exchanged rate USD(As per requested date)',
            type: 'input',                                               
            disabled: true,             
            value: quoteDetails.exchangerate || '704.56'            
        },
        {
            label: 'Dispatch period from',                                                         
            type: 'datePicker',           
            value: quoteDetails.fromdate || null,  
            disabled: true,                          
            sm: 3       
        },
        {
            label: 'Dispatch period to',                                                         
            type: 'datePicker',           
            value: quoteDetails.todate || null, 
            disabled: true,                           
            sm: 3         
        }, 
        {
            label: 'Total expected instant coffee quantity(KGS)',
            type: 'input',                            
            value: quoteDetails.customer_address || '',
            disabled: true            
        }                                
    ]


const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr): new Date();
    return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear(); 
  }
   

  const approveRate = async (e) => {      
   
}

const getActiveStep = () => {
    if(props.status === "Pending with GMC" || props.status === "New"){
        return "0";
    }else if(props.status === "Pending with GC rates"){
        return "1";
    }    
}

const logTableColumns = [
    { id: 'type', label: 'Type', },    
    { id: 'user_by', label: 'User By'},
    { id: 'dt_time', label: 'DT Time', },
  ]; 

let component;
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
                    (props.status === "Pending with GC rates") &&  <Button label="Approve" onClick={approveRate} />  
                 }                                       
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
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>Green coffee prices</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Template payload={payload2} /> 
            </AccordionDetails>
        </Accordion>   
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid container >
                    <Grid item md={12} xs={12}  className='item'>
                        <Typography>Activity log</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <BasicTable rows={[]} columns={logTableColumns} hasTotal={false}></BasicTable>
            </AccordionDetails>
        </Accordion>                                                                                         
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
return (<>
    {component}  
    </>
);
}
export default ERPQuotePendingGCEdit;