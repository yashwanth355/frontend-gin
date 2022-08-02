import React from 'react';
import { Fab as FabButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { colors } from '../constants/colors';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
        margin: theme.spacing(1),
        },
        // position: 'absolute',
        // bottom: 10,
        // right: 10,
        backgroundColor: colors.orange,
        color: colors.white,
        textTransform:'capitalize',
        '&:hover': {
            backgroundColor: colors.orange,
            opacity: 0.8,
        }
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}));
  
export default function Fab (props) {
    const classes = useStyles();
    return (
        <FabButton {...props} className={classes.root}>
            {
                props.icon || <AddIcon className={classes.extendedIcon} />
            }
            {
                props.label
            }
        </FabButton>
    )
}

