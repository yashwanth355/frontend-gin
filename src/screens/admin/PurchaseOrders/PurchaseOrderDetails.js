import React, { useEffect, useState, useRef } from "react";
import Template from "../../../components/Template";
import { Grid } from "@material-ui/core";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import SimpleStepper from "../../../components/SimpleStepper";
import SimplePopper from "../../../components/Popper";
import Button from "../../../components/Button";
import {
  getPODetails,
  getTopMrinDetails,
  poDocumentsUpload,
  updateGCPoStatus,
  getMrinListForPoDetails,
  getQuotesInfo,
} from "../../../apis";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "../../common.css";
import Snackbar from "../../../components/Snackbar";
import BasicTable from "../../../components/BasicTable";
import DispatchList from "./DispatchList";
import DispatchDetails from "./DispatchDetails";
import AuditLog from "./AuditLog";
import { roles } from "../../../constants/roles";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import useToken from "../../../hooks/useToken";
import Blob from "./PdfDownload/BlobProvider";
import { numberWithCommas } from "../../common";
import PurchaseOrderActions from "./purchaseActions";
import Utility from "../../../utils/utility";
import _ from "lodash";
import SimpleModal from '../../../components/Modal';
import useStyles from './poStyles';
import { useNavigate, useParams } from "react-router-dom";
import { routeBuilder } from "../../../utils/routeBuilder";
import LineItemList from "./LineItemList";

