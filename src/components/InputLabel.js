import React from 'react';
import { FormLabel as Label } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    heading: {        
        margin: "4px",       
        fontWeight: 450,
        color: 'black'        
    },
    label: {        
        margin: "4px" ,
        color: 'black'     
    }    
  }));

export const InputLabel = (props) => {
    const classes = useStyles();    
    const { id, variant, children } = props;
    return (
        <Label
            {...props}
            id={id}           
            variant={variant}  
            className={(props.bold ? classes.heading : classes.label) + " " + props.className}         
        >{children}</Label>
    )
}

InputLabel.defaultProps = {   
    fullWidth: true,
}