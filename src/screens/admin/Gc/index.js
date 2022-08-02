import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Container, Grid, InputLabel } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Fab from "../../../components/Fab";
import GcList from "./GcList";
import { getGCs, getGcCreationInfo } from "../../../apis";
import { DownloadExcel } from "../../../components/DownloadExcel";
import RoundButton from "../../../components/RoundButton";
import useToken from "../../../hooks/useToken";
import _ from "lodash";
// import {roles} from "../../../constants/roles"; 
import Snackbar from "../../../components/Snackbar";
import { useNavigate } from "react-router-dom";
import { routeBuilder } from '../../../utils/routeBuilder'
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

const Gc = (props) => {
  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  // const role = currentUserDetails.role;
  const currentUserId = currentUserDetails.id;
  const classes = useStyles();
  const [state, setState] = useState("allgcs");
  const [filter, setFilter] = useState(null);
  const [gc, setGc] = useState(null);
  const [itemGroup, setItemGroup] = useState([]);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  const getItemGroups = () => {
    getGcCreationInfo({
      type: "itemgroups",
    }).then((res) => {
      setItemGroup(formatToSelection(res, "group_name", "group_id"));
    });
  };
  const getData = async (filter, state) => {
    let filterString = "";
    // if (role !== roles.managingDirector && role !==roles.managerPurchaseGC) {
    //   filterString = filterString + `createdbyuserid = '${currentUserId}'`;
    // }
    console.log("state is", state, filterString);
    if (state === "specialgcs") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `cat_type = 'speciality'`;
    } else if (state !== "allgcs") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `groupname = '${state}'`;
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `${filter}`;
    }

    let data = { filter: filterString, loggedinuserid: currentUserId };

    try {
      let response = await getGCs(data);
      if (response) {
        console.log("Response", response);
        setGc(response);
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

  useEffect(() => {
    getItemGroups();
  }, []);

  const handleChange = async (event) => {
    setState(event.target.value);
    setFilter(null);
  };

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };

  return <Container className={classes.root}> <>
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
            <option value="allgcs">All GCs</option>
            <option value="specialgcs">Special Coffee</option>
            {/* eslint-disable-next-line */}
            {itemGroup.map((item, index) => {
              return <option value={item.label}>{item.label}</option>;
            })}
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
        {gc !== null && (
          <RoundButton
            onClick={() => exportExcel()}
            label="Export to excel"
          // variant="extended"
          />
        )}
        <Fab
          onClick={() => navigate(routeBuilder('gc',null, 'create'))}
          label={"Create GC"}
          variant="extended"
        />
      </Grid>
    </Grid>
    {showDownloadExcel === true && (
      <DownloadExcel tableData={gc} tableName="GC" />
    )}
    <GcList
      selectedAdvancedFilters={(val) => setFilter(val)}
      clearAdvancedFilters={() => setFilter(null)}
      data={gc}
      gcDetails={(event, gcId) => navigate(routeBuilder('gc',gcId, 'view'))}
    />
  </>
  </Container>;
};

export default Gc;