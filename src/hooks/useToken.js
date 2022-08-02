import { useState } from 'react';
import _ from 'lodash';
import { login, vendorLogin } from '../apis';
import {roles} from '../constants/roles';
const useToken = () => {
    const [token, setToken] = useState(localStorage.getItem('currentUserId'));
    const [role, setRole] = useState(localStorage.getItem('currentUserRole'));
    const storeToken = (details) => {
        localStorage.setItem("token", details.id);
        localStorage.setItem("currentUserId", details.user_id);
        localStorage.setItem("currentUserRole", details.role);
        localStorage.setItem("currentUserName", details.user_name);
        setRole(details.role);
        setToken(details.id);
    }
    const getToken = () => {
        let value = localStorage.getItem("token");
        return value;
    }
    const getCurrentUserDetails = () => {
        let userDetails = {};
        userDetails.id = localStorage.getItem("currentUserId");
        userDetails.role = localStorage.getItem("currentUserRole");
        userDetails.name = localStorage.getItem("currentUserName");
        return (userDetails);
    }
    const setPreference = (details) => {
        localStorage.setItem("preference", JSON.stringify(details));
    }
    const getPreference = () => {
        let value = localStorage.getItem("preference");
        return JSON.parse(value);
    }
    const removeToken = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUserName');
        localStorage.removeItem('preference');
        localStorage.removeItem('currentActivePage');
        localStorage.removeItem('currentUserRole');
        setToken(null);
        setRole(undefined);
    }
    const refreshToken = async () => {
        if (!!token) {
            try {
                const preference = await localStorage.getItem('preference');
                let data = {
                    username: JSON.parse(preference)?.name,
                    password: JSON.parse(preference)?.password
                };
                if (role === roles.vendor)
                    data.vendor = true
                let response = role === roles.vendor ? await vendorLogin(data) : await login(data);
                if (!_.isEmpty(response)) {
                    await storeToken(response);
                }
            }
            catch (err) {
                console.log('Er is', err);
            }
        }
    }
    return {
        storeToken, getToken, setPreference, getPreference,
        getCurrentUserDetails, token, role,
        removeToken, refreshToken
    };
}

export default useToken;