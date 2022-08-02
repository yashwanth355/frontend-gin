import React, { useState, useContext } from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useNavigate, useLocation } from "react-router-dom";
import _ from 'lodash';
import { loginSchema } from '../utils/validations';
import { login } from '../apis';
import Snackbar from '../components/Snackbar';
import { colors } from '../constants/colors';
import { AuthContext } from '../context/auth-context';
import { roleBasedRoutes } from '../constants/roles'
// import Background from '../assets/images/login-background.jpg';

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // backgroundImage: `url(${Background})`,
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

export default function SignIn(props) {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useContext(AuthContext);
    const getUserDetails = (field = "") => {
        let value = auth.getPreference();
        if (value?.rememberMe) {
            return value[field];
        }
        return "";
    }
    const [name, setName] = useState(getUserDetails("name"));
    const [nameError, setNameError] = useState('');
    const [password, setPassword] = useState(getUserDetails("password"));
    const [passwordError, setPasswordError] = useState('');
    const [rememberMe, setRememeberMe] = useState(getUserDetails("rememberMe") || false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);

    const onLogin = async (e) => {
        e.preventDefault();
        const value = loginSchema.validate({ name, password }, { errors: { escapeHtml: true } });
        if (value?.error?.details.length) {
            if (value.error.details[0].path.includes("password")) {
                setPasswordError("Password cannot be empty");
                setNameError('');
            } else {
                setNameError("Please enter valid name");
            }
        } else {
            setLoading(true);
            try {
                let data = { username: name, password };
                let response = await login(data);
                if (!_.isEmpty(response)) {
                    await auth.storeToken(response);
                    let settingPreference = { rememberMe, name, password };
                    console.log("Setting Preference", settingPreference, auth.role,);
                    await auth.setPreference(settingPreference);

                    const pathIndex = roleBasedRoutes?.[auth.role]?.findIndex(path => path === location?.state?.from?.pathname);
                    if (!!auth.token && pathIndex > -1)
                        navigate(location?.state?.from?.pathname ? location?.state?.from?.pathname : "/home");
                    else navigate(roleBasedRoutes?.[auth.role]?.[0]);
                }
            } catch (e) {
                console.log('Er is', e);
                setSnack({
                    open: true,
                    message: e?.response?.data?.split(':')[e?.response?.data?.split(':')?.length - 1],
                    severity: 'error',
                })
            }
            finally {
                setLoading(false);
            }
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            {showSnack.open && <Snackbar severity={showSnack.severity} message={showSnack.message} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <div className={classes.paper}>
                {/* <Avatar className={classes.avatar} src={"../assets/images/logo.jpeg"} /> */}
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
                        autoComplete="name"
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
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        error={Boolean(passwordError.length)}
                        helperText={passwordError}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" style={{ color: colors.orange }} color="primary" checked={rememberMe} onChange={() => setRememeberMe(!rememberMe)} />}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        className={classes.submit}
                        onClick={onLogin}
                    >
                        {loading ? "Loading..." : "Login"}
                    </Button>


                    <Grid container>
                        <Grid item xs>
                            <Typography align="center">
                                <Link href="/forget" variant="body2" style={{ color: colors.orange }}>
                                    Forgot password?
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>

            </div>
        </Container>
    );

}