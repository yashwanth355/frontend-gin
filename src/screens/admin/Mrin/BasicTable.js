import React, {  useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { TextField } from '../../../components/TextField'
// import { TextField } from '@material-ui/core';
// import { Input } from "@material-ui/core";

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
      '& .MuiOutlinedInput-input':{
        padding: '10px 14px'
      },
         
    },
  }))(TableRow);

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    container:{
      width: '95%'
    }
});

export default function BasicTable(props) {
    const classes = useStyles();
   
    const total = () => {
      return props.rows?.map(row => parseInt(row[props.totalColId] ? row[props.totalColId] : 0)).reduce((sum, i) => sum + i, 0);                       
    } 
    
    const totalIndex = () => {
      return props.columns.findIndex(item => item.id === props.totalColId);    
    }  

    const [totalValue, setTotalValue] = useState(total())

      

    const EditableCell = (data) => {
        
        const [value, setValue] = useState(data.initialValue)
      
        const onChange = e => {
            setValue(e.target.value)
            // updateMyData(data.index, data.id, e.target.value)
        }
        
        // const onClick = e => {
        //   props.handler.handleClick(props.index);                               
        // }
      
        // We'll only update the external data when the input is blurred
        const onBlur = (e) => {
          // if(e.keyCode === 9){
            updateMyData(data.index, data.id, value);
          // }          
        }

        // const getTabKey = (e) => {
        //   if (e.key === "Tab") {
        //     e.preventDefault();
        //     console.log('tab::', props)
        //     editableKeyToFocus.current = props.index + 1;
        //   }
       
        // }
      
        // If the initialValue is changed external, sync it up with our state 
        useEffect(() => {
          setValue(data.initialValue)  
          const totalVal = total();
          setTotalValue(totalVal);                  
        }, [data.initialValue])

        //  <TextField value={value} autoFocus={true} key={props.index} onChange={onChange} onBlur={onBlur} type={props.type} /> 

        return <TextField value={value} onChange={onChange} onBlur={onBlur} type={props.type} />
        
        //  return  <Input
        //             type='number'
        //             value={value}
        //             autoFocus={true}
        //             onChange={onChange}
        //             onKeyDown={onBlur}
        //             // onBlur={onBlur}
        //           />
      }

      const updateMyData = (rowIndex, columnId, value) => {
        // eslint-disable-next-line
        props.rows.map((row, index) => {
          if (index === rowIndex) {
            row[columnId] = value;
            row['difference'] = row['expected_spec'] - row['delivered_spec'];
          }
        })
        props.onUpdate && props.onUpdate(props.rows);          
      }
     
    return (
        <TableContainer component={Paper} className={classes.container}>
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
                <TableBody style={{backgroundColor: '#fff'}}>
                    {(props.rows === undefined && props.rows === null && props.rows.length === 0) ? <p><b>No Records</b></p> : props.rows?.map((row, index) => (
                        <StyledTableRow key={row.name}>
                            {props.columns.map((column) => {
                                const value = row[column.id] !== '' ? row[column.id] : '-';                                
                                return (
                                    <StyledTableCell key={column.id} align={column.align}>                                        
                                        {column.isEditable === true ? <EditableCell rows={props.rows} initialValue={value} index={index} id={column.id} type={column.type} label={column.label} handler={column.handler} />  : value}
                                    </StyledTableCell>
                                )                                
                            })}
                        </StyledTableRow>
                    ))}
                </TableBody>
                {                  
                    props.rows !== null && props.rows.length > 0 && props.hasTotal && 
                    <StyledTableRow>                    
                    <StyledTableCell colSpan={totalIndex() - 1}></StyledTableCell>
                    <StyledTableCell>{totalValue}</StyledTableCell>
                  </StyledTableRow>
                }
            </Table>
        </TableContainer>
    );
}
