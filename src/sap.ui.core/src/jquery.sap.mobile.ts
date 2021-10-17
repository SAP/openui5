import jQuery from "jquery.sap.global";
import Mobile from "sap/ui/util/Mobile";
import Device from "sap/ui/Device";
function getValue(oTarget, sProperty) {
    var descriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
    return descriptor && descriptor.value;
}
(function () {
    jQuery.os = jQuery.extend({
        os: Device.os.name,
        version: Device.os.versionStr,
        fVersion: Device.os.version
    }, getValue(jQuery, "os"));
    jQuery.os[Device.os.name] = true;
    jQuery.device = jQuery.extend({}, getValue(jQuery, "device"));
    jQuery.device.is = jQuery.extend({
        standalone: window.navigator.standalone,
        landscape: Device.orientation.landscape,
        portrait: Device.orientation.portrait,
        iphone: Device.os.ios && Device.system.phone,
        ipad: Device.os.ios && Device.system.tablet,
        android_phone: Device.system.phone && Device.os.android,
        android_tablet: Device.system.tablet && Device.os.android,
        tablet: Device.system.tablet,
        phone: Device.system.phone,
        desktop: Device.system.desktop
    }, jQuery.device.is);
})();
jQuery.sap.initMobile = Mobile.init;
jQuery.sap.setIcons = Mobile.setIcons;
jQuery.sap.setMobileWebAppCapable = Mobile.setWebAppCapable;