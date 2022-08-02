import React, { useState } from 'react';
// import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import _ from 'lodash';
import { useNavigate } from "react-router-dom";
import { emailSchema, verificationSchema } from '../utils/validations';
import { forgetPassword, confirmForgotPassword } from '../apis';
import Snackbar from '../components/Snackbar';
import { colors } from '../constants/colors';
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

export default function ForgetPassword() {
    const classes = useStyles();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [changePass, setChangePass] = useState(false);
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const navigate = useNavigate();
    const onReset = async (e) => {
        e.preventDefault();
        const value = emailSchema.validate({ email }, { errors: { escapeHtml: true } });
        if (value?.error?.details.length) {
            setEmailError(value.error.details[0].message)
        } else {
            // api to forget
            try {
                let data = { username: email }, message;
                let response = await forgetPassword(data);
                console.log("Response", response);
                if (!_.isEmpty(response)) {
                    setChangePass(true);
                    message = 'Reset link sent successfully';
                } else {
                    message = 'Some error occured. Please try again';
                    throw message;
                }
                setSnack({
                    open: true,
                    message
                })
            }
            catch (err) {
                setSnack({
                    open: true,
                    message: err,
                    severity: 'error',
                })
            }
            // alert("Validation successful");
        }
    }
    const onChangePassword = async (e) => {
        e.preventDefault();
        try {
            let data = { username: email, confirmationcode: code, password };
            const value = verificationSchema.validate({ code, password });
            if (value?.error?.details.length) {
                if (value.error.details[0].path.includes("password")) {
                    setPasswordError("Password must be minimum 8 character long along with uppercase, lowercase, special character and numbers");
                    setCodeError('');
                    setTimeout(() => setPasswordError(''), 5000)
                } else {
                    setCodeError("Please enter valid code");
                }
            } else {
                let response = await confirmForgotPassword(data);
                console.log("Response", response);

                if (_.isEmpty(response)) {
                    navigate("/");
                }
            }
        } catch (e) {
            setSnack({
                open: true,
                message: e,
                severity: 'error'
            })
            console.log("Error in changing password", e.message);
        }
    }
    return (
        <Container component="main" maxWidth="xs">
            {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
            <div className={classes.paper}>
                {/* <Avatar className={classes.avatar}> */}
                {/* <LockOutlinedIcon /> */}
                {/* </Avatar> */}
                <Typography component="h1" variant="h5">
                    Forgot Password
                </Typography>
                {
                    !changePass &&
                    <Typography variant="body2" gutterBottom display="block" align="center">
                        Please enter the email address you'd like your password reset information set to
                    </Typography>
                }
                {
                    !changePass ?
                        <form className={classes.form} noValidate>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email ID"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                error={Boolean(emailError.length)}
                                helperText={emailError}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onReset}
                            >
                                Request reset link
                            </Button>
                        </form>
                        :
                        <form className={classes.form} noValidate>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="code"
                                label="Verification Code"
                                name="code"
                                autoComplete="code"
                                autoFocus
                                value={code}
                                error={Boolean(codeError.length)}
                                helperText={codeError}
                                onChange={e => setCode(e.target.value)}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                label="New Password"
                                name="password"
                                type="password"
                                autoComplete="password"
                                value={password}
                                error={Boolean(passwordError.length)}
                                helperText={passwordError}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onChangePassword}
                            >
                                Change Password
                            </Button>
                        </form>
                }
                <Grid container justify="center" alignItems="center">
                    <Grid item xs >
                        <Link href="/" variant="body2" align="center" style={{ color: colors.orange }}>
                            Back to Login
                        </Link>
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
}