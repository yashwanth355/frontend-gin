import React, { Fragment, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

export const DownloadExcel = (props) => {
  // eslint-disable-next-line
  useEffect(async () => {
    const { tableData, tableName } = await props;
    if (tableData && tableData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, tableName + fileExtension);
    }
    // eslint-disable-next-line
  }, [props.tableData]);

  return <Fragment></Fragment>;
};
