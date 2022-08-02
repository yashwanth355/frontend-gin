import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { colors } from '../constants/colors';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary">
      {'Copyright © '}
      <Link color="inherit" href="https://ccplconnect.com/">
        CCL
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    bottom: 0,
    position: 'absolute',
    right: 0,
    left: 0,
    zIndex: 1,
    // minHeight: '100vh',
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
    backgroundColor: colors.gray,
  },
  container: {
      textAlign: 'center',
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
    <CssBaseline />
      <footer className={classes.footer}>
        <Container maxWidth="sm" className={classes.container}>
          <Typography variant="body1">CCL CRM Software</Typography>
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}