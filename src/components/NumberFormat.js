import React from 'react';
import NumberFormat from 'react-number-format';

const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(props, ref) {
    console.log('Number format is', props);
    const { onChange, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
            isNumericString
            prefix="$"
        />
    );
});

export default NumberFormatCustom;