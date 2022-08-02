import React from "react";
import PropTypes from "prop-types";
import Filter from '../assets/images/filter.png';
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Grid } from "@material-ui/core";
import Popover from "@material-ui/core/Popover";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import FilterButton from "./FilterButton";
import _ from 'lodash';

const useStyles = makeStyles((theme) => ({
  filterMain: {
    padding: "10px 20px 30px 20px",
    width: "300px !imporant",
  },
  formcontrolFilter: {
    marginBottom: "15px",
  },
  imgFilter: {
    position: 'relative',
    top: '5px',
    left: '5px',
    cursor: 'pointer'
  },
}));

var filterOptions = [
  { enable: false, type: '', value: "select", title: "Select" },
  { enable: true, type: ' = ', value: "eq", title: "Is equal to" },
  { enable: true, type: ' != ', value: "neq", title: "Is not equal to" },
  { enable: true, type: ' ilike ', value: "startswith", title: "Starts with" },
  { enable: true, type: ' ilike ', value: "contains", title: "Contains" },
  { enable: true, type: ' not ilike ', value: "doesnotcontain", title: "Does not contain" },
  { enable: true, type: ' ilike ', value: "endswith", title: "Ends with" },
  { enable: true, type: ' is null ', value: "isnull", title: "Is null" },
  { enable: true, type: ' is not null ', value: "isnotnull", title: "Is not null" },
  { enable: true, type: ' = "" ', value: "isempty", title: "Is empty" },
  { enable: true, type: ' != "" ', value: "isnotempty", title: "Is not empty" },
  { enable: true, type: ' is null ', value: "hasnovalue", title: "Has no value" },
  { enable: true, type: ' is not null ', value: "hasvalue", title: "Has value" },
];

export default function EnhancedTableHead(props) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [filterColumnId, setFilterColumnId] = React.useState(null);
  const [allData, setAllData] = React.useState({
    before: "select",
    and: "select",
    after: "select",
  });

  const handleClick = (event, headCell) => {
    setFilterColumnId(headCell.id)
    setAnchorEl(event.currentTarget);
    // reset();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const { order, orderBy, headCells } = props;
  // const createSortHandler = (property) => (event) => {
  //   onRequestSort(event, property);
  // };

  const handleChange = (e, type) => {
    let temp = { ...allData };
    temp[type] = e.target.value;
    setAllData(temp);
  };

  const reset = () => {
    props.clearAdvancedFilters();
    setAllData({
      before: "select",
      and: "select",
      after: "select",
      afterText: '',
      beforeText: ''
    });
    setAnchorEl(null);
  };

  const generateFilterString = (key, column, value) => {
    value = value?.trim();
    switch (key) {
      case "eq":
        return ` ${column} = '${value}' `
      case "neq":
        return ` ${column} <> '${value}' `
      case "startswith":
        return ` ${column} ilike '${value}%' `
      case "contains":
        return ` ${column} ilike '%${value}%' `
      case "doesnotcontain":
        return ` ${column} not ilike '%${value}%' `
      case "endswith":
        return ` ${column} ilike '%${value}' `
      case "isnull":
        return ` ${column} is null `
      case "isnotnull":
        return ` ${column} is not null `
      case "isempty":
        return ` ${column} = '' `
      case "isnotempty":
        return ` ${column} <> '' `
      case "hasnovalue":
        return ` ${column} is null `
      case "hasvalue":
        return ` ${column} is not null `
      case "select":
      default:
        return null
    }
  }
  const filter = () => {
    let firstString = generateFilterString(allData.before, filterColumnId, allData.beforeText)
    let secondString = generateFilterString(allData.after, filterColumnId, allData.afterText)
    let filterString = [firstString, secondString].filter(Boolean).join(` ${allData.and} `)
    if (_.isEmpty(filterString))
      reset()
    else
      props.selectedAdvancedFilters(filterString)
    setAnchorEl(null);
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {/* <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            > */}
            {headCell.label}
            {!headCell.hideFilter ?
              <img src={Filter} width='17px' alt='filter-icon' onClick={(e) => handleClick(e, headCell)}
                className={classes.imgFilter} /> : null}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Box
                component="form"
                sx={{
                  "& > :not(style)": { m: 1, width: "25ch" },
                }}
                noValidate
                autoComplete="off"
              >
                <div className={classes.filterMain}>
                  <p>Show items with value that:</p>
                  <FormControl className={classes.formcontrolFilter} fullWidth>
                    <Select
                      value={allData.before}
                      onChange={(e) => handleChange(e, "before")}
                    >
                      {filterOptions?.map((item, index) => {
                        return (
                          <MenuItem disabled={!item.enable} selected={!item.enable} value={item.value}>{item.title}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formcontrolFilter} fullWidth>
                    <TextField
                      id="standard-basic"
                      variant="standard"
                      value={allData.beforeText}
                      onChange={(e) => handleChange(e, "beforeText")}
                    />
                  </FormControl>
                  <FormControl className={classes.formcontrolFilter} fullWidth>
                    <Select
                      value={allData.and}
                      onChange={(e) => handleChange(e, "and")}
                    >
                      <MenuItem value="select" disabled >Select</MenuItem>
                      <MenuItem value="and">And</MenuItem>
                      <MenuItem value="or">Or</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formcontrolFilter} fullWidth>
                    <Select
                      value={allData.after}
                      onChange={(e) => handleChange(e, "after")}
                    >
                      {filterOptions.map((item, index) => {
                        return (
                          <MenuItem disabled={!item.enable} value={item.value}>{item.title}</MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formcontrolFilter} fullWidth>
                    <TextField
                      id="standard-basic"
                      value={allData.afterText}
                      variant="standard"
                      onChange={(e) => handleChange(e, "afterText")}
                    />
                  </FormControl>
                  <Grid id="top-row" container>
                    <Grid item md={6} xs={6}>
                      <Grid item>
                        <FilterButton label="Clear" onClick={() => reset()} />
                      </Grid>
                    </Grid>
                    <Grid item md={6} xs={6}>
                      <Grid item>
                        <FilterButton label="Filter" onClick={() => filter()} />
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              </Box>
            </Popover>

            {/* {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                </span>
              ) : null} */}
            {/* </TableSortLabel> */}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};
