import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import Button from '../../../components/Button';
import { getOtherFactorsInfo, getQuoteItemsInfo, getSamplesInfo, getSelectedSamplesForPricing, insertPricingInfo, updateOtherFactorsInfo, updateSamplesInfoForPricing } from '../../../apis';
// eslint-disable-next-line
import AuditLog from "./AuditLog";
import '../../common.css'
import _ from 'lodash';
import { roles } from '../../../constants/roles';
import useToken from '../../../hooks/useToken';
import BasicTable from '../../../components/BasicTable';
import { CheckBox } from '../../../components/CheckBox';
import Snackbar from '../../../components/Snackbar';

const formatDate = (datestr) => {
    let dateVal = datestr ? new Date(datestr) : new Date();
    return (
        dateVal.getDate() +
        "/" +
        (dateVal.getMonth() + 1) +
        "/" +
        dateVal.getFullYear()
    );
};

const QuoteItemDetailsMD = (props) => {
    const [quoteItemDetails, setQuoteItemDetails] = useState({});
    // eslint-disable-next-line
    const [otherfactors, setOtherfactors] = useState(null);
    const [allOtherFactorsData, setAllOtherFactorsData] = useState(null);
    const [allOtherData, setAllOtherData] = useState(null);
    // eslint-disable-next-line
    const [packingCostingData, setPackingCostingData] = useState(null);
    
    const [alternativeData, setAlternativeData] = useState(null);
    // eslint-disable-next-line
    const [finalizedsampleData, setfinalizedsampleData] = useState(null);
    const [btnStatus, setBtnStatus] = useState(null);
    // const [previousquoterates, setPreviousquoterates] = useState(null);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // eslint-disable-next-line
    const [loading, setLoading] = useState(false);

    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails.role;

    useEffect(() => {
        getQuoteItemsInfo({
            "type": "Viewquotelineitem",
            "loggedinuserid": getCurrentUserDetails()?.id,
            "quotelineitem_id": parseInt(props.id)
        }).then(res => {
            setQuoteItemDetails(res);

            getSelectedSamplesForPricing({
                "quoteid": res?.quote_id?.toString(),
                "quotelineid": res?.quotelineitem_number?.toString()
            }).then(res2 => {
                getSamplesInfo({
                    'msampleid': parseInt(res?.msampleid),
                    'quotelineitemid': res.quote_id, //
                    'sampleid': res.sample_id //
                }).then(res1 => {
                   
                    setBtnStatus(res2?.gcpriceStatus === '' ? 'GC Price Requested' : res2?.gcpriceStatus);
                    let altersData = [];
                    if (res2?.gcpriceStatus === 'GC Price Received') {
                        // eslint-disable-next-line
                        res2?.data?.map(item => {
                            var indx = altersData?.findIndex(v => v.msamplecode === item?.msamplecode);

                            if (indx === -1) {
                                altersData.push({
                                    msamplecode: item?.msamplecode, alt_msampleid: item?.alt_msampleid, currentpricerequested: item?.currentpricerequested, finalizedsample: item?.finalizedsample, stockpricerequested: item?.stockpricerequested, checked: true, data: [{
                                        convertionratio: item.convertionratio,
                                        percentage: item.percentage,
                                        stockprice: item.stockprice,
                                        currentprice: item.currentprice,
                                        itemname: item.itemname,
                                        pricingid: item.pricingid,
                                        finalizedsample: item.finalizedsample
                                    }]
                                });
                            } else {
                                altersData[indx].data.push({
                                    convertionratio: item.convertionratio,
                                    percentage: item.percentage,
                                    stockprice: item.stockprice,
                                    currentprice: item.currentprice,
                                    itemname: item.itemname,
                                    pricingid: item.pricingid,
                                    finalizedsample: item.finalizedsample
                                });
                            }
                        })
                    } else {
                        // eslint-disable-next-line
                        res1?.alternatesamples?.map((item, index) => {
                            if (altersData.findIndex(val => item.msamplecode === val.name) === -1) {
                                altersData.push({ name: item?.msamplecode, checked: false, stockpricerequested: false, currentpricerequested: true, data: [] });
                                altersData[altersData.findIndex(val => item.msamplecode === val.name)].data.push(item);
                            } else {
                                altersData[altersData.findIndex(val => item.msamplecode === val.name)].data.push(item);
                            }
                        })

                        if (res2?.data !== null) {
                            // eslint-disable-next-line
                            res2?.data.map(item => {
                                const indx = altersData.findIndex(val => item.msamplecode === val.name);
                                if (indx !== -1) {
                                    altersData[indx].checked = true;
                                    altersData[indx].stockpricerequested = item.stockpricerequested;
                                    altersData[indx].currentpricerequested = item.currentpricerequested;
                                }
                            })
                        }
                    }
                    console.log('altersData::', altersData)
                    setAlternativeData(altersData);
                });
            });

            getOtherFactorsInfo({
                "quotelineitemid": res?.quotelineitem_number?.toString()
            }).then(res2 => {
                let costs = [];
                let temp = [];
                let tamp = [];
                // eslint-disable-next-line
                res2?.map((item, index) => {
                    if (item.factorgroupid === 'FAC-2') {
                        costs.push({ factors: item?.factorname, rate: item?.purgcrate, rate_comm: '-' });
                    } else {
                        temp.push({ factorname: item?.factorname, purgcrate: item?.purgcrate, id: item?.factorid });
                        tamp.push(item);
                    }
                })
                setPackingCostingData(costs);
                setAllOtherFactorsData(temp);
                setAllOtherData(tamp);
            });
        });
        // eslint-disable-next-line 
    }, []);

    useEffect(() => {
        if (allOtherFactorsData !== null) {
            let otherfactorsData = [];
            // eslint-disable-next-line 
            allOtherFactorsData.map((item, index) => {
                otherfactorsData.push({ factorname: item?.factorname, rate: <input type='number' value={item?.purgcrate} onChange={(e) => onChangeRate(e, index)} /> });
            });
            setOtherfactors(otherfactorsData);
        }
        // eslint-disable-next-line 
    }, [allOtherFactorsData]);

    const onChangeRate = (e, index) => {
        let temp = [...allOtherFactorsData];
        const val = e.target.value;
        temp[index].purgcrate = val;
        setAllOtherFactorsData(temp);
    }

    const otherFactorCost = async () => {
        let temp = [];
        // eslint-disable-next-line
        allOtherData?.map(item => {
            var fltr = allOtherFactorsData?.findIndex(val => (item?.factorid === val?.id && val?.purgcrate !== item?.purgcrate));
            if (fltr !== -1) {
                temp.push({
                    "pricedetid": item?.pricedetid,
                    "quotelineitemid": quoteItemDetails?.quote_id.toString(),
                    "factorname": item?.factorname,
                    "commrate": item?.commrate,
                    "purgcrate": allOtherFactorsData[fltr]?.purgcrate,
                    "modifieduserid": getCurrentUserDetails()?.id
                })
            }
        })
        try {
            let response = await updateOtherFactorsInfo(temp);
            if (response) {
                setSnack({
                    open: true,
                    message: "Other Factors Updated Successfully",
                });
                setTimeout(() => {
                    props.back()
                }, 2000)
            }


        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
        finally {
            setLoading(false);
        }


    }

    const requestPrice = async () => {
        let temp = [];
        // eslint-disable-next-line
        alternativeData.map(val => {
            if (val.checked === true) {
                // eslint-disable-next-line
                val.data.map(item => {
                    temp.push({
                        "quoteid": quoteItemDetails?.quote_id?.toString(),
                        "quotelineid": quoteItemDetails.quotelineitem_number,
                        "agentuserid": currentUserDetails?.id,
                        "exporderquantity": quoteItemDetails?.expectedorder_kgs?.toString(),
                        "yieldratio": item.convertionratio,
                        "compositionperc": item.percentage,
                        "createduserid": currentUserDetails?.id,
                        "itemid": item.itemid,
                        "altmssampleid": item.alt_msampleid,
                        'msamplecode': item.msamplecode,
                        "stockpricerequested": val.stockpricerequested,
                        "currentpricerequested": val.currentpricerequested
                    })
                })
            }
        })
        try {
            let response = await insertPricingInfo(temp);
            if (response) {
                setSnack({
                    open: true,
                    message: "Price sent for request successfully",
                });
                setTimeout(() => {
                    props.back()
                }, 2000)
            }


        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
        finally {
            setLoading(false);
        }
    }

    const onfinalizedSample = async () => {
        let temp = [];
        // eslint-disable-next-line
        finalizedsampleData?.map(item => {
            temp.push({
                "modifieduserid": getCurrentUserDetails()?.id,
                "finalizedsample": true,
                "pricingid": item?.pricingid
            })
        });
        try {
            let response = await updateSamplesInfoForPricing(temp);
            if (response) {
                setSnack({
                    open: true,
                    message: "Sample sent successfully",
                });
                setTimeout(() => {
                    props.back()
                }, 2000)
            }


        } catch (e) {
            setSnack({
                open: true,
                message: 'Server Error. Please contact administrator', //e.response?.data
                severity: 'error',
            })
        }
        finally {
            setLoading(false);
        }




    }

    // eslint-disable-next-line
    const packingCostings = [
        { id: "factors", label: "Factors" },
        { id: "rate", label: "Rate From Purchase(Per KG)" },
        { id: "rate_comm", label: "Factor Rate From Commercia`l (Per KG)" }
    ];

    // eslint-disable-next-line
    const factorTableColumns = [
        { id: 'factorname', label: 'Factors' },
        { id: 'rate', label: 'Cost' },
    ];

    const onCheckMasterSample = (e, item, type, index) => {
        let temp = [...alternativeData];
        temp[index][type] = !item[type];
        setAlternativeData(temp);
    }

    return (<>
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        <Card className="page-header">
            <CardHeader
                title=" Quotation Item Details"
                className='cardHeader'
            />
            <CardContent>
                <Grid container md={6}>
                    <Grid item md={3} xs={12} >
                        <Typography variant="h7">Quote Number</Typography>
                        <Typography>{quoteItemDetails.quote_number}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Quote Item Id</Typography>
                        <Typography>{quoteItemDetails.quotelineitem_number}</Typography>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Typography variant="h7">Sample Code</Typography>
                        <Typography>{(quoteItemDetails.sample_code)}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={12} container direction="column">
                <Grid className='item'>
                    <Typography>Requested Samples</Typography>
                </Grid>
                <Grid id="top-row" container>
                    <Grid item md={12} xs={12}>
                        <Grid id="top-row" style={{ alignItems: 'center', padding: '15px' }} container >
                            <Grid item md={2} xs={12} style={{ textAlign: 'center' }}>
                                Sample Name
                            </Grid>
                            <Grid item md={7} xs={12} style={{ textAlign: 'center' }}>
                                Alternative Samples
                            </Grid>
                            <Grid item md={3} xs={12} style={{ textAlign: 'center', display: 'inherit' }}>
                                <Typography style={{ textAlign: 'center', width: '33%' }}>Select Samples</Typography>
                                <Typography style={{ textAlign: 'center', width: '33%' }}>Stock Price</Typography>
                                <Typography style={{ textAlign: 'center', width: '33%' }}>Market Price</Typography>
                            </Grid>
                        </Grid>
                        {alternativeData?.map((item, index) => {
                            return (
                                <Grid id="top-row" style={{ alignItems: 'center', padding: '15px' }} container >
                                    <Grid item md={2} xs={12} style={{ textAlign: 'center' }}>
                                        <Typography>{item.name}</Typography>
                                    </Grid>
                                    <Grid item md={7} xs={12} style={{ textAlign: 'center' }}>
                                        <BasicTable rows={item.data} columns={alternativeSample}></BasicTable>
                                    </Grid>
                                    <Grid item md={3} xs={12} style={{ textAlign: 'center', display: 'inherit' }}>
                                        <Typography style={{ textAlign: 'center', width: '33%' }}>
                                            <CheckBox checked={item.checked} onChange={(e) => onCheckMasterSample(e, item, 'checked', index)} />
                                        </Typography>
                                        <Typography style={{ textAlign: 'center', width: '33%' }}>
                                            <CheckBox disabled={!item.checked} checked={item.stockpricerequested} onChange={(e) => onCheckMasterSample(e, item, 'stockpricerequested', index)} />
                                        </Typography>
                                        <Typography style={{ textAlign: 'center', width: '33%' }}>
                                            <CheckBox disabled={!item.checked} checked={item.currentpricerequested} onChange={(e) => onCheckMasterSample(e, item, 'currentpricerequested', index)} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )
                        })}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        <Grid id="top-row" container >
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Grid className='item'>
                    <Typography>Packing / Pallet Costings</Typography>
                </Grid>
                <Grid id="top-row" container style={{ maxHeight: '550px', overflow: 'auto' }}>
                    <Grid item md={12} xs={12} className='item'>
                        <BasicTable rows={packingCostingData} columns={packingCostings} hasTotal={true} totalColId='rate_comm' ></BasicTable>
                    </Grid>
                </Grid>
            </Grid>
            <Grid id="top-row" xs={12} md={6} container direction="column">
                <Grid className='item'>
                    <Typography>List Of Other Factors Their Costings</Typography>
                </Grid>
                <Grid id="top-row" container style={{ maxHeight: '550px', overflow: 'auto' }}>
                    <BasicTable rows={otherfactors} columns={factorTableColumns} colSpan={4} ></BasicTable>
                </Grid>
                <Grid item style={{ textAlign: 'right' }}>
                    <Button label="Update Other Factors Cost" onClick={() => otherFactorCost()} />
                </Grid>

            </Grid>
        </Grid>

        {/* 
        <Grid id="top-row" container style={{ margin: 6 }}>
            <Grid item md={12} xs={12} className="item">
                <Typography>Audit log information</Typography>
            </Grid>
        </Grid>
        <AuditLog data={quoteItemDetails.audit_log} /> */}

        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
            {role !== roles.managerPurchaseGCQuotes && role !== roles.BusinessDevelopmentManager &&
                <Grid item>
                    <Button label="Edit" onClick={(e) => props.edit("edit_quoteItem", props.id)} />
                </Grid>
            }
            {role === roles.BusinessDevelopmentManager &&
                <Grid item>
                    <Button disabled={btnStatus === 'GC Price Requested' ? false : finalizedsampleData?.length > 0 ? false : true} label={btnStatus === 'GC Price Requested' ? "Save" : 'Update'} onClick={() => btnStatus === 'GC Price Requested' ? requestPrice() : onfinalizedSample()} />
                </Grid>
            }
            <Grid item>
                <Button label="Cancel" onClick={props.back} />
            </Grid>
        </Grid>

    </>
    );
}
export default QuoteItemDetailsMD;