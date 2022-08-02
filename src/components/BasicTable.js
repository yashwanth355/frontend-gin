import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from './Button';
import { DatePicker } from './DatePicker';
import { TextField } from './TextField';
import { CheckBox } from './CheckBox';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#feecda',
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(even)': {
      //   backgroundColor: theme.palette.action.hover,
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 14px'
    },

  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  container: {
    width: '95%'
  }
});



export default function BasicTable(props) {
  const classes = useStyles();

  const total = () => {
    if (props?.mrinOtherSpec && props?.mrinOtherSpec === true) {
      return props.rows;
    } else {
      if (props?.rowlength) {
        if (props.rowlength !== 0 && props.rowlength === props.rows.length) {

          return props.rows?.map(row => parseFloat(row[props.totalColId])).reduce((sum, i) => sum + i, 0);
        } else {
          return false;
        }
      } else {
        return props.rows?.map(row => parseFloat(row[props.totalColId] ? row[props.totalColId] : 0)).reduce((sum, i) => sum + i, 0);
      }
    }
  }
  // eslint-disable-next-line
  useEffect(async () => {
    await setTotalValue(total());
    // eslint-disable-next-line
  }, [props.rowlength]);

  const totalIndex = () => {
    return props.columns.findIndex(item => item.id === props.totalColId);
  }

  const [totalValue, setTotalValue] = useState(total())
  const EditableCell = (props) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(props.initialValue)

    const onChange = e => {
      if (props.type === "date") {
        setValue(e)
        updateMyData(props.index, props.id, e)
      } else {
        if (props.id && (props.id === 'dispatch_quantity' || props.id === 'delivered_spec')) {
          if (e.target.value >= 0) {
            setValue(e.target.value)
          }
        } else {
          setValue(e.target.value)
        }
      }
    }

    const onClick = e => {
      props?.taxDelete ? props.handler.handleTaxClick(props.index) : props.handler.handleClick(props.index);
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateMyData(props.index, props.id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(props.initialValue)
      const totalVal = total();
      setTotalValue(totalVal);
    }, [props.initialValue])

    if (props.type === "date" && props?.disablePastDates && props?.disablePastDates === true) {

      return <DatePicker value={value === '-' ? new Date() : value} onChange={onChange} minDate={new Date()} onBlur={onBlur}></DatePicker>
    } else if (props.type === "date") {
      return <DatePicker value={value === '-' ? new Date() : value} onChange={onChange} onBlur={onBlur}></DatePicker>
    } else if (props.type === "button") {
      return <Button onClick={onClick} label={props.label}></Button>
    } else {
      return <TextField value={value} onChange={onChange} onBlur={onBlur} onWheel={event => document.activeElement.blur()} type={props.type} />
    }
  }

  const updateMyData = (rowIndex, columnId, value) => {
    props.rows.forEach((row, index) => {
      if (index === rowIndex) {
        row[columnId] = value;
      }
    })
    const totalVal = total();
    setTotalValue(totalVal);
    console.log('val::22', totalVal)
    props.onUpdate && props.onUpdate(totalVal);
  }

  return (
    <TableContainer component={Paper} className={props.fullwidth ? '' : classes.container}>
      <Table className={classes.table} aria-label="simple table">
        {
          !props.hideHeader &&
          <TableHead>
            <StyledTableRow>
              {props.columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          </TableHead>
        }
        <TableBody style={{ backgroundColor: '#fff' }}>
          {(props.rows === undefined || props.rows === null || props.rows.length === 0) ? <p>No records to display</p> : props.rows?.map((row, index) => (
            <StyledTableRow key={row.name}>
              {props.columns.map((column) => {
                const value = row[column.id] !== '' ? row[column.id] : '-';
                return (
                  <StyledTableCell key={column.id} align={column.align}>

                    {column.isEditable === true && row['tax_name']?.toLowerCase() !== 'tds' ?
                      <EditableCell initialValue={value} index={index}
                        id={column.id} type={column.type} label={column.label} handler={column.handler} taxDelete={column?.taxDelete} disablePastDates={column?.disablePastDates} /> :
                      column.clickable === true ?
                        // eslint-disable-next-line
                        <a onClick={() => column.onClick(row[column.id])} style={{ textDecoration: "underline" }} href="#">{value}</a> : value
                    }
                  </StyledTableCell>
                )
              })}
            </StyledTableRow>
          ))}
        </TableBody>
        {
          props.rows !== null && props.rows.length > 0 && props.hasTotal &&
          <StyledTableRow>
            <StyledTableCell colSpan={props.colSpan || totalIndex() - 1}></StyledTableCell>
            <StyledTableCell>{totalValue?.toFixed(2)}</StyledTableCell>
          </StyledTableRow>
        }
        {props.otherfactorCheck &&
          <>
            <StyledTableRow>
              <StyledTableCell><b>Additional Rate(MD)</b></StyledTableCell>
              {props?.currentpricerequested === 'both' ? <>
                <StyledTableCell>
                  <input type='number'
                    defaultValue={props.allData?.additionalrate}
                    onChange={(e) => props?.AdditionalCharges('currentAdditional', e.target.value)}
                    disabled={props?.enablepriceapprovebutton}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <input type='number'
                    defaultValue={props.allData?.additionalrate}
                    disabled={props?.enablepriceapprovebutton}
                    onChange={(e) => props?.AdditionalCharges('stockAdditional', e.target.value)}
                  /></StyledTableCell> </> :
                props?.currentpricerequested === "Current" ?
                  <StyledTableCell>
                    <input type='number'
                      defaultValue={props.allData?.additionalrate}
                      onChange={(e) => props?.AdditionalCharges('currentAdditional', e.target.value)}
                      disabled={props?.enablepriceapprovebutton}
                    />
                  </StyledTableCell> :
                  <StyledTableCell>
                    <input type='number'
                      defaultValue={props.allData?.additionalrate}
                      disabled={props?.enablepriceapprovebutton}
                      onChange={(e) => props?.AdditionalCharges('stockAdditional', e.target.value)}
                    /></StyledTableCell>}
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell><b>Base Price</b></StyledTableCell>
              {props?.currentpricerequested === "both" ? 
              <>
                <StyledTableCell><b>{props?.currentbaseprice ? parseFloat(props?.currentbaseprice).toFixed(2) : 0.00}</b></StyledTableCell>
                <StyledTableCell><b>{props?.stockbaseprice ? parseFloat(props?.stockbaseprice).toFixed(2) : 0.00}</b></StyledTableCell>
              </> : 
              props?.currentpricerequested === "Current" ?
                <StyledTableCell><b>{props?.currentbaseprice ? parseFloat(props?.currentbaseprice).toFixed(2) : 0.00}</b></StyledTableCell> :
                <StyledTableCell><b>{props?.stockbaseprice ? parseFloat(props?.stockbaseprice).toFixed(2) : 0.00}</b></StyledTableCell>}
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell></StyledTableCell>
              {props?.currentpricerequested === "both" ? <>
                <StyledTableCell><CheckBox checked={props?.current_price_checked} disabled={props?.enablepriceapprovebutton} name='current_price_checked' onChange={(e) => props?.priceChecked('current_price_checked', e.target.checked)} /></StyledTableCell>
                <StyledTableCell><CheckBox checked={props?.stock_price_checked} disabled={props?.enablepriceapprovebutton} name='stock_price_checked' onChange={(e) => props?.priceChecked('stock_price_checked', e.target.checked)} /></StyledTableCell>
              </> :
                props?.currentpricerequested === "Current" ?
                  <StyledTableCell><CheckBox checked={props?.current_price_checked} disabled={props?.enablepriceapprovebutton} name='current_price_checked' onChange={(e) => props?.priceChecked('current_price_checked', e.target.checked)} /></StyledTableCell> :
                  <StyledTableCell><CheckBox checked={props?.stock_price_checked} disabled={props?.enablepriceapprovebutton} name='stock_price_checked' onChange={(e) => props?.priceChecked('stock_price_checked', e.target.checked)} /></StyledTableCell>}
            </StyledTableRow>
          </>
        }
      </Table>
    </TableContainer>
  );
}