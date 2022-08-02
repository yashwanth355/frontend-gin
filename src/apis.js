import instance from "./config/axios"
import routes from "./constants/routes"
import url from "./constants/url"

// import axios from 'axios'

// const headers ={
//     "Content-Type": 'application/json',
//     "Access-Control-Allow-Origin": "*"
// }

export const login = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.login}`, data)
        // return axios.post(`${url.apiGinUrl}/${routes.login}`, data, {headers: headers})
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err?.message, err?.code))
}

export const forgetPassword = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.forget}`, data)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from forget password api", err?.message, err?.code))
}

export const confirmForgotPassword = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.confirmForgotPassword}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from forget password api", err?.message, err?.code))
}

export const registerUser = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.registerUser}`, data)
        .then(res => {
            if (res) {
                instance.post(`${url.apiGinUrl}${routes.insertUser}`, data)
                    .then(res => {
                        return res;
                    })
            }
            return res;
        })

    // instance.post(`${url.apiGinUrl}${routes.registerUser}`, data)
    // .then(res => {
    //     return res;
    // })
    // return instance.post(`${url.apiGinUrl}${routes.insertUser}`, data)
    // .then(res => {
    //     return res;
    // })
}

export const updateUser = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.insertUser}`, data)
        .then(res => {
            return res;
        })
}
// export const CreatedUser = (data) => {
//     instance.post(`${url.apiGinUrl}${routes.CreatedUser}`, data)
//     .then(res => {
//         return res;
//     })
//     return instance.post(`${url.apiGinUrl}${routes.insertUser}`, data)
//     .then(res => {
//         return res;
//     })
// }

export const getUserPool = () => {
    return instance.get(`${url.apiGinUrl}${routes.listPoolUsers}`)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from get users list api", err?.message, err?.code))
}

export const getUserDetails = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.userDetail}`, data)
        .then(res => {
            return res;
        })
        .catch(err => console.log("Error from get users list api", err?.message, err?.code))
}

export const changeUserStatus = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.userStatus}`, data)
        .then(res => {
            return res;
        })
}

export const changeUserStatusDisable = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.userStatusDisable}`, data)
        .then(res => {
            return res;
        })
}

export const changePassword = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.changePassword}`, data)
        .then(res => {
            return res;
        })
}

export const getLeads = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.leads}`, data)
        .then(res => {
            return res;
        })
}

export const getAccounts = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.accounts}`, data)
        .then(res => {
            return res;
        })
}
export const getContacts = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.contacts}`, data)
        .then(res => {
            return res;
        })
}
export const getQuotes = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.quotes}`, data)
        .then(res => {
            return res;
        })
}



export const getRoles = () => {
    return instance.get(`${url.apiGinUrl}${routes.userRole}`)
        .then(res => {
            return res;
        })
}

export const getCompanyNames = () => {
    return instance.get(`${url.apiGinUrl}${routes.companyName}`)
        .then(res => {
            return res;
        })
}

export const getDesignation = () => {
    return instance.get(`${url.apiGinUrl}${routes.designation}`)
        .then(res => {
            return res;
        })
}


export const getDepartmentNames = () => {
    return instance.get(`${url.apiGinUrl}${routes.departmentName}`)
        .then(res => {
            return res;
        })
}

export const getDivisionNames = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.division}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err?.message, err?.code))
}

export const getDelegatedApprover = () => {
    return instance.get(`${url.apiGinUrl}${routes.delegatedApprover}`)
        .then(res => {
            return res;
        })
}

export const getCountryNames = () => {
    return instance.get(`${url.packagingapiurl}${routes.country}`)
        .then(res => {
            return res;
        })
}

export const getStateNames = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.state}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err?.message, err?.code))
}

export const getCityNames = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.city}`, data)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err?.message, err?.code))
}

export const getProfileName = () => {
    return instance.get(`${url.apiGinUrl}${routes.profile}`)
        .then(res => {
            return res;
        })
    // .catch(err => console.log("Error from login api", err?.message, err?.code))
}

export const createLead = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.insertLead}`, data)
        .then(res => {
            return res;
        })
}

export const getLeadsInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.leadsInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getContactsInLeadtoAcc = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.contactsInleadToAccount}`, data)
        .then(res => {
            return res;
        })
}

export const getLeadsDetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.leadsDetail}`, data)
        .then(res => {
            return res;
        })
}

export const convertLeadToAccount = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.convertLeadToAccount}`, data)
        .then(res => {
            return res;
        })
}

export const getUsers = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getUsers}`, data)
        .then(res => {
            return res;
        })
}

export const getProductAndCategory = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getProductAndCategory}`, data)
        .then(res => {
            return res;
        })
}

export const getQuotesInfo = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.quotesInfo}`, data)
        .then(res => {
            return res;
        })
}

