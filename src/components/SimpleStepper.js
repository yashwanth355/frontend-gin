import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Check from '@material-ui/icons/Check';
  
  const useQontoStepIconStyles = makeStyles({
    root: {
      color: '#eaeaf0',
      display: 'flex',
      height: 22,
      alignItems: 'center',
    },
    active: {
    //   color: '#784af4',
    },
    circle: {
    //   width: 8,
    //   height: 8,
    //   borderRadius: '50%',
    //   backgroundColor: 'currentColor',
    },
    completed: {
      color: '#784af4',
      zIndex: 1,
      fontSize: 18,
    },
  });
  
  function QontoStepIcon(props) {
    const classes = useQontoStepIconStyles();
    const { active, completed } = props;
  
    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
        })}
      >
        {completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
      </div>
    );
  }
  
  QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     */
    active: PropTypes.bool,
    /**
     * Mark the step as completed. Is passed to child components.
     */
    completed: PropTypes.bool,
  };
  

const useStyles = makeStyles((theme) => ({
  root: {
     
    width: '100%',
    '& .MuiStep-horizontal':{
      padding: 0
    },
    '& .MuiStepConnector-root':{
        display:'none'
    },
    '& .MuiStep-root':{        
        flex: '1 1 0%',                     
        pointer: 'cursor',     
        marginLeft: '.375rem', 
        marginRight: '.4375rem',                      
        background:'var(--lwc-colorBackgroundPathIncomplete,rgb(236, 235, 234))',
        ' & .MuiStepLabel-label':{
            color: 'black',
            padding: '0.65rem',
            width: "max-content"
        } ,            
    },    
    ' & .MuiStep-completed':{
        background: 'var(--lwc-colorBackgroundPathComplete,rgb(69, 198, 90))',
        ' & .MuiStepLabel-label':{
            color: 'white',
            padding: '0.75rem'
        }
    },
    ' & .MuiStep-root div.active':{
        background: 'var(--lwc-colorBackgroundPathActive,rgb(1, 68, 134))',
        ' & .MuiStepLabel-label':{
            color: 'white',
            padding: '0.65rem'
        },       
    },
    ' & .MuiPaper-root .MuiStep-root:first-child, & .MuiPaper-root .MuiStep-root:first-child > div':{
        borderTopLeftRadius: 'var(--lwc-heightSalesPath,2rem)',
        borderBottomLeftRadius: 'var(--lwc-heightSalesPath,2rem)',            
    },    
    ' & .MuiPaper-root .MuiStep-root:last-child, & .MuiPaper-root .MuiStep-root:last-child > div':{
        marginRight: 0,  
        borderTopRightRadius: 'var(--lwc-heightSalesPath,2rem)',
        borderBottomRightRadius: 'var(--lwc-heightSalesPath,2rem)',
        paddingRight: '.625rem',
    },
    
  },
  disabledStep:{
    background:'var(--lwc-colorBackgroundPathIncomplete,rgb(236, 235, 234)) !important',
},
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function SimpleStepper(props) {
  const classes = useStyles();
  const steps = props.steps;   
  const [currentStep, setCurrentStep] = React.useState(parseInt(props.completeStep));  

  useState(()=>{
    if(props.completeStep) {
      setCurrentStep(props.completeStep);
    }
  }, [props.completeStep])

  // const handleClick = (currentStep) => {
  //   setCurrentStep(currentStep);
  // };
// onClick={() => {handleClick(index)}}
  return (
    <div className={classes.root}>      
      <Stepper activeStep={props.activeStep}
      >
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};   
          if(currentStep === (index)){
              stepProps.active = true;
          }      
          return (
            <Step key={label} id={index+1} className={props?.quoteSteps && props.activeStep !== index+1 ? classes.disabledStep : ''}>              
              <div className={stepProps.active ? "active" : ""} style={{"width": props.activeStepProgress ? props.activeStepProgress : "100%"}}>               
                <StepLabel {...labelProps}  >{label}</StepLabel>
              </div>                            
              {/* StepIconComponent={QontoStepIcon} */}
            </Step>
          );
        })}
      </Stepper>
    </div>       
  );
}
