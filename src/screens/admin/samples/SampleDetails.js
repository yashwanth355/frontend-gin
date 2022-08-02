import React, { useEffect,
  
  // useRef, 
  
  useState } from "react";
import Template from "../../../components/Template";
//import ContentTabs from "../../../components/ContentTabs";
import { makeStyles, withStyles} from "@material-ui/core/styles";
//import Tab from "@material-ui/core/Tab";
import {
  Typography,
  // Card,
  // CardContent,
  // CardHeader,
  Grid,
  Container,
} from "@material-ui/core";
import { viewSampleRequest, viewAndDeleteSampleLineItem } from "../../../apis";
//import SimplePopper from "../../../components/Popper";
import Button from "../../../components/Button";
import Fab from "../../../components/Fab";
import "../../common.css";
import SampleListItem from "./SampleListItem";
// import EditSampleItem from "./EditSampleItem";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
//import AddSampleItem from "./AddSampleItem";
//import SimpleStepper from "../../../components/SimpleStepper";
//import AuditLog from "./AuditLog";
//import ViewSampleItem from "./ViewSampleItem";

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
const WhiteTextTypography = withStyles({
    root: {
      color: "#F05A30"
    }
  })(Typography);

const SampleDetails = (props) => {
  const classes = useStyles();
  //const [sampleDetails, setSampleDetails] = useState({});
  const [createSampleItem, setCreateSampleItem] = useState(false);
  const [sampleItems, setSampleItems] = useState([]);
  //const [sampleItemsDetails, setSampleItemsDetails] = useState([]);
  const [showEditSampleItem, setEditSampleItem] = useState(false);
  const [submitSample, setSubmitSample] = useState(false);
  //const [sampleItemId, setSampleItemId] = useState(-1);
  //const [logData, setLogData] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  //const sampleItemInfoRef = useRef(null);
  console.log('Id is', props.id);
  useEffect(() => {
    viewAndDeleteSampleLineItem({
      type: "listsamplelineitems",
      sample_reqid: parseInt(props.id),
    }).then((res) => {
      setSampleItems(res);
    });
    viewSampleRequest({
      type: "viewsample",
      sample_id: parseInt(props.id),
    }).then((res) => {
     // setSampleDetails(res);
      //setLogData(res.audit_log);
    });
    // eslint-disable-next-line
  }, [props.id]);

  const payload = [
    {
      type: "label",
      value: "Sample ID",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: '56666556',
      sm: "6",
    },
    
    {
      type: "label",
      value: "Sample Date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: '22-03-2022',
      sm: "6",
    },
    
  ];

  const payload1 = [
    {
        type: "label",
        value: "Sample Code",
        bold: true,
        sm: "6",
      },
      {
        type: "label",
        value: 'HGGH987766',
        sm: "6",
      },
    {
      type: "label",
      value: "Factory Code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: 'FC9080',
      sm: "6",
    },
    
  ];



  const payload2 = [
    {
        type: "label",
        value: "Product Category",
        bold: true,
        sm: "6",
      },
      {
        type: "label",
        value: 'Test cat',
        sm: "6",
      },
    {
      type: "label",
      value: "Product Sub-Type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: 'Type data',
      sm: "6",
    },
    {
      type: "label",
      value: "Product Flavor",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: 'Flavor',
      sm: "6",
    },
  ];

  const payload3 = [
    {
        type: "label",
        value: "Aroma",
        bold: true,
        sm: "6",
      },
      {
        type: "label",
        value: 'Test Aroma',
        sm: "6",
      },
    {
      type: "label",
      value: "Aroma QTY (Litres/HR)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: '45',
      sm: "6",
    },
    {
      type: "label",
      value: "Yield (%)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: '5',
      sm: "6",
    },{
      type: "label",
      value: "Yield Ratio",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: '4.5',
      sm: "6",
    },
  ];

  const ShowCreateSampleItemHandler = () => {
    setCreateSampleItem(true);
  };

  const ShowSampleItemDetailsHandler = (event, sampleItemId) => {
    if (event === "view_sampleitem") {
      viewAndDeleteSampleLineItem({
        type: "viewsamplelineitem",
        lineitem_id: parseInt(sampleItemId),
      }).then((res) => {
        //setSampleItemsDetails(res);
      });
      setEditSampleItem(true);
      //setSampleItemId(sampleItemId);
    } else {
      viewAndDeleteSampleLineItem({
        type: "deletesamplelineitem",
        lineitem_id: parseInt(sampleItemId),
      }).then((res) => {
        if (res) {
          setSnack({
            open: true,
            message: res,
          });
        }
      });
      viewAndDeleteSampleLineItem({
        type: "listsamplelineitems",
        sample_reqid: parseInt(props.id),
      }).then((res) => {
        setSampleItems(res);
      });
      setCreateSampleItem(false);
      setEditSampleItem(false);
    }
  };

  // const sampleItemInfo = () => (
  //   <Container className={classes.popover}>
  //     <Grid id="top-row" container ref={sampleItemInfoRef}>
  //       <Grid item md={12} xs={12} className="item">
  //         <Typography>Sample line item information</Typography>
  //       </Grid>
  //     </Grid>
  //     {/* <SampleItemList
  //       data={sampleItems}
  //       // deleteSampleline={(event, sampleItemId) => showDeleteSamplelineHandler(event, sampleItemId)}
  //       sampleItemDetails={(event, sampleItemId) =>
  //         ShowSampleItemDetailsHandler(event, sampleItemId)
  //       }
  //     /> */}
  //   </Container>
  // );

  // const SubmitSampleAction = async (e) => {
  //   // try {
  //   //     let response = await requestQuotePriceInfo({
  //   //         "type":"requestprice",
  //   //         "quote_number":props.id?.toString()
  //   //         });
  //   //     console.log("Response", response);
  //   //     if(response) {
  //   setSubmitSample(!submitSample);
  //   //         setTimeout(() => {
  //   //             handleClose();
  //   //         }, 2000)
  //   //     }
  //   // } catch(e) {
  //   setSnack({
  //     open: true,
  //     message: 'Server Error. Please contact administrator', //e.response?.data //e.message
  //     severity: "error",
  //   });
  //   // }
  // };

  const handleClose = () => {
    setSubmitSample(false);
    props.back();
  };

  // const ShowDetailsList = () => {
  //   setCreateSampleItem(false);
  //   viewAndDeleteSampleLineItem({
  //     type: "listsamplelineitems",
  //     sample_reqid: parseInt(props.id),
  //   }).then((res) => {
  //     setSampleItems(res);
  //   });
  // };

  // const HideSampleEditItemHandler = () => {
  //   viewAndDeleteSampleLineItem({
  //     type: "listsamplelineitems",
  //     sample_reqid: parseInt(props.id),
  //   }).then((res) => {
  //     setSampleItems(res);
  //   });
  //   setCreateSampleItem(false);
  //   setEditSampleItem(false);
  // };

  const requestSampleSuccess = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>Sample request submitted and email sent successfully</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Close" onClick={handleClose} />
        </Grid>
      </Grid>
    </Container>
  );

  // const sampleSteps = [
  //   "New",
  //   "Pending with QC",
  //   "Received from QC",
  //   "Approved",
  //   "Samples dispatched",
  // ];

  // const getActiveStep = () => {
  //   if (sampleDetails.masterstatus === "New") {
  //     return "1";
  //   } else if (sampleDetails.masterstatus === "Pending with QC") {
  //     return "2";
  //   } else if (sampleDetails.masterstatus === "Received from QC") {
  //     return "3";
  //   } else if (sampleDetails.masterstatus === "Approved") {
  //     return "4";
  //   } else {
  //     return "5";
  //   }
  // };

  let component;

  if (createSampleItem) {
    //component = <AddSampleItem back={ShowDetailsList} sampleid={props.id} />;
  } else if (showEditSampleItem) {
    component = (
   
        <>Edit</>
    );
  } else {
    return (
      <>
        {showSnack.open && (
          <Snackbar
            {...showSnack}
            handleClose={() =>
              setSnack({ open: false, message: "", severity: "" })
            }
          />
        )}
        {/* <Card className="page-header">
          <CardHeader title="Sample details" className="cardHeader" />
          <CardContent>
        
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload1} />
              </Grid>
            </Grid>
      
            <Grid container className={classes.links} md={6}>
              <Grid item md={5} xs={6}>
                <SimplePopper
                  linkLabel="Sample Line Items Information"
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
              <Grid item md={12} xs={12}>
                <SimpleStepper
                  activeStep={getActiveStep()}
                  steps={sampleSteps}
                  stepClick={(e) => {
                    console.log("e::", e);
                  }}
                ></SimpleStepper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>*/}


         
            <Grid id="top-row" container>
            <Grid item md={12} xs={12}>
                <WhiteTextTypography variant="h5">
                Master Blend information</WhiteTextTypography>
          </Grid>
              <Grid item md={12} xs={12} className="item">
                      <WhiteTextTypography variant="h3">Sample Info</WhiteTextTypography>
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
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={12} direction="column">
                <Grid item md={12} xs={12} className="item">
                        <WhiteTextTypography variant="h3">Product Info</WhiteTextTypography>
                </Grid>
             
              </Grid>

              <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload2} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload3} />
              </Grid>
            </Grid>
              <Grid id="top-row" xs={12} md={12} direction="column">
                <Grid item md={12} xs={12} className="item">
                        <WhiteTextTypography variant="h3">Remarks</WhiteTextTypography>
                </Grid>
                <Template payload={payload1} />
              </Grid>
            </Grid>

            <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <Typography>Sample line item information</Typography>
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
              label={"Sample Line Item"}
              variant="extended"
              onClick={ShowCreateSampleItemHandler}
              sampleId={props.id}
            />
          </Grid>
        </Grid>
        {/* {sampleItems?.length > 0 && ( */}
        <SampleListItem
          data={sampleItems}
          sampleItemDetails={(event, sampleItemId) =>
            ShowSampleItemDetailsHandler(event, sampleItemId)
          }
        />
      
        <SimpleModal
          open={submitSample}
          handleClose={handleClose}
          body={requestSampleSuccess}
        />
      </>
    );
  }

  return <>{component}</>;
};
export default SampleDetails;