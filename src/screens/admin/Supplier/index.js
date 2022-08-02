import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Container, Grid } from "@material-ui/core";
import Fab from "../../../components/Fab";
import SupplierOrderList from "./SupplierOrderList";
import { getSuppliersList } from "../../../apis";
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import _ from 'lodash';
// import {roles} from "../../../constants/roles";
import useToken from "../../../hooks/useToken";
import Snackbar from "../../../components/Snackbar";
import { useNavigate } from "react-router-dom";
import { routeBuilder } from "../../../utils/routeBuilder";

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

const Supplier = (props) => {
  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  // const role = currentUserDetails.role;
  const currentUserId = currentUserDetails.id;
  const [state, setState] = useState("allsuppliers");
  const [filter, setFilter] = useState(null);
  const navigate = useNavigate();
  const classes = useStyles();
  // eslint-disable-next-line no-unused-vars
  // const [supplier, setSupplier] = useState([]);
  // const [showSupplier, setPurchaseDetails] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });

  const getData = async (filter, state) => {
    let filterString = "";
    if (state !== "allsuppliers") {
      if (!_.isEmpty(filterString))
        filterString = filterString + " AND "
      filterString = filterString + `groupname = '${state}'`
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString))
        filterString = filterString + ' AND '
      filterString = filterString + `${filter}`
    }
    let data = { filter: filterString, loggedinuserid: currentUserId }


    try {
      let response = await getSuppliersList(data);
      console.log("Response", response);
      if (response) {
        setSupplier(response);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: 'error',
      })
    }

  };
  useEffect(() => {
    getData(filter, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, state]);

  const handleChange = async (event) => {
    setState(event.target.value);
    setFilter(null);
  };

  /*
  */

  const exportExcel = () => {
    setShowDownloadExcel(true);
  }
  return (
    <Container className={classes.root}>
      <>
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Grid container direction="row">
          <Grid xs={6} item>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
              <Select
                native
                value={state}
                onChange={handleChange}
                label="View"
                inputProps={{
                  name: "view",
                  id: "outlined-view-native-simple",
                }}
              >
                <option value="allsuppliers">All Suppliers</option>
                <option value="Instant Coffee Suppliers">Instant Coffee Suppliers</option>
                <option value="Indegenious Green Coffee Supliers">Indigenous Green Coffee Suppliers</option>
                <option value="Imported Green Coffee Suppliers">Imported Green Coffee Suppliers</option>
                <option value="Indigenous Other Raw Material Suppliers">Indigenous Other Raw Material Suppliers</option>
                <option value="Imported Other Raw Material Suppliers">Imported Other Raw Material Suppliers</option>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            {supplier !== null &&
              <RoundButton
                onClick={() => exportExcel()}
                label='Export to excel'
              // variant="extended"
              />
            }
            <Fab
              onClick={() => navigate(routeBuilder('supplier',null, 'create'))}
              label={"Create Supplier"}
              variant="extended"
            />
          </Grid>
        </Grid>
        {showDownloadExcel === true &&
          <DownloadExcel tableData={supplier} tableName='Supplier' />
        }
        <SupplierOrderList
          data={supplier}
          selectedAdvancedFilters={(val) => setFilter(val)}
          clearAdvancedFilters={() => setFilter(null)}
          supplierDetails={(supplierId) => navigate(routeBuilder('supplier',supplierId, 'view'))
          }
        />
      </>
    </Container>
  );
};

export default Supplier;