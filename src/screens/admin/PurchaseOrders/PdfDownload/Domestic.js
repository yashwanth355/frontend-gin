import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import Logo from "../../../../assets/images/logo_pdf.png";
import _ from "lodash";
var convertRupeesIntoWords = require("convert-rupees-into-words");
// Create Document Component

const calculateGrossPrice = (data) => {
  const amount = calculateAmount(data);
  const otherCharges = calculateOtherCharges(data);
  return amount + otherCharges;
};
// eslint-disable-next-line
function numberWithCommas(n) {
  var parts = n?.toString().split(".");
  return parts?.length > 0
    ? parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (parts[1] ? "." + parts[1] : "")
    : parts;
}
// eslint-disable-next-line
const calculateQuantity = (data) => {
  return data?.["item_dispatch"]?.reduce((sum, i) => {
    return sum + parseInt(i.dispatch_quantity);
  }, 0);
};
const calculateAmount = (data) => {
  // const totalQuantity = calculateQuantity(data);
  return parseFloat(data?.["purchase_price"]) * data?.['total_quantity'];
};
const calculatedAmount = (data) => {
  // const totalQuantity = calculateQuantity(data);
  return data?.["purchase_price"] * data?.["total_quantity"];
};
const validateValue = (value) => {
  return !_.isEmpty(value) && value.trim() !== "" ? true : false;
};
const calculateNetPrice = (data) => {
  const amount = calculateAmount(data);
  const otherCharges = calculateOtherCharges(data);
  // const taxes = [data.cgst, data.igst, data.sgst].reduce((sum, current) => {
  //   if (validateValue(current)) return sum + parseFloat(current);
  //   return sum;
  // }, 0);
  let tempPerc = [];
  // eslint-disable-next-line
  data?.domestic_taxes?.map((item, index) => {
    tempPerc.push(item.perc);
  })
  const taxes = tempPerc.reduce((sum, current) => {
    if (validateValue(current)) return sum + parseFloat(current);
    return sum;
  }, 0);
  return amount + (taxes / 100) * amount + otherCharges;
};

