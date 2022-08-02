import React from 'react';
import { Grid } from '@material-ui/core';
import { Select } from "./Select";
import { TextField } from './TextField';
import { InputLabel } from './InputLabel';
import NumberFormatCustom from './NumberFormat'
import Button from './Button';
import { Radio } from './Radio';
import { CheckBox } from './CheckBox';
import { DatePicker } from './DatePicker';
import { ComboBox } from './Autocomplete';
import FreeSoloCreateOption from './AutoCompleteWithAdd'
const Template = (props) => {
    const { payload } = props;
    const selectComponent = (v, i) => {
        switch (v.type) {
            case 'input':
                return <TextField
                    key={i}
                    {...v}
                />
            case 'button':
                return <Button
                    key={i}
                    {...v}
                />
            case 'number':
                if (v.format) {
                    <TextField
                        label="react-number-format"
                        value={props.value}
                        onChange={props.onChange}
                        name={props.label}
                        id="formatted-numberformat-input"
                        InputProps={{
                            inputComponent: NumberFormatCustom,
                        }}
                        variant="standard"
                    />
                }
                return <TextField
                    key={i}
                    {...v}

                    InputProps={{ pattern: "[0-9]*" }}
                    type="number"
                    onWheel={event => document.activeElement.blur()}
                />
            case 'float':
                return <TextField
                    key={i}
                    {...v}
                    type="number"
                    onWheel={event => document.activeElement.blur()}
                />
            case 'file':
                return <TextField
                    key={i}
                    {...v}
                    type="file"
                />
            case 'label':
                return <InputLabel
                    key={i}
                    {...v}
                >{v.value}</InputLabel>
            case 'select':
                return <Select
                    key={i}
                    {...v}
                />
            case 'radio':
                return <Radio
                    key={i}
                    {...v}
                />
            case 'checkbox':
                return <CheckBox
                    key={i}
                    {...v}
                />
            case 'datePicker':
                return <DatePicker
                    key={i}
                    {...v}
                />
            case 'autocomplete':
                return <ComboBox
                    key={i}
                    {...v}
                />
            case 'autocompleteAdd':
                return <FreeSoloCreateOption
                    key={i}
                    {...v} />
            default: return null
        }
    }

    //eslint-disable-next-line
    return (
        <Grid id="top-row" container spacing={props?.spacing || 24} direction="row" justifyContent={props.justify}
            alignItems={props.align}>
            {
                payload.map((v, i) => (
                    <Grid item xs={v.xs || 12} sm={v.sm || 6} className="posrelative" style={{ overflowWrap: 'break-word' }}>
                        {selectComponent(v, i)}
                        {v.isplusShow ?
                            <span className="pluspost" onClick={v.onClick}>+</span> : null}
                    </Grid>
                ))
            }
        </Grid>
    )
}

export default Template;