import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { colors } from '../constants/colors';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1   
  },
  tabs:{
    '& .MuiTab-root': {      
      color: colors.orange,
      textTransform: 'capitalize',
      fontSize: '18px',
    },
    '& .MuiTabs-indicator':{
      backgroundColor: colors.orange,
    }    
  }
}));

export default function ContentTabs(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState(props.value);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>    
      <Tabs value={value} onChange={handleChange} className={classes.tabs} >
        {props.children.map(c => <Tab label={c.props.label} value={c.props.index} {...tabProps(c.props.index)}></Tab> )}         
      </Tabs>     
      {props.children.map(c => <TabPanel value={value} index={c.props.index}>{c.props.children}</TabPanel> )}     
    </Paper>
  );
}