import React from 'react';
import { Button as MButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../constants/colors';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
    backgroundColor: colors.orange,
    color: colors.white,
    minWidth: 150,
    textTransform:'capitalize',
  
    '&:hover': {
      backgroundColor: colors.orange,
      opacity: 0.8,
      
    }
  },
  outlineButton: {
    border: '1px solid' + colors.orange,
    color: colors.orange,
    '&:hover': {
      backgroundColor: colors.orange,
      opacity: 0.8,
      color: colors.white,
    }
  }
}));

export default function Button(props) {
  const classes = useStyles();
  const { label, variant } = props;
    return (
        <MButton
            variant={variant ? variant : "contained" }
            color="primary"
            className={variant ? classes.outlineButton : classes.button}
            // endIcon={props.icon || <Icon>left arrow</Icon>}
            {...props}
        >
            { label }
        </MButton>
    )
}