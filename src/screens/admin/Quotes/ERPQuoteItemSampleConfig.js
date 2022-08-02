import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, Link} from '@material-ui/core'
import BasicTable from '../../../components/BasicTable';
import {CheckBox} from '../../../components/CheckBox';

const useStyles = makeStyles({
    table: {       
        padding: 5,        
   },
   row:{       
       borderBottom: "1px solid rgba(224, 224, 224, 1)",
       padding: 5
   },   
   link: {        
    cursor: 'pointer'
    },
});

const ERPQuoteItemSampleConfig = (props) => {
    const classes = useStyles();

    const sampleTableColumns = [
        { id: 'item_name', label: 'Item name', },
        { id: 'item_ratio', label: 'Ratio', },
        { id: 'item_percentage', label: 'Perc'}         
      ]; 

    const CellClickHandler = (e,sample) => {  
        props.removeSampleForPrice("removeForPrice", sample);
    };

    return (<>    
        {
            props.data && props.data?.map((sample) => (              
                <Grid id="top-row" container>                     
                    <Grid item md={3} xs={12} className={classes.row}>
                        <Grid container className={classes.table}>
                            <Grid item md={12} xs={12}>
                                {sample.msample_code}
                            </Grid>
                            <Grid item md={12} xs={12}>
                                <CheckBox label="Request to provide stock price"></CheckBox>
                                <Link className={classes.link} onClick={(e) => CellClickHandler(e, sample)}>Remove from the list</Link>
                                <CheckBox label="Stock price request approved" disabled></CheckBox>
                                <CheckBox label="Confirmed sample" disabled></CheckBox>
                            </Grid>
                        </Grid>                                                
                    </Grid>
                    <Grid item md={9} xs={12} className={classes.row}>
                        <BasicTable rows={sample.item_information} columns={sampleTableColumns} hasTotal={true} totalColId="item_percentage"></BasicTable>
                    </Grid>
                </Grid>
            ))
        }
    </>
    );
}

export default ERPQuoteItemSampleConfig;