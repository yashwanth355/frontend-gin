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
    borderRadius: '24px',
    height: '48px',
    boxShadow: '0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%)',
    transition: 'backgroundColor 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
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

export default function RoundButton(props) {
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