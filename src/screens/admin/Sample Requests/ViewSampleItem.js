import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { Card, CardContent, CardHeader, Grid, Typography } from "@material-ui/core";
import Button from "../../../components/Button";
import "../../common.css";
import AuditLog from "./AuditLog";
import EditSampleItem from "./EditSampleItem";
import { numberWithCommas } from "../../common";

const ViewSampleItem = (props) => {
  const [sample, setSampleInfo] = useState({});
  const [editSampleItem, setEditSampleItem] = useState(false);

  useEffect(() => {    
    setSampleInfo(props.data);
  }, [props.data]);

  const payload = [
    {
      type: "label",
      value: "Product Type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.product_type,
      sm: "6",
    },
    {
      type: "label",
      value: "Description",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.description,
      sm: "6",
    },
    {
      type: "label",
      value: "Sample category",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.sample_category,
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Target",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.targetprice_enabled === false ? 'No' : 'Yes',
      sm: "6",
    },
    {
      type: "label",
      value: "Target Price",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.target_price === '' ? '-' : numberWithCommas(sample.target_price),
      sm: "6",
    },
  ];


  let component;

  if(editSampleItem){
    component = <EditSampleItem back={props.back} sampleid={props.sampleid} id={props.id} data={props.data} />
  } else {
   return(
      <>
        <Card className="page-header">
          <CardHeader
            title="Sample request line item details"
            className="cardHeader"
          />
          <CardContent>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload1} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
              </Grid>
            </Grid>
            <AuditLog data={sample.audit_log} />
            
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
          <Grid item>
            <Button
              label="Edit"
              onClick={() => setEditSampleItem(true)}
            />
          </Grid>
          <Grid item>
            <Button label="Back" onClick={props.back} />
          </Grid>
        </Grid>
      </>
   )
  }

  return (
    <>
      {component}
    </>
  );
};

export default ViewSampleItem;
