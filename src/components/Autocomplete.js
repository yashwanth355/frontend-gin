import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

export const ComboBox = (props) => {
  return (
   <> <Autocomplete
    {...props}          
    getOptionLabel={(option) => props.labelprop ? (option[props.labelprop] ? option[props.labelprop].toString() : '') : (option.label ? option.label : '')}
    onChange={props.onChange}    
    options={props.options}     
    renderInput={(params) => <TextField {...params} helperText={props.helperText} label={props.label} error={props.error} variant="outlined" required={props.required} />}
    />
   
    </>
  );
}