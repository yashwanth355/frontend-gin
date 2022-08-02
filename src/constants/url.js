console.log("window env is",window._env_.REACT_APP_API_URL )
const url = {
    apiGinUrl: window._env_?.REACT_APP_API_URL,
    pricingapiurl: window._env_?.PRICING_API_URL,
    packagingapiurl: window._env_?.PACKAGING_API_URL,
}

export default url;