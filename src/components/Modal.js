import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { colors } from '../constants/colors';
// import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  paper: {
    // position: 'absolute',
    // width: 400,
    // backgroundColor: theme.palette.background.paper,
    // border: '2px solid #000',
    // boxShadow: theme.shadows[5],
    // padding: theme.spacing(2, 4, 3),
    '& #simple-modal-title': {
      color: colors.orange
    }
  },
}));

export default function SimpleModal(props) {
   const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render 
  return (
    <div>
      <Modal
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.paper}
        disableBackdropClick
      >
        {props.body()}
      </Modal>
    </div>
  );
}
