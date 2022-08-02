import React, { useEffect, useRef, useState } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Container,
} from "@material-ui/core";
import { viewSampleRequest } from "../../../apis";
import SimplePopper from "../../../components/Popper";
import Button from "../../../components/Button";
import Fab from "../../../components/Fab";
import "../../common.css";
import SampleItemList from "./SampleItemList";
import EditSampleItem from "./EditSampleItem";
import SimpleModal from '../../../components/Modal';
import Snackbar from '../../../components/Snackbar';
import AddSampleItem from "./AddSampleItem";
import SimpleStepper from "../../../components/SimpleStepper";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    "& .page-header": {
      width: "100%",
      marginBottom: 15,
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  card: {
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    marginBottom: 5,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "30%",
    left: "30%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const sampleData = [
    {
        lineitemid: "1",
        samplecode: "Sample Code",
        producttype: "Product Type",
        samplecategory: "Sample Category",
        packingitem: "Packing Type",
        dispatchDate: "Dispatch Date",
        status: "Status",
    },
    {
        lineitemid: "2",
        samplecode: "Sample Code1",
        producttype: "Product Type1",
        samplecategory: "Sample Category1",
        packingitem: "Packing Type1",
        dispatchDate: "Dispatch Date1",
        status: "Status1",
    },    
]

const SampleDetails = (props) => {
  const classes = useStyles();
  const [sampleDetails, setSampleDetails] = useState({});
  const [createSampleItem, setCreateSampleItem] = useState(false);
  const [sampleItems, setSampleItems] = useState(sampleData);
  // const [showSampleItemDetails, setSampleItemDetails] = useState(false);
  const [showEditSampleItem, setEditSampleItem] = useState(false);
  const [submitSample, setSubmitSample] = useState(false);
  const [sampleItemId, setSampleItemId] = useState(-1);
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
  const sampleItemInfoRef = useRef(null);

  useEffect(() => {
    setSampleItems(sampleData);
    viewSampleRequest({ "type": "viewsample", "sample_id": props.id}).then((res) => {
      setSampleDetails(res && res[0]);
    });
    // eslint-disable-next-line
  }, [props.id]);

  const sampleSteps = ['Req GC Rates','Rec GC Rates','Req Price Approval','Rec Price Approval','Approval Status'];  

  const payload = [
    {
      type: "label",
      value: "Sample request number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.samplerequestid,
      sm: "6",
    },
    {
      type: "label",
      value: "Account name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.accountname,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping address",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.shippingaddress,
      sm: "6",
    },
    {
      type: "label",
      value: "Status",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.status,
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Record type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.recordtypeid,
      sm: "6",
    },
    {
      type: "label",
      value: "Contact name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.firstname,
      sm: "6",
    },
    {
      type: "label",
      value: "Remarks",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.remarks,
      sm: "6",
    },
    {
      type: "label",
      value: "Created date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sampleDetails.createddate,
      sm: "6",
    },
  ];

  const ShowCreateSampleItemHandler = () => {
    setCreateSampleItem(true);
  };

  const ShowSampleItemDetailsHandler = (event, sampleItemId) => {
    // setSampleItemDetails(false);
    setEditSampleItem(true);
    setSampleItemId(sampleItemId);
  };

  const sampleItemInfo = () => (
    <Container className={classes.popover}>
      <Grid id="top-row" container ref={sampleItemInfoRef}>
        <Grid item md={12} xs={12} className="item">
          <Typography>Sample request item information</Typography>
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid xs={6} item></Grid>
        <Grid
          xs={6}
          item
          justify="flex-end"
          alignItems="center"
          style={{ display: "flex" }}
        >
          <Fab
            label={"Create Sample Request Item"}
            variant="extended"
            onClick={ShowCreateSampleItemHandler}
            sampleId={props.id}
          />
        </Grid>
      </Grid>
      {/* {sampleItems?.length > 0 && ( */}
        <SampleItemList
          data={sampleItems}
          sampleItemDetails={(event, sampleItemId) =>
            ShowSampleItemDetailsHandler(event, sampleItemId)
          }
        />
      {/* )} */}
    </Container>
  );

  const SubmitSampleAction = async (e) => {
    // try {                                   
    //     let response = await requestQuotePriceInfo({
    //         "type":"requestprice",
    //         "quote_number":props.id?.toString()                
    //         });            
    //     console.log("Response", response);
    //     if(response) {
            setSubmitSample(!submitSample);
    //         setTimeout(() => {                            
    //             handleClose();
    //         }, 2000)
    //     }
    // } catch(e) {
        setSnack({
            open: true,
            message: 'Something Went Wrong',//e.message
            severity: 'error',
        })
    // }
  }

  const handleClose = () => {
      setSubmitSample(false);
      props.back();
  }

  const ShowDetailsList = () => {
      setCreateSampleItem(false);
  }

  const HideSampleEditItemHandler = () => {
      setCreateSampleItem(false);
      setEditSampleItem(false);
  }  

  const requestSampleSuccess = () => (
      <Container className={classes.modal}>
          <h2 id="simple-modal-title">
              Success
          </h2> 
          <p>Sample request submitted and email sent successfully</p>                         
          <Grid id="top-row" container spacing={24} justify="center" alignItems="center">                
              <Grid item>
                  <Button label="Close" onClick={handleClose}/>
              </Grid>                
          </Grid>  
      </Container>
  );

  const getActiveStep = () => {
    if(props.status === "Pending with GMC" || props.status === "New"){
        return "0";
    }else if(props.status === "Pending with GC rates"){
        return "1";
    }    
  }

  let component;

  if(createSampleItem){
    component = <AddSampleItem back={ShowDetailsList} />
  } else if(showEditSampleItem){
    component = <EditSampleItem back={HideSampleEditItemHandler} id={sampleItemId}></EditSampleItem>
  } else {
    return(
      <>
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: ''})} />} 
        <Card className="page-header">
            <CardHeader title="Sample Request Details" className="cardHeader" />
            <CardContent>
            <Grid container md={6}>
                <Grid item md={5} xs={12}>
                <Typography variant="h7">Sample request number</Typography>
                <Typography>{props.id}</Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                <Typography variant="h7">Created date</Typography>
                <Typography>{sampleDetails.createddate}</Typography>
                </Grid>
            </Grid>
            <Grid container className={classes.links} md={6}>
                <Grid item md={3} xs={6}>
                <SimplePopper
                    linkLabel="Sample Request Item Information"
                    body={sampleItemInfo}
                    linkRef={sampleItemInfoRef}
                ></SimplePopper>
                </Grid>
            </Grid>
            </CardContent>
        </Card>
        
        <Card className="page-header">
            <CardContent>                                                  
            <Grid container md={12}>
                <Grid item md={12} xs={12} >               
                    <SimpleStepper activeStep={getActiveStep()} steps={sampleSteps} stepClick={(e) => { console.log(e); }}></SimpleStepper>             
                </Grid>                
            </Grid>
           </CardContent>               
        </Card>  
        
        <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
            <Typography>Sample request information</Typography>
            </Grid>
        </Grid>
        <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload1} />
            </Grid>
        </Grid>
        <Grid id="top-row" container ref={sampleItemInfoRef}>
            <Grid item md={12} xs={12} className="item">
            <Typography>Sample request item information</Typography>
            </Grid>
        </Grid>
        <Grid container direction="row">
            <Grid xs={6} item></Grid>
            <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
            >
            <Fab
                label={"Create Sample Request Item"}
                variant="extended"
                onClick={ShowCreateSampleItemHandler}
                sampleId={props.id}
            />
            </Grid>
        </Grid>
        {/* {sampleItems?.length > 0 && ( */}
            <SampleItemList
            data={sampleItems}
            sampleItemDetails={(event, sampleItemId) =>
                ShowSampleItemDetailsHandler(event, sampleItemId)
            }
            />
        {/* )} */}
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            <Grid item>
            <Button
                label="Edit"
                onClick={(e) => props.editSample("edit_sample", props.id)}
            />
            </Grid>
            <Grid item>
            <Button label="Cancel" onClick={props.back} />
            </Grid>
            <Grid item>
            <Button label="Submit" onClick={(e) => SubmitSampleAction(e)} />
            </Grid>
        </Grid>
        <SimpleModal open={submitSample} handleClose={handleClose} body={requestSampleSuccess} />   
        </>
    )
  }

  return (
    <>
            {component}

      {/* <Grid container direction="row">
                <Grid xs={6} item>
                </Grid>
                <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                    <Fab label={"Create Quote Item"} variant="extended" onClick={ShowCreateQuoteItemHandler} quoteId={props.id} />
                </Grid>
            </Grid> */}
      {/* {
                quoteItems?.length > 0 &&  <QuoteItemList data={quoteItems} quoteItemDetails={(event, quoteItemId) => ShowQuoteItemDetailsHandler(event, quoteItemId)} />
            }            */}
      {/* <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button label="Edit" onClick={(e) => props.edit("edit_quote", props.id)} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={props.back} />
                </Grid>
                <Grid item>
                    {
                        quoteItems?.length > 0 && props.status === "New" && <Button label="Request Price" onClick={(e) => requestPriceAction()} />
                    }
                </Grid>
            </Grid> */}
      {/* <SimpleModal open={requestPrice} handleClose={handleClose} body={requestPriceSuccess} />    */}

      {/* <ContentTabs value="0">
         <Tab label="Sample Information" index="0"> 
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Sample Request Information</Typography>
            </Grid>
          </Grid>
          <Grid id="top-row" container>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload} />
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
              <Template payload={payload1} />
            </Grid>
          </Grid>
          <Grid
            container
            xs={12}
            md={12}
            style={{ margin: 24 }}
            justify="center"
          >
            <Grid item>
              <Button
                label="Edit"
                onClick={(e) => props.editSample("edit_sample", props.id)}
              />
            </Grid>
            <Grid item>
              <Button label="Cancel" onClick={props.back} />
            </Grid>
          </Grid>
        </Tab>
        <Tab label="Item Information" index="1"> 
          <Grid container direction="row">
            <Grid xs={6} item></Grid>
            <Grid
              xs={6}
              item
              justify="flex-end"
              alignItems="center"
              style={{ display: "flex" }}
            >
              <Fab label={"Create Item"} variant="extended" />
            </Grid>
          </Grid>
         </Tab> 
      </ContentTabs> */}
    </>
  );
};
export default SampleDetails;
