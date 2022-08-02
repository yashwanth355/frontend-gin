import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { colors } from '../constants/colors';
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

const theme = createMuiTheme({
    overrides: {
        MuiPickersCalendar: {
            week: {
                '& .MuiPickersDay-current': {
                    color: colors.orange
                },
                '& .MuiPickersDay-daySelected': {
                    backgroundColor: colors.orange,
                    color: colors.white
                }
            }
        }
    },
});


export const DatePicker = (props) => {
    const { label, value, onChange, variant, format, id } = props;
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <ThemeProvider theme={theme}>
                <KeyboardDatePicker
                    {...props}
                    disableToolbar
                    variant={variant}
                    format={format}
                    id={id}
                    label={label}
                    value={value}
                    onChange={onChange}
                    fullWidth
                    autoOk

                />
            </ThemeProvider>
        </MuiPickersUtilsProvider>
    );
}

DatePicker.defaultProps = {
    variant: 'inline',
    id:"date-picker-inline",
    format: "dd/MM/yyyy",
    margin:"normal"
}