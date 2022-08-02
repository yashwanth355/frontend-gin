import React, { useEffect, useState } from "react";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import "../../../common.css";
import "./styles.css"; //"../../../../assets/images/logo_pdf.png";
import Logo from "../../../../assets/images/logo_pdf.png";
var convertRupeesIntoWords = require("convert-rupees-into-words");

const AccountPDF = (props) => {
  const [debitNoteGcDetails, setDebitNoteGcDetails] = useState(null);

  const fetchData = async () => {
    if (props.debitNoteGcDetails) {
      var temp = {};
      temp.delivery_at_address =
        "Ccl Products (India) Limited\r\nHead Office,Ho Address: 7-1-24/2/D, Greendale, Ameerpet,Hyderabad, Telangana - 500 016,Gst No. 36aaacc9552g2zl";
      temp = props.debitNoteGcDetails;
      setDebitNoteGcDetails(temp);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [props.debitNoteGcDetails]);

  const formatDate = (datestr) => {
    let dateVal = new Date(datestr);
    return (
      dateVal.getDate() +
      "/" +
      (dateVal.getMonth() + 1) +
      "/" +
      dateVal.getFullYear()
    );
  };


  return (
    <div id="po_view_main_acc">
      {debitNoteGcDetails !== null && (
        <>
          <Grid container md={12} className="">
            <Grid container md={3}>
              <img src={Logo} style={{ height: "200px", width: "200px" }} alt="logo" />
            </Grid>
            <Grid container md={9}>
              <Grid item className="first-section-main-import">
                {/* {debitNoteGcDetails?.entity_address
                  .split(",")
                  ?.map((item, index) => {
                    return (
                      <>
                        {index === 0 ? (
                          <h3 className="first-title">{item},</h3>
                        ) : (
                          (index <= 3 || index === 6 || (index >= debitNoteGcDetails?.entity_address.split(",").length - 3 && index !== debitNoteGcDetails?.entity_address.split(",").length - 1) )
                          ? <strong>{item},</strong> : 
                          <p className="first-address">
                            <strong>{item},</strong>
                          </p>
                        )}
                      </>
                    );
                  })} */}
                <h3 className="first-title-debit">
                  CCL PRODUCTS (INDIA) LIMITED.
                </h3>
                <p className="formerly-debit">
                  <strong>(Formerly - CONTINENTAL COFFEE LTD.)</strong>
                </p>
                {debitNoteGcDetails?.entity_address
                  .split(",")
                  ?.map((item, index) => {
                    return (
                      <>
                        {item},{" "}
                        {index >=
                          debitNoteGcDetails.entity_address.split(",").length -
                            4 && <br />}
                      </>
                    );
                  })}

                {/* <h3 className="first-title-debit">CCL PRODUCTS (INDIA) LIMITED.</h3>
                  <p className='formerly-debit'><strong>(Formerly - CONTINENTAL COFFEE LTD.)</strong></p>
                  <p className="first-address">Duggirala Mandal, Guntur District. A.P. - 522 330</p>                 
                  <p className="first-address"> Hyderabad Telangana, India</p>
                  <strong>GST No: 37AAACC9552G1ZK</strong> */}
              </Grid>
            </Grid>
          </Grid>
          <Grid container md={12}>
            <Grid item className="second-section-contract-debit">
              <p>{"DEBIT NOTE(ACCOUNTS)"}</p>
            </Grid>
          </Grid>
          <Grid container md={12} className="third-main-import">
            <Grid container md={6}>
              <Grid item className="third-section-left-main-contract">
                <p>
                  <strong>TO,</strong>
                </p>
                <p className="supplier_name">
                  {debitNoteGcDetails?.vendor_name}
                </p>
                <p className="supplier_name">
                  {debitNoteGcDetails?.vendor_address
                    .split(",")
                    ?.map((item, index) => {
                      return (
                        <>
                          {item},{" "}
                          {index >=
                            debitNoteGcDetails.vendor_address.split(",")
                              .length -
                              4 && <br />}
                        </>
                      );
                    })}
                </p>
                {/* <p className="supplier_name">NEAR MADEENA MASJID,</p>
                <p className="supplier_name">SHAREEF STREET,</p>
                <p className="supplier_name">CHIKMAGALUR 577101</p>
                <p className="supplier_name">KARNATAKA - 29</p>
                <p className="supplier_name">PH : 08262 248510, 9449496571</p> */}
                {/* <Grid container md={12}>
                  <Grid container md={3}>
                    <Grid item className="third-section-right-main-right">
                      <p>
                        <strong>GSTIN</strong>
                      </p>
                      <p>
                        <strong>PAN</strong>
                      </p>
                    </Grid>
                  </Grid>
                  <Grid container md={3}>
                    <Grid item className="third-section-right-main-right">
                      <p>29AAKFC3947Q1ZL</p>
                      <p>AAKFC3947Q</p>
                    </Grid>
                  </Grid>
                  <Grid container md={6}></Grid>
                </Grid> */}
                {/* <p className="rm-mar-btm add-wid">
                 
                </p> */}
              </Grid>
            </Grid>
            <Grid container md={6}>
              <Grid container md={12} className="third-section-right-main">
                <Grid container md={4}>
                  <Grid item className="third-section-right-main-right">
                    <p>
                      <strong>DEBIT NOTE NO</strong>
                    </p>
                    <p>
                      <strong>Date</strong>
                    </p>
                  </Grid>
                </Grid>
                <Grid container md={8}>
                  <Grid item className="third-section-right-main-right">
                    <p>
                      {debitNoteGcDetails.debit_noteno
                        ? debitNoteGcDetails.debit_noteno
                        : "-"}
                    </p>
                    <p>
                      {debitNoteGcDetails.debit_notedate
                        ? formatDate(debitNoteGcDetails.debit_notedate)
                        : "-"}
                    </p>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <p>Dear Sir (s),</p>
          <p>
            Please note that your account has been debited with a sum of Rs.{" "}
            <strong>
              {debitNoteGcDetails.debit_amount} (Indian Rupees{" "}
              {convertRupeesIntoWords(
                parseInt(debitNoteGcDetails.debit_amount)
              )}{" "}
              Only){" "}
            </strong>{" "}
            towards quality problems:
          </p>

          <TableContainer className="pdf_table_main">
            <Table className="pdf_table" aria-label="simple table">
              <TableHead>
                <TableCell className="text-center">
                  <strong>INVOICE NO</strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>
                    INVOICE <br /> DATE
                  </strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>PO NO</strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>PO DATE</strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong> MRIN NO </strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong> MRIN DT </strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>GRADE</strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>HS CODE</strong>
                </TableCell>
                <TableCell className="text-center">
                  <strong>DEBIT AMOUNT</strong>
                </TableCell>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.invoice_no}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.invoice_date === '' ? debitNoteGcDetails.invoice_date : formatDate(debitNoteGcDetails.invoice_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.po_no}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.po_date === '' ? debitNoteGcDetails.po_date : formatDate(debitNoteGcDetails.po_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.mrin_no}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.mrin_date === '' ? debitNoteGcDetails.mrin_date : formatDate(debitNoteGcDetails.mrin_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.gcitem_name}
                  </TableCell>
                  <TableCell className="text-center">
                    {debitNoteGcDetails.hsc_code}
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{debitNoteGcDetails.debit_amount}</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={8} className="text-right">
                    <strong>TOTAL</strong>
                  </TableCell>
                  <TableCell className="text-center">
                    <strong>{debitNoteGcDetails.debit_amount}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ height: "550px" }}></div>
          <Grid container md={12} className="sign-main debit_btm">
            <Grid container md={8}></Grid>
            <Grid container md={4} className="sign-right">
              <Grid item>
                <p className="authorised">
                  for <strong>CCL PRODUCTS (INDIA) LTD.</strong>
                </p>
                <br />
                <br />
                <br />
                <p className="authorised">
                  <strong>Authorised Signatory</strong>
                </p>
              </Grid>
            </Grid>
          </Grid>
          <div
            style={{
              height: "10px",
              borderBottom: "1px dashed #000",
              width: "100%",
            }}
          ></div>
          <p
            style={{
              borderBottom: "1px solid #000",
              width: "100%",
              textAlign: "center",
              paddingBottom: "10px",
            }}
          >
            THIS IS ELECTRONICALLY APPROVED. SIGNATURE NOT REQUIRED
          </p>

          <Grid container md={12} style={{ paddingBottom: "10px" }}>
            <Grid container md={8}>
              <h4>
                <b>Corporate Office:</b>7-1-24/2/D. "GreenDale" Ameerpet,
                Hyderabad, Telangana - 500 016
                <br /> Tel : (040) 23730855.{" "}
              </h4>
            </Grid>
            <Grid container md={4}>
              <h4>
                <b>PAN No : AAACC9552G</b>
              </h4>
              <h4>
                <b>CIN No : L15110AP1961PLC000874</b>
              </h4>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
};
export default AccountPDF;
