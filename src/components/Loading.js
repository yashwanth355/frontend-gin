import React from 'react'
import classes from './common.module.css';
import { CircularProgress } from '@material-ui/core';
import { colors } from '../constants/colors';
const Loading = (props) => {
    return (
        <div className={classes.loadingContainer}>
            <CircularProgress color={colors.orange} />
        </div>
    )
}

export default Loading