import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import { colors } from "../constants/colors";
import useToken from "../hooks/useToken";
import Snackbar from '../components/Snackbar';
import {
  NavLink
} from 'react-router-dom';

const StyledTabs = withStyles({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    "& > span": {
      maxWidth: 40,
      width: "100%",
      backgroundColor: colors.orange,
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const StyledTab = withStyles((theme) => ({
  root: {
    textTransform: "none",
    color: colors.orange,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    "&:focus": {
      opacity: 1,
      fontWeight: 800,
    },
    "& > span": {
      height: "100%",
    },
    opacity: 0.8,
    fontWeight: 600,
    padding: "unset",
    minWidth: "180px",
  }
}))((props) => <Tab disableRipple {...props} />);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  notification: {
    marginRight: '2em',
    cursor: 'pointer',
    position: 'relative',
  },
  notificationBox: {
    height: '350px',
    width: '300px',
    zIndex: '99',
    boxShadow: '0px 0px 4px 2px #0e0e0e38',
    // borderRadius: '10px',
    padding: '10px'
  },
  hyperspan: {
    color: '#337ab7',
    cursor: 'pointer',
  },
  semiNotiBox: {
    overflow: 'auto',
    border: '1px solid #0000008c',
    borderRadius: '10px',
    height: '290px',
    width: '100%',
  },
  mainNotiRow: {
    margin: '5px',
  },
  mainNotiRowP: {
    color: '#000',
  },
  markRead: {
    color: '#337ab7',
    margin: '0 0 5px 0',
    textAlign: 'right',
    cursor: 'pointer',
  },
  mainNotiRowH3: {
    color: '#000',
    margin: '0',
  },
  padding: {
    padding: theme.spacing(3),
  },
  demo2: {
    backgroundColor: theme.palette.background.paper,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    position: "absolute",
    margin: "auto",
    top: "40%",
    left: "40%",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  label: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: 700,
  },
}));

export default function CustomizedTabs(props) {
  const classes = useStyles();

  const [showSnack, setSnack] = React.useState({ open: false, message: '', severity: '' });



  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();



  // eslint-disable-next-line




  const getTabs = () => {
    const tabArray = [];
    props?.routes?.map((route, index) => {
      if (route?.roles === undefined ||
        route?.roles?.indexOf(currentUserDetails?.role) > -1) {
        tabArray.push(<NavLink to={route?.to}
          style={({ isActive }) => ({
            borderBottom: isActive && `2px solid ${colors.orange}`,
            textDecoration: 'none'
          })
          }>
          <StyledTab tabIndex={index} label={route?.label} />
        </NavLink >)
      }
      return null
    })
    return tabArray;
  }



  return (
    <div className={classes.root}>

      {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}

      <AppBar position="static" color="default">
        <div className={classes.demo2}>
          <StyledTabs
            aria-label="tabs"
            variant="scrollable"
            scrollButtons="auto"
          // onChange={handleChange}
          >
            {getTabs()}
          </StyledTabs>
        </div>
      </AppBar>
      {/* <Container maxWidth="xl">
        {props.children}
      </Container> */}
      <div style={{ flex: 1, maxHeight: "calc(100vh - 130px)", height: "calc(100vh - 130px)", overflow: 'scroll', margin: '1rem' }}>
        {props.children}
      </div>
    </div>
  );
}

CustomizedTabs.defaultProps = {
  routes: [],
  component: () => <div />,
};