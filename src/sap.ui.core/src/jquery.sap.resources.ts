import ResourceBundle from "sap/base/i18n/ResourceBundle";
import jQuery from "jquery.sap.global";
jQuery.sap.resources = function () {
    return ResourceBundle.create.apply(ResourceBundle, arguments);
};
jQuery.sap.resources.isBundle = function (oBundle) {
    return oBundle instanceof ResourceBundle;
};
jQuery.sap.resources._getFallbackLocales = ResourceBundle._getFallbackLocales;