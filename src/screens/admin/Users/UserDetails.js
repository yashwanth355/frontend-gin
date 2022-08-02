import React, { useEffect, useState } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import Button from '../../../components/Button';
import { getUserDetails } from '../../../apis';
import '../../common.css'
import { useParams, useNavigate } from 'react-router-dom'
import { routeBuilder } from '../../../utils/routeBuilder';


const UserDetails = (props) => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [userDetails, setUserDetails] = useState({});
    const fetchData = () => {
        getUserDetails({
            "type": "getuser",
            "emailid": userId
        }).then(res => {
            setUserDetails(res);
        });
    }
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line 
    }, []);

    const payload = [
        {
            type: 'label',
            value: "First name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.firstname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Middle name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.middlename,
            sm: '6'
        },
        {
            type: 'label',
            value: "Last name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.lastname,
            sm: '6'
        },
        {
            type: 'label',
            value: "Alias",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.alias,
            sm: '6'
        },
        {
            type: 'label',
            value: "Email",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.emailid,
            sm: '6'
        },
        {
            type: 'label',
            value: "EMP code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.empcode,
            sm: '6'
        },
        {
            type: 'label',
            value: "Phone ",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.ext + '-' + userDetails?.phone,
            sm: '6'
        },
        {
            type: 'label',
            value: "Mobile",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.mobile,
            sm: '6'
        },
    ];

    const payload1 = [
        {
            type: 'label',
            value: "Designation",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.designation,
            sm: '6'
        },
        {
            type: 'label',
            value: "Company",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.company,
            sm: '6'
        },
        {
            type: 'label',
            value: "Department",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.department,
            sm: '6'
        },
        {
            type: 'label',
            value: "Division",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.division,
            sm: '6'
        },
        {
            type: 'label',
            value: "Role",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.role,
            sm: '6'
        },
        {
            type: 'label',
            value: "Profile",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.profile,
            sm: '6'
        },
        {
            type: 'label',
            value: "Employee",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.employee ? 'Yes' : 'No',
            sm: '6'
        },
        {
            type: 'label',
            value: "Title",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.title,
            sm: '6'
        },
        {
            type: 'label',
            value: "Active",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.active ? 'Yes' : 'No',
            sm: '6'
        },
    ];

    const payload2 = [
        {
            type: 'label',
            value: "Delegated approver",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.delegatedapprover,
            sm: '6'
        }
    ];

    const payload3 = [
        {
            type: 'label',
            value: "Manager",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.manager,
            sm: '6'
        }
    ];

    const payload4 = [
        {
            type: 'label',
            value: "Address",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.street,
            sm: '6'
        },
        {
            type: 'label',
            value: "Country",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.country,
            sm: '6'
        }
    ];

    const payload5 = [
        {
            type: 'label',
            value: "State/provision",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.state,
            sm: '6'
        },
        {
            type: 'label',
            value: "City",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.city,
            sm: '6'
        },
        {
            type: 'label',
            value: "Zip/Postal code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: userDetails?.postalcode,
            sm: '6'
        }
    ];

    return (<>
        <>
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>General information</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload1} />
                </Grid>
            </Grid>
            <br />
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Approval setting</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload2} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload3} />
                </Grid>
            </Grid>
            <br />
            <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>Mailing address</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload4} />
                </Grid>
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload5} />
                </Grid>
            </Grid>
            <br />
            <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
                <Grid item>
                    <Button label="Edit" onClick={(e) => navigate(routeBuilder('users', userId, 'edit'))} />
                </Grid>
                <Grid item>
                    <Button label="Cancel" onClick={() => navigate(-1)} />
                </Grid>
            </Grid>
        </>
    </>
    );
}
export default UserDetails;