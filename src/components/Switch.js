import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { colors } from "../constants/colors";

const CustomSwitchStyle = withStyles({
  switchBase: {
    color: colors.orange,
    '&$checked': {
      color: colors.orange,
    },
    '&$checked + $track': {
      backgroundColor: colors.orange,
    },
  },
  checked: {},
  track: {},
})(Switch);

export default function CustomSwitch(props) {
  return (
    <FormGroup>
      <FormControlLabel
        control={<CustomSwitchStyle checked={props.checked} onChange={props.onChange} name={props.name} />}
      />
    </FormGroup>
  );
}