const calculatedTaxes = (data) => {
  const amount = calculateAmount(data);

  let tempPerc = [];
  // eslint-disable-next-line
  data?.domestic_taxes?.map((item, index) => {
    tempPerc.push(item.perc);
  })
  const taxes = tempPerc.reduce((sum, current) => {
    if (validateValue(current)) return sum + parseFloat(current);
    return sum;
  }, 0);
  return (taxes / 100) * amount;
}
const calculateOtherCharges = (data) => {
  const columns = [
    "packing_forward_charges",
    "installation_charges",
    "freight_charges",
    "handling_charges",
    "misc_charges",
    "hamali_charges",
    "mandifee_charges",
    "fulltax_charges",
    "insurance_charges",
  ];
  return columns?.reduce((total, current) => {
    if (validateValue(data[current])) return total + parseFloat(data[current]);
    return total;
  }, 0);
};
// const purchaseDetails = {
//     delivery_at_address: 'CCL Head office, Duggirala Mandal, Guntur District-522330',
//     supplier_name: "BLUE OCEAN BOITECH PVT LTD",
//     supplier_address: "4-325, PEDDAPURAM, VADLAMURU ROAD, PEDDAPURAM MANDAL, EAST GODAVARI, G-RAGAMPET 533440, PH :  9177023003373 ANDHRA PRADESH - 37"
// }
const formatDate = (datestr) => {
  console.log("Date string", datestr);
  if (_.isEmpty(datestr)) {
    return ""
  }
  let dateVal = new Date(datestr);
  return (
    dateVal.getDate() +
    "/" +
    (dateVal.getMonth() + 1) +
    "/" +
    dateVal.getFullYear()
  );
};
const CustomText = (props) => {
  return (
    <Text style={[styles.textregular, props.style]}>{props.children}</Text>
  );
};
const KeyValue = (props) => {
  return (
    <View style={[{ display: "flex", flexDirection: "row" }, props.style]}>
      <CustomText
        style={{ marginRight: "10px", fontFamily: "Helvetica-Bold", flex: 1 }}
      >
        {props.label}
      </CustomText>
      <CustomText style={{ flex: 1 }}>{props.value}</CustomText>
    </View>
  );
};
const Terms = (props) => {
  return (
    <View style={{ display: "flex", flexDirection: "row" }}>
      <CustomText
        style={[
          {
            marginRight: 15,
            lineHeight: 1.5,
            fontFamily: "Times-Bold",
            fontSize: "10px",
          },
          props.numStyle,
        ]}
      >
        {props.number}
      </CustomText>
      <CustomText
        style={{
          marginRight: 20,
          textAlign: "justify",
          lineHeight: 1.5,
          fontFamily: "Times-Roman",
          fontSize: "10px",
        }}
      >
        <CustomText
          style={[
            {
              fontFamily: "Times-Bold",
              marginRight: 10,
              lineHeight: 1.5,
              fontSize: "10px",
            },
            props.underline ? { textDecoration: "underline" } : null,
          ]}
        >
          {props.label}
          {` `}
        </CustomText>
        {` `} {props.value}
      </CustomText>
    </View>
  );
};
const Conditions = (props) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        marginHorizontal: 5,
        marginBottom: 5,
      }}
    >
      <CustomText
        style={{
          marginRight: 20,
          width: 100,
          fontFamily: "Helvetica-Bold",
          fontSize: "9px",
        }}
      >
        {props.label}
      </CustomText>
      <CustomText
        style={{
          marginRight: 20,
          borderLeft: "1px dashed black",
          paddingLeft: 5,
        }}
      >
        {props.value}
      </CustomText>
    </View>
  );
};
const ReportTable = ({ data, maximumDays, purchaseDetails, dispatchDetails }) => {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.bold, styles.headerTable]}>
        <CustomText
          style={[
            styles.row1,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          SNO
        </CustomText>
        <CustomText
          style={[
            styles.row2,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          DESCRIPTION
        </CustomText>
        <CustomText
          style={[
            styles.row3,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          UNIT
        </CustomText>
        <CustomText
          style={[
            styles.row4,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          QUANTITY
        </CustomText>
        <CustomText
          style={[
            styles.row5,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          RATE(INR)
        </CustomText>
        <CustomText
          style={[
            styles.row6,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          TAX STRUCTURE
        </CustomText>
        <CustomText
          style={[
            styles.row7,
            {
              textAlign: "center",
              fontFamily: "Helvetica-Bold",
              paddingHorizontal: "5",
              display: "flex",
              textWrap: "wrap",
              fontSize: 8,
            },
          ]}
        >
          AMOUNT(INR)
        </CustomText>
      </View>
      {data.map((row, i) => (
        <View key={i} style={styles.row} wrap={false}>
          <CustomText style={styles.row1}>{row.sno}</CustomText>
          <View style={[styles.row2, { flexDirection: 'column' }]}>
            <CustomText style={{ textAlign: 'start', marginHorizontal: 5 }}>
              {_.upperCase(row.description)}
            </CustomText>
            <CustomText style={{ fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>DISPATCH SCHEDULE</CustomText>
            <View>
              {/* {data?.item_dispatch?.map((item, index) => ( */}
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row' }}>
                  <CustomText
                    style={[
                      {
                        textAlign: "center",
                        fontFamily: "Helvetica-Bold",
                        paddingHorizontal: "5",
                        display: "flex",
                        textWrap: "wrap",
                        fontSize: 8,
                        width: '50%'
                      },
                    ]}
                  >
                    DATE
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        textAlign: "center",
                        fontFamily: "Helvetica-Bold",
                        paddingHorizontal: "5",
                        display: "flex",
                        textWrap: "wrap",
                        fontSize: 8,
                        width: '50%'
                      },
                    ]}
                  >
                    QUANTITY
                  </CustomText>
                </View>
                {dispatchDetails?.map((detail, index) => <View key={index} style={{ display: 'flex', flexDirection: 'row' }} wrap={false}>
                  <CustomText style={{ width: '50%' }}>{detail.dispatch_date ? formatDate(detail.dispatch_date) : ''}</CustomText>
                  <CustomText style={{ width: '50%' }}>{Number(detail.dispatch_quantity)?.toLocaleString('en-IN',
                    { minimumFractionDigits: 2 })}</CustomText>
                </View>)}
              </View>
              {/* ))} */}
            </View>
          </View>

          <CustomText style={styles.row3}>{row.unit}</CustomText>
          <CustomText style={styles.row4}>{Number(row.quantity)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</CustomText>
          <CustomText style={styles.row5}>{Number(row.rate)?.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</CustomText>
          <View style={styles.row6}>
            {row?.domestic_taxes?.map((item, index) => {
              return (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CustomText>{item?.tax_name}@</CustomText>
                  <CustomText>{Number(item.perc)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CustomText>
                </View>
              )
            })
            }
            {/* {row.cgst ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomText>CGST@</CustomText>
                <CustomText>{Number(row.cgst)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CustomText>
              </View>
            ) : null} */}
            {/* {row.sgst ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomText>SGST@</CustomText>
                <CustomText>{Number(row.sgst)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CustomText>
              </View>
            ) : null}
            {!_.isEmpty(row.igst) ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomText>IGST@</CustomText>
                <CustomText>{Number(row.igst)?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CustomText>
              </View>
            ) : null} */}
          </View>

          <CustomText style={styles.row7}>{row.amount}</CustomText>
        </View>
      ))}
      <View
        style={[
          styles.row,
          { padding: 5, justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <View style={{ width: "40%" }}></View>
        <View
          style={{ width: "40%", paddingLeft: 20, flexDirection: "column" }}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginBottom: 10 }}>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                GROSS VALUE
              </CustomText>
            </View>
            <View style={{ flex: 1 }}>
              <CustomText
                style={{ fontFamily: "Helvetica-Bold", textAlign: "right" }}
              >
                {Number(calculateGrossPrice(purchaseDetails))?.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </CustomText>
            </View>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <CustomText
                style={{
                  fontFamily: "Helvetica-Bold",
                  textDecoration: "underline",
                }}
              >
                TAXES VALUATION
              </CustomText>
            </View>
            <View style={{ flex: 1 }}></View>
          </View>
          {purchaseDetails?.domestic_taxes?.map((item, index) => {
            return (
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                  <CustomText style={{ fontFamily: "Helvetica" }}>
                    {item.tax_name}
                  </CustomText>
                </View>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <CustomText
                    style={{ fontFamily: "Helvetica", textAlign: "right" }}
                  >
                    {Number(
                      (item.perc / 100) *
                      calculateGrossPrice(purchaseDetails)
                    )?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </CustomText>
                </View>
              </View>
            )
          })
          }
          {/* {purchaseDetails?.cgst ? (
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <CustomText style={{ fontFamily: "Helvetica" }}>
                  CGST
                </CustomText>
              </View>
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <CustomText
                  style={{ fontFamily: "Helvetica", textAlign: "right" }}
                >
                  {purchaseDetails.cgst === ""
                    ? 0
                    : Number(
                      (purchaseDetails.cgst / 100) *
                      calculateGrossPrice(purchaseDetails)
                    )?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CustomText>
              </View>
            </View>
          ) : null}
          {purchaseDetails?.sgst ? (
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <CustomText style={{ fontFamily: "Helvetica" }}>
                  SGST
                </CustomText>
              </View>
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <CustomText
                  style={{ fontFamily: "Helvetica", textAlign: "right" }}
                >
                  {purchaseDetails.sgst === ""
                    ? 0
                    : Number(
                      (purchaseDetails.sgst / 100) *
                      calculateGrossPrice(purchaseDetails)
                    )?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CustomText>
              </View>
            </View>
          ) : null}
          {purchaseDetails?.igst ? (
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <CustomText style={{ fontFamily: "Helvetica" }}>
                  IGST
                </CustomText>
              </View>
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <CustomText
                  style={{ fontFamily: "Helvetica", textAlign: "right" }}
                >
                  {purchaseDetails.igst === ""
                    ? 0
                    : Number(
                      (purchaseDetails.igst / 100) *
                      calculateGrossPrice(purchaseDetails)
                    )?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CustomText>
              </View>
            </View>
          ) : null} */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                TAX VALUE
              </CustomText>
            </View>
            <View style={{ flex: 1 }}>
              <CustomText
                style={{ fontFamily: "Helvetica-Bold", textAlign: "right" }}
              >
                {Number(calculatedTaxes(purchaseDetails))?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {/* {parseFloat(calculatedTaxes(purchaseDetails))} */}
                {/* {Number(
                  parseFloat(
                    (purchaseDetails.igst / 100) *
                    calculateGrossPrice(purchaseDetails)
                  ) +
                  parseFloat(
                    (purchaseDetails.cgst / 100) *
                    calculateGrossPrice(purchaseDetails)
                  ) +
                  parseFloat(
                    (purchaseDetails.sgst / 100) *
                    calculateGrossPrice(purchaseDetails)
                  )
                )?.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} */}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.row,
          { padding: 5, justifyContent: "space-between", alignItems: "center" },
        ]}
      >
        <View style={{ width: "40%" }}>
          <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
            {isNaN(calculateNetPrice(purchaseDetails))
              ? " - "
              : "(Indian Rupees " +
              convertRupeesIntoWords(calculateNetPrice(purchaseDetails)) +
              " Only) "}
          </CustomText>
        </View>
        <View style={{ width: "40%", paddingLeft: 20, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
              NET VALUE
            </CustomText>
          </View>
          <View style={{ flex: 1 }}>
            <CustomText
              style={{ fontFamily: "Helvetica-Bold", textAlign: "right" }}
            >
              {Number(calculateNetPrice(purchaseDetails))?.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              {/* {numberWithCommas(calculateNetPrice(purchaseDetails).toFixed(4))} */}
            </CustomText>
          </View>
        </View>
      </View>
      <View style={[styles.row, { padding: 5 }]}>
        <CustomText
          style={{
            textAlign: "center",
            fontFamily: "Helvetica-Oblique",
            fontWeight: 800,
          }}
        >
          "We are liable to deduct TDS as per section 194Q of Income Tax Act,
          1961 on purchases made from you. Therefore, you are requested not to
          collect Tax under section 206C(1H)."
        </CustomText>
      </View>
    </View>
  );
};

const MyDocument = (props) => {
  const { purchaseDetails, dispatchDetails } = props; //documents

  const getPaymentTermsString = () => {
    let string = '';
    if (validateValue(purchaseDetails?.advance) && parseFloat(purchaseDetails?.advance) !== 0) {
      string = string + `${parseFloat(purchaseDetails.advance).toFixed(2)}`
    }
    if (purchaseDetails?.advance_type === "Percentage")
      string = string + '% '
    if (validateValue(purchaseDetails?.payment_terms_days))
      string = string + `: ${purchaseDetails?.payment_terms_days}  WORKING DAYS FROM DATE OF INVOICE`
    return string;
  }
  console.log("Purchase detailsa re", props.purchaseDetails);
  return (
    <Document>
      <Page style={styles.section} size={"A4"}>
        <View style={styles.header}>
          <View style={{ marginHorizontal: "4px" }}>
            <Image
              src={Logo}
              style={{ height: "100px", width: "70px" }}
              alt="logo"
            />
          </View>
          <View style={{
            display: 'flex', flexDirection: 'row',
            justifyContent: 'space-between',
            width: '90%',
          }}>
            <View
              style={{ display: "flex", flexDirection: "column", padding: "5px" }}
            >
              <Text style={{ fontSize: "18px" }}>
                CCL PRODUCTS (INDIA) LIMITED.{" "}
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    fontFamily: "Helvetica-Bold",
                    fontSize: "9px",
                    marginVertical: 10,
                  },
                ]}
              >
                (Formerly - CONTINENTAL COFFEE LTD.)
              </Text>
              <View style={{ width: "90%" }}>
                <CustomText>
                  {purchaseDetails?.delivery_at_addressline1}
                </CustomText>
                <CustomText>
                  {[
                    purchaseDetails?.delivery_at_addressline2,
                    purchaseDetails?.delivery_zipcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </CustomText>
                <CustomText>
                  {[
                    purchaseDetails?.delivery_state,
                    purchaseDetails?.delivery_country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </CustomText>
                <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                  {purchaseDetails?.delivery_at_gstno?.toUpperCase()}
                </CustomText>
              </View>
            </View>
            <CustomText>
              QFR/PUR/001
            </CustomText>
          </View>
        </View>
        <View style={styles.podetails}>
          <CustomText
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 10,
              alignSelf: "center",
            }}
          >
            PURCHASE ORDER
          </CustomText>
          <View
            style={{ flexDirection: "row", display: "flex", marginVertical: 3 }}
          >
            <View
              style={{
                flex: 1,
                border: "1px solid black",
                borderLeft: "none",
                padding: 5,
              }}
            >
              <View style={{ width: "70%", display: "flex" }}>
                <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                  TO,
                </CustomText>
                <CustomText style={{ fontSize: "8px" }}>
                  {_.upperCase(purchaseDetails?.supplier_name)}
                </CustomText>
                {/* <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                > */}
                    {/* {_.upperCase(purchaseDetails?.supplier_address)} */}
                    <CustomText
                      style={{
                        textTransform: "capitalize",
                        lineHeight: "1.3",
                        fontSize: "8px",
                      }}
                    >
                      {" "}
                      {purchaseDetails.supplier_address_line1}, {purchaseDetails.supplier_address_line2},
                    </CustomText>
                     <CustomText
                      style={{
                        textTransform: "capitalize",
                        lineHeight: "1.3",
                        fontSize: "8px",
                      }}
                    >
                      {purchaseDetails.supplier_country}, {purchaseDetails.supplier_state}, {purchaseDetails.supplier_pincode},
                    </CustomText>
                    <CustomText
                      style={{
                        textTransform: "capitalize",
                        lineHeight: "1.3",
                        fontSize: "8px",
                      }}
                    >
                      PHONE: {purchaseDetails.supplier_phone},
                    </CustomText>
                    <CustomText
                      style={{
                        textTransform: "capitalize",
                        lineHeight: "1.3",
                        fontSize: "8px",
                      }}
                    >
                      MOBILE: {purchaseDetails.supplier_mobile}
                    </CustomText>
                    <CustomText
                      style={[
                        styles.textregular,
                        {
                          textTransform: "uppercase",
                          width: "auto",
                          lineHeight: "1.3",
                          fontFamily: "Helvetica",
                        },
                      ]}
                    >
                      <b style={[
                        styles.textregular,
                        {
                          textTransform: "uppercase",
                          width: "auto",
                          lineHeight: "1.3",
                          fontFamily: "Helvetica-Bold",
                        },
                      ]}>PAN No.: </b> {purchaseDetails.supplier_panno}
                    </CustomText>
                    <CustomText
                      style={[
                        styles.textregular,
                        {
                          textTransform: "uppercase",
                          width: "auto",
                          lineHeight: "1.3",
                          fontFamily: "Helvetica",
                        },
                      ]}
                    >
                      <b style={[
                        styles.textregular,
                        {
                          textTransform: "uppercase",
                          width: "auto",
                          lineHeight: "1.3",
                          fontFamily: "Helvetica-Bold",
                        },
                      ]}>GSTIN:  &nbsp;&nbsp;</b> {purchaseDetails.supplier_gstno}
                    </CustomText>
                {/* </View> */}
                {/* <KeyValue label={"GSTIN"} value={"INSAK2131231"} />
                            <KeyValue label={"PANNO"} value={"INSAK2131231"} /> */}
              </View>
            </View>
            <View
              style={{
                flex: 1,
                border: "1px solid black",
                borderLeft: "none",
                borderRight: "none",
                padding: 10,
              }}
            >
              <KeyValue label={"P.O.NO"} value={props.id} />
              <KeyValue
                label={"Date"}
                value={formatDate(purchaseDetails?.po_date)}
                style={{ marginBottom: 5 }}
              />
              {/* <KeyValue label={"Ref. Our Enq No"} value={"INSAK2131231"} />
                        <KeyValue label={"Dated"} value={"INSAK2131231"} /> */}
              <KeyValue
                label={"Your Quotation No"}
                value={purchaseDetails?.quot_no}
              />
              <KeyValue
                label={"Dated"}
                value={formatDate(purchaseDetails?.quot_date)}
              />
            </View>
          </View>
        </View>
        <View style={styles.description}>
          <CustomText style={{ fontSize: "9px", lineHeight: 1.2 }}>
            Dear Sir (s),
          </CustomText>
          <CustomText
            style={{ textIndent: "50px", fontSize: "9px", lineHeight: 1.2 }}
          >
            Please arrange to supply us the following items against this order
            in accordance with the terms and conditions mentioned below:
          </CustomText>
        </View>
        <View>
          <ReportTable
            data={[
              {
                sno: 1,
                description: purchaseDetails?.item_name,
                unit: "KGS",
                quantity: !_.isEmpty(purchaseDetails?.total_quantity) ? parseFloat(purchaseDetails?.total_quantity)?.toFixed(2) : '-',//numberWithCommas(calculateQuantity(purchaseDetails)),
                rate: purchaseDetails?.purchase_price,
                domestic_taxes: purchaseDetails.domestic_taxes,
                cgst: !_.isEmpty(purchaseDetails?.cgst)
                  ? parseFloat(purchaseDetails?.cgst)?.toFixed(2)
                  : null,
                sgst: !_.isEmpty(purchaseDetails?.sgst)
                  ? parseFloat(purchaseDetails?.sgst)?.toFixed(2)
                  : null,
                igst: !_.isEmpty(purchaseDetails?.igst)
                  ? parseFloat(purchaseDetails?.igst)?.toFixed(2)
                  : null,
                amount: Number(calculatedAmount(purchaseDetails))?.toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                // numberWithCommas(
                //   calculatedAmount(purchaseDetails).toFixed(4)
                // ),
              },
            ]}
            purchaseDetails={purchaseDetails}
            dispatchDetails={dispatchDetails}
          />
        </View>
        <View>
          <Conditions
            label={"Mode of Transport"}
            value={purchaseDetails?.mode_of_transport}
          />
          {/* <Conditions
            label={"Delivery Terms"}
            value={""}
          /> */}
          <Conditions
            label={"Terms of Payment"}
            value={getPaymentTermsString()}
          />
          <Conditions
            label={"Transit Insurance"}
            value={purchaseDetails?.transit_insurance}
          />
          <Conditions
            label={"Packing"}
            value={purchaseDetails?.packing_forwarding}
          />
        </View>

        <View style={{ display: "flex", flexDirection: "row", width: "100%" }} wrap={false}>
          <View style={{ width: "40%" }}>
            <CustomText
              style={{
                fontFamily: "Helvetica-Bold",
                borderBottom: "1px dashed black",
                margin: 5,
              }}
            >
              Billing Address
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.billing_com_name}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.billing_at_name}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.billing_at_addressline1}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {[
                purchaseDetails?.billing_at_addressline2,
                purchaseDetails?.billing_zipcode,
              ]
                ?.filter(Boolean)
                ?.join(", ")}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {[
                purchaseDetails?.billing_state,
                purchaseDetails?.billing_country,
              ]
                ?.filter(Boolean)
                ?.join(", ")}
            </CustomText>
            <CustomText
              style={{ marginHorizontal: 5, fontFamily: "Helvetica-Bold" }}
            >
              {purchaseDetails?.billing_at_gstno?.toUpperCase()}
            </CustomText>
          </View>
          <View style={{ width: "20%" }}></View>
          <View style={{ width: "40%" }}>
            <CustomText
              style={{
                fontFamily: "Helvetica-Bold",
                borderBottom: "1px dashed black",
                margin: 5,
              }}
            >
              Delivery Address
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.delivery_com_name}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.delivery_at_name}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {purchaseDetails?.delivery_at_addressline1}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {[
                purchaseDetails?.delivery_at_addressline2,
                purchaseDetails?.delivery_zipcode,
              ]
                ?.filter(Boolean)
                ?.join(", ")}
            </CustomText>
            <CustomText style={{ marginHorizontal: 5 }}>
              {[
                purchaseDetails?.delivery_state,
                purchaseDetails?.delivery_country,
              ]
                ?.filter(Boolean)
                ?.join(", ")}
            </CustomText>
            <CustomText
              style={{ marginHorizontal: 5, fontFamily: "Helvetica-Bold" }}
            >
              {purchaseDetails?.delivery_at_gstno?.toUpperCase()}
            </CustomText>
          </View>
        </View>
        <View
          style={{
            alignSelf: "flex-end",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "30px",
          }}
          wrap={false}
        >
          <CustomText
            style={{ fontFamily: "Helvetica-Bold", fontSize: "10px" }}
          >
            For CCL PRODUCTS (INDIA) LTD
          </CustomText>
          <CustomText style={{ marginTop: 40, fontFamily: "Helvetica-Bold" }}>
            Authorised Signatory
          </CustomText>
        </View>

        <View
          fixed
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <View
            style={{
              alignSelf: "flex-end",
              justifyContent: "center",
              alignItems: "center",
              marginRight: '5px'
            }}
            wrap={false}
          >
            <CustomText
              style={{ fontFamily: "Helvetica", fontSize: "10px", fontStyle: 'italic' }}
            >
              Continued on next page ...
            </CustomText>
          </View>
          <View style={{ borderTop: "1px dashed black", padding: 5 }}>
            <CustomText style={{ textAlign: "center", fontSize: 8 }}>
              THIS IS ELECTRONICALLY APPROVED. SIGNATURE NOT REQUIRED
            </CustomText>
          </View>
          <View
            style={{
              flexDirection: "row",
              borderTop: "2px solid black",
              padding: 5,
            }}
          >
            <View style={{ flex: 2 }}>
              <CustomText>
                Corporate Office: 7-1-24/2/D. "GreenDale" Ameerpet, Hyderabad,
                Telangana - 500 016Tel : (040) 23730855.
              </CustomText>
            </View>
            <View style={{ flex: 1, paddingLeft: 20 }}>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                PAN No: AAACC9552G
              </CustomText>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                CIN No: L15110AP1961PLC000874
              </CustomText>
            </View>
          </View>
        </View>
      </Page>
      <Page style={styles.section}>
        <CustomText
          style={{
            textAlign: "center",
            fontFamily: "Times-Bold",
            textDecoration: "underline",
            marginBottom: 10,
            fontSize: "10px",
          }}
        >
          TERMS & CONDITIONS
        </CustomText>
        <View style={{ padding: 10 }}>
          <CustomText style={{ fontFamily: "Times-Bold", fontSize: "10px" }}>
            1.{"  "} Definitions
          </CustomText>
          <View style={{ paddingHorizontal: 20 }}>
            <Terms
              number={"(a)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="CCL"
              value={"shall refer to CCL Products (India) Limited;"}
            ></Terms>
            <Terms
              number={"(b)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="Defect"
              value={
                " means   any   defect,   deficiency,      error,      failure,      flaw,      omission,      damage,      fault,   inadequacy   or   discrepancy   in   the workmanship or in the Goods or any part or component thereof;"
              }
            ></Terms>
            <Terms
              number={"(c)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="Goods"
              value={
                "shall  refer  to  any  and  all  the  goods,  materials,    equipment,    supplies,    spares,  components  that  are  to  be  supplied by the Supplier under the PO;"
              }
            ></Terms>
            <Terms
              number={"(d)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="PO"
              value={
                "shall refer to the document titled Purchase Order to which these Terms & Conditions are attached;"
              }
            ></Terms>
            <Terms
              number={"(e)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="Supplier"
              value={
                " shall  refer  to  the  supplier  as  identified  on  the  face  of  the  PO  or  shall  refer  to  the  party  to  whom  the  PO  is addressed, and shall include its successors and permitted assigns;"
              }
            ></Terms>
            <Terms
              number={"(f)"}
              underline
              numStyle={{ marginRight: 10 }}
              label="Terms & Conditions"
              value={"shall refer to this Terms & Conditions document."}
            ></Terms>
          </View>
          <Terms
            number={"2."}
            label={"Acceptance."}
            value={
              "Any of the following shall constitute Supplier's unqualified acceptance of this PO: (a)acknowledgement of PO; (b) furnishing of any Goods or the rendering of any services pursuant to this PO; or (c) acceptance of any payment. No modification of or release from this Terms & Conditions document shall be binding unless agreed to in writing by both parties."
            }
          />
          <Terms
            number={"3."}
            label={"PO Identification."}
            value={
              " The PO number must appear on all invoices and correspondence."
            }
          />
          <Terms
            number={"4."}
            label={"Delivery."}
            value={
              " Delivery   must   be   completed   within   the   delivery   schedule   stated   on   the   PO.   CCL   reserves   the   right   to   cancel this  PO  without  liability  and  to  charge  the  Supplier  with  any  loss  incurred  as  a  result  of  Supplier's  failure  to  make  the delivery within the delivery schedule specified."
            }
          />
          <Terms
            number={"5."}
            label={"Packaging."}
            value={
              "  Supplier   must   provide   proper   and   adequate   packaging   in   accordance   with   best   commercial   practice,   to ensure   that   the   Goods   in   transit   will   be   free   of   damage.   Packaging   must   be   adequate   to   allow   for   rough   handling, exposure to extreme temperatures, with consideration for the type of Goods and transportation mode."
            }
          />
          <Terms
            number={"6."}
            label={"Inspection   and   Acceptance."}
            value={
              "   CCL   shall   have   30   calendar   days   after   proper   receipt   of   the   Goods   to   inspect   them   and either   accept   or   reject   them   as   non-conforming   with   this   PO.   Based   on   the   inspection,   CCL   may   reject   the   entire delivery.   Supplier   agrees   that   CCL's   payment   under   this   PO   shall   not   be   deemed   acceptance   of   any   Goods   delivered hereunder.    CCL's  right  to  reject  the  Goods  shall  not  be  limited  or  waived  by  the  Goods  having  been  previously  inspected or  tested  by  CCL  prior  to  delivery.  The  Supplier  agrees  that  any  acceptance  by  CCL  does  not  release  the  Supplier  from any   warranty   or   other   obligations   under   this   Contract.   If   the   Goods   are   rejected   by   CCL,   Supplier   shall   (a)   repair   the defects identified by CCL; (b) replace the Goods; or (c) return all payments made by CCL, at the sole discretion of CCL."
            }
          />
          <Terms
            number={"7."}
            label={"Title  and  risk  of  loss."}
            value={
              " Title  to  the  Goods  shall  pass  when  they  are  delivered  and  accepted  by  CCL.  Risk  of  loss,  injury, or destruction of the Goods shall be borne by Supplier until title passes to CCL. "
            }
          />
          <Terms
            number={"8."}
            label={"Warranties."}
            value={
              "   Supplier    represents    and    warrants    that:    (a)    the    Goods    are    conforming    to    the    specifications,    drawings, samples,   or   other   descriptions   furnished,   approved   or   specified   by   CCL   and   are   free   from   Defects.   Unless   provided otherwise  in  the  PO,  this  warranty  shall  remain  valid  for  twelve  (12)  months  after  the  Goods  have  been  delivered  to  and accepted  at  the  final  destination.  CCL's  continued  use  of  such  Goods  after  notifying  Supplier  of  their  Defect  or  failure  to conform   will   not   be   considered   a   waiver   of   Supplier's   warranty.   (b)   it   has   full   title   to   the   Goods   and   is   a   company financially    sound    and    duly    licensed,    with    adequate    human    resources,    equipment,    competence,    expertise    and    skills necessary   to   carry   out   fully   and   satisfactorily,   within   the   stipulated   completion   period,   the   delivery   of   the   Goods   in accordance  with  this  PO;  (c)  it  shall  comply  with  all  applicable  laws,  ordinances,   rules   and   regulations   when   performing its  obligations  under  this  PO;  (d)  in  all  circumstances  it  shall  act  in  the  best  interests  of  CCL;  (e)  it  has  not  misrepresented or concealed any material facts in the procuring of this PO."
            }
          />
          <Terms
            number={"9."}
            label={"Indemnification."}
            value={
              "   The   Supplier   shall   at   all   times   defend,   indemnify,   and   hold   harmless   CCL,   its   officers,   employees,      and agents    from    and    against    all    losses,    costs,    damages    and    expenses    (including    legal    fees    and    costs),    claims,    suits, proceedings,  demands  and  liabilities  of  any  kind  or  nature  to  the  extent  arising  out  of  or  resulting  from  breach  of  the  PO or  the  Terms  &  Conditions,  or  acts  or  omissions  of  the  Supplier  or  its  employees,  officers,  agents  or  subcontractors,  in  the performance of its obligations. "
            }
          />
          <Terms
            number={"10."}
            label={"Independent   Contractor."}
            value={
              "  The   Supplier   shall   supply   Goods   pursuant   to   this   PO   as   an   independent   contractor   and   not   as an employee, partner, or agent of CCL."
            }
          />
          <Terms
            number={"11."}
            label={"Audit."}
            value={
              "  The   Supplier   agrees   to   maintain   records,   in   accordance   with   sound   and   generally   accepted   accounting   procedures, of   all   direct   and   indirect   costs   of   whatever   nature   involving   transactions   related   to   the   PO.   The   Supplier   shall   make   all such   records   available   to   CCL   or   the   CCL's   designated   representative   at   all   reasonable   times,   for   inspection,   audit,      or reproduction  for  the  purpose  of  verifying  services  or  quantities  delivered,  or  the  right  of  Supplier  to  any  price  adjustment or extra charge claimed under this PO."
            }
          />
          <Terms
            number={"12."}
            label={"Invoices."}
            value={
              " Supplier  shall  raise  proper  invoices  upon  CCL  as  per  the  applicable  laws.  If  it  is  a  zero  rated  supply,  valid  LUT number  shall  be  mentioned  in  the  invoice.  If  LUT  No.  has  not  been  allotted  and  has  been  applied  for,  acknowledgement copy  of  having  applied  for  LUT  shall  be  annexed  along  with  invoice.  All  invoices  shall  be  duly  accompanied  by  such  other supporting documents as may be specified by CCL."
            }
          />
          <Terms
            number={"13."}
            label={"Right to Set-off:"}
            value={
              " CCL shall have right to set-off or deduct any amounts due from the Supplier to CCL"
            }
          />
          <Terms
            number={"14."}
            label={"Assignment  and  Subcontracting."}
            value={
              " The  Supplier  shall  not  assign  or  subcontract  its  obligations  or  any  work  under  the  PO in  part  or  all,  unless  agreed  upon  in  writing  in  advance  by  CCL.  Any  subcontract  entered   into   by   the   Supplier   without approval in writing by the CCL may be cause for termination of the PO. "
            }
          />
          <Terms
            number={"15."}
            label={"Governing  Law   and   Jurisdiction. "}
            value={
              "  The   PO   and   the  Terms   &   Conditions   shall   be   governed   in   accordance   with   the   laws of India and shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana."
            }
          />
          <Terms
            number={"16."}
            label={"Waiver."}
            value={
              "Failure  by  either  Party  to  insist  in  any  one  or  more  instances  on  a  strict  performance  of  any  of  the  provisions  of the  PO  or  the  Terms  &  Conditions  shall  not  constitute  a  waiver  or  relinquishment  of  the  right  to  enforce  the  provisions  of this PO or the Terms & Conditions in future instances, but this right shall continue and remain in full force and effect. 17.No Lien. Supplier shall not create any lien on the Goods for any reason whatsoever."
            }
          />
          <Terms
            number={"17."}
            label={"No Lien."}
            value={
              "Supplier shall not create any lien on the Goods for any reason whatsoever."
            }
          />

          <Terms
            number={"18."}
            label={"Binding   nature."}
            value={
              "This   Terms   &   Conditions   document   contains   the   entire   and   only   understanding   between   the   parties respecting the subject matter hereof and supersedes all prior agreements and understandings."
            }
          />
          <Terms
            number={"19."}
            label={"Time is of the Essence"}
            value={
              "  Time is of the essence with respect to every duty required to be performed by either party."
            }
          />
          <Terms
            number={"20."}
            label={"Headings;    Emphasis."}
            value={
              "   Headings    in    this    lease    for    convenience    only.    Unless    otherwise    expressed,    headings,    bold, italicized   or   underlined   letters,   numerals,   or   characters   have   no   greater   significance   than   plain   text   letters,   numerals,      or characters."
            }
          />
          <Terms
            number={"21."}
            label={"Interpretation."}
            value={
              " The  terms  laid  down  under  this  Terms  &  Conditions  document  shall  be  in  addition  to  the  terms  of  the PO.  If  any  provisions  of  this  Terms  &  Conditions  are  held  or  deemed  unenforceable  or  too  broad  to  permit  enforcement of  such  provision  to  its  full  extent,  then  such  provision  shall  be  enforced  to  the  maximum  extent  permitted  by  applicable law. Nothing contained herein shall limit either party’s right to available remedies in law or equity against the other party."
            }
          />
          <Terms
            number={"22."}
            label={"Termination."}
            value={
              " Termination   of   the   PO   for   any   reason   shall   constitute   valid   termination   of   this   Terms   &   Conditions document."
            }
          />
          <Terms
            number={"23."}
            label={"Survival."}
            value={
              "  The   obligations   under   this   Terms   &   Conditions   document   which   by   implication   are   intended   to   survive   shall survive  the  termination  or  expiry  of  PO  and  the  Terms  &  Conditions.  In  addition,  clause  6,    7,    8,    9,    14,    15  shall  survive  the termination or expiration of the PO and the Terms & Conditions."
            }
          />
        </View>
        <View
          fixed
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: "100%",
          }}
        >
          {/* <View
            style={{
              alignSelf: "flex-end",
              justifyContent: "center",
              alignItems: "center",
              marginRight: '5px'
            }}
            wrap={false}
          >
            <CustomText
              style={{ fontFamily: "Helvetica", fontSize: "10px", fontStyle: 'italic' }}
            >
              Continued on next page ...
            </CustomText>
          </View> */}
          <View
            fixed
            style={{
              display: "flex",
              flexDirection: "row",
              borderTop: "2px solid black",
              padding: 5,
              width: "100%",
            }}
          >
            <View style={{ flex: 2 }}>
              <CustomText>
                Corporate Office: 7-1-24/2/D. "GreenDale" Ameerpet, Hyderabad,
                Telangana - 500 016 Tel : (040) 23730855.
              </CustomText>
            </View>
            <View style={{ flex: 1, paddingLeft: 20 }}>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                PAN No: AAASKCMAC
              </CustomText>
              <CustomText style={{ fontFamily: "Helvetica-Bold" }}>
                CIN No: LASACOACKASCOK1212AS
              </CustomText>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    padding: 5,
    paddingBottom: 60,
  },
  header: {
    display: "flex",
    flexDirection: "row",
  },
  text: {
    fontSize: "10px",
    textAlign: "center",
    fontWeight: "light",
  },
  podetails: {
    display: "flex",
    flexDirection: "column",
    marginVertical: 5,
    justifyContent: "center",
  },
  textregular: {
    fontSize: "8px",
    lineHeight: 1.5,
    fontFamily: "Helvetica",
  },
  description: {
    paddingHorizontal: 5,
  },
  table: {
    width: "100%",
    marginVertical: 5,
    border: "1px solid black",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderTop: "1px solid black",
  },
  headerTable: {
    borderTop: "none",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  // So Declarative and unDRY 👌
  row1: {
    width: "5%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row2: {
    width: "35%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row3: {
    width: "5%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row4: {
    width: "15%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row5: {
    width: "10%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row6: {
    width: "15%",
    borderRight: "1px solid black",
    paddingVertical: 8,
    textAlign: "center",
  },
  row7: {
    width: "15%",
    paddingVertical: 8,
    textAlign: "right",
    marginRight: 5,
  },
});
export default MyDocument;
