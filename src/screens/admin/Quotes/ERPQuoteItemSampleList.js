import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, Link} from '@material-ui/core'
import BasicTable from '../../../components/BasicTable';

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

const ERPQuoteItemSampleList = (props) => {
    const classes = useStyles();

    const sampleTableColumns = [
        { id: 'item_name', label: 'Item name', },
        { id: 'item_ratio', label: 'Ratio', },
        { id: 'item_percentage', label: 'Perc'}         
      ]; 

    const CellClickHandler = (e,sample) => {  
        props.addSampleForPrice("addForPrice", sample);
    };      

    return (<>    
        {
            props.data && props.data.map((sample) => ( 
                <Grid id="top-row" container>                     
                    <Grid item md={3} xs={12} className={classes.row}>
                        <Grid container className={classes.table}>
                            <Grid item md={12} xs={12}>
                                {sample.msample_code}
                            </Grid>
                            <Grid item md={12} xs={12}>
                                <Link className={classes.link} onClick={(e) => { CellClickHandler(e,sample)}}>Add for GC Price Request</Link>
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

export default ERPQuoteItemSampleList;