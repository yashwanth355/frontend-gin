import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { colors } from "../constants/colors";

const useStyles = makeStyles({
    root: {     
      '& .MuiCheckbox-colorSecondary.Mui-checked': {
        color: colors.orange,
      },
    },     
  });

export const CheckBox = (props) => {  
    const classes = useStyles();
  return (
    <div className={classes.root}>
      <FormControlLabel
        control={
          <Checkbox
            disabled={props.disabled}       
            checked={props.checked}
            onChange={props.onChange}        
          />
        }
        label={props.label}
      />      
      
    </div>
  );
}