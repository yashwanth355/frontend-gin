import _ from 'lodash'
import { updateGCPurchaseOrders } from '../../../apis'

export default class PurchaseOrderActions {

    constructor(purchaseDetails, setPurchaseDetails, validationError, setValidationError, taxList, otherChargesList, dispatchTableData, setValidationModal, setErrorValidationMessage, documents, setLoading, setSnack, setEdit) {
        this.purchaseDetails = purchaseDetails;
        this.setPurchaseDetails = setPurchaseDetails;
        this.validationError = validationError;
        this.setValidationError = setValidationError;
        this.taxList = taxList || [];
        this.otherChargesList = otherChargesList || [];
        this.dispatchTableData = dispatchTableData;
        this.setValidationModal = setValidationModal;
        this.setErrorValidationMessage = setErrorValidationMessage;
        this.documents = documents;
        this.setLoading = setLoading;
        this.setSnack = setSnack;
        this.setEdit = setEdit;
    }

    calculatePurchasePrice(terminalRate, differentialRate) {
        return parseFloat(terminalRate || 0) + parseFloat(differentialRate || 0);
    }

    calculateGrossPrice = (purchasePrice, qty) => {
        return parseFloat(purchasePrice || 0) * parseFloat(qty || 0) / 1000;
    }

    calculateTotalPriceImport = (grossPrice, taxes) => {
        let otherCharges = (this.otherChargesList)?.reduce((total, current) => {
            total = total + parseFloat(current.total_tax_rate || 0);
            return total;
        }, 0)
        return parseFloat(grossPrice || 0) + parseFloat(taxes || 0) + parseFloat(otherCharges || 0);
    }
    calculateTotalPrice(data) {
        const otherCharge = (this.otherChargesList).reduce((total, current) => {
            total = total + parseFloat(current.total_tax_rate || 0);
            return total;
        }, 0)
        const purPrice = data?.purchase_price;
        const amount = parseFloat(purPrice || 0) * (this.purchaseDetails.supplier_type_id === "1001" ? (parseFloat(data.total_quantity || 0) / 1000) : parseFloat(data.total_quantity || 0));
        const tdsDeductedPrice = (amount - (amount * parseFloat(data?.tds || 0) / 100));
        const tax = parseFloat(this.taxList.reduce((total, currentValue) => total = total + currentValue.perc, 0));
        const taxedPrice = (tdsDeductedPrice + (tdsDeductedPrice * tax / 100));
        return taxedPrice + parseFloat(otherCharge);
    }
    calculatePOMargin = (marketPrice, purchasePrice) => {
        return parseFloat(marketPrice) - parseFloat(purchasePrice);
    }

    getTerminalValue(purchaseType, fixedTerminal, bookedTerminal) {
        if (purchaseType === "Fixed") {
            return fixedTerminal
        }
        else if (purchaseType === "Differential" && !_.isEmpty(fixedTerminal))
            return fixedTerminal
        else return bookedTerminal;
    }

    handleTerminalRateChange(event, key) {
        const marketPrice = event.target.value >= 0 ? event.target.value : 0;
        const purchaseType = this.purchaseDetails?.purchase_type;
        const fixedTerminalValue = key === "fixed_terminal_rate" ? event.target.value : this.purchaseDetails?.fixed_terminal_rate;
        const bookedTerminalValue = key === "booked_terminal_rate" ? event.target.value : this.purchaseDetails?.booked_terminal_rate;
        const purchasePrice = this.calculatePurchasePrice(this.getTerminalValue(purchaseType, fixedTerminalValue, bookedTerminalValue),
            purchaseType === "Fixed" ? this.purchaseDetails?.fixed_differential :
                this.purchaseDetails?.booked_differential);
        const grossPrice = this.calculateGrossPrice(purchasePrice, this.purchaseDetails?.total_quantity);
        const totalPrice = this.calculateTotalPriceImport(grossPrice, this.purchaseDetails?.taxes);
        const poMargin = this.calculatePOMargin(marketPrice, purchasePrice);
        let data = {
            ...this.purchaseDetails,
            "purchase_price": purchasePrice,
            "market_price": marketPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "totalPrice": totalPrice,
            [key]: event.target.value
        }
        this.setPurchaseDetails(data);
    }

    handlePurchaseTypeChange = (event, key) => {
        const marketPrice = event.target.value === "Fixed" ?
            this.purchaseDetails?.fixed_terminal_rate : this.purchaseDetails?.booked_terminal_rate;
        const purchasePrice = this.calculatePurchasePrice(this.getTerminalValue(this.purchaseDetails?.purchase_type, this.purchaseDetails?.fixed_terminal_rate,
            this.purchaseDetails?.booked_terminal_rate), event.target.value === "Fixed" ?
            this.purchaseDetails?.fixed_differential : this.purchaseDetails?.booked_differential);
        const grossPrice = this.calculateGrossPrice(purchasePrice, this.purchaseDetails?.total_quantity);
        const totalPrice = this.calculateTotalPriceImport(grossPrice, this.purchaseDetails?.taxes);
        const poMargin = this.calculatePOMargin(this.purchaseDetails?.market_price, purchasePrice);
        let data = {
            ...this.purchaseDetails,
            [key]: event.target.value,
            "purchase_price": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "market_price": marketPrice
        }
        this.setPurchaseDetails(data);
    }