const formatGCCompositions = (compostion = {}) => {
  return [
    {
      composition_name: "Density(Gm/Cc)",
      composition_rate: compostion.density,
    },
    { composition_name: "Moisture (%)", composition_rate: compostion.moisture },
    { composition_name: "Sound Beans (%)", composition_rate: compostion.soundbeans },
    { composition_name: "Browns (%)", composition_rate: compostion.browns },
    { composition_name: "Blacks (%)", composition_rate: compostion.blacks },
    {
      composition_name: "Broken & Bits (%)",
      composition_rate: compostion.brokenbits,
    },
    {
      composition_name: "Insected Beans (%)",
      composition_rate: compostion.insectedbeans,
    },
    { composition_name: "Bleached (%)", composition_rate: compostion.bleached },
    { composition_name: "Husk (%)", composition_rate: compostion.husk },
    { composition_name: "Sticks (%)", composition_rate: compostion.sticks },
    { composition_name: "Stones (%)", composition_rate: compostion.stones },
    {
      composition_name: "Beans retained on 5mm mesh during sieve analysis",
      composition_rate: compostion.beansretained,
    },
  ];
};
const PurchaseOrderDetails = (props) => {
  const navigate = useNavigate();
  const { poid } = useParams();
  const classes = useStyles();
  const currentUserRole = localStorage.getItem("currentUserRole");
  const [purchaseDetails, setPurchaseDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [mrinTableData, setMrinTableData] = useState([]);
  const [lineItemData, setLineItemData] = useState([]);
  const [mrinList, setMrinList] = useState([]);
  const [logData, setLogData] = useState([]);
  const [dispatchData, setDispatchData] = useState([]);
  const [dispatchDetails, setDispatchDetails] = useState({});
  // const [lineItemDetails, setLineItemDetails] = useState({});
  const [compositions, setCompositions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currencyCodes, setCurrencyCodes] = useState([]);
  const dispatchInfoRef = useRef(null);
  const lineItemsRef = useRef(null);
  const [showDispatchDetails, setShowDispatchDetails] = useState(false);
  // const [showLineItemDetails, setShowLineItemDetails] = useState(false);
  const [activeStep, setActiveStep] = React.useState(-1);
  const [stepProgress, setStepProgress] = useState("100%");
  const [taxList, setTaxList] = useState([]);
  const [otherChargesList, setOtherChargesList] = useState([]);
  const [edit, setEdit] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [validationModal, setValidationModal] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [errorValidationMessage, setErrorValidationMessage] = useState("Please check and give mandatory fields to save");
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const formatToSelection = (data = [], key, id) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[key], value: v[id] || v[key] }))
    return formattedData;
  }
  const purchaseTypeList = formatToSelection([{ id: "Fixed", label: "Fixed" }, { id: "Differential", label: "Differential" }], "label", "id");
  const purchaseOrderActions = new PurchaseOrderActions(purchaseDetails,
    setPurchaseDetails, validationError, setValidationError, taxList, otherChargesList, [],
    setValidationModal, setErrorValidationMessage, documents, setLoading, setSnack, setEdit);
  const { getCurrentUserDetails } = useToken();
  let currentUserDetails = getCurrentUserDetails();
  const fetchData = async () => {
    try {
      let response = await getMrinListForPoDetails({
        type: "mrinsonponoforview",
        po_no: poid?.toString(),
        "loggedinuserid": getCurrentUserDetails()?.id,
      });
      let temp = [];
      // eslint-disable-next-line
      response?.map((item, index) => {
        temp.push({
          apStatus: item?.apStatus,
          balance_quantity: numberWithCommas(item?.balance_quantity),
          delivered_quantity: numberWithCommas(item?.delivered_quantity),
          dispatch_id: item?.dispatch_id,
          expected_quantity: numberWithCommas(item?.expected_quantity),
          item_id: item?.item_id,
          mrin_id: item?.mrin_id,
          mrindate: item?.mrindate,
          po_no: item?.po_no,
          qcStatus: item?.qcStatus,
          related_detid: item?.related_detid,
          type: item?.type,
        });
      });
      setMrinTableData(temp);
      getQuotesInfo({ type: "currencies" }).then((res) => {
        var currencyCodes = {};
        res.forEach((cur, i) => {
          currencyCodes[cur.currencyid] = cur.currencycode;
        });
        setCurrencyCodes(currencyCodes);
      });
      await getPODetails({
        po_no: poid?.toString(),
      }).then((res) => {
        // debugger
        setPurchaseDetails(res);
        setLineItemData([])
        let tamp = res.domestic_taxes != null ? res.domestic_taxes.map((item, index) => {
          return { ...item, total_rate: (parseFloat(res?.grossPrice) * parseFloat(item?.perc)) / 100 }
        }) : [];

        // tamp.push({perc: res?.tds, tax_id: "", tax_name: "TDS", total_rate: (parseFloat(res.totalPrice)*parseFloat(res?.tds ? res?.tds : 0))/100});
        setTaxList(tamp);
        // eslint-disable-next-line
        let miscCharges = [];
        res?.taxes_misc_charges?.map((item, index) => {
          if (res[item.misc_id] !== "") {
            miscCharges.push({
              label: item?.misc_charge_name,
              rate: item?.misc_charge_rate,
              taxRate: item.tax_percentage,
              taxLabel: item.tax_name,
              total_tax_rate: (
                (1 + parseFloat(item?.tax_percentage || 0) / 100) *
                parseFloat(item?.misc_charge_rate || 0)
              ).toFixed(2),
            });
          }
          return null;
        });
        setOtherChargesList(miscCharges);
        setActiveStep(parseInt(res.status) - 1);
        setLogData(res.audit_log_gc_po);
        setCompositions(formatGCCompositions(res));
        setDispatchData(res.item_dispatch?.length > 0 ? res.item_dispatch : []);
        if (res.status === "4") {
          var delivered = res.item_dispatch
            ?.map((dispatch) =>
              dispatch.delivered_quantity
                ? parseInt(dispatch.delivered_quantity)
                : 0
            )
            .reduce((sum, i) => sum + i, 0);
          var qty = res.item_dispatch
            ?.map((dispatch) => parseInt(dispatch.dispatch_quantity))
            .reduce((sum, i) => sum + i, 0);
          setStepProgress((delivered / qty) * 100 + "%");
        }
        getTopMrinDetails({
          type: "topmrinrecord",
          gcitem_id: res.item_id,
          po_date: new Date(res.po_date),
        }).then((res) => {
          if (res?.gcitem_id) {
            let data = {
              ...res,
              number: 1,
            };
            setMrinList([data]);
          } else {
            setMrinList([]);
          }
        });
        let documents = [];
        poDocumentsUpload({
          type: "getDocumentsOnPo",
          po_id: res.poid,
        }).then((response) => {
          response?.map((doc) =>
            documents.push({
              upload: !!doc?.file_name,
              file_name: doc?.file_name,
              document_name: doc?.document_name,
              doc_kind: doc?.doc_kind,
              required: doc?.required,
              docid: doc?.docid,
            })
          );
          setDocuments(documents);
        });
        // getPOCreationInfo({ "type": "getTaxes" }).then(res => {
        //   setTaxesList(formatToSelection(res, "tax_name", "tax_id"))
        // });
        // getPOCreationInfo({ "type": "miscCharges" }).then(res => {
        //   setChargesList(formatToSelection(res, "misc_charges_name", "misc_id"))
        // });
      });
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data,
        severity: "error",
      });
    }
  };
  useEffect(() => {
    if (!showDispatchDetails) fetchData();
    // eslint-disable-next-line
  }, [showDispatchDetails]);
  const editPriceInformationHandler = () => {
    if (edit) {
      purchaseOrderActions.updatePurchaseOrder()
    }
    else
      setEdit(prevState => !prevState)
  }
  const formatDate = (datestr, mode = "date") => {
    if (_.isEmpty(datestr)) return "";
    let dateVal = new Date(datestr);
    if (mode === "date")
      return (
        dateVal.getDate() +
        "/" +
        (dateVal.getMonth() + 1) +
        "/" +
        dateVal.getFullYear()
      );
    return dateVal.getMonth() + 1 + "/" + dateVal.getFullYear();
  };

  const payload3 = [
    {
      type: "label",
      value: "Supplier",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Supplier Email",
      bold: true,
      className: classes.labelheading,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_email || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: "Supplier ID",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_id,
      sm: "12",
      md: "12",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "Supplier Address",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: <p>{purchaseDetails.supplier_address_line1}, {purchaseDetails.supplier_address_line2} , <br /> {purchaseDetails.supplier_country}, {purchaseDetails.supplier_state},{purchaseDetails.supplier_pincode}, <br /> phone: {purchaseDetails.supplier_phone}, mobile: {purchaseDetails.supplier_mobile} <br /> PAN no.: {purchaseDetails.supplier_panno} <br /> GST no.: {purchaseDetails.supplier_gstno} </p>,
      sm: "12",
      md: "12",
    },
  ];
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
      value: purchaseDetails.comments || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "Taxes & Duties",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.taxes_duties || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Packaging & Forwarding",
      bold: true,
      sm: "12",
      md: "12",
      className: classes.labelheading,
    },
    {
      type: "label",
      value: purchaseDetails.packing_forwarding || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload7 = [
    {
      type: "label",
      value: "Mode of Transport",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.mode_of_transport || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload8 = [
    {
      type: "label",
      value: "Transit Insurance",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.transit_insurance || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload9 = [
    {
      type: "label",
      value: "Currency",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.currency_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Days IOM can  be generated from date of invoice",
      bold: true,
      sm: "12",
      className: classes.labelheading,
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payment_terms_days,
      sm: "12",
      md: "12",
    },
  ];

  const payload10 = [
    {
      type: "label",
      value: "Advance Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.advance_type,
      sm: "12",
      md: "12",
    },
  ];

  const payload11 = [
    {
      type: "label",
      value: "Advance",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: numberWithCommas(parseFloat(purchaseDetails.advance).toFixed(2)),
      sm: "12",
      md: "12",
    },
  ];

  const payload12 = [
    {
      type: "label",
      value: "Incoterm",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.incoterms || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Mode of Transport",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.mode_of_transport || "-",
      sm: "12",
      md: "12",
    },
    {
      type: 'label',
      value: "Type of packing",
      className: classes.labelheading,
      bold: true,
      sm: '12',
      md: '12'
    },
    {
      type: 'label',
      value: purchaseDetails.packing_type || '-',
      sm: '12',
      md: '12'
    },
    {
      type: "label",
      value: "Forwarding",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.forwarding || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Payment Terms",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payment_terms || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Containers",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.no_of_containers || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload13 = [
    {
      type: "label",
      value: "Origin",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.origin || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Insurance",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.insurance || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Currency",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.currency_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Comments",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.comments || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Container Type",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.container_type || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload14 = [
    {
      type: "label",
      value: "Port of Loading",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.ports || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Destination Port",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.destination_port_name || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "No of Bags",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.no_of_bags || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Net Weight",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.net_weight || "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload15 = [
    {
      type: "label",
      value: "Billing At",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.billing_at_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Billing Address",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        purchaseDetails.billing_com_name +
        " - " +
        purchaseDetails.billing_at_addressline1,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [
        purchaseDetails.billing_at_addressline2,
        purchaseDetails?.billing_zipcode,
      ]
        .filter(Boolean)
        .join(", "),
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.billing_state, purchaseDetails?.billing_country]
        .filter(Boolean)
        .join(", "),
      sm: "12",
      md: "12",
    },
  ];

  const payload16 = [
    {
      type: "label",
      value: "Delivery At",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.delivery_at_name,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Delivery Address",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        purchaseDetails.delivery_com_name +
        " - " +
        purchaseDetails.delivery_at_addressline1,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [
        purchaseDetails.delivery_at_addressline2,
        purchaseDetails?.delivery_zipcode,
      ]
        .filter(Boolean)
        .join(", "),
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: [purchaseDetails.delivery_state, purchaseDetails?.delivery_country]
        .filter(Boolean)
        .join(", "),
      sm: "12",
      md: "12",
    },
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
      value: purchaseDetails.otherCharges,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: purchaseDetails.supplier_type_id === "1002" ? "Rate(INR)" : "Rate",
      className: classes.labelheading,
      bold: true,
      sm: "3",
      md: "3",
    },
    {
      type: "label",
      value: purchaseDetails.rate,
      sm: "3",
      md: "3",
    },
  ];

  const payload18 = [
    {
      type: "label",
      value:
        purchaseDetails?.po_category === "ORM"
          ? "ORM Type"
          : "Green Coffee Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_name,
      sm: "12",
      md: "12",
    },
  ];

  const payload19 = [
    {
      type: "label",
      value: "Quotation No",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_no,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Quotation Date",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_date
        ? formatDate(purchaseDetails.quot_date)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Price",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.quot_price
        ? numberWithCommas(parseFloat(purchaseDetails.quot_price).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload20 = [
    {
      type: "label",
      value: "Quantity(kgs)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: numberWithCommas(
        Number(purchaseDetails.total_quantity).toLocaleString("en-IN")
      ),
      sm: "12",
      md: "12",
    },
  ];

  const payload21 = [
    {
      type: "label",
      value: "Dispatch Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_dispatch?.length > 1 ? "Multiple" : "Single",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Dispatch Count",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.item_dispatch?.length,
      sm: "12",
      md: "12",
    },
  ];

  const payload30 = [
    {
      type: "label",
      value: "Purchase Type",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchase_type || "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Terminal Month",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.terminal_month
        ? formatDate(purchaseDetails.terminal_month, "month")
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload51 = [
    {
      type: "label",
      value: "Fixation Date",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixation_date
        ? formatDate(purchaseDetails.fixation_date)
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload22 = [
    {
      type: "label",
      value: "Booked Differential",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.booked_differential
        ? parseFloat(purchaseDetails.booked_differential).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        "Total Price" +
        (purchaseDetails.po_category === "ORM"
          ? currencyCodes[purchaseDetails.currency_id]
            ? " (" + currencyCodes[purchaseDetails.currency_id] + ")"
            : ""
          : " (USD)"),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.totalPrice
        ? numberWithCommas(parseFloat(purchaseDetails.totalPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload23 = [
    {
      type: "label",
      value: "Fixed Terminal Rate",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixed_terminal_rate
        ? parseFloat(purchaseDetails.fixed_terminal_rate).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        "Market Price" +
        (purchaseDetails.po_category === "ORM"
          ? currencyCodes[purchaseDetails.currency_id]
            ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)"
            : ""
          : " (USD/MT)"),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.market_price
        ? numberWithCommas(parseFloat(purchaseDetails.market_price).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        "Purchase Price" +
        (purchaseDetails.po_category === "ORM"
          ? currencyCodes[purchaseDetails.currency_id]
            ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)"
            : ""
          : " (USD/MT)"),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchase_price
        ? numberWithCommas(
          parseFloat(purchaseDetails.purchase_price).toFixed(2)
        )
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Gross Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.grossPrice
        ? numberWithCommas(parseFloat(purchaseDetails.grossPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];
  const ormPurchasePayload = [
    {
      type: "label",
      value:
        "Purchase Price" +
        (currencyCodes[purchaseDetails.currency_id]
          ? " (" + currencyCodes[purchaseDetails.currency_id] + "/MT)"
          : ""),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "4",
    },
    {
      type: "label",
      value:
        purchaseDetails.purchase_price || purchaseDetails?.purchasePriceInr
          ? numberWithCommas(
            parseFloat(
              purchaseDetails.purchase_price ||
              purchaseDetails?.purchasePriceInr
            ).toFixed(2)
          )
          : "-",
      sm: "12",
      md: "4",
    },
    {
      type: "label",
      value:
        "Gross Price" +
        (currencyCodes[purchaseDetails.currency_id]
          ? " (" + currencyCodes[purchaseDetails.currency_id] + ")"
          : ""),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "4",
    },
    {
      type: "label",
      value: purchaseDetails.grossPrice
        ? numberWithCommas(parseFloat(purchaseDetails.grossPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        "Total Price" +
        (currencyCodes[purchaseDetails.currency_id]
          ? " (" + currencyCodes[purchaseDetails.currency_id] + ")"
          : ""),
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.totalPrice
        ? numberWithCommas(parseFloat(purchaseDetails.totalPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];
  const ormPurchasePayloadEdit = [{
    label: "Purchase Price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
    type: 'float',
    value: purchaseDetails?.purchase_price || '',
    required: true,
    onChange: (e) => purchaseOrderActions.handlePurchasePriceInrChange(e, "purchase_price"),
    error: validationError?.purchase_price,
    helperText: validationError?.purchase_price,
    className: classes.spacing,
  },
  {
    label: "Gross price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
    type: 'float',
    value: purchaseDetails.grossPrice || '',
    disabled: true,
    required: true,
    error: validationError?.grossPrice,
    helperText: validationError?.grossPrice,
    className: classes.spacing,
  },
  {
    label: "Total price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + "/MT)" : "") : " (USD/MT)"),
    type: 'float',
    value: purchaseDetails.totalPrice || '',
    required: true,
    disabled: true,
    error: validationError?.totalPrice,
    helperText: validationError?.totalPrice,
    className: classes.spacing,
  }]

  const payload24 = [
    {
      type: "label",
      value: "Booked Terminal Rate",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.booked_terminal_rate
        ? parseFloat(purchaseDetails.booked_terminal_rate).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },

    {
      type: "label",
      value: "Fixed Differential",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.fixed_differential
        ? parseFloat(purchaseDetails.fixed_differential).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "PO Margin",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.po_margin
        ? parseFloat(purchaseDetails.po_margin).toFixed(2)
        : "-",
      sm: "12",
      md: "12",
    },
  ];
  const payload28 = [
    {
      type: "label",
      value: "Terminal Price(USD)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.terminalPrice
        ? numberWithCommas(
          Number(purchaseDetails.terminalPrice)?.toLocaleString("en-IN")
        )
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Market Price (INR/KG)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.marketPriceInr
        ? numberWithCommas(
          Number(
            parseFloat(purchaseDetails.marketPriceInr).toFixed(2)
          )?.toLocaleString("en-IN")
        )
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Gross Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.grossPrice
        ? numberWithCommas(parseFloat(purchaseDetails.grossPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const payload29 = [
    {
      type: "label",
      value: "Purchase Price (INR/KG)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.purchasePriceInr
        ? numberWithCommas(
          parseFloat(purchaseDetails.purchasePriceInr).toFixed(2)
        )
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Gross Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.grossPrice
        ? numberWithCommas(parseFloat(purchaseDetails.grossPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: "Total Price (INR)",
      className: classes.labelheading,
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.totalPrice
        ? numberWithCommas(parseFloat(purchaseDetails.totalPrice).toFixed(2))
        : "-",
      sm: "12",
      md: "12",
    },
  ];
  // eslint-disable-next-line
  const payload25 = [
    {
      type: "label",
      value: "SGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        purchaseDetails.sgst === ""
          ? 0
          : parseFloat(purchaseDetails.sgst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];
  // eslint-disable-next-line
  const payload26 = [
    {
      type: "label",
      value: "CGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        purchaseDetails.cgst === ""
          ? 0
          : parseFloat(purchaseDetails.cgst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];
  // eslint-disable-next-line
  const payload27 = [
    {
      type: "label",
      value: "IGST (%)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value:
        purchaseDetails.igst === ""
          ? 0
          : parseFloat(purchaseDetails.igst).toFixed(2),
      sm: "12",
      md: "12",
    },
  ];
  // eslint-disable-next-line
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
        purchaseDetails.tds === ""
          ? 0
          : parseFloat(purchaseDetails.tds).toFixed(2),
      sm: "6",
      md: "6",
    },
  ];
  // const payload31 = [
  //   {
  //     type: "label",
  //     value: "Other Charges/Vehicle",
  //     bold: true,
  //     sm: "12",
  //     md: "12",
  //   },
  //   {
  //     type: "label",
  //     value: purchaseDetails.otherCharges,
  //     sm: "12",
  //     md: "12",
  //   },
  // ];

  // const payload32 = [
  //   {
  //     type: "label",
  //     value: purchaseDetails.supplier_type_id === '1002' ? 'Rate(INR)' : 'Rate',
  //     bold: true,
  //     sm: "12",
  //     md: "12",
  //   },
  //   {
  //     type: "label",
  //     value: purchaseDetails.rate
  //       ? parseFloat(purchaseDetails.rate).toFixed(2)
  //       : "-",
  //     sm: "12",
  //     md: "12",
  //   },
  // ];

  const payload33 = [
    {
      type: "label",
      value: "AP Status",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.apStatus ? purchaseDetails.apStatus : "Backlog",
      sm: "12",
      md: "12",
    },
  ];

  const payload34 = [
    {
      type: "label",
      value: "QC Status",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.qcStatus ? purchaseDetails.qcStatus : "Backlog",
      sm: "12",
      md: "12",
    },
  ];

  const payload35 = [
    {
      type: "label",
      value: "AP(payable amount)",
      bold: true,
      sm: "12",
      md: "12",
    },
    {
      type: "label",
      value: purchaseDetails.payable_amount
        ? Number(purchaseDetails.payable_amount)?.toLocaleString("en-IN")
        : "-",
      sm: "12",
      md: "12",
    },
  ];

  const purchaseSteps = [
    "Req Approval",
    "Approve",
    "In Progress",
    purchaseDetails.supplier_type_id === "1001" ? "Shipped" : "Dispatched",
    "Close Order",
  ];
  const payload36 = [
    {
      label: 'Fixation date',
      type: 'datePicker',
      value: purchaseDetails.fixation_date || null,
      onChange: (e) => Utility.handleChange(purchaseDetails, 'fixation_date', e, setPurchaseDetails, "date"),
    }
  ];
  const payload37 = [
    {
      label: 'Booked terminal Rate',
      type: 'float',
      value: purchaseDetails.booked_terminal_rate === undefined ? '' : purchaseDetails.booked_terminal_rate,
      disabled: !_.isEmpty(purchaseDetails?.fixed_terminal_rate) || purchaseDetails?.purchaseType === "Fixed",
      className: classes.spacing,
      onChange: (e) => purchaseOrderActions.handleTerminalRateChange(e, 'booked_terminal_rate'),
    },
    {
      label: 'Booked differential',
      type: 'float',
      value: purchaseDetails.booked_differential,
      className: classes.spacing,
      disabled: purchaseDetails.purchase_type === 'Fixed' ? true : false,
      onChange: (e) => purchaseOrderActions.handleDifferentialChange(e, 'booked_differential'),
    },
    {
      label: 'Fixed terminal Rate',
      type: 'float',
      className: classes.spacing,
      value: purchaseDetails.fixed_terminal_rate === undefined ? '' : purchaseDetails.fixed_terminal_rate,
      onChange: (e) => purchaseOrderActions.handleTerminalRateChange(e, 'fixed_terminal_rate'),
    },
    {
      label: 'Fixed differential',
      type: 'float',
      className: classes.spacing,
      value: purchaseDetails.fixed_differential,
      onChange: (e) => purchaseOrderActions.handleDifferentialChange(e, 'fixed_differential'),
    },
    {
      label: "Purchase price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
      type: 'float',
      value: purchaseDetails.purchase_price || '',
      required: true,
      disaled: true,
      className: classes.spacing,
      error: validationError?.purchase_price,
      helperText: validationError?.purchase_price,
    },
    {
      label: "Market price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + "/MT)" : "") : " (USD/MT)"),
      type: 'float',
      value: purchaseDetails.market_price || '',
      required: true,
      disabled: true,
      error: validationError?.market_price,
      helperText: validationError?.market_price,
      className: classes.spacing,
      // onChange: (e) => handleMPChange(e, 'market_price'),
    },
    {
      label: 'PO margin',
      type: 'float',
      disabled: true,
      value: purchaseDetails.po_margin || '',
      className: classes.spacing,
    },
    {
      label: "Gross price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.importCurrency] ? " (" + currencyCodes[purchaseDetails.importCurrency] + ")" : "") : " (USD)"),
      type: 'float',
      value: purchaseDetails.grossPrice || '',
      disabled: true,
      required: true,
      error: validationError?.grossPrice,
      helperText: validationError?.grossPrice,
      className: classes.spacing,
    },
    {
      label: "Total price" + (purchaseDetails.po_category === "ORM" ? (currencyCodes[purchaseDetails.currency_id?.value] ? " (" + currencyCodes[purchaseDetails.currency_id?.value] + ")" : "") : ' (USD)'),
      type: 'float',
      value: purchaseDetails.totalPrice || '',
      required: true,
      disabled: true,
      error: validationError?.totalPrice,
      helperText: validationError?.totalPrice,
      className: classes.spacing,
    },

  ]
  const payload38 = [

    {
      label: 'Purchase price (INR/KG)',
      type: 'float',
      required: true,
      className: classes.spacing,
      error: validationError?.purchase_price,
      helperText: validationError?.purchase_price,
      value: purchaseDetails.purchase_price || '',
      onChange: (e) => purchaseOrderActions.handlePurchasePriceInrChange(e, 'purchase_price'),
    },
    {
      label: 'Gross price (INR)',
      type: 'float',
      className: classes.spacing,
      value: purchaseDetails.grossPrice || '',
      onChange: (e) => Utility.handleChange(purchaseDetails, 'grossPrice', e.target.value, setPurchaseDetails, "number"),
    },
    {
      label: 'PO Value (INR)',
      type: 'float',
      className: classes.spacing,
      value: purchaseDetails.totalPrice || '',
      onChange: (e) => Utility.handleChange(purchaseDetails, 'totalPrice', e.target.value, setPurchaseDetails, "number")
    },
  ]
  const payload39 = [
    {
      label: 'Purchase type',
      type: 'select',
      className: classes.spacing,
      value: purchaseDetails.supplier_type_id === "1002" ? 'Fixed' : purchaseDetails.purchase_type || '',
      options: purchaseTypeList || [],
      disabled: purchaseDetails.supplier_type_id === "1002" ? true : false,
      onChange: (e) => purchaseOrderActions.handlePurchaseTypeChange(e, 'purchase_type'),
    },
    {
      label: 'Terminal month',
      type: 'datePicker',
      className: classes.spacing,
      views: ['year', 'month'],
      format: "MM/yyyy",
      value: purchaseDetails.terminal_month || null,
      onChange: (e) => Utility.handleChange(purchaseDetails, 'terminal_month', e, setPurchaseDetails, "date")
    },
  ]
  const terminalPricePayload = [{
    label: 'Terminal (USD)',
    type: 'float',
    className: classes.spacing,
    value: purchaseDetails.terminalPrice || '',
    onChange: (e) => Utility.handleChange(purchaseDetails, 'terminalPrice', e.target.value, setPurchaseDetails, "number"),
    sm: 6,
  }]

  const dispatchInfo = () => {
    return (
      <Container className={classes.popover}>
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <Typography>Dispatch Information</Typography>
          </Grid>
        </Grid>
        <DispatchList
          data={dispatchData}
          mrin={mrinTableData}
          dispatchDetails={(event, data) =>
            ShowDispatchDetailsHandler(event, data)
          }
        />
      </Container>
    );
  };

  const lineItemsInfo = () => {
    return (
      <Container className={classes.popover}>
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <Typography>Line Items</Typography>
          </Grid>
        </Grid>
        <LineItemList
          data={[]}
          dispatchDetails={(event, data) =>
            ShowLineItemsHandler(event, data)
          }
        />
      </Container>
    );
  };

  const createAction = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">
        Validation
      </h2>
      <Grid id="top-row" container >
        <Grid id="top-row" xs={6} md={10} container direction="column">
          {errorValidationMessage}
        </Grid>
      </Grid>
      <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
        <Grid item>
          <Button label="Ok" onClick={() => setValidationModal(!validationModal)} />
        </Grid>
      </Grid>
    </Container>
  );
  const gcTableColumns = [
    { id: "composition_name", label: "Item" },
    { id: "composition_rate", label: "Composition" },
  ];

  const taxColumns = [
    { id: "number", label: "SNo" },
    { id: "mrin_date", label: "MRIN Date" },
    { id: "cgst_per", label: "Tax (%)" },
  ];

  const mrinTableColumns = [
    { id: "mrindate", label: "Date" },
    { id: "mrin_id", label: "MRIN" },
    { id: "dispatch_id", label: "Dispatch" },
    { id: "expected_quantity", label: "Expected(Kgs)" },
    { id: "delivered_quantity", label: "Delivered(Kgs)" },
    { id: "balance_quantity", label: "Balance Quantity(Kgs)" },
    { id: "related_detid", label: "Parent Dispatch" },
    { id: "apStatus", label: "AP Status" },
    { id: "qcStatus", label: "QC Status" },
  ];

  const lineItemColumns = [
    { id: 'dispatchNo', label: 'Sr. NO', },
    { id: 'qty', label: 'Item' },
    { id: 'date', label: 'Item Desc' },
    { id: 'delivered_quantity', label: 'Qty' },
    { id: 'balance_quantity', label: 'Price' },
    { id: 'balance_quantity', label: 'Total Price' },
  ];

  const ocTableColumns = [
    { id: "label", label: "Item" },
    { id: "rate", label: "Value", type: "number" }, //, isEditable: true
    { id: "taxLabel", label: "Tax", type: "number" }, //, isEditable: true
    { id: "taxRate", label: "Tax Value", type: "number" }, //, isEditable: true
    { id: "total_tax_rate", label: "Total Price", type: "number" },
  ];

  const approvePo = async (blob) => {
    //changeToPendingStatus
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async function () {
      let base64String = reader.result;
      let base64SubString = base64String.substr(base64String.indexOf(",") + 1);
      setLoading(true);
      try {
        let status =
          parseInt(purchaseDetails.status) === 1
            ? "changeToPendingStatus"
            : parseInt(purchaseDetails.status) === 3
              ? "changeToclosedStatus"
              : "changeToInprogessStatus";
        let payload = {
          emailid: purchaseDetails?.supplier_email,
          type: status,
          po_id: purchaseDetails.poid,
          "loggedinuserid": getCurrentUserDetails()?.id,
        };
        if (parseInt(purchaseDetails.status) === 2) {
          payload.notify_email = true;
          payload.document = base64SubString;
          payload.document_name = `${purchaseDetails?.poid}.pdf`;
        }
        let response = await updateGCPoStatus(payload);
        if (response) {
          setSnack({
            open: true,
            message:
              parseInt(purchaseDetails.status) === 1
                ? "PO sent for request approval"
                : parseInt(purchaseDetails.status) === 3
                  ? "PO closed successfully"
                  : "PO approved successfully",
          });
          setTimeout(() => {
            props.back(
              "purchase_details",
              parseInt(purchaseDetails.status) === 1
                ? "pendingwithapprovalpos"
                : parseInt(purchaseDetails.status) === 3
                  ? "closedpos"
                  : "inprogresspos"
            );
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  };

  const closePo = async (e) => {
    try {
      let response = await updateGCPoStatus({
        type: "close",
        emailid: purchaseDetails?.supplier_email,
        po_id: purchaseDetails.poid,
        createduserid: localStorage.getItem("currentUserId"),
        "loggedinuserid": getCurrentUserDetails()?.id,
      });
      if (response) {
        setSnack({
          open: true,
          message: "PO closed successfully",
        });
        setTimeout(() => {
          props.back("purchase_details", "closedpos");
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

  const sendEmail = async (blob) => {
    let reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async function () {
      let base64String = reader.result;
      let base64SubString = base64String.substr(base64String.indexOf(",") + 1);
      setLoading(true);
      try {
        let response = await updateGCPoStatus({
          notify_email: true,
          document: base64SubString,
          document_name: `${purchaseDetails?.poid}.pdf`,
          vendor_email: purchaseDetails?.supplier_email,
          po_id: purchaseDetails.poid,
          "loggedinuserid": getCurrentUserDetails()?.id,
        });
        if (response) {
          setSnack({
            open: true,
            message: "Email Sent Successfully",
          });
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  };

  const ShowDispatchDetailsHandler = (event, data) => {
    setShowDispatchDetails(true);
    setDispatchDetails(data);
  };

  const ShowLineItemsHandler = (event, data) => {
    // setShowLineItemDetails(true);
    // setLineItemDetails(data);
  };

  const HideDispatchDetailsHandler = (event, data) => {
    setShowDispatchDetails(false);
  };

  // const HideLineItemDetailsHandler = (event, data) => {
  //   setShowLineItemDetails(false);
  // };  

  const taxTableColumns = [
    { id: "tax_name", label: "Tax", type: "number" }, //, isEditable: true
    { id: "perc", label: "Tax Value(%)", type: "number" }, //, isEditable: true
    { id: "total_rate", label: "Total Price", type: "number" },
    // { id: 'delete', label: 'Delete', isEditable: true, type: "button", taxDelete: true, handler: { handleTaxClick } }
  ];

  let component;
  if (showDispatchDetails) {
    component = (
      <DispatchDetails
        purchaseDetails={purchaseDetails}
        activeStep={activeStep}
        details={dispatchDetails}
        expComposition={compositions}
        back={HideDispatchDetailsHandler}
      ></DispatchDetails>
    );
    // else if(showLineItemDetails) {
    //    component = (
    //     <DispatchDetails
    //       purchaseDetails={purchaseDetails}
    //       activeStep={activeStep}
    //       details={dispatchDetails}
    //       expComposition={compositions}
    //       back={HideLineItemDetailsHandler}
    //     ></DispatchDetails>
    //   );
    // }
  } else {
    component = (
      <>
        {showSnack.open && (
          <Snackbar
            {...showSnack}
            handleClose={() =>
              setSnack({ open: false, message: "", severity: "" })
            }
          />
        )}
        <Card className="page-header">
          <CardHeader title=" Purchase Order Details" className="cardHeader" />
          <CardContent>
            <Grid container md={12}>
              <Grid container md={6}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h7">PO No</Typography>
                  <Typography>{poid}</Typography>
                </Grid>
                <Grid item md={2} xs={12}>
                  <Typography variant="h7">PO Date</Typography>
                  <Typography>
                    {formatDate(purchaseDetails?.po_date)}
                  </Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                  <Typography variant="h7">PO Category</Typography>
                  <Typography>{purchaseDetails?.po_category}</Typography>
                </Grid>
                <Grid item md={3} xs={12}>
                  <Typography variant="h7">PO Sub Category</Typography>
                  <Typography>{purchaseDetails?.supplier_type}</Typography>
                </Grid>
              </Grid>

              {parseInt(purchaseDetails.status) === 1 && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Blob
                    purchaseDetails={purchaseDetails}
                    documents={documents}
                    isLoading={loading}
                    id={poid}
                    dispatchDetails={dispatchData}
                    title={"Request Approval"}
                    onClick={(blob) => approvePo(blob)}
                  />
                </Grid>
              )}
              {parseInt(purchaseDetails.status) === 2 && currentUserDetails?.role !== roles.asstManagerPurchase && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Blob
                    purchaseDetails={purchaseDetails}
                    documents={documents}
                    isLoading={loading}
                    id={poid}
                    dispatchDetails={dispatchData}
                    title={"Approve"}
                    onClick={(blob) => approvePo(blob)}
                  />
                </Grid>
              )}
              {(parseInt(purchaseDetails.status) === 3 ||
                parseInt(purchaseDetails.status) === 4) && (
                  <Grid
                    container
                    md={2}
                    justify="flex-end"
                    style={{ display: "flex" }}
                  >
                    {currentUserRole !== roles.accountManager && (
                      <Grid item>
                        <Blob
                          purchaseDetails={purchaseDetails}
                          documents={documents}
                          isLoading={loading}
                          id={poid}
                          dispatchDetails={dispatchData}
                          title="Send Email To Vendor"
                          onClick={(blob) => sendEmail(blob)}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}
              {parseInt(purchaseDetails.status) === 4 && (
                <Grid
                  container
                  md={2}
                  justify="flex-end"
                  style={{ display: "flex" }}
                >
                  <Grid item>
                    <Button label="Close Order" onClick={closePo} />
                  </Grid>
                </Grid>
              )}
              <div id="myMm" style={{ height: "1mm" }} />
              <Grid
                container
                md={2}
                justify="flex-end"
                style={{ display: "flex" }}
              >
                <Grid item>
                  <Blob
                    purchaseDetails={purchaseDetails}
                    documents={documents}
                    id={poid}
                    dispatchDetails={dispatchData}
                    title="Generate PDF"
                  />
                </Grid>
              </Grid>
            </Grid>

            {purchaseDetails.supplier_type_id === "1001" && (
              <Grid container md={12}>
                <Grid item md={4} xs={12}>
                  <Typography variant="h7">Contract No</Typography>
                  <Typography>{purchaseDetails?.contract}</Typography>
                </Grid>
              </Grid>
            )}
            <Grid container md={12}>
              <Grid item md={3} xs={6}>
                <SimplePopper
                  linkLabel="Dispatch Information"
                  body={dispatchInfo}
                  linkRef={dispatchInfoRef}
                ></SimplePopper>
              </Grid>
              <Grid item md={3} xs={6}>
                <SimplePopper
                  linkLabel="Line Items"
                  body={lineItemsInfo}
                  linkRef={lineItemsRef}
                ></SimplePopper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="page-header">
          <CardContent>
            <Grid container md={12}>
              <Grid item md={12} xs={12}>
                {activeStep !== -1 ? (
                  <SimpleStepper
                    activeStep={activeStep}
                    completeStep={activeStep}
                    steps={purchaseSteps}
                    activeStepProgress={stepProgress}
                  ></SimpleStepper>
                ) : (
                  "Loading ..."
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Vendor/Supplier Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={3} container direction="column">
                <Template payload={payload3} />
              </Grid>
              <Grid id="top-row" xs={12} md={3} container direction="column">
                <Template payload={payload4} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload5} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {purchaseDetails.supplier_type_id === "1002" && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Currency & Advance Information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload9} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload10} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload11} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
        {purchaseDetails.supplier_type_id === "1001" && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Currency & Incoterms</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload12} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload13} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload14} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Billing & Delivery Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload15} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload16} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>
                  {purchaseDetails?.po_category === "ORM"
                    ? "ORM Information"
                    : "Green Coffee Information"}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid container xs={12} md={12}>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload18} />
                  {purchaseDetails.gc_type === "speciality" && (
                    <Template payload={payload19} />
                  )}
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload20} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload21} />
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {purchaseDetails.gc_type && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Specification Information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <BasicTable
                rows={compositions}
                columns={gcTableColumns}
                hasTotal={false}
              ></BasicTable>
            </AccordionDetails>
          </Accordion>
        )}

        <Accordion defaultExpanded={true} ref={dispatchInfoRef}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Line Item</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <BasicTable
              rows={lineItemData}
              columns={lineItemColumns}
            ></BasicTable>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={true} ref={dispatchInfoRef}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>MRIN Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <BasicTable
              rows={mrinTableData}
              columns={mrinTableColumns}
            ></BasicTable>
          </AccordionDetails>
        </Accordion>


        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Finance Information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload33} />
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload34} />
              </Grid>
              <Grid id="top-row" xs={12} md={4} container direction="column">
                <Template payload={payload35} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        {purchaseDetails.gc_type &&
          purchaseDetails.supplier_type_id === "1002" && (
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid id="top-row" container style={{ margin: 6 }}>
                  <Grid item md={12} xs={12} className="item">
                    <Typography>Previous Tax Information</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <BasicTable rows={mrinList} columns={taxColumns}></BasicTable>
              </AccordionDetails>
            </Accordion>
          )}
        {purchaseDetails.supplier_type_id === "1002" && (
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
              <BasicTable
                rows={otherChargesList}
                columns={ocTableColumns}
                hasTotal={true}
                rowlength={otherChargesList.length}
                colSpan={4}
                totalColId="total_tax_rate"
              ></BasicTable>
              {purchaseDetails.supplier_type_id === "1001" && (
                <Template payload={payload40} />
              )}
              {purchaseDetails.supplier_type_id === "1002" && (
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload50} />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={true} expanded={expanded} onClick={(e) => e.stopPropagation()}>
          <AccordionSummary expandIcon={<ExpandMoreIcon onClick={() => setExpanded(prevState => !prevState)} />}>
            <Grid id="top-row" container style={{ margin: 6 }} className="item"
              alignItems="center" justifyContent="space-between">
              <Typography>Price Information</Typography>
              {purchaseDetails?.po_sub_category === "Import" && purchaseDetails?.po_category
                === "GC" && mrinList?.length <= 0 &&
                <Button label={loading ? "Loading" : edit ? "Save" : "Edit"} disabled={activeStep < 2 || loading}
                  onClick={editPriceInformationHandler} />}
            </Grid>
          </AccordionSummary>
          {edit ? <AccordionDetails>
            <Grid container md={12} xs={12}>
              <Grid item md={12} xs={12} >
                {purchaseDetails?.po_category !== "ORM" && <Template payload={payload39} />}
                {
                  purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category !== "ORM" &&
                  <Template payload={payload37} />
                }
                {
                  purchaseDetails.supplier_type_id === "1001" && purchaseDetails?.po_category === "ORM" &&
                  <Template payload={ormPurchasePayloadEdit} />
                }
                {
                  purchaseDetails?.po_category !== "ORM" && <Template payload={payload36} />
                }
                {
                  purchaseDetails.supplier_type_id === "1002" &&
                  <Template payload={purchaseDetails?.po_category === "ORM" ? payload38 : terminalPricePayload.concat(payload38)} />
                }
              </Grid>
            </Grid>
          </AccordionDetails> : <AccordionDetails>
            <Grid id="top-row" container>
              {purchaseDetails?.po_category === "ORM" && (
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={ormPurchasePayload} />
                </Grid>
              )}
              {purchaseDetails?.po_category !== "ORM" && (
                <>
                  <Grid
                    id="top-row"
                    xs={12}
                    md={4}
                    container
                    direction="column"
                  >
                    <Template payload={payload30} />
                    {purchaseDetails.purchase_type === "Differential" && (
                      <Template payload={payload51} />
                    )}

                    {purchaseDetails.supplier_type_id === "1001" && (
                      <Template payload={payload22} />
                    )}
                  </Grid>
                  <Grid
                    id="top-row"
                    xs={12}
                    md={4}
                    container
                    direction="column"
                  >
                    {purchaseDetails.supplier_type_id === "1001" && (
                      <Template payload={payload23} />
                    )}
                    {
                      purchaseDetails.supplier_type_id === "1002" && (
                        <Template payload={payload28} />
                      )}
                  </Grid>
                  <Grid
                    id="top-row"
                    xs={12}
                    md={4}
                    container
                    direction="column"
                  >
                    {purchaseDetails.supplier_type_id === "1001" &&
                      purchaseDetails?.po_category !== "ORM" && (
                        <Template payload={payload24} />
                      )}
                    {purchaseDetails.supplier_type_id === "1002" && (
                      <Template payload={payload29} />
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
          }
        </Accordion>

        {purchaseDetails.supplier_type_id !== "1001" && (
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid id="top-row" container style={{ margin: 6 }}>
                <Grid item md={12} xs={12} className="item">
                  <Typography>Other Information</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid id="top-row" container>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload6} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload7} />
                </Grid>
                <Grid id="top-row" xs={12} md={4} container direction="column">
                  <Template payload={payload8} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* {purchaseDetails.supplier_type_id === "1001" &&
                    <Accordion defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                            <Grid id="top-row" container style={{ margin: 6 }}>
                                <Grid item md={12} xs={12} className='item'>
                                    <Typography>Document information</Typography>
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <DocumentList data={documents} edit={true} uploadFile={(event, fileContent, docName, fileName) => uploadFileHandler(event, fileContent, docName, fileName)} downloadFile={(event, fileName, docName) => downloadFileHandler(event, fileName, docName)} deleteFile={(event, fileName) => deleteFileHandler(event, fileName)} />
                        </AccordionDetails>
                    </Accordion>
                } */}
        <Accordion defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid id="top-row" container style={{ margin: 6 }}>
              <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <AuditLog data={logData} />
          </AccordionDetails>
        </Accordion>

        {/* </div> */}
        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
          {currentUserDetails.role !== "GC Stores Executive" &&
            currentUserDetails.role !== "Accounts Manager" &&
            parseInt(purchaseDetails.status) !== 6 && (
              <Grid item>
                <Button
                  label="Edit"
                  disabled={activeStep >= 2 ? true : false}
                  onClick={(e) =>
                    navigate(routeBuilder('purchase-order', poid, 'edit'))
                  }
                />
              </Grid>
            )}
          <Grid item>
            <Button label="Cancel" onClick={() => navigate(-1)} />
          </Grid>
        </Grid>

        <SimpleModal open={validationModal} handleClose={() => setValidationModal(!validationModal)} body={createAction} />
      </>
    );
  }

  return <>{component}</>;
};
export default PurchaseOrderDetails;
