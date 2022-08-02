import React from "react";
import { Container, Avatar, Grid, Divider, List, ListItem, ListItemIcon, ListItemText, Card, CardActions, IconButton, AppBar, Toolbar, Typography } from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditIcon from '@material-ui/icons/Edit';
import LockIcon from '@material-ui/icons/Lock';
import ExitToApp from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from "../constants/colors";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles(theme => ({
    container: {
        padding: 0,
        margin: 0,
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: window.innerWidth,
    },
    root: {
        backgroundColor: colors.orange,
        color: colors.white,
        width: 128,
        height: 128,
        fontSize: '5em',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    item: {
        marginTop: theme.spacing(2),
    },
    gridContainer: {
        marginTop: theme.spacing(5),
    }
}))

const UserProfile = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const handleClick = (e, action) => {
        e.preventDefault();
        if (action === "logout") {
            localStorage.removeItem('')
            localStorage.removeItem('currentActivePage')
            navigate("/login");
        } else if (action === "back") {
            navigate(-1)
        }

    }
    return (
        <Container fluid className={classes.container}>
            <AppBar position="static" style={{ backgroundColor: colors.orange }}>
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" onClick={e => handleClick(e, "back")}>
                        <ArrowBackIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid container justify="center" alignItems="center" direction="column" className={classes.gridContainer}>
                <Grid item>
                    <Avatar
                        className={classes.root}
                        variant="circular"
                        sizes="large"
                    >
                        A
                    </Avatar>
                </Grid>
                <Grid item>
                    <Typography variant="h6" style={{ color: colors.orange, padding: "1em 0em" }}>
                        Welcome, Admin
                    </Typography>
                </Grid>
                <Grid item className={classes.item}>
                    <Card>
                        <CardActions>
                            <List component="nav" aria-label="main">
                                <ListItem button>
                                    <ListItemIcon>
                                        <EditIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Edit Profile" />
                                </ListItem>
                                <ListItem button>
                                    <ListItemIcon>
                                        <LockIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Change Password" />
                                </ListItem>
                                <Divider />
                                <ListItem button onClick={e => handleClick(e, "logout")}>
                                    <ListItemIcon>
                                        <ExitToApp />
                                    </ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItem>
                            </List>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}

export default UserProfile;