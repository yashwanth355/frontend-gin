import React from 'react';
import { Snackbar as Snack} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Snackbar(props) {
  const state = {
    open: true,
    vertical: 'bottom',
    horizontal: 'center',
  };

  const { vertical, horizontal, open } = state;

  return (
    <Snack
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={props.handleClose}
        key={vertical + horizontal}
        autoHideDuration={5000}
    >
      <Alert onClose={props.handleClose} severity={props.severity || "success"}>
          {props.message}
        </Alert>
    </Snack>
  );
}
