import React from 'react'
// import { DatePicker } from 'antd';
// import classes from './home.module.css';
// import _ from 'lodash';
// import { colors } from '../../../../constants/colors';
// import axios from 'axios';
const Home = () => {
    // const [confirmedOrders, setConfirmedOrders] = useState([]);
    // const { RangePicker } = DatePicker;

    // useEffect(() => {
    //     const fetchConfirmedOrders = () => {
    //         axios.get("http://k8s-develope-leapfrog-6e0891b4e1-1182481187.ap-south-1.elb.amazonaws.com/gin-dev-getconfirmedorders", {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': '*',
    //             },
    //         }).then((response) => { return response.data })
    //             .then(response => {
    //                 console.log('Response fetched is', response);
    //                 let tempConfirmedOrders = response?.map(order => {
    //                     return {
    //                         "S. No.": order?.SerialNo,
    //                         "Contract No.": order?.ContactNo,
    //                         "Customer Name": order?.CustomerName,
    //                         "Marketing Rep.": order?.MarketingRep,
    //                         "Product Type": order?.ProductCode,
    //                         "Packing Type": order?.PackingType,
    //                         "Sample Code": order?.SampleCode,
    //                         "Brand Name": order?.BrandName,
    //                         "Destination": order?.Destination,
    //                         "Incoterms": order?.InCoterms,
    //                         "Quantity (Kg)": order?.Quantity,
    //                         "Price ($/Kg)": order?.Price,
    //                         "Value ($)": order?.Value

    //                     }
    //                 });
    //                 setConfirmedOrders(tempConfirmedOrders);
    //             })
    //             .catch((err) => {
    //                 console.log("Error is", err)
    //             });
    //     }
    //     fetchConfirmedOrders();
    // }, [])
    // const fetchColumns = (cols) => {
    //     return cols.map((col, index) => {
    //         return {
    //             title: () => <b>{_.toUpper(col)}</b>, dataIndex: col, key: col, width: 150, ellipsis: true,
    //             render: (text) => {
    //                 if (index === 0) {// eslint-disable-next-line
    //                     return <a href="#">{text}</a>
    //                 }
    //                 else return text
    //             }
    //         }
    //     })
    // }
    // const cols1 = fetchColumns(["S. No.", "Contract No.", "Customer Name", "Marketing Rep.", "Product Type", "Sample Code", "Packing Type", "Brand Name", "Destination", "Incoterms", "Quantity (Kg)", "Price ($/Kg)", "Value ($)"])
    // const cols2 = fetchColumns(["Contract Date", "Purchase Order No.", "Purchase Order Date"])
    // const cols3 = fetchColumns(["Net Wt.(g)", "Units per Carton", "No. of Cartons", "No. Of Units",
    //     "Order Scheduled Date", "Requested Dispatch Date",
    //     "Production Scheduled Date", "Ready for Dispatch Date",
    //     "Dispatched Date", "Status",
    //     "Dispatched Plant", "Product Description"])
    // const data1 = [{
    //     "S. No.": 1,
    //     "Contract No.": 121212,
    //     "Customer Name": "Acme Corp",
    //     "Marketing Rep.": "Rohith",
    //     "Product Type": "Green Coffee",
    //     "Sample Code": "S-123",
    //     "Packing Type": "P-1234",
    //     "Brand Name": 'Continental Coffee',
    //     "Destination": "Africa",
    //     "IncoTerms": "Terms",
    //     "Quantity (Kg)": 12343,
    //     "Price ($/Kg)": "123",
    //     "Value ($)": '1231',
    // },
    // {
    //     "S. No.": 2,
    //     "Contract No.": 12121212,
    //     "Customer Name": "Acme Corp 2",
    //     "Marketing Rep.": "Ramesh",
    //     "Product Type": "Green Coffee",
    //     "Sample Code": "S-223",
    //     "Packing Type": "P-123434",
    //     "Brand Name": 'Continental Coffee',
    //     "Destination": "Antarctica",
    //     "IncoTerms": "Terms 2",
    //     "Quantity (Kg)": 12312,
    //     "Price ($/Kg)": "6453",
    //     "Value ($)": '345',
    // },
    // {
    //     "S. No.": 2,
    //     "Contract No.": 12121212,
    //     "Customer Name": "Acme Corp 2",
    //     "Marketing Rep.": "Ramesh",
    //     "Product Type": "Green Coffee",
    //     "Sample Code": "S-223",
    //     "Packing Type": "P-123434",
    //     "Brand Name": 'Continental Coffee',
    //     "Destination": "Antarctica",
    //     "IncoTerms": "Terms 2",
    //     "Quantity (Kg)": 12312,
    //     "Price ($/Kg)": "6453",
    //     "Value ($)": '345',
    // },
    // {
    //     "S. No.": 4,
    //     "Contract No.": 12121212,
    //     "Customer Name": "Acme Corp 2",
    //     "Marketing Rep.": "Ramesh",
    //     "Product Type": "Green Coffee",
    //     "Sample Code": "S-223",
    //     "Packing Type": "P-123434",
    //     "Brand Name": 'Continental Coffee',
    //     "Destination": "Antarctica",
    //     "IncoTerms": "Terms 2",
    //     "Quantity (Kg)": 12312,
    //     "Price ($/Kg)": "6453",
    //     "Value ($)": '345',
    // },
    // ]
    // const data2 = [{
    //     "Contract Date": '12/10/2021',
    //     "Purchase Order No.": "PO-1234",
    //     "Purchase Order Date": '15/10/2021'
    // },
    // {
    //     "Contract Date": '12/10/2021',
    //     "Purchase Order No.": "PO-1234",
    //     "Purchase Order Date": '15/10/2021'
    // },
    // {
    //     "Contract Date": '12/10/2021',
    //     "Purchase Order No.": "PO-1234",
    //     "Purchase Order Date": '15/10/2021'
    // },
    // {
    //     "Contract Date": '12/10/2021',
    //     "Purchase Order No.": "PO-1234",
    //     "Purchase Order Date": '15/10/2021'
    // },]
    // const data3 = [{
    //     "Net Wt.(g)": "100gm", "Units per Carton": "22", "No. of Cartons": "3", "No. Of Units": "66",
    //     "Order Scheduled Date": '12/10/2021', "Requested Dispatch Date": '15/10/2021',
    //     "Production Scheduled Date": "14/10/2021", "Ready for Dispatch Date": "13/10/2021",
    //     "Dispatched Date": '13/10/2021', "Status": "Pending",
    //     "Dispatched Plant": "Duggirala", "Product Description": "Description"
    // },
    // {
    //     "Net Wt.(g)": "100gm", "Units per Carton": "22", "No. of Cartons": "3", "No. Of Units": "66",
    //     "Order Scheduled Date": '12/10/2021', "Requested Dispatch Date": '15/10/2021',
    //     "Production Scheduled Date": "14/10/2021", "Ready for Dispatch Date": "13/10/2021",
    //     "Dispatched Date": '13/10/2021', "Status": "Pending",
    //     "Dispatched Plant": "Duggirala", "Product Description": "Description"
    // }, {
    //     "Net Wt.(g)": "100gm", "Units per Carton": "22", "No. of Cartons": "3", "No. Of Units": "66",
    //     "Order Scheduled Date": '12/10/2021', "Requested Dispatch Date": '15/10/2021',
    //     "Production Scheduled Date": "14/10/2021", "Ready for Dispatch Date": "13/10/2021",
    //     "Dispatched Date": '13/10/2021', "Status": "Pending",
    //     "Dispatched Plant": "Duggirala", "Product Description": "Description"
    // }]
    // const data = [
    //     {
    //         key: '1',
    //         name: 'John Brown',
    //         age: 32,
    //         address: 'New York No. 1 Lake Park',
    //         tags: ['nice', 'developer'],
    //     },
    //     {
    //         key: '2',
    //         name: 'Jim Green',
    //         age: 42,
    //         address: 'London No. 1 Lake Park',
    //         tags: ['loser'],
    //     },
    //     {
    //         key: '3',
    //         name: 'Joe Black',
    //         age: 32,
    //         address: 'Sidney No. 1 Lake Park',
    //         tags: ['cool', 'teacher'],
    //     },
    // ];
    return (
        <div style={{ width: '100%', height: "100%", padding: 5, }}>
            <iframe
                title="quicksight-dashboard"
                style={{ height: "100%", width: "100%" }}
                src="https://ap-south-1.quicksight.aws.amazon.com/sn/embed/share/accounts/473666746939/dashboards/98ad3ceb-f025-4aac-8969-0e70401829a8?directory_alias=ccldashboard">
            </iframe>
            {/* <section className={classes.filters}>https://ap-south-1.quicksight.aws.amazon.com/sn/embed/share/accounts/473666746939/dashboards/dfd6bd10-b677-47ad-a941-416cd98145db?directory_alias=ccldashboard
                <div className={classes.datefilter}>
                    <RangePicker />
                    <section className={classes.button}>
                        <Button type='primary' style={{ backgroundColor: colors.orange, border: `1px solid ${colors.orange}` }}>
                            Apply
                        </Button>
                        <Button style={{ color: colors.orange, border: `1px solid ${colors.orange}` }}>
                            Clear
                        </Button>
                    </section>
                </div>
                <Radio.Group >
                    <Radio.Button value="Week">Week to Date</Radio.Button>
                    <Radio.Button value="Month">Month to Date</Radio.Button>
                    <Radio.Button value="Year">Year to Date</Radio.Button>
                </Radio.Group>
            </section>
            <div style={{
                display: 'flex', width: '100%',
                flexDirection: 'row',
            }}>
                <div className={`${classes.tableWrapper} ${classes.flex2}`}>
                    <section className={classes.tableheader}>
                        <h2 style={{ color: colors.orange }}>
                            Confirmed Orders
                        </h2>
                    </section>
                    <Table columns={cols1} dataSource={confirmedOrders} size="small"
                        scroll={{ x: 500, y: 200 }} className={classes.table}
                        onHeaderRow={(columns, index) => {
                            console.log("Columns are", columns, index);
                        }} />
                </div>
                <div className={classes.tableWrapper}>
                    <section className={classes.tableheader}>
                        <h2 style={{ color: colors.orange }}>
                            Purchases against Orders
                        </h2>
                    </section>
                    <Table columns={cols2} dataSource={data2} scroll={{ x: 500, y: 200 }} size='small' className={classes.table} />
                </div>
            </div >
            <div className={classes.tableWrapper}>
                <section className={classes.tableheader}>
                    <h2 style={{ color: colors.orange }}>
                        Production Planning Logistics
                    </h2>
                </section>
                <Table columns={cols3} dataSource={data3} className={classes.table} size='small' scroll={{ x: 500, y: 200 }} />
            </div> */}
        </div >
    )
}

export default Home
