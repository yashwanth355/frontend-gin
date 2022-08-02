import React from 'react';
import { Select as Selection, FormControl, InputLabel, MenuItem, FormHelperText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        minWidth: '95%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export const Select = (props) => {
    const { label, value, onChange, options, error, helperText, className } = props;
    const classes = useStyles();
    return (
        <FormControl variant="outlined" className={classes.formControl + " " + className} error={error} >
            <InputLabel id={label}>{label}</InputLabel>
            <Selection
                {...props}
                value={value}
                onChange={onChange}
                label={label}
                fullWidth
            >
                {
                    options.map(v => <MenuItem value={v.value}>{v.label}</MenuItem>)
                }
            </Selection>
            {error &&  <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    )
}