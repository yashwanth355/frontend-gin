import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import { loginSchema } from '../utils/validations';
import { vendorLogin } from '../apis';
import Snackbar from '../components/Snackbar';
import { AuthContext } from '../context/auth-context';
import { colors } from '../constants/colors';
const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        height: '100%',
        width: '100%',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
        backgroundColor: colors.orange,
        color: colors.white,
        '&:hover': {
            backgroundColor: colors.orange,
            color: colors.white,
        }
    },
}));

export default function VendorLogin(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState('');
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState('');
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const onLogin = async (e) => {
        e.preventDefault();
        const value = loginSchema.validate({ name, password }, { errors: { escapeHtml: true } });
        if (value?.error?.details.length) {
            if (value.error.details[0].path.includes("password")) {
                setPasswordError("OTP cannot be empty");
                setNameError('');
            } else {
                setNameError("Please enter valid name");
            }
        } else {
            try {
                let data = { username: name, password, vendor: true };
                let response = await vendorLogin(data);
                if (!_.isEmpty(response)) {
                    await auth.storeToken(response);
                    localStorage.setItem('isVendorFirstScreen', 'true');
                    localStorage.setItem('currentActivePage', 0);
                    let settingPreference = { name, password };
                    console.log("Setting Pererence", settingPreference);
                    await auth.setPreference(settingPreference);
                    navigate("/vendor");
                }
            } catch (e) {
                setSnack({
                    open: true,
                    message: "Invalid credentials",
                    severity: 'error',
                })
            }
        }
    }
    
    
    
    

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            {showSnack.open && <Snackbar severity={showSnack.severity} message={showSnack.message} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Email address"
                        name="name"
                        autoFocus
                        value={name}
                        error={Boolean(nameError.length)}
                        helperText={nameError}
                        onChange={e => {
                            setName(e.target.value)
                            setNameError('')
                        }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="OTP"
                        type="password"
                        id="password"
                        value={password}
                        error={Boolean(passwordError.length)}
                        helperText={passwordError}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className={classes.submit}
                        onClick={onLogin}
                    >
                        Login
                    </Button>
                </form>
            </div>
        </Container>
    );
}
