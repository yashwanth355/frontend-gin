import React, { useContext, useEffect, Suspense, lazy } from 'react';
import Login from './screens/Login';
import VendorLogin from './screens/VendorLogin';
import ForgetPassword from './screens/ForgetPassword';
import { makeStyles } from '@material-ui/core/styles';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import CustomizedTabs from './components/Tabs';
import { mainRoutes, vendorRoutes } from './config/routes';
// eslint-disable-next-line
import { Grid, Container, Card, CardContent, } from '@material-ui/core';
import Background from "./assets/images/background.jpg";
import SwipeableTextMobileStepper from './components/Stepper';
import useToken from './hooks/useToken';
import Home from './screens/admin/Users/Home/home';

import { AuthContext } from './context/auth-context';
// eslint-disable-next-line
import { roles, routes, roleBasedRoutes } from './constants/roles';

import CustomAppBar from './components/AppBar';
import Loading from './components/Loading';
const Leads = lazy(() => import('./screens/admin/Leads'));
const Accounts = lazy(() => import('./screens/admin/Accounts'));
const Contacts = lazy(() => import('./screens/admin/Contacts'));
const SampleRequests = lazy(() => import('./screens/admin/Sample Requests'));
const PurchaseOrders = lazy(() => import('./screens/admin/PurchaseOrders'));
const CreatePurchaseOrder = lazy(() => import('./screens/admin/PurchaseOrders/CreatePurchaseOrder'));
const PurchaseOrderDetails = lazy(() => import('./screens/admin/PurchaseOrders/PurchaseOrderDetails'));
const EditPurchaseOrder = lazy(() => import('./screens/admin/PurchaseOrders/EditPurchaseOrder'));
const CreateLead = lazy(() => import('./screens/admin/Leads/CreateLead'));
const EditLead = lazy(() => import('./screens/admin/Leads/EditLead'));
const VendorPurchaseForm = lazy(() => import('./screens/admin/PurchaseOrders/VendorPurchaseForm'));
const Settings = lazy(() => import('./screens/admin/Settings'));
const PackingType = lazy(() => import('./screens/admin/PackingType'));
const Users = lazy(() => import('./screens/admin/Users'));
const Supplier = lazy(() => import('./screens/admin/Supplier'));
const EditSupplier = lazy(() => import('./screens/admin/Supplier/EditSupplier'));
const CreateSupplier = lazy(() => import('./screens/admin/Supplier/CreateSupplier'));
const SupplierDetails = lazy(() => import('./screens/admin/Supplier/SupplierDetails'));
const MRIN = lazy(() => import('./screens/admin/Mrin'));
// const MRINDetails = lazy(() => import('./screens/admin/Mrin/MrinDetails'));
// const CreateMRIN = lazy(() => import('./screens/admin/Mrin/CreateMrin'));
// const EditMRIN = lazy(() => import('./screens/admin/Mrin/EditMrin'));
const GC = lazy(() => import('./screens/admin/Gc'));
const CreateGC = lazy(() => import('./screens/admin/Gc/CreateGc'));
const EditGC = lazy(() => import('./screens/admin/Gc/EditGc'));
const GcDetails = lazy(() => import('./screens/admin/Gc/GcDetails'));
const Quotes = lazy(() => import('./screens/admin/Quotes'));
const DebitNoteGC = lazy(() => import('./screens/admin/DebitNoteGc'));
const Packaging = lazy(() => import('./screens/admin/Packaging'));
const PackagingDetails = lazy(() => import('./screens/admin/Packaging/PackagingDetails'))
const CreateUser = lazy(() => import('./screens/admin/Users/CreateUser'));
const UserDetails = lazy(() => import('./screens/admin/Users/UserDetails'));
const EditUser = lazy(() => import('./screens/admin/Users/EditUser'));
const CreateDebitNote = lazy(() => import('./screens/admin/DebitNoteGc/AddDebitNoteGc'));
const EditDebitNote = lazy(() => import('./screens/admin/DebitNoteGc/EditDebitNoteGc'));
const ViewDebitNote = lazy(() => import('./screens/admin/DebitNoteGc/DebitNoteGcDetails'));
const CreateSampleRequest = lazy(() => import('./screens/admin/Sample Requests/AddSample'));
const ViewSampleRequest = lazy(() => import('./screens/admin/Sample Requests/SampleDetails'));
const EditSampleRequest = lazy(() => import('./screens/admin/Sample Requests/EditSample'));


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    position: 'relative',
    maxWidth: '100%',
    margin: 0,
    backgroundImage: `url(${Background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    paddingRight: 0,
    paddingLeft: 0
  },
}));

const WithBackground = (props) => {
  const classes = useStyles();
  return (
    <Container component="main" maxWidth="xs" className={classes.root}>
      {
        !props.iframe ?
          <Grid container spacing={0} direction="column" alignItems="center" justify="center"
            style={{ minHeight: '100vh' }}>
            <Grid item xs={12} sm={12}>
              <Card>
                <CardContent>
                  {props.children}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          :
          <Grid container spacing={0} direction="row" style={{ height: '100vh' }}>
            <Grid item xs={12} sm={6} justify="center" alignItems="center" style={{ display: 'flex' }}>
              <Card>
                <CardContent>
                  {props.children}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <SwipeableTextMobileStepper />
            </Grid>
          </Grid>
      }
    </Container>
  )
}


function RequireAuth(props) {
  let auth = useContext(AuthContext);
  let location = useLocation();
  const pathIndex = roleBasedRoutes?.[auth.role]?.findIndex(path => path === props.path);
  if (!auth.token) {
    return <Navigate to={routes.login} state={{ from: location }} />;
  }
  else if (pathIndex === -1) {
    return <Navigate to={roleBasedRoutes[auth.role]?.[0]} />
  }
  else return props.children
}
function CheckAuth(props) {
  let auth = useContext(AuthContext);
  const location = useLocation();
  const pathIndex = roleBasedRoutes?.[auth.role]?.findIndex(path => path === location?.state?.from?.pathname);
  if (!!auth.token && pathIndex > -1) {
    return <Navigate to={location?.state?.from?.pathname} />

  }
  else if (!!auth.token) {
    return <Navigate to={roleBasedRoutes[auth.role]?.[0]} />;
  }
  return props.children;
}
function AuthWrapperWithTab(props) {
  return <RequireAuth path={props.path}>
    <CustomAppBar>
      <CustomizedTabs routes={mainRoutes}>
        {props.children}
      </CustomizedTabs>
    </CustomAppBar>
  </RequireAuth>
}

function App() {
  const { storeToken, setPreference, getPreference, token, role, removeToken, refreshToken } = useToken();

  useEffect(() => {
    refreshToken();
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 1200000)
    return () => {
      clearInterval(refreshInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <AuthContext.Provider value={{
        token: token,
        role: role,
        storeToken: storeToken,
        setPreference: setPreference,
        getPreference: getPreference,
        removeToken: removeToken,
      }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={routes.vendor} element={<RequireAuth path={routes.vendor}>
              <CustomizedTabs routes={vendorRoutes}>
                <VendorPurchaseForm />
              </CustomizedTabs>
            </RequireAuth>}
            />

            <Route path={routes.home} exact element={<AuthWrapperWithTab path={routes.home}><Home /></AuthWrapperWithTab>} />
            <Route path={routes.leads} exact element={
              <AuthWrapperWithTab path={routes.leads}>
                <Leads />
              </AuthWrapperWithTab>} />

            <Route path={routes.createLead} exact element={
              <RequireAuth path={routes.createLead}>
                <CreateLead />
              </RequireAuth>} />
            <Route path={routes.editLead} exact element={
              <RequireAuth path={routes.editLead}>
                <EditLead />
              </RequireAuth>} />
            <Route path={routes.viewLead} element={
              <RequireAuth path={routes.viewLead}>
                <EditLead />
              </RequireAuth>} />
            {/* <Route path={routes.samples} exact element={
            <AuthWrapperWithTab>
              <Samples />
            </AuthWrapperWithTab>} /> */}

            <Route path={routes.packaging} exact element={
              <AuthWrapperWithTab path={routes.packaging}>
                <Packaging />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewPackaging} exact element={
              <AuthWrapperWithTab path={routes.viewPackaging}>
                <PackagingDetails />
              </AuthWrapperWithTab>} />

            <Route path={routes.accounts} exact element={
              <AuthWrapperWithTab path={routes.accounts}>
                <Accounts />
              </AuthWrapperWithTab>} />
            <Route path={routes.contacts} exact element={
              <AuthWrapperWithTab path={routes.contacts}>
                <Contacts />
              </AuthWrapperWithTab>} />
            <Route path={routes.sampleRequest} exact element={
              <AuthWrapperWithTab path={routes.sampleRequest}>
                <SampleRequests />
              </AuthWrapperWithTab>} />
            <Route path={routes.createSampleRequest} exact element={
              <AuthWrapperWithTab path={routes.createSampleRequest}>
                <CreateSampleRequest />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewSampleRequest} exact element={
              <AuthWrapperWithTab path={routes.viewSampleRequest}>
                <ViewSampleRequest />
              </AuthWrapperWithTab>} />
            <Route path={routes.editSampleRequest} exact element={
              <AuthWrapperWithTab path={routes.editSampleRequest}>
                <EditSampleRequest />
              </AuthWrapperWithTab>} />
            {/* <Route path="/master-sample-request" exact element={
            <AuthWrapperWithTab>
              <MasterSampleRequests />
            </AuthWrapperWithTab>} />             */}
            <Route path={routes.quote} exact element={
              <AuthWrapperWithTab path={routes.quote}>
                <Quotes />
              </AuthWrapperWithTab>} />
            <Route path={routes.users} exact element={
              <AuthWrapperWithTab path={routes.users}>
                <Users />
              </AuthWrapperWithTab>} />
            <Route path={routes.createUser} exact element={
              <AuthWrapperWithTab path={routes.createUser}>
                <CreateUser />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewUser} exact element={
              <AuthWrapperWithTab path={routes.viewUser}>
                <UserDetails />
              </AuthWrapperWithTab>} />
            <Route path={routes.editUser} exact element={
              <AuthWrapperWithTab path={routes.editUser}>
                <EditUser />
              </AuthWrapperWithTab>} />
            <Route path={routes.purchaseOrders} exact element={
              <AuthWrapperWithTab path={routes.purchaseOrders}>
                <PurchaseOrders />
              </AuthWrapperWithTab>} />
            <Route path={routes.createPurchaseOrder} exact element={
              <AuthWrapperWithTab path={routes.createPurchaseOrder}>
                <CreatePurchaseOrder />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewPurchaseOrder} exact element={
              <AuthWrapperWithTab path={routes.viewPurchaseOrder}>
                <PurchaseOrderDetails />
              </AuthWrapperWithTab>} />
            <Route path={routes.editPurchaseOrder} exact element={
              <AuthWrapperWithTab path={routes.editPurchaseOrder}>
                <EditPurchaseOrder />
              </AuthWrapperWithTab>} />
            <Route path={routes.debitNoteGC} exact element={
              <AuthWrapperWithTab path={routes.debitNoteGC}>
                <DebitNoteGC />
              </AuthWrapperWithTab>} />
            <Route path={routes.createDebitNoteGC} exact element={
              <AuthWrapperWithTab path={routes.createDebitNoteGC}>
                <CreateDebitNote />
              </AuthWrapperWithTab>} />
            <Route path={routes.editDebitNoteGC} exact element={
              <AuthWrapperWithTab path={routes.editDebitNoteGC}>
                <EditDebitNote />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewDebitNoteGC} exact element={
              <AuthWrapperWithTab path={routes.viewDebitNoteGC}>
                <ViewDebitNote />
              </AuthWrapperWithTab>} />
            <Route path={routes.settings} exact element={
              <AuthWrapperWithTab path={routes.settings}>
                <Settings />
              </AuthWrapperWithTab>} />
            <Route path={routes.mrin} exact element={
              <AuthWrapperWithTab path={routes.mrin}>
                <MRIN />
              </AuthWrapperWithTab>} />
            <Route path={routes.gc} exact element={
              <AuthWrapperWithTab path={routes.gc}>
                <GC />
              </AuthWrapperWithTab>} />
            <Route path={routes.createGC} exact element={
              <AuthWrapperWithTab path={routes.createGC}>
                <CreateGC />
              </AuthWrapperWithTab>} />
            <Route path={routes.editGC} exact element={
              <AuthWrapperWithTab path={routes.editGC}>
                <EditGC />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewGC} exact element={
              <AuthWrapperWithTab path={routes.viewGC}>
                <GcDetails />
              </AuthWrapperWithTab>} />
            <Route path={routes.packingType} exact element={
              <AuthWrapperWithTab path={routes.packingType}>
                <PackingType />
              </AuthWrapperWithTab>} />
            <Route path={routes.supplier} exact element={
              <AuthWrapperWithTab path={routes.supplier}>
                <Supplier />
              </AuthWrapperWithTab>} />
            <Route path={routes.createSupplier} exact element={
              <AuthWrapperWithTab path={routes.createSupplier}>
                <CreateSupplier />
              </AuthWrapperWithTab>} />
            <Route path={routes.editSupplier} exact element={
              <AuthWrapperWithTab path={routes.editSupplier}>
                <EditSupplier />
              </AuthWrapperWithTab>} />
            <Route path={routes.viewSupplier} exact element={
              <AuthWrapperWithTab path={routes.viewSupplier}>
                <SupplierDetails />
              </AuthWrapperWithTab>} />
            <Route path={routes.login} element={<CheckAuth>
              <WithBackground>
                <Login />
              </WithBackground>
            </CheckAuth>} />
            <Route path={routes.forget} element={<WithBackground>
              <ForgetPassword />
            </WithBackground>} />
            {/* <Route path="/profile" element={<UserProfile />} /> */}
            <Route path={routes.vendorLogin} element={
              <CheckAuth>
                <WithBackground>
                  <VendorLogin />
                </WithBackground>
              </CheckAuth>} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Suspense>
      </AuthContext.Provider>
    </>
  );
}

export default App;