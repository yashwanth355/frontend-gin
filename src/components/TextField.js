import React from 'react';
import { TextField as Field } from '@material-ui/core';

export const TextField = (props) => {
    const { label, value, onChange, variant, fullWidth } = props;
    return (
        <Field
            {...props}
            id={label}
            label={label}
            variant={variant}
            value={value}
            onChange={onChange}
            fullWidth={fullWidth}
        />
    )
}

TextField.defaultProps = {
    variant: 'outlined',
    fullWidth: true,
}