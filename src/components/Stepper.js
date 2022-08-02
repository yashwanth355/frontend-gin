import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
// import MobileStepper from '@material-ui/core/MobileStepper';
// import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
// import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
// import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import Iframe from './IFrame';


const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const useStyles = makeStyles((theme) => ({
  root: {
    //maxWidth: 400,
    height: '100vh',
    width: '100%',
    flexGrow: 1

  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  }
}));

function SwipeableTextMobileStepper() {
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [feed, setFeed] = useState([]);
  // const maxSteps = feed?.length;
// IGQVJVUE5Edm1peVduZAlhPNUt3d2g4UjJnU3JOTUx2djl2a0tVSjFLRG10Q19DWGtDbUJpNUVtQklzU3RDUlpyNEo3aUJtT1hpbnNFVUZANVGZAWNk05QXNZARHhRQ3B1NlR5aWM1NThyRnN3YzRnY1VTUAZDZD
  const getInstagramFeed = () => {
    let url = `https://graph.instagram.com/me/media?fields=media_type,media_url&&limit=5&&access_token=bbea45a9fdff94469d17af805d6403d6`;
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(data => {
        if (!data.error) {
          setFeed(data.data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    getInstagramFeed();
  }, []);

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  return (
    <div className={classes.root}>
      <AutoPlaySwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        containerStyle={{ height: '100vh', }}
        style={{ height: '100vh' }}
        enableMouseEvents
      >
        {feed?.map((step, index) => (
          <>
            {Math.abs(activeStep - index) <= 2 ? (
              <Iframe
                iframe={'<img src=' + step.media_url + ' width="100%" height="100%"/>'}
              />

            ) : null}
          </>
        ))}
      </AutoPlaySwipeableViews>
      {/* <MobileStepper
        steps={maxSteps}
        position="static"
        variant="text"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      /> */}
    </div>
  );
}

export default SwipeableTextMobileStepper;
