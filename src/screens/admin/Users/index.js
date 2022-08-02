import React, { useEffect, useState } from 'react';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import { makeStyles } from '@material-ui/core/styles';
import Table from '../../../components/Table';
import { changeUserStatus, changeUserStatusDisable, getUserDetails } from "../../../apis";
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import useToken from '../../../hooks/useToken';
import Snackbar from '../../../components/Snackbar';
import { useNavigate } from 'react-router-dom';
import { routeBuilder } from '../../../utils/routeBuilder';
const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    excelExport: {
        margin: '0 10px 0 0 !important',
        color: '#ffffff',
        textTransform: 'capitalize',
        backgroundColor: '#F05A30',
        width: 'auto',
        height: '48px',
        padding: '0 20px',
        minWidth: '48px',
        minHeight: 'auto',
        borderRadius: '24px',
        boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)',
    }
}));

const User = (props) => {
    const classes = useStyles();
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const currentUserId = currentUserDetails?.id;

    const [users, setUsers] = useState(null);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [filter, setFilter] = useState("");
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    const fetchData = async (filter) => {
        let data = { filter, loggedinuserid: currentUserId }
        try {
            let response = await getUserDetails(data);
            console.log("Response", response);
            if (response) {
                setUsers(response ?? []);
            }
        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }

    };
    useEffect(() => {
        fetchData(filter);
        // eslint-disable-next-line
    }, [filter]);

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }

    const userStatus = async (username, status) => {
        try {
            let response;
            let payload = {
                "username": username.trim(),
                "loggedinuserid": getCurrentUserDetails()?.id,
            }
            console.log("status", status)
            if (status === 'disable') {
                response = await changeUserStatusDisable(payload)
            } else {
                response = await changeUserStatus(payload)
            }
            let active = status === 'disable' ? false : true;
            let payload1 = {
                "type": "changestatus",
                "emailid": username.trim(),
                "active": active,
                "loggedinuserid": currentUserId
            }
            response = await getUserDetails(payload1)
            console.log("response", response);
            if (response) {
                fetchData();
            }
        } catch (e) {
            console.log("Error changeing user status", e.message);
        }
    }

    return (
        <Container className={classes.root}>
            <>
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Grid container direction="column">
                    <Grid item justify="flex-end" style={{ display: 'flex' }}>
                        {users !== null &&
                            <RoundButton
                                onClick={() => exportExcel()}
                                label='Export to excel'
                                className={classes.excelExport}
                            // variant="extended"
                            />
                        }
                        <Fab onClick={() => navigate(routeBuilder('users'))} label={"Create User"} variant="extended" />
                    </Grid>
                    {showDownloadExcel === true &&
                        <DownloadExcel tableData={users} tableName='Users' />
                    }
                    <Grid item style={{ marginTop: 25, maxWidth: '100%' }}>
                        <Table selectedAdvancedFilters={(val) => setFilter(val)}
                            clearAdvancedFilters={() => setFilter("")} data={users} userStatus={userStatus} viewUserDetails={(emailId) => navigate(routeBuilder('users', emailId, 'view'))} />
                    </Grid>
                </Grid>
            </>
        </Container>
    )
}

export default User;