import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { Table as Tables } from "@material-ui/core";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "../../../components/Button";
import { CheckBox } from "../../../components/CheckBox";
import { TextField } from "../../../components/TextField";
import { DatePicker } from "../../../components/DatePicker";
import _ from 'lodash';

const detailscolumns = [
  { id: "doc_kind", label: "Document Name" },
  { id: "document_name", label: "File Name" },
];

const editcolumns = [{ id: "doc_kind", label: "Document Name" }];

function createData(
  doc_kind,
  document_name,
  file_name,
  upload,
  required,
  docid,
  dispatchid,
  billofentrydate,
  billofentrynumber,
  billofladdingdate,
  billofladdingnumber,
  conversationratio,
  invoicedate,
  invoicenumber,
) {
  return {
    doc_kind,
    document_name,
    file_name,
    upload,
    required,
    docid,
    dispatchid,
    billofentrydate,
    billofentrynumber,
    billofladdingdate,
    billofladdingnumber,
    conversationratio,
    invoicedate,
    invoicenumber,
  };
}

const useStyles = makeStyles({
  root: {
    width: "100%",
    marginTop: 24,
  },
});

const DocumentList = (props) => {
  const classes = useStyles();
  // const rows = [];
  const columns = props.details === true ? detailscolumns : editcolumns;
  const [rows, setRows] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  React.useEffect(() => {
    console.log("Props Data", props.data);
    let temp = [];
    // eslint-disable-next-line
    props.data?.map((item, index) => {
      temp.push(
        createData(
          item.doc_kind,
          item.document_name,
          item.file_name,
          item.upload,
          item.required,
          item?.docid,
          item?.dispatchid,
          item?.billofentrydate,
          item?.billofentrynumber,
          item?.billofladdingdate,
          item?.billofladdingnumber,
          item?.conversationratio,
          item?.invoicedate,
          item?.invoicenumber,
        )
      )
    })

    setRows(temp);
  }, [props.data]);
  // eslint-disable-next-line

  // for (const v in props.data) {

  // }

  const downloadAction = (e, fileName, docName, docid, dispatchid) => {
    props.downloadFile("download_file", fileName, docName, docid, dispatchid);
  };

  const deleteAction = (e, fileName, docid, dispatchid) => {
    props.deleteFile("delete_file", fileName, docid, dispatchid);
  };

  const uploadAction = (
    e,
    fileContent,
    docName,
    fileName,
    docid,
    dispatchid,
    billofentrydate,
    billofentrynumber,
    billofladdingdate,
    billofladdingnumber,
    conversationratio,
    invoicedate,
    invoicenumber,
  ) => {
    console.log('Upload file is', fileContent, docName, fileName);
    props.uploadFile(
      "upload_file",
      fileContent,
      docName,
      fileName,
      docid,
      dispatchid,
      billofentrydate,
      billofentrynumber,
      billofladdingdate,
      billofladdingnumber,
      conversationratio,
      invoicedate,
      invoicenumber,
    );
    setSelectedFiles([]);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fileUploadHandle = async (e, row) => {
    console.log(e.target.files[0]);
    let file = await toBase64(e.target.files[0]);
    file = file.replace(/^data:application\/(pdf);base64,/, "")
    const tempFiles = _.cloneDeep(selectedFiles);
    tempFiles[row.doc_kind] = { file_name: e.target.files[0].name, file: file }
    setSelectedFiles(tempFiles);
  };

  const handleChange = (index, e, key) => {
    const value = e.target.value;
    let temp = [...rows];
    temp[index][key] = value;
    console.log("Temp is", temp);
    setRows(temp);
    props.otherFields(temp);
  };

  const handleChangeDate = (index, e, key) => {
    const value = new Date(e);
    let temp = [...rows];
    temp[index][key] = (value.getMonth() + 1) + '/' + value.getDate() + '/' + value.getFullYear();
    setRows(temp);
    props.otherFields(temp);
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const formatDate = (datestr) => {
    if (_.isEmpty(datestr))
      return ""

    var validDt = new Date(datestr).getDate();
    if (isNaN(validDt) === true) {
      var dt = datestr.toString(); //;
      let dateVal = dt.replace(new RegExp(escapeRegExp('-'), 'g'), '/') //datestr ? '14-3-2022'.replace('-', '/') : '-'; //moment(datestr).format("DD/MM/YYYY")
      // console.log('dt::', dateVal)
      return dateVal;
    } else {
      // eslint-disable-next-line
      var dt = new Date(datestr);
      var dateVal = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
      // console.log('dt::12', dateVal, new Date(datestr))
      return dateVal;
    }

  }

  return (
    <Paper className={classes.root}>
      <TableContainer>
        <Tables stickyHeader aria-label="sticky table" size="small">
          {props.details === true && (
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell>Documents Required</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Conversion Rate</TableCell>
                <TableCell>Upload</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          )}
          {props.edit === true && (
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell>File</TableCell>
                <TableCell>Documents Required</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Conversion Rate</TableCell>
                <TableCell>Upload</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {rows.map((row, i) => {
              if (props.details === true) {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <CheckBox
                        checked={row.required}
                        name={row.required}
                        disabled={true}
                      />
                    </TableCell>
                    {row.doc_kind === "Bill of Lading" ? (
                      <>
                        <TableCell>
                          {row?.billofladdingnumber
                            ? row?.billofladdingnumber
                            : ''}
                        </TableCell>
                        <TableCell>
                          {row?.billofladdingdate ? formatDate(row?.billofladdingdate) : ""}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Invoice" ? (
                      <>
                        <TableCell>
                          {row?.invoicenumber ? row?.invoicenumber : ""}
                        </TableCell>
                        <TableCell>
                          {row?.invoicedate ? formatDate(row?.invoicedate) : ""}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Bill of Entry" ? (
                      <>
                        <TableCell>
                          {row?.billofentrynumber ? row?.billofentrynumber : ""}
                        </TableCell>
                        <TableCell>
                          {row?.billofentrydate ? formatDate(row?.billofentrydate) : ""}
                        </TableCell>
                        <TableCell>
                          {row?.conversationratio ? row?.conversationratio : ""}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </>
                    )}
                    <TableCell>
                      <CheckBox
                        checked={row.upload ? true : false}
                        name={row.upload}
                        disabled={true}
                      />
                    </TableCell>
                    <TableCell>
                      {row.file_name && (
                        <Button
                          label="Download"
                          onClick={(e) => {
                            downloadAction(
                              e,
                              row.file_name,
                              row.document_name,
                              row?.docid,
                              row?.dispatchid
                            );
                          }}
                        ></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              } else {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column, index) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      {!row.file_name && (
                        <TextField
                          type="file"
                          style={{ width: '200px' }}
                          onChange={(e) => {
                            fileUploadHandle(e, row);
                          }}
                        ></TextField>
                      )}
                      {row.document_name}
                    </TableCell>
                    <TableCell>
                      <CheckBox checked={row?.required} name={row?.required} />
                    </TableCell>
                    {row.doc_kind === "Bill of Lading" ? (
                      <>
                        <TableCell>
                          <TextField
                            //type="number"
                            disabled={!row.file_name}
                            value={row?.billofladdingnumber}
                            style={{ width: '200px' }}
                            onChange={(e) => handleChange(i, e, 'billofladdingnumber')}
                            placeholder='Bill of Lading Number'
                          />
                          {/* {row?.billofladdingnumber
                            ? row?.billofladdingnumber
                            : ''} */}
                        </TableCell>
                        <TableCell>
                          <DatePicker 
                          disabled={!row.file_name}
                          value={row?.billofladdingdate ? new Date(row?.billofladdingdate) : null} style={{ width: '200px' }} onChange={(e) => handleChangeDate(i, e, 'billofladdingdate')}></DatePicker>
                          {/* {row?.billofladdingdate ? row?.billofladdingdate : ''} */}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Invoice" ? (
                      <>
                        <TableCell>
                          <TextField
                           // type="number"
                           disabled={!row.file_name}
                            value={row?.invoicenumber}
                            style={{ width: '200px' }}
                            onChange={(e) => handleChange(i, e, 'invoicenumber')}
                            placeholder='Invoice Number'
                          />
                          {/* {row?.invoicenumber ? row?.invoicenumber : ''} */}
                        </TableCell>
                        <TableCell>
                          <DatePicker 
                          disabled={!row.file_name}
                          value={row?.invoicedate ? new Date(row?.invoicedate) : null} style={{ width: '200px' }} onChange={(e) => handleChangeDate(i, e, 'invoicedate')}></DatePicker>
                          {/* {row?.invoicedate ? row?.invoicedate : ''} */}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Bill of Entry" ? (
                      <>
                        <TableCell >
                          <TextField
                            //type="number"
                            disabled={!row.file_name}
                            style={{ width: '200px' }}
                            value={row?.billofentrynumber}
                            onChange={(e) => handleChange(i, e, 'billofentrynumber')}
                            placeholder='Bill Of Entry Number'
                          />
                          {/* {row?.billofentrynumber ? row?.billofentrynumber : ''} */}
                        </TableCell>
                        <TableCell>
                          <DatePicker 
                          disabled={!row.file_name}
                          value={row?.billofentrydate ? new Date(row?.billofentrydate) : null} onChange={(e) => handleChangeDate(i, e, 'billofentrydate')}></DatePicker>
                          {/* {row?.billofentrydate ? row?.billofentrydate : ''} */}
                        </TableCell>
                        <TableCell>
                          <TextField
                            //type="number"
                            disabled={!row.file_name}
                            style={{ width: '100px' }}
                            value={row?.conversationratio}
                            onChange={(e) => handleChange(i, e, 'conversationratio')}
                            placeholder='Conversation Ratio'
                          />
                          {/* {row?.conversationratio ? row?.conversationratio : ''} */}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </>
                    )}
                    <TableCell>
                      <CheckBox
                        checked={row.upload ? true : false}
                        name={row.upload}
                      />
                    </TableCell>
                    <TableCell>
                      {!row.file_name && (
                        <Button
                          label="Upload"
                          onClick={(e) => {
                            uploadAction(
                              e,
                              selectedFiles[row.doc_kind]?.file,
                              row.doc_kind,
                              selectedFiles[row.doc_kind]?.file_name,
                              row?.docid,
                              row?.dispatchid
                            );
                          }}
                        ></Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.file_name && (
                        <Button
                          label="Download"
                          onClick={(e) => {
                            downloadAction(
                              e,
                              row.file_name,
                              row.document_name,
                              row?.docid,
                              row?.dispatchid
                            );
                          }}
                        ></Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.file_name && (
                        <Button
                          label="Delete"
                          onClick={(e) => {
                            deleteAction(
                              e,
                              row.file_name,
                              row?.docid,
                              row?.dispatchid
                            );
                          }}
                        ></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Tables>
      </TableContainer>
    </Paper>
  );
};

export default DocumentList;
