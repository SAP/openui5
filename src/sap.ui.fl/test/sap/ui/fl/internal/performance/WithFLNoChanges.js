const sMeasure = "fl.performance.flexBundleLoad";
performance.mark(`${sMeasure}`);

const __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];

window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:fl/performance/flexBundleLoad/withFL";
window["sap-ui-config"].resourceroots = {"fl.performance": "./"};
window["sap-ui-config"].async = "true";

document.write('<script src="' + __sPathPrefix + '/resources/sap-ui-core.js"><' + '/script>');