import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Grid,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { getMRINDetail, createOrUpdateMRINDetail, getPOCreationInfo, getMrinCreationDetail } from "../../../apis";
import Button from "../../../components/Button";
import "../../common.css";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import useToken from "../../../hooks/useToken";
import _ from "lodash";
import BasicTable from "../../../components/BasicTable";
import { roles } from '../../../constants/roles';
import { numberWithCommas } from "../../common";
import AuditLog from './AuditLog';
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    "& .page-header": {
      width: "100%",
      marginBottom: 15,
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  card: {
    boxShadow:
      "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    marginBottom: 5,
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "30%",
    left: "30%",
    width: 700,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  control: {
    marginTop: 3,
    marginBottom: 3,
  },
}));

const formatGCCompositions = (delivered_spec, dispatched_spec, expected_spec) => {
  return [
    {
      composition_name: "Density(Gm/Cc)",
      key: "del_density",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_density : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_density : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_density : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_density - delivered_spec[0].del_density) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_density : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_density : 0
    },
    {
      composition_name: "Moisture (%)",
      key: "del_moisture",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_moisture : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_moisture : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_moisture : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_moisture - delivered_spec[0].del_moisture) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_moisture : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_moisture : 0
    },
    {
      composition_name: "Sound Beans (%)",
      key: "del_soundbeans",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_soundbeans : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_soundbeans : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_soundbeans : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_soundbeans - delivered_spec[0].del_soundbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_soundbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_soundbeans : 0
    },
    {
      composition_name: "Browns (%)",
      key: "del_browns",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_browns : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_browns : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_browns : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_browns - delivered_spec[0].del_browns) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_browns : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_browns : 0
    },
    {
      composition_name: "Blacks (%)",
      key: "del_blacks",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_blacks : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_blacks : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_blacks : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_blacks - delivered_spec[0].del_blacks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_blacks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_blacks : 0
    },
    {
      composition_name: "Broken & Bits (%)",
      key: "del_brokenbits",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_brokenbits : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_brokenbits : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_brokenbits : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_brokenbits - delivered_spec[0].del_brokenbits) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_brokenbits : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_brokenbits : 0
    },
    {
      composition_name: "Insected beans (%)",
      key: "del_insectedbeans",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_insectedbeans : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_insectedbeans : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_insectedbeans : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_insectedbeans - delivered_spec[0].del_insectedbeans) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_insectedbeans : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_insectedbeans : 0
    },
    {
      composition_name: "Bleached (%)",
      key: "del_bleached",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_bleached : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_bleached : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_bleached : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_bleached - delivered_spec[0].del_bleached) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_bleached : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_bleached : 0
    },
    {
      composition_name: "Husk (%)",
      key: "del_husk",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_husk : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_husk : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_husk : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_husk - delivered_spec[0].del_husk) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_husk : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_husk : 0
    },
    {
      composition_name: "Sticks (%)",
      key: "del_sticks",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_sticks : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_sticks : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_sticks : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_sticks - delivered_spec[0].del_sticks) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_sticks : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_sticks : 0
    },
    {
      composition_name: "Stones (%)",
      key: "del_stones",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_stones : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_stones : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_stones : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_stones - delivered_spec[0].del_stones) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_stones : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_stones : 0
    },
    {
      composition_name: "Beans retained on 5mm mesh during sieve analysis",
      key: "del_beansretained",
      expected_spec: expected_spec !== null ? expected_spec[0].exp_beansretained : 0,
      dispatched_spec: dispatched_spec !== null ? dispatched_spec[0].dis_beansretained : 0,
      delivered_spec: delivered_spec !== null ? delivered_spec[0].del_beansretained : 0,
      difference: (expected_spec !== null && delivered_spec !== null) ? parseInt(expected_spec[0].exp_beansretained - delivered_spec[0].del_beansretained) : (expected_spec === null && delivered_spec !== null) ? delivered_spec[0].del_beansretained : (expected_spec !== null && delivered_spec === null) ? expected_spec[0].exp_beansretained : 0
    },
  ];
};

