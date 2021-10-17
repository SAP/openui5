import Device from "sap/ui/Device";
var isMouseEventDelayed = function (oNavigator) {
    oNavigator = oNavigator || navigator;
    return !!(Device.browser.mobile && !((Device.os.ios && Device.os.version >= 8 && Device.browser.safari && !Device.browser.webview) || (Device.browser.chrome && !/SAMSUNG/.test(oNavigator.userAgent) && Device.browser.version >= 32)));
};