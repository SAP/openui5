const sMeasure = "fl.performance.flexBundleLoad";
performance.mark(`${sMeasure}`);

const __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];
const sPath = __sPathPrefix + "/test-resources/sap/ui/fl/internal/performance/flexData/flexBundleLoad.rename.5.json";

window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:fl/performance/flexBundleLoad/withFL";
window["sap-ui-config"].resourceroots = {"fl.performance": "./"};
window["sap-ui-config"].bindingSyntax = "complex";
window["sap-ui-config"].async = "true";
window["sap-ui-config"].flexibilityServices = '[{"connector": "ObjectPathConnector", "path": "' + sPath + '"}, {"connector": "SessionStorageConnector"}]';

document.write('<script src="' + __sPathPrefix + '/resources/sap-ui-core.js"><' + '/script>');