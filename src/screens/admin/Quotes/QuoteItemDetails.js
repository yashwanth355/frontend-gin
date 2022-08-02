import React, { useEffect, useState } from 'react';
import Template from '../../../components/Template';
import { Grid } from '@material-ui/core';
import { Typography, Card, CardContent, CardHeader } from '@material-ui/core';
import Button from '../../../components/Button';
import { getFinalisedSamples, getOtherFactorsInfo, getQuoteItemsInfo, getSamplesInfo, getSelectedSamplesForPricing, insertPricingInfo, updateOtherFactorsInfo, updateSamplesInfoForPricing } from '../../../apis';
import AuditLog from "./AuditLog";
import '../../common.css'
import _ from 'lodash';
import { roles } from '../../../constants/roles';
import SimpleStepper from '../../../components/SimpleStepper';
import useToken from '../../../hooks/useToken';
import BasicTable from '../../../components/BasicTable';
import { CheckBox } from '../../../components/CheckBox';
import Snackbar from '../../../components/Snackbar';
import QuoteDetailsComm from './QuoteDetailsComm';

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

const QuoteItemDetails = (props) => {
    const [quoteItemDetails, setQuoteItemDetails] = useState({});
    // eslint-disable-next-line
    const [previousRateData, setpreviousRateData] = useState([]);
    const [tempFactorsList, setTempFactorsList] = useState([{ factors: "", cost: "" }]);
    // eslint-disable-next-line
    const [otherfactors, setOtherfactors] = useState(null);
    const [allOtherFactorsData, setAllOtherFactorsData] = useState(null);
    const [allOtherData, setAllOtherData] = useState(null);
    // eslint-disable-next-line
    const [packingCostingData, setPackingCostingData] = useState(null);
    // eslint-disable-next-line
    const [alternativeData, setAlternativeData] = useState(null);
    const [finalizedsampleData, setfinalizedsampleData] = useState(null);
    const [btnStatus, setBtnStatus] = useState(null);
    // const [previousquoterates, setPreviousquoterates] = useState(null);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // eslint-disable-next-line
    const [loading, setLoading] = useState(false);
    const [redirectQuote, setRedirectQuote] = useState(false);
    const [quoteItems, setQuoteItems] = useState(null);
    const [alternateSamples, setAlternateSamples] = useState(null);
    const [additionalPrices, setAddtionalPrices] = useState([]);
    // eslint-disable-next-line
    const [checkedSample, setCheckedSample] = useState([]);
    // eslint-disable-next-line
    const [defaultSelectedSample, setDefaultSelectedSample] = useState({});

    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails.role;

    const sampleSteps = [
        'Customer Approved',
        'Customer Rejected',
        'GMC Approved',
        'GMC Rejected',
    ];

    const onRedirectToQuote = (item) => {
        setRedirectQuote(true);
        setQuoteItems(item);
    }

    const HideQuoteDetailsHandler = (item) => {
        setRedirectQuote(false);
    }

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
                    // setAlternatesamples(res1?.alternatesamples);
                    // setMastersamples(res1?.mastersamples);
                    // setPreviousquoterates(res1?.previousquoterates);
                    let tempRate = [];
                    // eslint-disable-next-line
                    res1?.previousquoterates?.map((item, index) => {
                        tempRate.push({
                            customer: <div><b>Customer: </b>{item.customer}<br /><b>Final Client: </b>{item.finalclient}</div>,
                            // eslint-disable-next-line 
                            quote_no: <a onClick={() => onRedirectToQuote(item)}>{item.quotationno}</a>,
                            quote_date: formatDate(item.quotationdate),
                            sample: item.samplecode,
                            packingType: item.description,
                            currency: item.currency,
                            final_rate: item.finalbaseprice,
                            inco_terms: item.incoterms
                        });
                    })
                    setpreviousRateData(tempRate);
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

                getFinalisedSamples({
                    "quoteid": res?.quote_id?.toString(),
                    "quotelineid": res?.quotelineitem_number?.toString(),
                    "userid": getCurrentUserDetails()?.id,
                }).then(response => {
                    // eslint-disable-next-line
                    const indx = response?.composition?.findIndex(v => v.confirmedsample === true);
                    let temp = [...additionalPrices];
                    let tamp = null;
                    let temp1 = [];
                    // eslint-disable-next-line
                    response.composition?.map(item => {
                        item.current_price_checked = item.currentpriceapproved === true && item.confirmedsample === true ? true : false;
                        item.stock_price_checked = item.stockpriceapproved === true && item.confirmedsample === true ? true : false;;
                        item.currentbaseprice = parseFloat(item.currentbaseprice).toFixed(2);
                        item.stockbaseprice = parseFloat(item.stockbaseprice).toFixed(2);

                        var currentSum = item?.itemcomposition?.reduce(function (prev, current) { return prev + + current.gccompositionprice }, 0);
                        var stockSum = item?.itemcomposition?.reduce(function (prev, current) { return prev + + parseFloat(current.stockcompositionprice) }, 0);

                        var sumOther = response?.otherfactorcomposition?.reduce(function (prev, current) { return prev + + parseFloat(current.purgcrate) }, 0);

                        item.totalCurrentBasePrice = item?.currentpricerequested === true ? parseFloat(currentSum + sumOther).toFixed(2) : null;
                        item.totalStockBasePrice = item?.stockpricerequested === true ? parseFloat(stockSum + sumOther).toFixed(2) : null;

                        // eslint-disable-next-line
                        item.itemcomposition?.map(item1 => {
                            item1.current_price = item1?.gccomposition + item1?.gccompositionprice;
                            item1.stock_price = item1?.stockcomposition + item1?.stockcompositionprice;
                        })
                        temp.push({ msamplecode: item.msamplecode, currentAdditional: item.additionalrate, stockAdditional: item.additionalrate, totalCurrentBasePrice: item.totalCurrentBasePrice, totalStockBasePrice: item.totalStockBasePrice });

                        if (item?.confirmedsample === true) {
                            tamp = {
                                "quoteid": res?.quote_id?.toString(),
                                "quotelineid": res?.quotelineitem_number,
                                "stockpriceapproved": false, //item?.stock_price_checked,
                                "currentpriceapproved": false, //item?.current_price_checked,
                                "confirmedsample": false,
                                "finalbaseprice": item?.stock_price_checked ? item?.stockbaseprice.toString() : item?.currentbaseprice.toString(),
                                "additionalrate": item.additionalrate.toString(),
                                "msamplecode": item?.msamplecode,
                                "userid": getCurrentUserDetails()?.id,
                                "userrole": getCurrentUserDetails()?.role,
                                "username": getCurrentUserDetails()?.name
                            };
                        }
                    });
                    setAddtionalPrices(temp);
                    setDefaultSelectedSample(tamp);
                    temp1 = response ? response : [];
                    setAlternateSamples(temp1);
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
                    // props.back()
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

    const payload = [
        {
            type: 'label',
            value: "Quote Number",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.quote_number,
            sm: '6'
        },
        {
            type: 'label',
            value: "Destination",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.destination,
            sm: '6'
        },
        {
            type: 'label',
            value: "Sample Code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.sample_code,
            sm: '6'
        },
        {
            type: 'label',
            value: "Currency Code",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.currencycode,
            sm: '6'
        }];

    const payload1 = [
        {
            type: 'label',
            value: "Incoterms",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.incoterms,
            sm: '6'
        },
        {
            type: 'label',
            value: "Coffee Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.coffee_type,
            sm: '6'
        },
        {
            type: 'label',
            value: "Customer Brand Name",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.customerbrand_name,
            sm: '6'
        }
    ];

    const payload2 = [
        {
            type: 'label',
            value: "Is Packaging New Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.isreqnew_packing === 1 ? "Yes" : "No",
            sm: '6'
        }
    ];

    const payload3 = [
        {
            type: 'label',
            value: "New Packaging Type Requirement",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.taskdesc,
            sm: '6'
        },
        {
            type: 'label',
            value: "Task Status (New Packing Type)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.new_packtype_status,
            sm: '6'
        },
    ];

    const payload4 = [
        {
            type: 'label',
            value: "Packing Category",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.category_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Weight",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.weight_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "No of Secondary Packs/Master Carton",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.noofsecondary_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Carton Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.cartontype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Is Palletization Required?",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.palletizationrequire_id === 1 ? "Yes" : "No",
            sm: '6'
        },
        {
            type: 'label',
            value: "Description of Packing Type available in ERP",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.currencyname,
            sm: '6'
        }

    ];

    const payload5 = [
        {
            type: 'label',
            value: "Packing Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.categorytype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Secondary Packing",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.secondary_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "UPC",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.upc_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Cap Type",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.captype_name,
            sm: '6'
        },
        {
            type: 'label',
            value: "Additional Requirements",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.additional_req,
            sm: '6'
        },
    ];

    const payload6 = [
        {
            type: 'label',
            value: "Expected Order Quantity(Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails.expectedorder_kgs,
            sm: '6'
        },
    ];

    const payload7 = [
        {
            type: 'label',
            value: "Base Price (Per KG)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.baseprice,
            sm: '6'
        },
        {
            type: 'label',
            value: "Margin Value",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.margin,
            sm: '6'
        },
        {
            type: 'label',
            value: "Margin (%)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.margin_percentage,
            sm: '6'
        },
        {
            type: 'label',
            value: "Final Price (Per KG)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.final_price,
            sm: '6'
        },
    ];

    const payload8 = [
        {
            type: 'label',
            value: "Negative Margin Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_status,
            sm: '6'
        },
        {
            type: 'label',
            value: "Negative Margin Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_remarks,
            sm: '6'
        },
        {
            type: 'label',
            value: "Negative Margin Reason",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.negativemargin_reason,
            sm: '6'
        }
    ];

    const payload9 = [
        {
            type: 'label',
            value: "Customer Approval Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: !_.isEmpty(quoteItemDetails?.customer_rejectionremarks?.toString()) ?
                quoteItemDetails?.customer_approval === true ? "Approved" : "Rejected" : null,
            sm: '6'
        },
        {
            type: 'label',
            value: "Confirmed Order Quantity (Kgs)",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.confirmed_orderquantity,
            sm: '6'
        }
    ];

    const payload0 = [
        {
            type: 'label',
            value: "Customer Rejection Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.customer_rejectionremarks,
            sm: '6'
        },
    ];

    const payload11 = [
        {
            type: 'label',
            value: "GMC Approval Status",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_approvalstatus,
            sm: '6'
        }];

    const payload12 = [
        {
            type: 'label',
            value: "GMC Rejection Remarks",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_rejectionremarks,
            sm: '6'
        },
    ];
    // eslint-disable-next-line
    const payload13 = [
        {
            type: 'label',
            value: "General Remark",
            bold: true,
            sm: '6'
        },
        {
            type: 'label',
            value: quoteItemDetails?.gms_rejectionremarks,
            sm: '6'
        }
    ];

    const getActiveStep = () => {
        if (quoteItemDetails?.gms_approvalstatus === 'Rejected') {
            return 4;
        } else if (quoteItemDetails?.gms_approvalstatus === 'Approved') {
            return 3;
        } else if (quoteItemDetails?.customer_approval === false) {
            return 2;
        } else if (quoteItemDetails?.customer_approval === true) {
            return 1;
        } else {
            return 0;
        }
    };
    // eslint-disable-next-line
    const previousQuoteSample = [
        { id: "customer", label: "Customer" },
        { id: "quote_no", label: "QT.No" },
        { id: "quote_date", label: "Date" },
        { id: "sample", label: "Sample" },
        { id: "packingType", label: "Packing Type" },
        { id: "currency", label: "Currency" },
        { id: "final_rate", label: "Final Rate" },
        { id: "inco_terms", label: "Inco Terms" }
    ];
    // eslint-disable-next-line
    const alternativeSample = [
        { id: "itemname", label: "Item Name" },
        { id: "convertionratio", label: "Ratio" },
        { id: "percentage", label: "Perc" }
    ];
    const alternativeSampleReceived = [
        { id: "itemname", label: "Item Name" },
        { id: "convertionratio", label: "Ratio" },
        { id: "percentage", label: "Perc" },
        { id: "stockprice", label: "Stock Price" },
        { id: "currentprice", label: "Market Price" },
    ];
    // eslint-disable-next-line
    const packingCostings = [
        { id: "factors", label: "Factors" },
        { id: "rate", label: "Rate From Purchase(Per KG)" },
        { id: "rate_comm", label: "Factor Rate From Commercial (Per KG)" }
    ];

    // eslint-disable-next-line
    const factorTableColumns = [
        { id: 'factorname', label: 'Factors' },
        { id: 'rate', label: 'Cost' },
    ];
    // eslint-disable-next-line
    const FactorAction = () => {

    }
    // eslint-disable-next-line
    const handleFactorCharge = (add, index, charges) => {
        let temp = _.cloneDeep(tempFactorsList);

        if (add) {
            const emptyItemIndex = temp.findIndex(charge => !charge.factors || charge.cost === "");
            if (emptyItemIndex > -1) temp[emptyItemIndex].error = "Item name cannot be empty";
            else {
                temp.push({ factors: "", cost: "" });
            }
        } else {
            temp.splice(index, 1);
        }

        setTempFactorsList(temp);
    }
    // eslint-disable-next-line
    const handleTempFactorChange = (event, key, index) => {
        var value = (key === "cost") ? event.target.value >= 0 ? event.target.value : 0 : event.target.value;
        let temp = _.cloneDeep(tempFactorsList);
        temp[index].error = null;
        temp[index][key] = value;
        setTempFactorsList(temp);
    }

    const onCheckMasterSample = (e, item, type, index) => {
        let temp = [...alternativeData];
        temp[index][type] = !item[type];
        setAlternativeData(temp);
    }

    const onCheckReceived = (e, item, type, index) => {
        let temp = [...alternativeData];
        temp[index][type] = !temp[index][type];
        let tamp = [];
        // eslint-disable-next-line
        temp?.map(item2 => {
            if (item2?.finalizedsample === true) {
                // eslint-disable-next-line
                item2?.data.map(item3 => {
                    tamp.push({
                        alt_msampleid: item3?.alt_msampleid,
                        convertionratio: item3?.convertionratio,
                        currentprice: item3?.currentprice,
                        currentpricerequested: item?.currentpricerequested,
                        finalizedsample: item3?.finalizedsample,
                        itemid: item3?.itemid,
                        itemname: item3?.itemname,
                        msamplecode: item3?.msamplecode,
                        percentage: item3?.percentage,
                        pricingid: item3?.pricingid,
                        stockprice: item3?.stockprice,
                        stockpricerequested: item?.stockpricerequested,
                    });
                })
            }

        });
        setfinalizedsampleData(tamp);
        setAlternativeData(temp);
    }

    const gcConfig = [
        { id: "itemname", label: "Item Name" },
        { id: "yeildratio", label: "Ratio" },
        { id: "percentage", label: "Percentage" },
        { id: "current_price", label: "Current Price (GC * Yeild * Composition%)" },
        { id: "stock_price", label: "Stock Price (GC * Yeild * Composition%)" }
    ];

    const onPriceChecked = (checked, type, index, item) => {
        setCheckedSample(item);
        let temp = { ...alternateSamples };
        // eslint-disable-next-line
        temp.composition.map(item1 => {
            item1.stock_price_checked = false;
            item1.current_price_checked = false;
        });
        // if (type === 'stock_price_checked') {
        temp.composition[index][type] = true;
        // temp.composition[index].current_price_checked = false;
        // } else {
        // temp.composition[index][type] = checked;
        // temp.composition[index].stock_price_checked = false;
        // }
        setAlternateSamples(temp);
    }

    const onAdditionalCharges = (type, val, item, index) => {
        let temp = [...additionalPrices];
        // var indx = temp.findIndex(v => v.msamplecode === item.msamplecode);
        var value = val === '' ? 0 : val;
        temp[index][type] = value;
        setAddtionalPrices(temp);
    }

    return (<>
        {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
        {redirectQuote ? <QuoteDetailsComm back={HideQuoteDetailsHandler} id={quoteItems?.quoteid} /> :
            <>
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
                <Card className="page-header">
                    <CardContent>
                        <Grid container md={12}>
                            <Grid item md={12} xs={12}>
                                {/* {getActiveStep() !== false && */}
                                <SimpleStepper
                                    activeStep={getActiveStep()}
                                    steps={sampleSteps}
                                    quoteSteps={true}
                                    stepClick={(e) => {
                                        console.log("e::", e);
                                    }}
                                ></SimpleStepper>
                                {/* } */}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Quotation & Sample Information</Typography>
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload1} />
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>New Packaging Type Request Details</Typography>
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload2} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload3} />
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Packaging Type Details</Typography>
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload4} />
                    </Grid>
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload5} />
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid item md={12} xs={12} className='item'>
                        <Typography>Expected Order Quantity</Typography>
                    </Grid>
                </Grid>
                <Grid id="top-row" container >
                    <Grid id="top-row" xs={12} md={6} container direction="column">
                        <Template payload={payload6} />
                    </Grid>
                </Grid>
              
                {role === roles.BusinessDevelopmentManager &&
                    <>
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Sample Details</Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid id="top-row" container >
                        <Grid id="top-row" xs={12} md={6} container direction="column">
                            <Template payload={payload14} />
                        </Grid>
                        <Grid id="top-row" xs={12} md={6} container direction="column">
                            <Template payload={payload15} />
                        </Grid>
                    </Grid> */}

                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Previous Quotation Rates For This Sample And Customer</Typography>
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12}>
                                <BasicTable rows={previousRateData} columns={previousQuoteSample}></BasicTable>
                            </Grid>
                        </Grid>

                        {props?.status === 'Base Price Received' ?
                            <Grid id="top-row" container style={{ margin: 1 }}>
                                <Grid item md={11} xs={12} className='item'>
                                    <Typography>Requested Samples</Typography>
                                </Grid>
                                <Grid id="top-row" container >
                                    {alternateSamples?.composition?.map((item, index) => {
                                        var len = alternateSamples?.composition?.length;
                                        var currentpricerequested = (item.currentpricerequested === true && item.stockpricerequested === true) ?
                                            [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Current Price' }, { id: "purgcrate", label: 'Stock Price' }] :
                                            item.currentpricerequested === true ?
                                                [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Current Price' }] :
                                                [{ id: "factorname", label: "Factor" }, { id: "purgcrate", label: 'Stock Price' }];

                                        var currentpricerequestedcheck = (item.currentpricerequested === true && item.stockpricerequested === true) ? 'both' : item.currentpricerequested === true ? 'Current' : 'Stock';

                                        var sumCurrentBase = parseFloat(item?.totalCurrentBasePrice) + parseFloat(additionalPrices[index]['currentAdditional']);
                                        var sumStockBase = parseFloat(item?.totalStockBasePrice) + parseFloat(additionalPrices[index]['stockAdditional']);
                                        console.log('current::', item?.totalCurrentBasePrice, additionalPrices[index]['currentAdditional'], additionalPrices);
                                        return (

                                            <Grid id="top-row" style={{ padding: 12 }} xs={12} md={len > 1 ? 6 : 12} container direction="column">
                                                <Card className="page-header">
                                                    <CardHeader
                                                        title={item?.msamplecode}
                                                        className='cardHeader'
                                                    />
                                                    <Grid>
                                                        <Grid item md={12} xs={12} className='item'>
                                                            <Typography>Green Coffee Configuration & Pricing (USD) </Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item md={12} xs={12} style={{ textAlign: 'center' }}>
                                                        <BasicTable fullwidth={true} rows={item?.itemcomposition} columns={gcConfig}></BasicTable>
                                                    </Grid>
                                                    {/* {item?.stock_price_checked === true && */}
                                                    <>
                                                        <Grid>
                                                            <Grid item md={12} xs={12} className='item'>
                                                                <Typography>Green Coffee & Other Factors Pricing (USD) </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item md={12} xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
                                                            <BasicTable fullwidth={true} rows={alternateSamples?.otherfactorcomposition} columns={currentpricerequested}
                                                                currentpricerequested={currentpricerequestedcheck} allData={item} otherfactorCheck={true} current_price_checked={item?.current_price_checked} stock_price_checked={item?.stock_price_checked} priceChecked={(type, checked) => onPriceChecked(checked, type, index, item)} currentbaseprice={sumCurrentBase} stockbaseprice={sumStockBase} AdditionalCharges={(type, val) => onAdditionalCharges(type, val, item, index)} enablepriceapprovebutton={true} ></BasicTable>
                                                        </Grid>
                                                    </>
                                                </Card>

                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </Grid> :
                            <>
                                <Grid id="top-row" container >
                                    <Grid id="top-row" xs={12} md={12} container direction="column">
                                        <Grid className='item'>
                                            <Typography>List Of Alternative Samples</Typography>
                                        </Grid>
                                        {btnStatus === 'GC Price Received' ?
                                            <Grid id="top-row" container>
                                                <Grid item md={12} xs={12}>
                                                    <Grid id="top-row" style={{ alignItems: 'center', padding: '15px' }} container >
                                                        <Grid item md={2} xs={12} style={{ textAlign: 'center' }}>
                                                            Sample Name
                                                        </Grid>
                                                        <Grid item md={9} xs={12} style={{ textAlign: 'center' }}>
                                                            Alternative Samples
                                                        </Grid>
                                                        <Grid item md={1} xs={12} style={{ textAlign: 'center', display: 'inherit' }}>
                                                            <Typography style={{ textAlign: 'center', width: '33%' }}>Finalized Samples</Typography>
                                                        </Grid>
                                                    </Grid>
                                                    {alternativeData?.map((item, index) => {
                                                        return (
                                                            <>
                                                                {item.checked ?
                                                                    <Grid id="top-row" style={{ alignItems: 'center', padding: '15px' }} container >
                                                                        <Grid item md={2} xs={12} style={{ textAlign: 'center' }}>
                                                                            <Typography>{item.msamplecode}</Typography>
                                                                        </Grid>
                                                                        <Grid item md={9} xs={12} style={{ textAlign: 'center' }}>
                                                                            <BasicTable rows={item.data} columns={alternativeSampleReceived}></BasicTable>
                                                                        </Grid>
                                                                        <Grid item md={1} xs={12} style={{ textAlign: 'center', display: 'inherit' }}>
                                                                            <Typography style={{ textAlign: 'center', width: '33%' }}>
                                                                                <CheckBox checked={item.finalizedsample} onChange={(e) => onCheckReceived(e, item, 'finalizedsample', index)} />
                                                                            </Typography>
                                                                        </Grid>
                                                                    </Grid> :
                                                                    null}
                                                            </>
                                                        )
                                                    })}
                                                </Grid>
                                            </Grid> : <Grid id="top-row" container>
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
                                            </Grid>}
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
                            </>
                        }
                    </>
                }
                {quoteItemDetails?.created_by === getCurrentUserDetails().name &&
                    <>
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Price Information</Typography>
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload7} />
                            </Grid>
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload8} />
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>Customer Approval & Confirmed Order Quantity</Typography>
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload9} />
                            </Grid>
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload0} />
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid item md={12} xs={12} className='item'>
                                <Typography>GMC Approval</Typography>
                            </Grid>
                        </Grid>
                        <Grid id="top-row" container >
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload11} />
                            </Grid>
                            <Grid id="top-row" xs={12} md={6} container direction="column">
                                <Template payload={payload12} />
                            </Grid>
                        </Grid>
                        {/* <Grid id="top-row" container >
                <Grid item md={12} xs={12} className='item'>
                    <Typography>General Remarks</Typography>
                </Grid>
            </Grid>
            <Grid id="top-row" container >
                <Grid id="top-row" xs={12} md={6} container direction="column">
                    <Template payload={payload13} />
                </Grid>
            </Grid> */}

                        <Grid id="top-row" container style={{ margin: 6 }}>
                            <Grid item md={12} xs={12} className="item">
                                <Typography>Audit log information</Typography>
                            </Grid>
                        </Grid>
                        <AuditLog data={quoteItemDetails.audit_log} />
                    </>
                }
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
            </>}
    </>
    );
}
export default QuoteItemDetails;