export const createQuote = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.insertQuote}`, data)
        .then(res => {
            return res;
        })
}

export const getSampleRequests = (params) => {
    return instance.post(`${url.packagingapiurl}${routes.sampleRequests}`, params)
        .then(res => {
            return res;
        })
}

export const getAccountDetails = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.accountsDetail}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const createQuoteItemCustom = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.requestNewPackType}`, data)
        .then(res => {
            return res;
        })
}

export const createAccountContact = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.accountContact}`, data)
        .then(res => {
            return res;
        })
}

export const createAccountSample = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.accountSample}`, data)
        .then(res => {
            return res;
        })
}

export const viewSampleRequest = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.viewSample}`, data)
        .then(res => {
            return res;
        })
}

export const createSample = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.insertSample}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItems = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.getQuoteItems}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const createQuoteItem = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.insertQuoteItem}`, data)
        .then(res => {
            return res;
        })
}
export const updateQuoteItem = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateQuoteItem}`, data)
        .then(res => {
            return res;
        })
}
export const updateQuoteStatus = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateQuoteStatus}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const getQuoteItemsInfo = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.quoteItemsInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountContacts = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getAccountContacts}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountSamples = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getAccountSamples}`, data)
        .then(res => {
            return res;
        })
}

export const getAccountQuotes = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getAccountQuotes}`, data)
        .then(res => {
            return res;
        })
}

export const reAssignLead = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.reassignLead}`, data)
        .then(res => {
            return res;
        })
}
export const reassignAccount = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.reassignAccount}`, data)
        .then(res => {
            return res;
        })
}
export const getQuotationInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quotesInfoErp}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItemSystemInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteItemSystemInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getQuoteItemSystemPackInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteItemSystemPackInfo}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const approveNewPackType = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.approveNewPackType}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const rejectNewPackType = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.rejectNewPackType}`, data)
        .then(res => {
            return res;
        })
}
export const requestQuotePriceInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteRequestPrice}`, data)
        .then(res => {
            return res;
        })
}

export const quoteSamples = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteSamples}`, data)
        .then(res => {
            return res;
        })
}

export const quoteSamplePricing = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteSamplePricing}`, data)
        .then(res => {
            return res;
        })
}

export const quoteRequestGCRates = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.quoteRequestGCRates}`, data)
        .then(res => {
            return res;
        })
}

export const currencyConversion = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.currencyConversion}`, data)
        .then(res => {
            return res;
        })
}

export const getPOCreationInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.poCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getPoCreationInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.PoCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getAllPurchaseOrders = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getAllPurchaseOrders}`, data)
        .then(res => {
            return res;
        })
}

export const createGCPurchaseOrders = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.createGCPo}`, data)
        .then(res => {
            return res;
        })
}

export const updateGCPurchaseOrders = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateGCPo}`, data)
        .then(res => {
            return res;
        })
}

export const updateGCPoStatus = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.gCPoStatus}`, data)
        .then(res => {
            return res;
        })
}

export const getGCApprovedQuotes = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.approvedQuotesOnGC}`, data)
        .then(res => {
            return res;
        })
}

export const getTopApprovedPOs = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.topApprovedPos}`, data)
        .then(res => {
            return res;
        })
}

export const getTopMrinDetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.topMrin}`, data)
        .then(res => {
            return res;
        })
}

export const getPODetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.poDetails}`, data)
        .then(res => {
            return res;
        })
}

// MRIN
export const getMRINs = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getAllmrins}`, data)
        .then(res => {
            return res;
        })
}
export const getMRINDetail = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.mrinDetails}`, data)
        .then(res => {
            return res;
        })
}
export const createOrUpdateMRINDetail = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.createOrUpdateMrin}`, data)
        .then(res => {
            return res;
        })
}

// get entity and po details
export const getMrinCreationDetail = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getMrinCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

// get mring based on po no
export const getMrinListForPoDetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.getMrinListForPoView}`, data)
        .then(res => {
            return res;
        })
}

export const createVendorDetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.createVendor}`, data)
        .then(res => {
            return res;
        })
}

export const getPortAndOriginForPo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.portAndOriginForPo}`, data)
        .then(res => {
            return res;
        })
}

export const getBalQuoteQtyForPoOrder = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.balQuoteQtyForPoOrder}`, data)
        .then(res => {
            return res;
        })
}

export const poDocumentsUpload = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.poDocuments}`, data)
        .then(res => {
            return res;
        })
}
 
// GC
export const getGCs = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getGCs}`, data)
        .then(res => {
            return res;
        })
}

export const getgcDetails = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getGCDetail}`, data)
        .then(res => {
            return res;
        })
}

// supplier
export const getSuppliers = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.getSuppliers}`, data)
        .then(res => {
            return res;
        })
}

