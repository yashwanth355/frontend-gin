import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid} from '@material-ui/core'
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

const ERPQuoteItemPackageCosts = (props) => {
    const classes = useStyles();

    const tableColumns = [
        { id: 'factory_name', label: 'Factors', },
      //  { id: 'updatedrate_inr', label: 'Rate From Purchase(Per KG)', },
        { id: 'updatedrate_inr', label: 'Factor Rate From Commercial(Per KG)', isEditable:true}         
      ];          

    return (<>   
            <Grid id="top-row" container>                                    
                <Grid item md={9} xs={12} className={classes.row}>
                    <BasicTable rows={props.data} columns={tableColumns} hasTotal={true} totalColId="updatedrate_inr"></BasicTable>
                </Grid>
            </Grid>       
    </>
    );
}

export default ERPQuoteItemPackageCosts;