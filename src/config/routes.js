import { roles, routes } from "../constants/roles";

export const mainRoutes = [
  {
    label: 'Home',
    to: routes.home,
    roles: [roles.managerPurchaseGC, roles.asstManagerPurchase, roles.purchaseExecutiveGC],
  },
  {
    label: 'Leads',
    to: routes.leads,
    roles: [roles.marketingExecutive, roles.managingDirector, roles.BusinessDevelopmentManager],
  },
  {
    label: 'Accounts',
    to: routes.accounts,
    roles: [roles.marketingExecutive, roles.managingDirector, roles.BusinessDevelopmentManager]
  },
  {
    label: 'Contacts',
    to: routes.contacts,
    roles: [roles.marketingExecutive, roles.managingDirector, roles.BusinessDevelopmentManager]
  },
  {
    label: 'Sample Request',
    to: routes.sampleRequest,
    roles: [roles.marketingExecutive, roles.managingDirector, roles.BusinessDevelopmentManager]
  },
  // {
  //   label: 'Samples',
  //   to: routes.samples,
  //   roles: [roles.marketingExecutive, roles.managingDirector]
  // },
  {
    label: 'Quote',
    to: routes.quote,
    roles: [roles.gmc, roles.managerCommerical, roles.commercialExecutive,
    roles.managingDirector, roles.asstManagerPurchase, roles.marketingExecutive, roles.managerPurchaseGC, roles.packingExecutive, roles.BusinessDevelopmentManager]
  },
  {
    label: 'Packaging',
    to: routes.packaging,
    roles: [roles.qcManager, roles.managerPurchasePackaging, roles.marketingExecutive]
  },
  {
    label: 'Users',
    to: routes.users,
    roles: [roles.admin, roles.managingDirector]
  },
  {
    label: 'Purchase Orders',
    to: routes.purchaseOrders,
    roles: [roles.managingDirector, roles.managerPurchaseGC,
    roles.managerStoresPackingAndGC, roles.purchaseExecutiveGC,
    roles.asstManagerPurchase, roles.gcStoresExecutive,
    roles.accountsManager]
  },
  {
    label: 'Debit Note GC',
    to: routes.debitNoteGC,
    roles: [roles.managingDirector, roles.managerPurchaseGC,
    roles.accountsExecutive, roles.accountsManager]
  },
  {
    label: 'MRIN',
    to: routes.mrin,
    roles: [roles.gcStoresExecutive, roles.managerStoresPackingAndGC,
    roles.srManager, roles.qcManager, roles.managingDirector, roles.accountsExecutive,
    roles.accountsManager, roles.managerPurchaseGC]
  },
  {
    label: 'GC',
    to: routes.gc,
    roles: [roles.managingDirector, roles.gcStoresExecutive,
    roles.managerStoresPackingAndGC, roles.managerPurchaseGC],
  },
  {
    label: 'Supplier',
    to: routes.supplier,
    roles: [roles.managingDirector, roles.purchaseManager, roles.managerPurchaseGC, roles.accountsManager, roles.purchaseExecutiveME]
  },
  {
    label: 'Settings',
    to: routes.settings,
    roles: [roles.admin]
  },
];

export const vendorRoutes = [
  {
    label: 'Home',
    to: routes.vendor,
  }
]
