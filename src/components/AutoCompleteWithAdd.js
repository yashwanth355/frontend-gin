/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

const filter = createFilterOptions();

export default function FreeSoloCreateOption(props) {

    return (
        <> <Autocomplete
            {...props}
            label={props.label}
            value={props.value}
            onClose={() => console.log("Close clicked")}
            onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                    props.onChange(event, newValue)
                } else if (newValue && newValue.inputValue) {
                    // Create a new value from the user input
                    props.onChange(event, { label: newValue?.inputValue, value: newValue?.inputValue })
                } else {
                    props.onChange(event, newValue);
                }
            }}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                // Suggest the creation of a new value
                if (params.inputValue !== '') {
                    filtered.push({
                        inputValue: params.inputValue,
                        label: `Add "${params.inputValue}"`,
                    });

                }

                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={props.options}
            getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === 'string') {
                    return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                    return option.inputValue;
                }
                // Regular option
                return option.label;
            }}
            renderOption={(option) => option.label}
            // renderOption={(option) => option.label}
            freeSolo
            renderInput={(params) => (<TextField {...params} helperText={props.helperText} label={props.label} error={props.error} variant="outlined" required={props.required} />
            )}
        />
        </>
    );
}

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
