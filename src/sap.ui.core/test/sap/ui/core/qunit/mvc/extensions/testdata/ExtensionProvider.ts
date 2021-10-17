import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
var ExtensionProvider = function () { };
ExtensionProvider.prototype.getControllerExtensions = function (sControllerName, sComponentId, bAsync) {
    if (bAsync) {
        return new Promise(function (fnResolve, fnReject) {
            sap.ui.require(["my/test/AnotherExtension"], function (AppExtension) {
                fnResolve([
                    AppExtension
                ]);
            });
        });
    }
    else {
        jQuery.sap.log.error("Never do sync stuff!!");
    }
};