export const getSuppliersList = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getSupplierList}`, data)
        .then(res => {
            return res;
        })
}

export const editSupplier = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.editSupplier}`, data)
        .then(res => {
            return res;
        })
}

export const CreateOrEditSupplier = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.curdSupplier}`, data)
        .then(res => {
            return res;
        })
}

export const getGcCreationInfo = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getGcCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const createOrUpdateGcDetail = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.createOrUpdateGcDetail}`, data)
        .then(res => {
            return res;
        })
}

export const vendorLogin = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.vendorLogin}`, data)
        .then(res => {
            return res;
        })
}

export const getDispatchDetails = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.getDispatchDetails}`, data)
        .then(res => {
            return res;
        })
}
export const updateGCPoDispatch = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateGCPoDispatch}`, data)
        .then(res => {
            return res;
        })
}
export const deleteGCPOAutoDispatch = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.deleteGCPOAutoDispatch}`, data)
        .then(res => {
            return res;
        })
}
export const getGCDebitNoteCreationInfo = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.getGCDebitNoteCreationInfo}`, data)
        .then(res => {
            return res;
        })
}

export const getlistGCDebitNoteDetails = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.listGCDebitNoteDetails}`, data)
        .then(res => {
            return res;
        })
}

export const getinsertOrEditGCDebitNoteDetail = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.insertOrEditGCDebitNoteDetail}`, data)
        .then(res => {
            return res;
        })
}

export const getviewGCDebitNoteDetail = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.viewGCDebitNoteDetail}`, data)
        .then(res => {
            return res;
        })
}

export const getupdateGcDebitNoteStatus = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateGcDebitNoteStatus}`, data)
        .then(res => {
            return res;
        })
}

export const createorupdateSampleLineItem = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.createorupdateSampleLineItem}`, data)
        .then(res => {
            return res;
        })
}

export const viewAndDeleteSampleLineItem = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.viewAndDeleteSampleLineItem}`, data)
        .then(res => {
            return res;
        })
}

export const getNotifications = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.getNotifications}`, data)
        .then(res => {
            return res;
        })
}

export const updateMRINGCSpec = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.updateMRINGCSpec}`, data)
        .then(res => {
            return res;
        })
}
export const sendMail = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.sendEmail}`, data)
        .then(res => {
            return res;
        })
}
export const releaseDebitNoteGC = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.releaseDebitNote}`, data)
        .then(res => {
            return res;
        })
}
export const CreateEditTaxMaster = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.taxMaster}`, data)
        .then(res => {
            return res;
        })
}
export const getTaxes = (data) => {
    return instance.post(`${url.apiGinUrl}${routes.taxList}`, data)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const getAllPackingRequests = (params) => {
    return instance.post(`${url.packagingapiurl}${routes.getAllPackingRequests}`, params)
        .then(res => {
            return res;
        })
}
//Packaging Release
export const viewPackingRequest = (data) => {
    return instance.post(`${url.packagingapiurl}${routes.viewPackingRequest}`, data)
        .then(res => {
            return res;
        })
}

export const getConversatioRatio = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getConversatioRatio}`, data)
        .then(res => {
            return res;
        })
}

export const getSamplesInfo = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getSamplesInfo}`, data)
        .then(res => {
            return res;
        })
}

export const insertPricingInfo = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.insertPricingInfo}`, data)
        .then(res => {
            return res;
        })
}

export const updateSamplesInfoForPricing = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.updateSamplesInfoForPricing}`, data)
        .then(res => {
            return res;
        })
}

export const getPackingInfoForPricing = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getPackingInfoForPricing}`, data)
        .then(res => {
            return res;
        })
}

export const getGCDataOnQuotes = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getGCDataOnQuotes}`, data)
        .then(res => {
            return res;
        })
}

export const getSelectedSamplesForPricing = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getSelectedSamplesForPricing}`, data)
        .then(res => {
            return res;
        })
}

export const updateQuotationStatusForPricing = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.updateQuotationStatusForPricing}`, data)
        .then(res => {
            return res;
        })
}

export const updateGcPriceOnQuotes = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.updateGcPriceOnQuotes}`, data)
        .then(res => {
            return res;
        })
}

export const getOtherFactorsInfo = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getOtherFactorsInfo}`, data)
        .then(res => {
            return res;
        })
}

export const updateOtherFactorsInfo = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.updateOtherFactorsInfo}`, data)
        .then(res => {
            return res;
        })
}
 
export const getFinalisedSamples = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.getFinalisedSamples}`, data)
        .then(res => {
            return res;
        })
}

export const updateConfirmSample = (data) => {//pricingGinUrl
    return instance.post(`${url.pricingapiurl}${routes.updateConfirmSample}`, data)
        .then(res => {
            return res;
        })
}




















