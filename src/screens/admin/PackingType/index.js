import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Grid } from "@material-ui/core";
// import { getSampleRequests } from "../../../apis";
import Fab from "../../../components/Fab";
import RoundButton from "../../../components/RoundButton";
import { DownloadExcel } from "../../../components/DownloadExcel";
import _ from "lodash";
import {roles} from "../../../constants/roles";
import useToken from "../../../hooks/useToken";
import PackingTypeList from "./PurchaseTypeList";
import Snackbar from "../../../components/Snackbar";


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
}));

const PackingType = (props) => {
  const { getCurrentUserDetails } = useToken();
  const currentUserDetails = getCurrentUserDetails();
  const role = currentUserDetails?.role;
  const currentUserId = currentUserDetails?.id;
  const [filteredValue, setFilteredValue] = React.useState(
    role === roles.managingDirector ? "all" : "mysamples"
  );
  const [filter, setFilter] = useState("");
  const classes = useStyles();
  const [packingType, setPackingType] = useState(null);
  const [packingTypeFilters, setPackingTypeFilters] = useState([]);
  // eslint-disable-next-line
  const [showPackingTypeAdd, setPackingTypeAdd] = useState(false);
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);
  // const [sampleId, setPackingTypeId] = useState(-1);
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
  
  const getData = async (filter, state) => {
    let filterString = "";
    if (role !== roles.managingDirector || state === "mysamples") {
      filterString = filterString + `createdbyuserid = '${currentUserId}'`;
    }
    if (state !== "all" && state !== "mysamples") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + ` status = '${state}'`;
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `${filter}`;
    }
    // let data = { filter: filterString, loggedinuserid: currentUserId };
    // let response = await getSampleRequests(data);
    setPackingType([]);
  };

  useEffect(() => {
    getData(filter, filteredValue);    
    let temp = [];
    if(role === roles.managerPackackingDevelopment) {
        temp.push({label: "All Packaging Types", value: 'all'}, {label: "Pending Packaging Types", value: 'pending'},{label: "Approved Packaging types", value: 'approved'},{label: "Rejected packaging types", value: 'rejected'});
    }else if(role === roles.qcManager) {
        temp.push({label: "Pending for approval packaging types", value: 'pending_approval'}, {label: "Approved packaging  types", value: 'approved'},{label: "Rejected packaging types", value: 'rejected'});
    }else if(role === roles.managingDirector) {
        // eslint-disable-next-line
        temp.push({label: "All Packaging Types", value: 'all'}, {label: "Pending Packaging Types", value: 'pending'},{label: "Approved Packaging types", value: 'approved'},{label: "Rejected packaging types", value: 'rejected', label: "Pending for approval packaging types", value: 'pending_approval'});
    }else {

    }

    setPackingTypeFilters(temp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredValue, filter]);

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };

  const clearAdvancedFilters = async () => {
    setFilter("");
  };

  const ShowPackingTypeDetailsHandler = (event, sampleId) => {
    // setPackingTypeDetails(true);
    // setPackingTypeId(sampleId);
  };

  return (
    <>
    {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
      <Grid container direction="row">
        <Grid xs={6} item>
          {packingTypeFilters?.length > 0 && <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
            <Select
              native
              value={filteredValue}
              onChange={(event) => {
                setFilteredValue(event.target.value);
                setFilter("");
              }}
              label="View"
              inputProps={{
                name: "view",
                id: "outlined-view-native-simple",
              }}
            >
              {packingTypeFilters.map((item, index) => {
                // if (item?.value === "pending" && role !== roles.managingDirector) {
                //   return null;
                // } else
                return <option value={item.value}>{item.label}</option>;
              })}
            </Select>
          </FormControl>}
        </Grid>
        <Grid
          xs={6}
          item
          justify="flex-end"
          alignItems="center"
          style={{ display: "flex" }}
        >
          {packingType !== null && (
            <RoundButton
              onClick={() => exportExcel()}
              label="Export to excel"
              // variant="extended"
            />
          )}
          <Fab
            onClick={() => setPackingTypeAdd(true)}
            label={"Packing Type"}
            variant="extended"
          />
        </Grid>
      </Grid>

      {showDownloadExcel === true && (
        <DownloadExcel tableData={packingType} tableName="Packing Type" />
      )}

      <PackingTypeList
        selectedAdvancedFilters={(val) => setFilter(val)}
        clearAdvancedFilters={clearAdvancedFilters}
        data={packingType}
        sampleDetails={(event, sampleId) =>
          ShowPackingTypeDetailsHandler(event, sampleId)
        }
      />
    </>
  );
};

export default PackingType;