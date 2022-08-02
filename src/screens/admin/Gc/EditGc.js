import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import _ from "lodash";
import {
  // Card,
  // CardContent,
  // CardHeader,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "../../common.css";
import { getGcCreationInfo, createOrUpdateGcDetail, getgcDetails } from "../../../apis";
import AuditLog from "./AuditLog";
import useToken from "../../../hooks/useToken";
import { routeBuilder } from "../../../utils/routeBuilder";
import { useNavigate, useParams } from "react-router-dom";

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
    "& .MuiAccordion-root": {
      width: "100%",
    },
    "& .dispatchTable": {
      maxHeight: "400px",
      overflowY: "auto",
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
}));

const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map(v => formattedData.push({ label: v[key], value: v[id] }))
  return formattedData;
}
// const formatDate = (datestr) => {
//     let dateVal = new Date(datestr);
//     return dateVal.getDate() + "/" + (dateVal.getMonth() + 1) + "/" + dateVal.getFullYear();
// }

const EditGc = (props) => {
  const navigate = useNavigate();
  const { gcId } = useParams();
  const classes = useStyles();
  const [gcDetails, setGcDetails] = useState({});
  const [ItemGroup, setItemGroup] = useState([]);
  const [ItemCategory, setItemCategory] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [ItemUom, setItemUom] = useState([]);
  // const [groupNewData, setGroupNewData] = useState([]);
  const [validationError, setValidationError] = useState({});
  const [lgroupcode, setLgroupcode] = useState('');
  const [lname, setLname] = useState('');
  const [logData, setLogData] = useState([]);
  // const [allgroups, setAllgroups] = useState([]);
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const { getCurrentUserDetails } = useToken();
  useEffect(() => {
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    let temp = await getgcDetails({ item_id: gcId });
    // var tempgr = allgroups?.length && allgroups.filter(v => v.group_id === props.data.group_id);
    temp.group_id = { label: temp.lname, value: temp.group_id }

    temp.uom = { label: temp.uom_name, value: temp.uom }
    temp.item_catid = { label: temp.item_catname, value: temp.item_catid }

    setLogData(temp.audit_log_gc);
    setGcDetails(temp);

    getGcCreationInfo({
      type: "uoms",
    }).then((res) => {
      setItemUom(formatToSelection(res, "uom_name", "uom_id"));
    });

    getGcCreationInfo({
      "type": "itemcategories"
    }).then((res) => {
      setItemCategory(formatToSelection(res, "item_category_name", "item_category_id"))
    });
    getGcCreationInfo({
      "type": "itemgroups"
    }).then((res) => {
      // setGroupNewData(res);
      // setAllgroups(res);
      setItemGroup(formatToSelection(res, "group_name", "group_id"))
      var temporary = res.filter(v => v.group_id === temp.group_id?.value);
      setLgroupcode(temporary[0].led_group_id);
      setLname(temporary[0].group_name);
    });

  };


  useEffect(() => {
    fetchData(gcId);
    // eslint-disable-next-line
  }, [gcId]);



  const updateGcAction = async (e) => {
    e.preventDefault();
    const message = "Please enter valid details";
    let errorObj = {};

    if (_.isEmpty(gcDetails.group_id)) {
      errorObj = { ...errorObj, group_id: message };
    }
    if (_.isEmpty(gcDetails.item_code)) {
      errorObj = { ...errorObj, item_code: message };
    }
    if (_.isEmpty(gcDetails.s_code)) {
      errorObj = { ...errorObj, s_code: message };
    }
    if (_.isEmpty(gcDetails.item_name)) {
      errorObj = { ...errorObj, item_name: message };
    }
    if (_.isEmpty(gcDetails.item_catid)) {
      errorObj = { ...errorObj, item_catid: message };
    }
    if (_.isEmpty(gcDetails.uom)) {
      errorObj = { ...errorObj, uom: message };
    }
    if (_.isEmpty(gcDetails.coffee_type)) {
      errorObj = { ...errorObj, coffee_type: message };
    }
    setValidationError(errorObj);
    if (!_.isEmpty(errorObj)) {
      setValidationError(errorObj);
    } else {
      setLoading(true);
      let data = {
        "update": true,
        "loggedinuserid": getCurrentUserDetails()?.id,
        "item_id": gcId,
        "group_id": gcDetails.group_id?.value,
        "item_code": gcDetails.item_code,
        "s_code": gcDetails.s_code,
        "item_name": gcDetails.item_name,
        "item_desc": gcDetails.item_desc,
        "hsn_code": gcDetails.hsn_code,
        "convertion_ratio": gcDetails.convertion_ratio ? gcDetails.convertion_ratio : "0",
        "item_catid": gcDetails.item_catid?.value,
        "uom": gcDetails.uom?.value,
        "enable_status": gcDetails.status,
        "updated_on": new Date(),
        "updated_by": localStorage.getItem('currentUserId'),
        display_inpo: gcDetails.display_inpo,
        display_in_dailyupdates: gcDetails.display_in_dailyupdates,
        is_specialcoffee: gcDetails.is_specialcoffee,
        coffee_type: gcDetails.coffee_type,
        lgroupcode: lgroupcode,
        lname: lname,
        density: gcDetails.density ? gcDetails.density : "0",
        moisture: gcDetails.moisture ? gcDetails.moisture : "0",
        soundbeans: gcDetails.soundbeans ? gcDetails.soundbeans : "0",
        browns: gcDetails.browns ? gcDetails.browns : "0",
        blacks: gcDetails.blacks ? gcDetails.blacks : "0",
        broken_bits: gcDetails.broken_bits ? gcDetails.broken_bits : "0",
        insected_beans: gcDetails.insected_beans
          ? gcDetails.insected_beans
          : "0",
        bleached: gcDetails.bleached ? gcDetails.bleached : "0",
        husk: gcDetails.husk ? gcDetails.husk : "0",
        sticks: gcDetails.sticks ? gcDetails.sticks : "0",
        stones: gcDetails.stones ? gcDetails.stones : "0",
        beans_retained: gcDetails.beans_retained
          ? gcDetails.beans_retained
          : "0",
      }
      try {
        let response = await createOrUpdateGcDetail(data);
        if (response) {
          setSnack({
            open: true,
            message: "GC updated successfully",
          });
          setTimeout(() => {
            navigate(-1)
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      }
      finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (event, key) => {
    let data = {
      ...gcDetails,
      [key]: event.target.value,
    };
    setGcDetails(data);
  };

  const handleCheck = (event, key) => {
    let data = {
      ...gcDetails,
      [key]: event.target.checked,
    };
    setGcDetails(data);
  };

  const handleCatIdChange = (event, value) => {
    let data = {
      ...gcDetails,
      'item_catid': value,
    };
    setGcDetails(data);
  };

  const handleGroup = async (event, value) => {
    // var temp = groupNewData.filter(v => v.group_id === event.target.value);
    await setLgroupcode(value.led_group_id);
    await setLname(value.group_name);
    let data = {
      ...gcDetails,
      'group_id': value,
    };
    await setGcDetails(data);
  };

  const payload = [
    {
      label: "Item group",
      type: 'autocomplete',
      labelprop: "label",
      value: gcDetails?.group_id ? gcDetails?.group_id : '',
      options: ItemGroup || [],
      required: true,
      error: validationError?.group_id,
      helperText: validationError?.group_id,
      onChange: handleGroup,
    },
    {
      label: "Item code",
      type: "input",
      value: gcDetails.item_code,
      required: true,
      error: validationError?.item_code,
      helperText: validationError?.item_code,
      onChange: (e) => handleChange(e, "item_code"),
    },
    {
      label: "Short code",
      type: "input",
      value: gcDetails.s_code,
      required: true,
      error: validationError?.s_code,
      helperText: validationError?.s_code,
      onChange: (e) => handleChange(e, "s_code"),
    },
    {
      label: "Item name",
      type: "input",
      value: gcDetails.item_name,
      required: true,
      error: validationError?.item_name,
      helperText: validationError?.item_name,
      onChange: (e) => handleChange(e, "item_name"),
    },
    {
      label: "Item description",
      type: "input",
      value: gcDetails.item_desc,
      onChange: (e) => handleChange(e, "item_desc"),
    },
    {
      label: "HSN code",
      type: "input",
      value: gcDetails.hsn_code,
      onChange: (e) => handleChange(e, "hsn_code"),
    },
    {
      label: "Conversion ratio",
      type: "number",
      value: gcDetails.convertion_ratio,
      onChange: (e) => handleChange(e, "convertion_ratio"),
    },
  ];

  const payload3 = [
    {
      label: "Density(Gm/cc)",
      type: "number",
      value: gcDetails.density === "" ? '' : gcDetails.density,
      onChange: (e) => handleChange(e, "density"),
    },
    {
      label: "Bleached(%)",
      type: "number",
      value: gcDetails.bleached === "" ? '' : gcDetails.bleached,
      onChange: (e) => handleChange(e, "bleached"),
    },
    {
      label: "Moisture(%)",
      type: "number",
      value: gcDetails.moisture === "" ? '' : gcDetails.moisture,
      onChange: (e) => handleChange(e, "moisture"),
    },
    {
      label: "Sound Beans(%)",
      type: "number",
      value: gcDetails.soundbeans === "" ? '' : gcDetails.soundbeans,
      onChange: (e) => handleChange(e, "soundbeans"),
    },
    {
      label: "Husk(%)",
      type: "number",
      value: gcDetails.husk === "" ? '' : gcDetails.husk,
      onChange: (e) => handleChange(e, "husk"),
    },
    {
      label: "Browns(%)",
      type: "number",
      value: gcDetails.browns === "" ? '' : gcDetails.browns,
      onChange: (e) => handleChange(e, "browns"),
    },
    {
      label: "Sticks(%)",
      type: "number",
      value: gcDetails.sticks === "" ? '' : gcDetails.sticks,
      onChange: (e) => handleChange(e, "sticks"),
    },
    {
      label: "Blacks(%)",
      type: "number",
      value: gcDetails.blacks === "" ? '' : gcDetails.blacks,
      onChange: (e) => handleChange(e, "blacks"),
    },
    {
      label: "Stones(%)",
      type: "number",
      value: gcDetails.stones === "" ? '' : gcDetails.stones,
      onChange: (e) => handleChange(e, "stones"),
    },
    {
      label: "Broken & Bites(%)",
      type: "number",
      value: gcDetails.broken_bits === "" ? '' : gcDetails.broken_bits,
      onChange: (e) => handleChange(e, "broken_bits"),
    },
    {
      label: "Beans retained on 5mm mesh during sieve analysis",
      type: "number",
      value: gcDetails.beans_retained === "" ? '' : gcDetails.beans_retained,
      onChange: (e) => handleChange(e, "beans_retained"),
    },
    {
      label: "Insected beans(%)",
      type: "number",
      value: gcDetails.insected_beans === "" ? '' : gcDetails.insected_beans,
      onChange: (e) => handleChange(e, "insected_beans"),
    }
  ];

  const handleUOMChange = (event, value) => {
    let data = {
      ...gcDetails,
      'uom': value,
    };
    setGcDetails(data);
  };

  const payload1 = [
    {
      label: "Item category",
      type: 'autocomplete',
      labelprop: "label",
      value: gcDetails?.item_catid ? gcDetails?.item_catid : '',
      options: ItemCategory || [],
      onChange: handleCatIdChange,
    },
    {
      label: "Item UOM",
      type: 'autocomplete',
      labelprop: "label",
      options: ItemUom || [],
      disabled: gcDetails.po_created ? gcDetails.po_created : false,
      value: gcDetails?.uom ? gcDetails?.uom : '',
      onChange: handleUOMChange,
    },
  ];

  const coffeetype = [
    { value: "GC", label: "GC" },
    { value: "ORM", label: "ORM" },
  ];

  const handleCoffeeTypeChange = (event, value) => {
    let data = {
      ...gcDetails,
      'coffee_type': event.target.value,
    };
    setGcDetails(data);
  };

  const payload2 = [
    {
      label: "Display this item in purchase order",
      type: "checkbox",
      checked: gcDetails.display_inpo ? gcDetails.display_inpo : false,
      onChange: (e) => handleCheck(e, "display_inpo"),
      sm: 6,
    },
    {
      label: "Display this green coffee rates in daily update",
      type: "checkbox",
      checked: gcDetails.display_in_dailyupdates ? gcDetails.display_in_dailyupdates : false,
      onChange: (e) => handleCheck(e, "display_in_dailyupdates"),
      sm: 6,
    },
    {
      label: "Item type",
      type: 'select',
      value: gcDetails?.coffee_type ? gcDetails?.coffee_type : '',
      required: true,
      error: validationError?.coffee_type,
      helperText: validationError?.coffee_type,
      options: coffeetype || [],
      onChange: (e) => handleCoffeeTypeChange(e, "coffee_type"),
      sm: 6,
    }
  ];

  const payload22 = [
    {
      label: "Display this item in purchase order",
      type: "checkbox",
      checked: gcDetails.display_inpo ? gcDetails.display_inpo : false,
      onChange: (e) => handleCheck(e, "display_inpo"),
      sm: 6,
    },
    {
      label: "Display this green coffee rates in daily update",
      type: "checkbox",
      checked: gcDetails.display_in_dailyupdates ? gcDetails.display_in_dailyupdates : false,
      onChange: (e) => handleCheck(e, "display_in_dailyupdates"),
      sm: 6,
    },
    {
      label: "Item type",
      type: 'select',
      value: gcDetails?.coffee_type ? gcDetails?.coffee_type : '',
      required: true,
      error: validationError?.coffee_type,
      helperText: validationError?.coffee_type,
      options: coffeetype || [],
      onChange: (e) => handleCoffeeTypeChange(e, "coffee_type"),
      sm: 6,
    },
    {
      label: "Is special coffee",
      type: "checkbox",
      checked: gcDetails.is_specialcoffee === true ? gcDetails.is_specialcoffee : false,
      onChange: (e) => handleCheck(e, "is_specialcoffee"),
      sm: 6,
    },
  ];

  let component = (
    <form className={classes.root} noValidate autoComplete="off">
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Green coffee information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Categories and UOM</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Template payload={payload1} />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Display & Type information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          {gcDetails?.coffee_type === 'GC' ? <Template payload={payload22} /> : <Template payload={payload2} />}
        </AccordionDetails>
      </Accordion>
      {gcDetails.coffee_type === 'GC' ?
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <Typography>Specification information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Template payload={payload3} />
          </AccordionDetails>
        </Accordion> : null}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <Typography>Audit log information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <AuditLog data={logData} />
        </AccordionDetails>
      </Accordion>

      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={(e) => updateGcAction(e)} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => navigate(routeBuilder('gc', gcId, 'view'), { replace: true })} />
        </Grid>
      </Grid>
    </form>
  );
  return <>{component}</>;
};
export default EditGc;