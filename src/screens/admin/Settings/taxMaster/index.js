import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";
import Fab from "../../../../components/Fab"
import CreateTax from "./CreateTax";
import EditTax from "./EditTax";
import { getTaxes } from "../../../../apis";
import { DownloadExcel } from "../../../../components/DownloadExcel";
import RoundButton from "../../../../components/RoundButton";
// import _ from "lodash";
import TaxList from "./TaxList";
import TaxDetails from "./TaxDetails";
import useToken from "../../../../hooks/useToken";
import Snackbar from "../../../../components/Snackbar";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    minWidth: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "25%",
    left: "25%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v[id] }));
  return formattedData;
};

const TaxMaster = (props) => {
  const classes = useStyles();
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const [taxes, setTaxes] = useState(null);
  const [showTaxDetails, setTaxDetails] = useState(false);
  const [showEditTax, setEditTax] = useState(false);
  const [showCreateTax, setCreateTax] = useState(false);
  const [taxId, setTaxId] = useState(-1);
  const [viewTaxData, setViewTaxData] = useState({});
   const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
// eslint-disable-next-line
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);

  // eslint-disable-next-line
  useEffect(async() => {
    await fetchData();
// eslint-disable-next-line
  }, []);

  const fetchData = async() => {
    let data = {
      filter: null,
      loggedinuserid: currentUserDetails.id,
    };
    try {
      let response = await getTaxes(data);
      console.log("Response", response);
      if (response) {
        setTaxes(response);
      }
  } catch (e) {      
      setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: 'error',
      })
  }

  }

  const ShowCreateTaxHandler = () => {
    setCreateTax(true);
    setTaxDetails(false);
  };

  const HideCreateTaxHandler = async() => {
    await fetchData();
    setCreateTax(false);
  };

  const ShowTaxDetailsHandler = (event, taxId) => {
    setTaxDetails(true);
    setTaxId(taxId);
  };

  const HideTaxDetailsHandler = (event) => {
    setTaxDetails(false);
  };

  const HideEditTaxHandler = async(event) => {
    await fetchData();
    setEditTax(false);
  };
  const updateTaxActionInfo = (data) => {
    setTaxDetails(!showTaxDetails);
    setViewTaxData(data);
    setEditTax(true);
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };

  let component;
  if (showCreateTax) {
    component = <CreateTax back={HideCreateTaxHandler}></CreateTax>;
  } else if (showEditTax) {
    component = (
      <EditTax back={() => HideEditTaxHandler()} id={taxId} data={viewTaxData} />
    );
  } else if (showTaxDetails) {
    component = (
      <TaxDetails
        back={() => HideTaxDetailsHandler()}
        updateTaxActionInfo={(data) => updateTaxActionInfo(data)}
        id={taxId}
      />
    );
  } else {
    component = (
      <>      
   {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid container direction="row">
          <Grid xs={6} item>
          </Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            {taxes !== null && (
              <RoundButton
                onClick={() => exportExcel()}
                label="Export to excel"
              // variant="extended"
              />
            )}
            <Fab
              onClick={ShowCreateTaxHandler}
              label={"Create Tax"}
              variant="extended"
            />
          </Grid>
        </Grid>
        {showDownloadExcel === true && (
          <DownloadExcel tableData={taxes} tableName="Tax Master" />
        )}
        <TaxList
          data={taxes}
          taxDetails={(event, taxId) => ShowTaxDetailsHandler(event, taxId)}
        />
      </>
    );
  }

  return <Container className={classes.root}>{component}</Container>;
};

export default TaxMaster;