const MrinDetails = (props) => {
  const classes = useStyles();
  const [mrinDetails, setMrinDetails] = useState({});
  const [submitSample, setSubmitSample] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState("");
  const [openApprove, setApprove] = useState(false);
  const [openPaid, setPaid] = useState(false);
  const [logData, setLogData] = useState([]);
  const [validationError, setValidationError] = useState({});
  const [compositions, setCompositions] = useState([]);
  const [otherChargesList, setOtherChargesList] = useState([]);
  const [allSilos, setAllSilos] = useState([]);
  const [taxList, setTaxList] = useState([]);

  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();

  const gcTableColumns = [
    { id: "composition_name", label: "Item" },
    { id: "expected_spec", label: "Expected" },
    { id: "dispatched_spec", label: "Dispatched" },
    { id: "delivered_spec", label: "Delivered" },
    { id: "difference", label: "Difference" },
  ];

  const ocTableColumns = [
    { id: 'label', label: 'Item', },
    { id: 'rate', label: 'Rate', type: "number" },//, isEditable: true
    { id: 'taxLabel', label: 'Tax', type: "number" },//, isEditable: true
    { id: 'taxRate', label: 'Tax Rate', type: "number" },//, isEditable: true
    { id: "total_tax_rate", label: "Total Price", type: "number" },
  ];

  const payload40 = [
    {
      type: "label",
      value: "Other Charges/Vehicle",
      className: classes.labelheading,
      bold: true,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: mrinDetails.otherCharges,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: mrinDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
      className: classes.labelheading,
      bold: true,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: mrinDetails.rate,
      sm: "3",
      md: "3",
    },
  ]
  const payload50 = [
    {
      type: "label",
      value: "Comments",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: mrinDetails.comments || "-",
      sm: "12",
      md: "12",
    },
  ];
  // eslint-disable-next-line
  useEffect(async () => {
    getMRINDetail({ type: "viewmrin", mrinid: props.id }).then(async (res) => {
      if (res !== null) {
        setLogData(res.audit_log_gc_po_mrin);
        let tamp = res.po_domestic_taxes != null ? res.po_domestic_taxes.map((item, index) => {
          return { ...item, total_rate: parseFloat(item?.tax_pro_rate) }
        }) : [];

        setTaxList(tamp);

        if (props.entityId !== null) {
          let response1 = await getMrinCreationDetail({ "type": "allSilos", "entity_id": props?.entityId });
          if (response1 === null) {
            setAllSilos(response1);
          } else if (response1 && response1.length) {
            setAllSilos(response1);
          }
        }

        setMrinDetails(res);
        let taxesMiscCharges = [];
        const taxesPromise = new Promise((resolve, reject) => {
          getPOCreationInfo({ type: "getTaxes" }).then((res) => {
            resolve(res)
          }).catch((err) => {
            reject(err);
          })
        })

        const otherChargesPromise = new Promise((resolve, reject) => {
          getPOCreationInfo({ type: "miscCharges" }).then((res) => {
            resolve(res)
          }).catch((err) => reject(err))
        })
        Promise.all([taxesPromise, otherChargesPromise]).then(([taxes, miscCharges]) => {
          console.log("Taxes are", taxes);
          res?.taxes_misc_charges?.map((item, index) => {
            if (res[item.misc_id] !== '') {
              taxesMiscCharges.push({
                label: miscCharges.find(miscCharge => miscCharge.misc_id === item?.misc_id)?.misc_charges_name,
                taxLabel: taxes.find(tax => tax.tax_id === item?.taxid)?.tax_name,
                rate: item?.misc_charge_rate,
                taxRate: !isNaN(item.tax_percentage) ? item.tax_percentage : 0.00,
                total_tax_rate: ((1 + ((item.tax_percentage !== '' && !isNaN(item.tax_percentage)) ? parseFloat(item.tax_percentage) : 0.00) / 100) * (item.misc_charge_rate !== '' ? parseFloat(item.misc_charge_rate) : 0.00)).toFixed(2)
              })
            }
            return null;
          })
          console.log("Taxes misc charges are", taxesMiscCharges);
          setOtherChargesList(taxesMiscCharges);
        })
        setCompositions(formatGCCompositions(res.delivered_spec, res.dispatched_spec, res.expected_spec));
      }
    });

    getMRINDetail({ type: "getDocumentsOnMRIN", mrinid: props.id }).then(
      (res) => {
        if (res) {
          setInvoiceFile(res[res.length - 1]);
        }
      }
    );

    // eslint-disable-next-line
  }, [props.id]);

  const handleClickPo = (e) => {
    props.viewPo("detail_mrin", mrinDetails.pono);
  };

  const handleClickDebitNote = (e) => {
    props.viewDebitNote("detail_debitnote", mrinDetails.debit_noteid);
  }

  const payload = [
    {
      type: "label",
      value: "MRIN number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.mrinno,
      sm: "6",
    },
    {
      type: "label",
      value: "PO number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      // eslint-disable-next-line
      value: <a href="#">{mrinDetails.pono}</a>,
      onClick: (e) => handleClickPo(e),
      sm: "6",
    },
    {
      type: "label",
      value: "Debit note number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      // eslint-disable-next-line
      value: mrinDetails.debit_noteid ? <a href="#">{mrinDetails.debit_noteid}</a> : '-',
      onClick: (e) => handleClickDebitNote(e),
      sm: "6",
    },    
    {
      type: "label",
      value: "Expected quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.expected_quantity
        ? numberWithCommas(Number(mrinDetails.expected_quantity)?.toLocaleString('en-IN', { minimumFractionDigits: 4 }))
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Vehicle number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        !mrinDetails.vehicle_no || mrinDetails.vehicle_no === ""
          ? "-"
          : mrinDetails.vehicle_no,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoice_date === "" ? "-" : mrinDetails.invoice_date,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoice_quantity
        ? numberWithCommas(Number(mrinDetails.invoice_quantity)?.toLocaleString('en-IN', { minimumFractionDigits: 4 }))
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Delivery date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.delivery_date,
      sm: "6",
    },
    {
      type: "label",
      value: "Weighment shortage",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayment_shortage
        ? parseFloat(mrinDetails.wayment_shortage).toFixed(4)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Way bill number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayBillNumber ? mrinDetails.wayBillNumber : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Purchase Price",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.purchase_price ? mrinDetails.purchase_price : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Coffee Grade",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.coffee_grade ? mrinDetails.coffee_grade : "-",
      sm: "6",
    },
  ];

  const months = [
    "Jan",
    "Feb",
    "March",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return datestr
      ? dateVal.getDate() +
      "-" +
      months[dateVal.getMonth()] +
      "-" +
      dateVal.getFullYear()
      : "";
  };

  const payload1 = [
        {
      type: "label",
      value: "PO category",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.po_category,
      sm: "6",
    },
        {
      type: "label",
      value: "PO sub category",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.po_sub_category,
      sm: "6",
    },    
    {
      type: "label",
      value: "Parent dispatch",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.related_detid === "" ? "-" : mrinDetails.related_detid,
      sm: "6",
    },
    {
      type: "label",
      value: "Dispatch number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.detid === "" ? "-" : mrinDetails.detid,
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice number",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoiceno ? mrinDetails.invoiceno : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Delivered quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.delivered_quantity
        ? numberWithCommas(Number(mrinDetails.delivered_quantity)?.toLocaleString('en-IN', { minimumFractionDigits: 4 }))
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Balance quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.balance_quantity
        ? numberWithCommas(Number(mrinDetails.balance_quantity).toLocaleString('en-IN', { minimumFractionDigits: 4 }))
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Total balance quantity(Kgs)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.total_balance_quantity
        ? numberWithCommas(Number(mrinDetails.total_balance_quantity).toLocaleString('en-IN', { minimumFractionDigits: 4 }))
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Way bill date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.wayBillDate
        ? formatDate(mrinDetails.wayBillDate)
        : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Location",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.silo_name ? mrinDetails.silo_name : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "MRIN Value",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.net_mrinvalue ? mrinDetails.net_mrinvalue : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "MRIN Value(INR)",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.net_mrinvalue ? (mrinDetails.conversationratio ? (mrinDetails.net_mrinvalue * parseFloat(mrinDetails.conversationratio)) : mrinDetails.net_mrinvalue) : "-",
      sm: "6",
    },
        {
      type: "label",
      value: "Gross MRIN Value",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.gross_mrinvalue,
      sm: "6",
    },
  ];

  const payload2 = [
    // {
    //   type: "label",
    //   value: "Bill of entry number",
    //   bold: true,
    //   sm: "6",
    // },
    // {
    //   type: "label",
    //   value:
    //     mrinDetails.billOfEntryNumber === ""
    //       ? "-"
    //       : mrinDetails.billOfEntryNumber,
    //   sm: "6",
    // },
    {
      type: "label",
      value: "Bill of entry conversion rate",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        mrinDetails.conversationratio === ""
          ? "-"
          : mrinDetails.conversationratio,
      sm: "6",
    },
  ];
  // eslint-disable-next-line
  const payload3 = [
    {
      type: "label",
      value: "Bill of entry date",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        mrinDetails.billOfEntryDate === "" ? "-" : mrinDetails.billOfEntryDate,
      sm: "6",
    },
  ];

  // const sampleItemInfo = () => (
  //   <Container className={classes.popover}>
  //     <Grid id="top-row" container ref={sampleItemInfoRef}>
  //       <Grid item md={12} xs={12} className="item">
  //         <Typography>Sample Line Item Information</Typography>
  //       </Grid>
  //     </Grid>
  //     <MrinList
  //       data={sampleItems}
  //       sampleItemDetails={(event, sampleItemId) =>
  //         ShowSampleItemDetailsHandler(event, sampleItemId)
  //       }
  //     />
  //     {/* )} */}
  //   </Container>
  // );

  const payload4 = [
    {
      type: "label",
      value: "AP status",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.apStatus ? mrinDetails.apStatus : "-",
      sm: "6",
    },
    {
      type: "label",
      value: "Invoice amount",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.invoiceAmount ? mrinDetails.invoiceAmount : "-",
      sm: "6",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "AP details",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.apDetails === "" ? "-" : mrinDetails.apDetails,
      sm: "6",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "QC status",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: mrinDetails.qcStatus === "" ? "-" : mrinDetails.qcStatus,
      sm: "6",
    },
  ];

  const downloadFileHandler = async (e) => {
    try {
      let response = await getMRINDetail({
        type: "downloadMRINDocument",
        file_name: invoiceFile.file_name,
        "loggedinuserid": getCurrentUserDetails()?.id,
      });
      console.log("Response", response);
      if (response) {
        const linkSource = `data:application/pdf;base64,${response.fileData}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = invoiceFile.document_name;
        downloadLink.click();
        setSnack({
          open: true,
          message: "File downloaded successfully",
        });
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: "error",
      });
    }
  };

  const payload7 = [
    {
      type: "label",
      value: "Invoice file",
      bold: true,
      sm: 2,
    },
    {
      type: "label",
      value: invoiceFile.document_name,
      sm: "6",
    },
    {
      label: "Download attachment",
      type: "button",
      sm: 12,
      onClick: (e) => downloadFileHandler(e, "invoiceAttachment"),
    },
  ];

  const payload9 = [
    {
      label: "Invoice status",
      type: "checkbox",
      checked: mrinDetails.invoiceStatus,
      sm: 12,
      disabled: true,
    },
  ];

  const handleChange = (event, key) => {
    let data = {
      ...mrinDetails,
      [key]: event.target.value,
    };
    setMrinDetails(data);
  };

  const payload8 = [
    {
      label: "AP details",
      type: "input",
      required: true,
      error: validationError?.apDetails,
      helperText: validationError?.apDetails,
      value: mrinDetails.apDetails || "",
      onChange: (e) => handleChange(e, "apDetails"),
      className: classes.control,
      sm: 12,
    },
    {
      label: "Invoice amount",
      type: "number",
      value: mrinDetails.invoiceAmount || "",
      className: classes.control,
      required: true,
      error: validationError?.invoiceAmount,
      helperText: validationError?.invoiceAmount,
      onChange: (e) => handleChange(e, "invoiceAmount"),
      sm: 12,
    },
  ];

  const handleClose = () => {
    setSubmitSample(false);
    props.back();
  };

  const requestSampleSuccess = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Success</h2>
      <p>Sample Request Submitted and email sent successfully</p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Close" onClick={handleClose} />
        </Grid>
      </Grid>
    </Container>
  );

  const paidAction = async (e) => {
    // const message = 'Please enter valid details';
    let errorObj = {};
    // if (_.isEmpty(mrinDetails.invoiceAmount)) {
    //   errorObj = { ...errorObj, invoiceAmount: message };
    // }
    const message = 'Please enter valid details';
    if (_.isEmpty(mrinDetails.invoiceAmount)) {
      errorObj = { ...errorObj, invoiceAmount: message };
    }
    if (_.isEmpty(mrinDetails.apDetails)) {
      errorObj = { ...errorObj, apDetails: message };
    }
    if (
      !_.isEmpty(mrinDetails.invoiceAmount) &&
      parseFloat(mrinDetails.invoiceAmount) > (parseFloat(mrinDetails.delivered_quantity) / 1000) * parseFloat(mrinDetails.purchase_price)
    ) {
      errorObj = {
        ...errorObj,
        invoiceAmount: "Cannot enter Invoice Amount more than PO Total Amount.",
      };
    }

    if (!_.isEmpty(errorObj)) {
      setValidationError(errorObj);
    } else {
      try {
        let response = await createOrUpdateMRINDetail({
          apStatus: "Paid",
          apDetails: mrinDetails.apDetails,
          "emailid": JSON.parse(localStorage.getItem('preference')).name,
          invoiceAmount: mrinDetails.invoiceAmount,
          type: "Paid",
          role: currentUserDetails.role,
          createduserid: currentUserDetails.id,
          mrinid: props.id,
          "loggedinuserid": getCurrentUserDetails()?.id,
        });
        if (response) {
          setSnack({
            open: true,
            message: "MRIN paid successfully",
          });
          setPaid(!openPaid);
          setTimeout(() => {
            props.back();
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      }
    }
  };

  const approveAction = async (e) => {
    try {
      let response = await createOrUpdateMRINDetail({
        qcStatus: "Approved",
        "emailid": JSON.parse(localStorage.getItem('preference')).name,
        type: "Approve",
        role: currentUserDetails.role,
        createduserid: currentUserDetails.id,
        mrinno: mrinDetails.mrinno,
        pono: mrinDetails.pono,
        mrinid: props.id,
        "loggedinuserid": getCurrentUserDetails()?.id,
      });
      if (response) {
        setSnack({
          open: true,
          message: "MRIN approved successfully",
        });
        setApprove(!openApprove);
        setTimeout(() => {
          props.back();
        }, 2000);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: "error",
      });
    }
  };

  const paidHandler = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Paid</h2>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={6} md={12} container direction="column">
          <Template payload={payload8} />
        </Grid>
      </Grid>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Yes" onClick={paidAction} />
        </Grid>
        <Grid item>
          <Button label="No" onClick={() => setPaid(!openPaid)} />
        </Grid>
      </Grid>
    </Container>
  );

  const approveHandler = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Approve</h2>
      <p>
        You are approving the Quality and invoice attachment. Are you sure you
        want to approve both?
      </p>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Yes" onClick={approveAction} />
        </Grid>
        <Grid item>
          <Button label="No" onClick={() => setApprove(!openApprove)} />
        </Grid>
      </Grid>
    </Container>
  );

  const taxTableColumns = [
    { id: "tax_name", label: "Tax", type: "number" }, //, isEditable: true
    { id: "tax_perc", label: "Tax Value(%)", type: "number" }, //, isEditable: true
    { id: "total_rate", label: "Total Price", type: "number" },
    // { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
  ];

  const payload55 = [
    {
      type: "label",
      value: "TDS (%)",
      bold: true,
      sm: "6",
      md: "6",
    },
    {
      type: "label",
      value:
        mrinDetails.tax_tds === ""
          ? 0
          : parseFloat(mrinDetails?.tax_tds).toFixed(2),
      sm: "6",
      md: "6",
    },
  ];

  return (
    <>
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container>
            <Grid item md={12} xs={12} className="item">
              <Typography>MRIN information</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            <Grid item md={6} xs={6}>
              <Template payload={payload} />
              {mrinDetails.po_sub_category === "Import" && (
                <Template payload={payload2} />
              )}
            </Grid>
            <Grid item md={6} xs={6}>
              <Template payload={payload1} />
              {/* {mrinDetails.po_sub_category === "Import" && (
                <Template payload={payload3} />
              )} */}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      {(currentUserDetails.role === "Accounts Executive" ||
        currentUserDetails.role === "Accounts Manager" ||
        currentUserDetails.role === roles.managingDirector) && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Finance information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid item md={6} xs={6}>
                  <Template payload={payload4} />
                </Grid>
                <Grid item md={6} xs={6}>
                  <Template payload={payload5} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      {(currentUserDetails.role === "QC Manager" ||
        currentUserDetails.role === roles.managingDirector) && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Quality information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container md={12} xs={12}>
                <Template payload={payload6} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

      {props?.poDetails?.po_sub_category !== "Import" && (
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Tax Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12}>
                <>
                  <Grid
                    md={12}
                    xs={12}
                    justify="flex-end"
                    alignItems="center"
                    style={{ display: "flex" }}
                  >
                  </Grid>
                  <BasicTable
                    rows={taxList}
                    columns={taxTableColumns}
                    totalColId='total_rate'
                    hasTotal={true}
                    rowlength={taxList.length}
                    colSpan={2}
                  ></BasicTable>
                </>
              </Grid>
              {/* <Grid id="top-row" xs={12} md={3} container direction="column">
                    <Template payload={payload25} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={3} container direction="column">
                    <Template payload={payload26} />
                  </Grid>
                  <Grid id="top-row" xs={12} md={3} container direction="column">
                    <Template payload={payload27} />
                  </Grid>*/}
              <Grid id="top-row" xs={12} md={3} container direction="column" style={{ margin: 12 }}>
                <Template payload={payload55} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
              <Typography>Other Charges/Vehicle</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid id="top-row" container>
            {/* {mrinDetails.supplier_type_id === "1001" && (
              <>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload31} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload32} />
                </Grid>
              </>
            )} */}
            <BasicTable
              rows={otherChargesList}
              columns={ocTableColumns}
              hasTotal={true}
              colSpan={4}
              rowlength={otherChargesList.length}
              totalColId="total_tax_rate"
            ></BasicTable>
            {mrinDetails.po_sub_category === "Import" && <Template payload={payload40} />}
            {mrinDetails.po_sub_category === "Import" && (
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload50} />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      {mrinDetails.po_category === 'GC' ?
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container>
              <Grid item md={12} xs={12} className="item">
                <Typography>Order specification information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container md={12} xs={12}>
              <BasicTable
                rows={compositions}
                columns={gcTableColumns}
                hasTotal={false}
              ></BasicTable>
            </Grid>
          </AccordionDetails>
        </Accordion> : null}
      {(currentUserDetails.role === "QC Manager" ||
        currentUserDetails.role === roles.managingDirector ||
        currentUserDetails.role === "GC Stores Executive") && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Invoice information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container md={12} xs={12}>
                {invoiceFile && (
                  <>
                    <Grid item md={12} xs={12}>
                      <Template payload={payload7} />
                    </Grid>
                  </>
                )}
              </Grid>
              <Grid container md={12} xs={12}>
                <Template payload={payload9} />
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

                <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Grid id="top-row" container style={{ margin: 6 }}>
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Audit log information</Typography>
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <AuditLog data={logData} />
            </AccordionDetails>
        </Accordion>

      <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
        {
          (currentUserDetails.role === roles.accountsManager ||
            currentUserDetails.role === roles.qcManager ||
            currentUserDetails.role === roles.accountsExecutive ||
            currentUserDetails.role === roles.managingDirector ||
            currentUserDetails.role === roles.gcStoresExecutive) &&
          mrinDetails.status !== "Closed" && (
            <Grid item>
              <Button
                label="Edit"
                onClick={(e) => props.editMrin("edit_mrin", mrinDetails, allSilos)}
              />
            </Grid>
          )}
        <Grid item>
          <Button label="Cancel" onClick={props.back} />
        </Grid>
        {mrinDetails.status === "Pending with QC Approval" &&
          (currentUserDetails.role === "QC Manager" ||
            currentUserDetails.role === roles.managingDirector) && (
            <Grid item>
              <Button
                label="Approve"
                onClick={() => setApprove(!openApprove)}
              />
            </Grid>
          )}
        {mrinDetails.status === "Pending with Finance" &&
          (currentUserDetails.role === "Accounts Executive" ||
            currentUserDetails.role === "Accounts Manager" ||
            currentUserDetails.role === roles.managingDirector) && (
            <Grid item>
              <Button label="Paid" onClick={() => setPaid(!openPaid)} />
            </Grid>
          )}
      </Grid>
      <SimpleModal
        open={submitSample}
        handleClose={handleClose}
        body={requestSampleSuccess}
      />
      <SimpleModal
        open={openApprove}
        handleClose={() => setApprove(!openApprove)}
        body={approveHandler}
      />
      <SimpleModal
        open={openPaid}
        handleClose={() => setPaid(!openPaid)}
        body={paidHandler}
      />
    </>
  );
};
export default MrinDetails;
