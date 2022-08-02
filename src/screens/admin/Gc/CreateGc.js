import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import _ from "lodash";
import {
  Grid,
  Typography,
  // FormControlLabel,
  FormControl,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { TextField } from "../../../components/TextField";
// import { Select } from "../../../components/Select";
import { makeStyles } from "@material-ui/core/styles";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { createOrUpdateGcDetail, getGcCreationInfo } from "../../../apis";
import useToken from '../../../hooks/useToken';
import "../../common.css";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useNavigate } from 'react-router-dom';
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

export const formatToSelection = (data = [], key, id) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v[id] }));
  return formattedData;
};
export const formatToSelectionGroup = (data = [], key, id, val) => {
  let formattedData = [];
  data.map((v) =>
    formattedData.push({ label: v[key], value: v[id], lgroupcode: val })
  );
  return formattedData;
};

export default function CreateGc(props) {
  const classes = useStyles();
  const [gcDetails, setGcDetails] = useState({});
  const [validationError, setValidationError] = useState({});
  const [ItemGroup, setItemGroup] = useState([]);
  // const[CoffeeType,setCoffeeType]=useState([]);
  const [ItemCategory, setItemCategory] = useState([]);
  const [Uom, setUom] = useState([]);
  const [lgroupcode, setLgroupcode] = useState("");
  const [groupNewData, setGroupNewData] = useState([]);
  const [lname, setLname] = useState("");
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getGcCreationInfo({
      type: "itemgroups",
    }).then((res) => {
      setGroupNewData(res);
      setItemGroup(formatToSelection(res, "group_name", "group_id"));
    });

    getGcCreationInfo({
      type: "uoms",
    }).then((res) => {
      setUom(formatToSelection(res, "uom_name", "uom_id"));
    });

    getGcCreationInfo({
      type: "itemcategories",
    }).then((res) => {
      setItemCategory(
        formatToSelection(res, "item_category_name", "item_category_id")
      );
    });
  }, []);
  const handleGroupItemCodeDiscription = (event, key) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...gcDetails,
      [key]: event.target.value,
    };
    setGcDetails(data);
  };

  const handleItemCategory = (event, value) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...gcDetails,
      'ItemCategory': value?.value || "",
    };
    setGcDetails(data);
  };

  const handleItemUom = (event, value) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...gcDetails,
      'Uom': value?.value || "",
    };
    setGcDetails(data);
  };

  const handleCoffeeType = (event, value) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...gcDetails,
      'CoffeeType': value?.value || "",
    };
    setGcDetails(data);
  };

  const handleItemGroup = (e, value) => {
    let data = {
      ...gcDetails,
      'ItemGroup': value?.value,
    };
    setGcDetails(data);
    var temp = groupNewData.filter((v) => v?.group_id === value?.value);
    setLgroupcode(temp?.[0]?.led_group_id || "");
    setLname(temp?.[0]?.group_name || "");
  };

  const handleSpecification = (event, key) => {
    let data = {
      ...gcDetails,
      [key]: event.target.value,
    };
    setGcDetails(data);
  };

  const handleChange = (event, key) => {
    // eslint-disable-next-line no-unused-vars
    let data = {
      ...gcDetails,
      [key]: event.target.checked,
    };
    setGcDetails(data);
  };

  const createGcAction = async (e) => {
    e.preventDefault();

    const message = "Please enter valid details";
    let errorObj = {};
    if (_.isEmpty(gcDetails.ItemGroup)) {
      errorObj = { ...errorObj, ItemGroup: message };
    }
    if (_.isEmpty(gcDetails.ItemCode)) {
      errorObj = { ...errorObj, ItemCode: message };
    }
    if (_.isEmpty(gcDetails.ShortCode)) {
      errorObj = { ...errorObj, ShortCode: message };
    }
    if (_.isEmpty(gcDetails.ItemName)) {
      errorObj = { ...errorObj, ItemName: message };
    }
    if (_.isEmpty(gcDetails.ItemCategory)) {
      errorObj = { ...errorObj, ItemCategory: message };
    }
    if (_.isEmpty(gcDetails.Uom)) {
      errorObj = { ...errorObj, Uom: message };
    }
    if (_.isEmpty(gcDetails.CoffeeType)) {
      errorObj = { ...errorObj, CoffeeType: message };
    }
    setValidationError(errorObj);
    if (!_.isEmpty(errorObj)) {
      setValidationError(errorObj);
    } else {
      setLoading(true)
      let data = {
        group_id: gcDetails.ItemGroup,
        createduserid: currentUserDetails.id,
        item_code: gcDetails.ItemCode,
        s_code: gcDetails.ShortCode,
        item_name: gcDetails.ItemName,
        item_desc: gcDetails.ItemDescription,
        hsn_code: gcDetails.HsnCode,
        convertion_ratio: gcDetails.conversionRatio
          ? gcDetails.conversionRatio
          : "0",
        item_catid: gcDetails.ItemCategory,
        uom: gcDetails.Uom,
        created_on: new Date(),
        created_by: localStorage.getItem("currentUserId"),
        display_inpo: gcDetails.gcpo,
        display_in_dailyupdates: gcDetails.gcDaily,
        is_specialcoffee: gcDetails.is_specialcoffee,
        coffee_type: gcDetails.CoffeeType,
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
        "loggedinuserid": getCurrentUserDetails()?.id,
      };
      try {
        let response = await createOrUpdateGcDetail(data);
        if (response) {
          setSnack({
            open: true,
            message: "GC Information Created Successfully",
          });
          setGcDetails({});
          setTimeout(() => {
            // navigate(-1)
          }, 1500);
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
  const coffeetype = [
    { value: "GC", label: "GC" },
    { value: "ORM", label: "ORM" },
  ];

  const payload2 = [
    {
      label: "Display this item in purchase order",
      type: "checkbox",
      value: gcDetails.gcpo,
      onChange: (e) => handleChange(e, "gcpo"),
      sm: 6,
    },
    {
      label: "Display this green coffee rates in daily update",
      type: "checkbox",
      value: gcDetails.gcDaily,
      onChange: (e) => handleChange(e, "gcDaily"),
      sm: 6,
    },
    {
      label: "Item type",
      type: 'autocomplete',
      labelprop: "label",
      value: gcDetails.CoffeeType,
      options: coffeetype || [],
      required: true,
      error: validationError?.CoffeeType,
      helperText: validationError?.CoffeeType,
      onChange: handleCoffeeType,
      sm: 6,
    },
  ];

  const payload10 = [
    {
      label: "Display this item in purchase order",
      type: "checkbox",
      value: gcDetails.gcpo,
      onChange: (e) => handleChange(e, "gcpo"),
      sm: 6,
    },
    {
      label: "Display this green coffee rates in daily update",
      type: "checkbox",
      value: gcDetails.gcDaily,
      onChange: (e) => handleChange(e, "gcDaily"),
      sm: 6,
    },
    {
      label: "Item type",
      type: 'autocomplete',
      labelprop: "label",
      value: gcDetails.CoffeeType,
      options: coffeetype || [],
      required: true,
      error: validationError?.CoffeeType,
      helperText: validationError?.CoffeeType,
      onChange: handleCoffeeType,
      sm: 6,
    },
    {
      label: "Is special coffee",
      type: "checkbox",
      value: gcDetails.is_specialcoffee,
      onChange: (e) => handleChange(e, "is_specialcoffee"),
      sm: 6,
    },
  ]

  const payload3 = [
    {
      label: "Density(Gm/cc)",
      type: "number",
      value: gcDetails.density,
      onChange: (e) => handleSpecification(e, "density"),
    },
    {
      label: "Moisture(%)",
      type: "number",
      value: gcDetails.moisture,
      onChange: (e) => handleSpecification(e, "moisture"),
    },
    {
      label: "Sound Beans(%)",
      type: "number",
      value: gcDetails.soundbeans,
      onChange: (e) => handleSpecification(e, "soundbeans"),
    },
    {
      label: "Browns(%)",
      type: "number",
      value: gcDetails.browns,
      onChange: (e) => handleSpecification(e, "browns"),
    },
    {
      label: "Blacks(%)",
      type: "number",
      value: gcDetails.blacks,
      onChange: (e) => handleSpecification(e, "blacks"),
    },
    {
      label: "Broken & bites(%)",
      type: "number",
      value: gcDetails.broken_bits,
      onChange: (e) => handleSpecification(e, "broken_bits"),
    },
    {
      label: "Insected beans(%)",
      type: "number",
      value: gcDetails.insected_beans,
      onChange: (e) => handleSpecification(e, "insected_beans"),
    },
    {
      label: "Bleached(%)",
      type: "number",
      value: gcDetails.bleached,
      onChange: (e) => handleSpecification(e, "bleached"),
    },
    {
      label: "Husk(%)",
      type: "number",
      value: gcDetails.husk,
      onChange: (e) => handleSpecification(e, "husk"),
    },
    {
      label: "Sticks(%)",
      type: "number",
      value: gcDetails.sticks,
      onChange: (e) => handleSpecification(e, "sticks"),
    },
    {
      label: "Stones(%)",
      type: "number",
      value: gcDetails.stones,
      onChange: (e) => handleSpecification(e, "stones"),
    },
    {
      label: "Beans retained on 5mm mesh during sieve analysis",
      type: "number",
      value: gcDetails.beans_retained,
      onChange: (e) => handleSpecification(e, "beans_retained"),
    },
  ];

  return (
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
          <Grid id="top-row" container spacing={24}>
            {/* item group */}

            <Grid item xs={12} sm={6}>
              <FormControl error={validationError?.ItemGroup} fullWidth>
                <Autocomplete
                  getOptionLabel={option => option.label}
                  label="Item group *"
                  value={gcDetails.ItemGroup}
                  onChange={handleItemGroup}
                  options={ItemGroup || []}
                  renderInput={(params) => <TextField {...params} helperText={validationError?.ItemGroup} label={'Item group'} error={validationError?.ItemGroup} variant="outlined" required={true} />}
                />
              </FormControl>
            </Grid>

            {/* itemcode */}
            <Grid item xs={12} sm={5}>
              <TextField
                label="Item code"
                value={gcDetails.ItemCode}
                onChange={(e) => handleGroupItemCodeDiscription(e, "ItemCode")}
                error={validationError?.ItemCode}
                helperText={validationError?.ItemCode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Tooltip
                style={{ height: "100%" }}
                title="Unique For Your Identification"
                arrow
              >
                <IconButton aria-label="Unique For Your Identification">
                  <HelpOutlineIcon style={{ color: "#F05A30" }} />
                </IconButton>
              </Tooltip>
            </Grid>

            {/* itemname */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item name"
                value={gcDetails.ItemName}
                onChange={(e) => handleGroupItemCodeDiscription(e, "ItemName")}
                error={validationError?.ItemName}
                helperText={validationError?.ItemName}
                required
              />
            </Grid>
            {/* shortcode */}
            <Grid item xs={12} sm={5}>
              <TextField
                label="Short code"
                value={gcDetails.ShortCode}
                onChange={(e) => handleGroupItemCodeDiscription(e, "ShortCode")}
                error={validationError?.ShortCode}
                helperText={validationError?.ShortCode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Tooltip
                style={{ height: "100%" }}
                title="(R&D Purpose For Sample Creation)Please Contact R&D Department To Enter The Short Code"
                arrow
              >
                <IconButton aria-label="(R&D Purpose For Sample Creation)Please Contact R&D Department To Enter The Short Code">
                  <HelpOutlineIcon style={{ color: "#F05A30" }} />
                </IconButton>
              </Tooltip>
            </Grid>
            {/* itemdescription */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item description"
                value={gcDetails.ItemDescription}
                onChange={(e) =>
                  handleGroupItemCodeDiscription(e, "ItemDescription")
                }
                error={validationError?.ItemDescription}
                helperText={validationError?.ItemDescription}
              />
            </Grid>
            {/* conversionratio */}
            <Grid item xs={12} sm={5}>
              <TextField
                type="number"
                label="Conversion ratio"
                value={gcDetails.conversionRatio}
                onChange={(e) =>
                  handleGroupItemCodeDiscription(e, "conversionRatio")
                }
                error={validationError?.conversionRatio}
                helperText={validationError?.conversionRatio}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Tooltip
                style={{ height: "100%" }}
                title="Please Enter This Item Contribution Percentage For The Powder Production"
                arrow
              >
                <IconButton aria-label="Please Enter This Item Contribution Percentage For The Powder Production">
                  <HelpOutlineIcon style={{ color: "#F05A30" }} />
                </IconButton>
              </Tooltip>
            </Grid>
            {/* hsncode */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="HSN code"
                value={gcDetails.HsnCode}
                onChange={(e) => handleGroupItemCodeDiscription(e, "HsnCode")}
                error={validationError?.HsnCode}
                helperText={validationError?.HsnCode}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>Categories & UOM</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container spacing={24}>
            {/* item CATEGORY */}
            <Grid item xs={12} sm={6}>
              <FormControl error={validationError?.ItemCategory} fullWidth>
                <Autocomplete
                  getOptionLabel={option => option.label}
                  label="Item category *"
                  value={gcDetails.ItemCategory}
                  onChange={handleItemCategory}
                  options={ItemCategory || []}
                  renderInput={(params) => <TextField {...params} helperText={validationError?.ItemCategory} label={'Item category'} error={validationError?.ItemCategory} variant="outlined" required={true} />}
                />
              </FormControl>
            </Grid>
            {/* UOM */}
            <Grid item xs={12} sm={6}>
              <FormControl error={validationError?.Uom} fullWidth>
                <Autocomplete
                  getOptionLabel={option => option.label}
                  label="Item UOM *"
                  value={gcDetails.Uom}
                  onChange={handleItemUom}
                  options={Uom || []}
                  renderInput={(params) => <TextField {...params} helperText={validationError?.Uom} label={'Item UOM'} error={validationError?.Uom} variant="outlined" required={true} />}
                />
              </FormControl>
            </Grid>
          </Grid>
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
          {gcDetails.CoffeeType === 'GC' ? <Template payload={payload10} /> : <Template payload={payload2} />}
        </AccordionDetails>
      </Accordion>
      {gcDetails.CoffeeType === 'GC' ?
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

      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={createGcAction} />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => navigate(-1)} />
        </Grid>
      </Grid>
    </form>
  );
}