    handleDifferentialChange = (event, key) => {
        const purchaseType = this.purchaseDetails?.purchase_type;
        const purchasePrice = this.calculatePurchasePrice(this.getTerminalValue(purchaseType,
            this.purchaseDetails?.fixed_terminal_rate, this.purchaseDetails?.booked_terminal_rate), event.target.value);
        const grossPrice = this.calculateGrossPrice(purchasePrice, this.purchaseDetails?.total_quantity);
        const totalPrice = this.calculateTotalPriceImport(grossPrice, this.purchaseDetails?.taxes);
        const poMargin = this.calculatePOMargin(this.purchaseDetails?.market_price, purchasePrice);
        let data = {
            ...this.purchaseDetails,
            "purchase_price": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "fixed_differential": event.target.value,
            "booked_differential": event.target.value,
        }
        this.setPurchaseDetails(data);
    };

    handlePurchasePriceInrChange = (event, key) => {
        const val = event.target.value >= 0 ? event.target.value : 0;
        const totalPriceInr = this.calculateTotalPrice({ ...this.purchaseDetails, [key]: val });
        const qty = parseFloat(this.purchaseDetails.total_quantity === undefined ? 0 : this.purchaseDetails.total_quantity);
        let data = {
            ...this.purchaseDetails,
            "grossPrice": parseFloat(val) * (this.purchaseDetails?.supplier_type_id === "1001" ? qty / 1000 : qty),
            "totalPrice": totalPriceInr,
            [key]: val
        }
        this.setPurchaseDetails(data);
    };

    handleDifferentialChange(event, key) {
        const purchaseType = this.purchaseDetails?.purchase_type;
        const purchasePrice = this.calculatePurchasePrice(this.getTerminalValue(purchaseType,
            this.purchaseDetails?.fixed_terminal_rate, this.purchaseDetails?.booked_terminal_rate), event.target.value);
        const grossPrice = this.calculateGrossPrice(purchasePrice, this.purchaseDetails?.total_quantity);
        const totalPrice = this.calculateTotalPriceImport(grossPrice, this.purchaseDetails?.taxes);
        const poMargin = this.calculatePOMargin(this.purchaseDetails?.market_price, purchasePrice);
        let data = {
            ...this.purchaseDetails,
            "purchase_price": purchasePrice,
            "totalPrice": totalPrice,
            "grossPrice": grossPrice,
            "po_margin": poMargin,
            "fixed_differential": event.target.value,
            "booked_differential": event.target.value,
        }
        // this.purchaseDetails(data);
        this.setPurchaseDetails(data);
    };

    async updatePurchaseOrder() {

        const loggedinuserid = localStorage.getItem("currentUserId");
        const message = 'Please enter valid details';
        let errorObj = { ...this.validationError };
        if ((this.purchaseDetails.supplier_type_id === "1001" && this.purchaseDetails?.po_category !== "ORM")
            && _.isEmpty(this.purchaseDetails.market_price?.toString())) {
            errorObj = { ...errorObj, market_price: message };
        } else {
            delete errorObj.market_price
        }
        if (this.purchaseDetails.supplier_type_id === "1001" && this.purchaseDetails?.po_category !== "ORM" && _.isEmpty(this.purchaseDetails.purchase_price?.toString())) {
            errorObj = { ...errorObj, purchase_price: message };
        } else {
            delete errorObj.purchase_price
        }
        if (_.isEmpty(this.purchaseDetails.supplier_type_id)) {
            errorObj = { ...errorObj, supplier_type_id: message };
        } else {
            delete errorObj.supplier_type_id
        }
        if (_.isEmpty(this.purchaseDetails.po_category)) {
            errorObj = { ...errorObj, po_category: message };
        } else {
            delete errorObj.po_category
        }
        if (!_.isEmpty(errorObj)) {
            this.setValidationError(errorObj);
            this.setValidationModal(true);
        } else {
            // console.log('data::11', data);
            // return;
            this.setLoading(true);
            try {
                let response = await updateGCPurchaseOrders({
                    type: 'updatePrice', 
                    "modified_byuserid": loggedinuserid,
                    "loggedinuserid": loggedinuserid,
                    "terminal_price": this.purchaseDetails?.terminal_price?.toString(),
                    "booked_terminal_rate": this.purchaseDetails?.booked_terminal_rate?.toString(),
                    "booked_differential": this.purchaseDetails?.booked_differential?.toString(),
                    "fixed_terminal_rate": this.purchaseDetails?.fixed_terminal_rate?.toString(),
                    "fixed_differential": this.purchaseDetails?.fixed_differential?.toString(),
                    "purchase_price": this.purchaseDetails?.purchase_price?.toString(),
                    "market_price": this.purchaseDetails?.market_price?.toString(),
                    "po_margin": this.purchaseDetails?.po_margin?.toString(),
                    "totalPrice": this.purchaseDetails?.totalPrice?.toString(),
                    "po_no": this.purchaseDetails?.po_no?.toString(),
                    "purchase_type": this.purchaseDetails?.purchase_type,
                    "terminal_month": this.purchaseDetails.terminal_month || null,
                    "fixation_date": this.purchaseDetails.fixation_date || null,
                    "grossPrice": this.purchaseDetails?.grossPrice?.toString()
                })
                if (response) {
                    this.setSnack({
                        open: true,
                        message: "GC Purchase Order updated successfully",
                    });
                    setTimeout(() => {
                        this.setEdit(prevState => !prevState)
                    }, 2000)
                }
            } catch (e) {
                this.setSnack({
                    open: true,
                    message: 'Server Error. Please contact administrator', //e.response?.data
                    severity: 'error',
                })
            }
            finally {
                this.setLoading(false);
            }
        }
    }
}