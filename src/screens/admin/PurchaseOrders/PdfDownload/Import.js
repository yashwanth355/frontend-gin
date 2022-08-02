import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import Logo from "../../../../assets/images/logo_pdf.png";
import _ from 'lodash';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingBottom: 40,
        // fontFamily: "OpenSans"
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid #000',
    },
    text: {
        fontSize: "10px",
        textAlign: 'center',
        fontWeight: 'light',
    },
    podetails: {
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 5,
        justifyContent: 'center',
    },
    textregular: {
        fontSize: "8px",
        lineHeight: 1.3,
        // fontFamily: 'OpenSans'
    },
    description: {
        paddingHorizontal: 5
    },
    table: {
        width: '100%',
        marginVertical: 5,
        border: '1px solid black',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        borderTop: '1px solid black',
    },
    headerTable: {
        borderTop: 'none',
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    // So Declarative and unDRY 👌
    row21: {
        width: '20%',
        borderRight: "1px solid black",
        paddingVertical: 5,
        textAlign: 'center'
    },
    row22: {
        width: '20%',
        borderRight: "1px solid black",
        paddingVertical: 5,
        textAlign: 'center'
    },
    row23: {
        width: '20%',
        borderRight: "1px solid black",
        paddingVertical: 5,
        textAlign: 'center'
    },
    row24: {
        width: '40%',
        borderRight: "1px solid black",
        paddingVertical: 5,
        textAlign: 'center'
    },
    row1: {
        width: '50%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },
    row2: {
        width: '10%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },
    row3: {
        width: '10%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },
    row4: {
        width: '10%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },
    row5: {
        width: '10%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },
    row6: {
        width: '10%',
        borderRight: "1px solid black",
        paddingVertical: 8,
        textAlign: 'center'
    },

});

// Create Document Component
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


const fullMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const formatDateSignature = (datestr) => {
    let dateVal = new Date(datestr);
    return (
        dateVal.getDate() +
        " " +
        fullMonths[dateVal.getMonth()] +
        " " +
        dateVal.getFullYear()
    );
};

const months = [
    "Jan",
    "Feb",
    "March",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
];

const formatShipment = (datestr) => {
    let dateVal = new Date(datestr);
    return months[dateVal.getMonth()] + "-" + dateVal.getFullYear();
};  
const CustomText = (props) => {
    return <Text style={[styles.textregular, props.style]}>{props.children}</Text>
}
const KeyValue = (props) => {
    return (
        <View style={[{ display: 'flex', flexDirection: 'row' }, props.style]}>
            <CustomText style={{ marginRight: "10px", fontFamily: 'Helvetica-Bold', flex: 1, lineHeight: '1.5' }}>{props.label}</CustomText>
            <CustomText style={{ flex: 1, lineHeight: '1.5' }}>{props.value}</CustomText>
        </View >
    )
}
const Conditions = (props) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 5 }}>
            <CustomText style={{
                marginRight: 20, lineHeight: 1.3, fontWeight: '600',
                width: '25%', fontFamily: 'Helvetica-Bold',
            }}>{props.label}</CustomText>
            <CustomText style={{ marginRight: 20, lineHeight: 1.3, paddingLeft: 5, width: '75%' }}>
                {props.value}</CustomText>
        </View>
    )
}
const Documents = (props) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', marginLeft: 10 }}>
            <CustomText style={{ fontFamily: 'Helvetica-Bold', lineHeight: 1.3, textAlign: 'center', marginRight: 5 }}>{props.label}</CustomText>
            <CustomText style={{ marginTop: '0px', lineHeight: 1.3, fontSize: '8px' }}>
                {props.value}</CustomText>
        </View >
    )
}
const getDocumentsRequired = (documents) => {
    const requiredDocs = [...new Set(documents.filter(document => document.required)?.map(doc => doc?.doc_kind))]
    return requiredDocs?.map((document, index) => <Documents label={index + 1} value={_.toUpper(document)} />)
}
const ReportTable = ({ data, maximumDays }) => {
    return (
        <View style={styles.table}>
            <View style={[styles.row, styles.bold, styles.headerTable]}>
                <CustomText style={[styles.row1, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>QUALITY</CustomText>
                <CustomText style={[styles.row2, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>BAGS / NOS</CustomText>
                <CustomText style={[styles.row3, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>BAGS WT</CustomText>
                <CustomText style={[styles.row4, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>BAGS WT KGS</CustomText>
                <CustomText style={[styles.row5, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>RATE / KG USD</CustomText>
                <CustomText style={[styles.row6, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>AMOUNT USD</CustomText>
            </View>
            {data.map((row, i) => (
                <View key={i} style={styles.row} wrap={false}>
                    <CustomText style={styles.row1}>
                        {row.quality}
                    </CustomText>
                    <CustomText style={styles.row2}>{row.bags}</CustomText>
                    <CustomText style={styles.row3}>{row.wt}</CustomText>
                    <CustomText style={styles.row4}>
                        {row.netkgs}
                    </CustomText>
                    <CustomText style={styles.row5}>
                        {row.ratekgs}
                    </CustomText>
                    <CustomText style={styles.row6}>
                        {row.amount}
                    </CustomText>
                </View>
            ))}
        </View >
    )
}
const CoffeeTable = ({ data, maximumDays }) => {
    return (
        <View style={styles.table}>
            <View style={[styles.row, styles.bold, styles.headerTable]}>
                <CustomText style={[styles.row21, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>CONTRACT NO</CustomText>
                <CustomText style={[styles.row22, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>ORIGIN</CustomText>
                <CustomText style={[styles.row23, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>NO OF CONTAINER</CustomText>
                <CustomText style={[styles.row24, { textAlign: 'center', fontFamily: 'Helvetica-Bold', paddingHorizontal: '5', display: 'flex', textWrap: 'wrap', fontSize: 8 }]}>SHIPMENT</CustomText>
            </View>
            {data.map((row, i) => (
                <View key={i} style={styles.row} wrap={false}>
                    <CustomText style={styles.row21}>
                        {row.contract}
                    </CustomText>
                    <CustomText style={styles.row22}>{row.origin}</CustomText>
                    <CustomText style={styles.row23}>{row.container + ' X ' + row.container_type}</CustomText>
                    <CustomText style={styles.row24}>
                        {row.shipment}
                    </CustomText>
                </View>
            ))}

        </View >
    )
}
const MyDocument1 = (props) => {
    const { purchaseDetails, documents } = props;
    return (
        <Document>
            <Page style={styles.section} size={"A4"}>
                <View style={styles.header}>
                    <View style={{ marginHorizontal: "4px" }}>
                        <Image src={Logo} style={{ height: "60px", width: "60px" }} alt="logo" />
                    </View>
                    <View style={{ padding: "5px", width: '90%', margin: '0 auto', alignItems: 'center' }}>
                        <Text style={{ fontSize: "15px", fontFamily: 'Helvetica-Bold', width: '100%', textAlign: 'center', marginBottom: 5 }}>CCL PRODUCTS (INDIA) LIMITED </Text>
                        <View style={{ width: '80%', whiteSpace: 'pre-line' }}>
                            <CustomText style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center', fontSize: '10px' }}>
                                {_.upperCase(purchaseDetails?.delivery_at_addressline1)}
                            </CustomText>
                            <CustomText style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center', fontSize: '10px' }}>
                                {[_.upperCase(purchaseDetails?.delivery_at_addressline2), _.upperCase(purchaseDetails?.delivery_zipcode)]?.filter(Boolean).join(', ')}
                            </CustomText>
                            <CustomText style={{ fontFamily: 'Helvetica-Bold', textAlign: 'center', fontSize: '10px' }}>
                                {[_.upperCase(purchaseDetails?.delivery_state), _.upperCase(purchaseDetails?.delivery_country)]?.filter(Boolean).join(', ')}
                            </CustomText>
                        </View>

                        <Text style={[styles.text, { fontFamily: 'Helvetica-Bold', textAlign: 'center' }]}>CIN : L15110AP1961PLC000874</Text>
                    </View>
                    <CustomText>
                        QFR/PUR/001
                    </CustomText>
                </View>

                <View style={styles.podetails}>
                    <Text style={{
                        fontFamily: 'Helvetica-Bold', alignSelf: 'center', letterSpacing: '8px',
                        textDecoration: 'underline',
                        marginBottom: 5,
                    }}>CONTRACT</Text>
                    <View style={{ flexDirection: 'row', display: 'flex', marginVertical: 3, }}>
                        <View style={{ flex: 1, padding: 5, }}>
                            <Text style={[styles.textregular, {
                                textTransform: 'uppercase', width: 'auto', lineHeight: '1.3',
                                fontFamily: 'Helvetica-Bold', textDecoration: 'underline'
                            }]}>
                                SELLER / EXPORTER
                            </Text>
                            <CustomText style={{
                                textTransform: 'capitalize', lineHeight: '1.3', marginTop: '10px',
                            }}>
                                {_.upperCase(purchaseDetails.supplier_name)}
                            </CustomText>
                            {/* <View style={{ display: "flex", flexDirection: "row", width: "60%" }}> */}
                                {/* <CustomText style={{ textTransform: 'capitalize', lineHeight: '1.3', fontSize: '8px' }}> */}
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
                                                fontFamily: "Helvetica-Bold",
                                            },
                                        ]}
                                    >
                                        PAN No. {purchaseDetails.supplier_panno}
                                    </CustomText>
                                    <CustomText
                                        style={[
                                            styles.textregular,
                                            {
                                                textTransform: "uppercase",
                                                width: "auto",
                                                lineHeight: "1.3",
                                                fontFamily: "Helvetica-Bold",
                                            },
                                        ]}
                                    >
                                        GST no.: {purchaseDetails.supplier_gstno}
                                    </CustomText>
                                    {/* {_.upperCase(purchaseDetails?.supplier_address)} */}
                                {/* </CustomText> */}
                            {/* </View> */}
                            {/* <CustomText >Phone: +65 6533-2092 </CustomText>
                            <CustomText>Mobile: +31 650207955 </CustomText> */}
                            <CustomText>{purchaseDetails?.supplier_email}</CustomText>
                        </View>
                        <View style={{ flex: 1, paddingLeft: 80 }}>
                            <KeyValue label={"CONTRACT NO"} value={purchaseDetails.contract ? purchaseDetails.contract : '-'} />
                            <View style={{ lineHeight: '1.3', display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
                                <CustomText style={{ marginRight: "10px", fontFamily: 'Helvetica-Bold', flex: 1 }}>CONTRACT DATE</CustomText>
                                <CustomText style={{ flex: 1, }}>{purchaseDetails.po_date ? formatDate(purchaseDetails.po_date) : '-'}</CustomText>
                            </View>
                            <KeyValue label={"CONTRACT TYPE"} value={"C&F"} />
                            <KeyValue label={"FORWARDING"} value={purchaseDetails.forwarding ? purchaseDetails.forwarding : '-'} />
                            <KeyValue label={"PORT OF LOADING"} value={purchaseDetails.ports ? purchaseDetails.ports : '-'} />
                            <KeyValue label={"DESTINATION"} value={purchaseDetails.destination_port_name ? purchaseDetails.destination_port_name : '-'} />
                            <KeyValue label={"INSURENCE"} value={purchaseDetails.insurance ? purchaseDetails.insurance : '-'} />
                        </View>
                    </View>
                </View>
                <View>
                    <Text style={[styles.textregular, { textTransform: 'uppercase', marginTop: '15px', marginBottom: '3px', width: 'auto', lineHeight: '1.3', fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }]}>
                        PRODUCT: GREEN COFFEE BEANS
                    </Text>
                    <ReportTable data={[{
                        quality: purchaseDetails?.item_name, bags: purchaseDetails?.no_of_bags,
                        wt: purchaseDetails?.total_quantity, netkgs: purchaseDetails?.net_weight,
                        ratekgs: purchaseDetails?.purchase_price,
                        amount: purchaseDetails?.grossPrice,
                    }]} />
                </View>

                <View>
                    <Text style={[styles.textregular, { textTransform: 'uppercase', marginTop: '15px', marginBottom: '3px', width: 'auto', lineHeight: '1.3', fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }]}>
                        SHIPMENT
                    </Text>
                    <CoffeeTable data={[{
                        contract: purchaseDetails.contract, origin: purchaseDetails.origin,
                        container: purchaseDetails.no_of_containers !== '' ? parseInt(purchaseDetails.no_of_containers) : 0,
                        container_type: purchaseDetails.container_type !== '' ? purchaseDetails.container_type : 0,
                        shipment: formatShipment(purchaseDetails.po_date),
                    }]} />
                </View>

                <View style={{ width: '70%' }}>
                    <Conditions
                        label={"PAYMENT TERMS"} value={purchaseDetails.payment_terms} />
                    <Conditions
                        label={"SPECIAL CLAUSES"} value={purchaseDetails.comments} />
                    <Conditions
                        label={"OTHER TERMS"} value={`shipment in ${purchaseDetails.no_of_bags} kg bags`} />
                </View>

                <View>
                    <CustomText style={{ textTransform: 'uppercase', marginTop: '15px', marginBottom: '3px', width: 'auto', lineHeight: '1.3', fontFamily: 'Helvetica-Bold', textDecoration: 'underline' }}>
                        DOCUMENTS REQUIRED:
                    </CustomText>
                    {getDocumentsRequired(documents)}
                </View>

                <View style={{ position: 'absolute', bottom: 40, display: 'flex', flexDirection: 'row', marginHorizontal: 20 }} fixed>
                    <View style={{ width: '30%', borderTop: '1px solid #333' }}>
                        <CustomText style={{ fontFamily: 'Helvetica-Bold', marginBottom: '10px', paddingTop: '5px', textAlign: 'center' }}>BUYER</CustomText>
                        <CustomText style={{ fontFamily: 'Helvetica-Bold' }}>CCL PRODUCTS(INDIA) LIMITED</CustomText>
                        <CustomText>DT. {purchaseDetails.po_date ? formatDateSignature(purchaseDetails.po_date) : '-'}</CustomText>
                    </View>

                    <View style={{ width: '40%' }}></View>

                    <View style={{ width: '30%', borderTop: '1px solid #333' }}>
                        <CustomText style={{ fontFamily: 'Helvetica-Bold', marginBottom: '10px', paddingTop: '5px', textAlign: 'center' }}>SELLER</CustomText>
                        <CustomText style={{ fontFamily: 'Helvetica-Bold', textAlign: 'right' }}>{_.upperCase(purchaseDetails.supplier_name)}</CustomText>
                        <CustomText style={{ textAlign: 'right' }}>DT. {purchaseDetails.po_date ? formatDateSignature(purchaseDetails.po_date) : '-'}</CustomText>
                    </View>

                </View>

            </Page>
        </Document >)
}
export default MyDocument1;