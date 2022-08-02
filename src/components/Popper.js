import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popper from '@material-ui/core/Popper';
import { Link } from '@material-ui/core';
import Button from './Button';
import { colors } from '../constants/colors';

const useStyles = makeStyles((theme) => ({
  root:{
    width: '95%',
    margin:10,
    zIndex: 100,
    '&[x-placement*="left"]  > span':{
    
      right: 0,
      width: 0, 
      height: 0, 
      borderTop: '1em solid transparent',
      borderBottom: '1em solid transparent',
      borderLeft: '1em solid '+ colors.orange,
      marginRight: '-0.9em',
  
      '&:before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: 'transparent transparent transparent white',
      }
    },
    '&[x-placement*="right"]  > span':{
    
      left: 0,
      width: 0, 
      height: 0, 
      borderTop: '1em solid transparent',
      borderBottom: '1em solid transparent',
      borderRight: '1em solid '+ colors.orange,
      marginLeft: '-0.9em',
  
      '&:before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: 'transparent white transparent transparent',
      }
    },
    '&[x-placement*="top"]  > span':{
    
      bottom: 0,
      width: 0, 
      height: 0, 
      borderLeft: '1em solid transparent',
      borderRight: '1em solid transparent',
      borderTop: '1em solid '+ colors.orange,
      marginBottom: '-0.9em',
  
      '&:before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: 'white transparent transparent transparent',
      }
    },
    '&[x-placement*="bottom"]  > span':{         
      width: 0, 
      height: 0, 
      borderLeft: '1em solid transparent',
      borderRight: '1em solid transparent',
      borderBottom: '1em solid '+ colors.orange,
      marginTop: '-0.9em',
  
      '&:before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: 'transparent transparent white transparent',
      }
    }
  },
  paper: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,  
  },
  links:{
    marginTop: 10,
    cursor: 'pointer'  
  },
  arrow: {
    position: 'absolute',
    fontSize: 10,
    width: '3em',
    height: '3em',

    '&:before': {     
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    }
  }

}));

export default function SimplePopper(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [arrowRef, setArrowRef] = useState(null);

  const toggle = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const scrollSection = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    props.linkRef.current.scrollIntoView()
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <div className={classes.links}>
      <Link aria-describedby={id} onMouseEnter={toggle} onClick={scrollSection}>
        {props.linkLabel}
      </Link>
      <Popper id={id} open={open} anchorEl={anchorEl} 
      onMouseLeave={toggle}
      placement="top"
      className={classes.root}    
       modifiers={{   
        flip: {
          enabled: true, 
        },     
        preventOverflow: {
          enabled: true,
          boundariesElement: 'scrollParent'
        },      
        arrow: {
          enabled: true,
          element: arrowRef,
        },
      }}>
        <span className={classes.arrow} ref={setArrowRef} />
        <div className={classes.paper}>
          {props.body()}
          <Button label="Close" onClick={toggle}></Button>
        </div>        
      </Popper>
    </div>
  );
}
