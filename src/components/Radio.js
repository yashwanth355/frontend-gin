import React from 'react';
import { FormLabel, FormControl, RadioGroup, Radio as RadioInput, FormControlLabel } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../constants/colors';

const useStyles = makeStyles((theme) => ({
    label: {       
        '& .MuiRadio-colorSecondary.Mui-checked': {
            color: colors.orange           
        }
    }    
}));
  
export const Radio = (props) => {    
    const { label, disabled, onChange, options } = props; 
    const classes = useStyles(); 
    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup aria-label={label} onChange={onChange} {...props} row>               
                {
                    options.map(v =>  <FormControlLabel disabled={disabled} className={classes.label} value={v.value} control={<RadioInput />} label={v.label} />)
                }
            </RadioGroup>
      </FormControl>
    )
}