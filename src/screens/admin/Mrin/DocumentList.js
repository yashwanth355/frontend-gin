import React from "react";
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

const detailscolumns = [
  { id: "doc_kind", label: "Document Name" },
  { id: "document_name", label: "File Name" },
];

const editcolumns = [{ id: "doc_kind", label: "Document Name" }];

function createData(doc_kind, document_name, file_name, upload,   billofentrydate,
  billofentrynumber,
  billofladdingdate,
  billofladdingnumber,
  conversationratio,
  invoicedate,
  invoicenumber,) {
  return { doc_kind, document_name, file_name, upload, billofentrydate,
    billofentrynumber,
    billofladdingdate,
    billofladdingnumber,
    conversationratio,
    invoicedate,
    invoicenumber, };
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

  React.useEffect(() => {
    console.log("Props Data", props.data);
    let temp = [];
    props.data?.map((item, index) => {
    temp.push(
      createData(
        item.doc_kind,
        item.document_name,
        item.file_name,
        item.upload,
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
  // eslint-disable-next-line

  // for (const v in props.data) {
  //   rows.push(
  //     createData(
  //       props.data[v].doc_kind,
  //       props.data[v].document_name,
  //       props.data[v].file_name,
  //       props.data[v].upload,
  //     )
  //   );
  // }

  const downloadAction = (e, fileName, docName) => {
    props.downloadFile("download_file", fileName, docName);
  };

  const deleteAction = (e, fileName) => {
    props.deleteFile("delete_file", fileName);
  };

  const uploadAction = (e, fileContent, docName, fileName) => {
    props.uploadFile("upload_file", fileContent, docName, fileName);
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
    row.file = await toBase64(e.target.files[0]);
    row.file = row.file.replace(/^data:application\/(pdf);base64,/, "");
    row.fileName = e.target.files[0].name;
  };

  const handleChange = (index, e, key) => {
    const value = e.target.value;
    let temp = [...rows];
    temp[index][key] = value; 
    setRows(temp);
    props.otherFields(temp);
  };

  const handleChangeDate = (index, e, key) => {
    const value = e;
    let temp = [...rows];
    temp[index][key] = new Date(value); 
    setRows(temp);
    props.otherFields(temp);
  };

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
                    
                   {row.doc_kind === "Bill of Lading" ? (
                      <>
                        <TableCell>
                          {row?.billofladdingnumber
                            ? row?.billofladdingnumber
                            : ''}
                        </TableCell>
                        <TableCell>
                          {row?.billofladdingdate ? row?.billofladdingdate : ""}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Invoice" ? (
                      <>
                        <TableCell>
                          {row?.invoicenumber ? row?.invoicenumber : ""}
                        </TableCell>
                        <TableCell>
                          {row?.invoicedate ? row?.invoicedate : ""}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Bill of Entry" ? (
                      <>
                        <TableCell>
                          {row?.billofentrynumber ? row?.billofentrynumber : ""}
                        </TableCell>
                        <TableCell>
                          {row?.billofentrydate ? row?.billofentrydate : ""}
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
                            downloadAction(e, row.file_name, row.document_name);
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
                          style={{width: '200px'}}
                          onChange={(e) => {
                            fileUploadHandle(e, row);
                          }}
                        ></TextField>
                      )}
                      {row.document_name}
                    </TableCell>

                    {row.doc_kind === "Bill of Lading" ? (
                      <>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row?.billofladdingnumber}
                            style={{width: '200px'}}
                            onChange={(e) => handleChange(i, e, 'billofladdingnumber')}
                            placeholder='Bill of Lading Number'
                          />
                          {/* {row?.billofladdingnumber
                            ? row?.billofladdingnumber
                            : ''} */}
                        </TableCell>
                        <TableCell>
                        <DatePicker value={row?.billofladdingdate ? row?.billofladdingdate : new Date()} style={{width: '200px'}} onChange={(e) => handleChangeDate(i, e, 'billofladdingdate')}></DatePicker>
                          {/* {row?.billofladdingdate ? row?.billofladdingdate : ''} */}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Invoice" ? (
                      <>
                        <TableCell>
                        <TextField
                          type="number"
                            value={row?.invoicenumber}
                            style={{width: '200px'}}
                            onChange={(e) => handleChange(i, e, 'invoicenumber')}
                            placeholder='Invoice Number'
                          />
                          {/* {row?.invoicenumber ? row?.invoicenumber : ''} */}
                        </TableCell>
                        <TableCell>
                        <DatePicker value={row?.invoicedate ? row?.invoicedate : new Date()} style={{width: '200px'}} onChange={(e) => handleChangeDate(i, e, 'invoicedate')}></DatePicker>
                          {/* {row?.invoicedate ? row?.invoicedate : ''} */}
                        </TableCell>
                        <TableCell></TableCell>
                      </>
                    ) : row.doc_kind === "Bill of Entry" ? (
                      <>
                        <TableCell >
                        <TextField
                          type="number"
                          style={{width: '200px'}}
                            value={row?.billofentrynumber}
                            onChange={(e) => handleChange(i, e, 'billofentrynumber')}
                            placeholder='Bill Of Entry Number'
                          />
                          {/* {row?.billofentrynumber ? row?.billofentrynumber : ''} */}
                        </TableCell>
                        <TableCell>
                        <DatePicker value={row?.billofentrydate ? row?.billofentrydate : new Date()} onChange={(e) => handleChangeDate(i, e, 'billofentrydate')}></DatePicker>
                          {/* {row?.billofentrydate ? row?.billofentrydate : ''} */}
                        </TableCell>
                        <TableCell>
                        <TextField
                          type="number"
                          style={{width: '100px'}}
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
                              row.file,
                              row.doc_kind,
                              row.fileName
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
                            downloadAction(e, row.file_name, row.document_name);
                          }}
                        ></Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.file_name && (
                        <Button
                          label="Delete"
                          onClick={(e) => {
                            deleteAction(e, row.file_name);
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
