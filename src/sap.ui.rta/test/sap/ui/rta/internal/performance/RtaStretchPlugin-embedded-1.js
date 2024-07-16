var __sPathPrefix = document.location.pathname.match(/(.*)\/test-resources\//)[1];

window["sap-ui-config"] = window["sap-ui-config"] || {};
window["sap-ui-config"].onInit = "module:rta/performance/stretch/main";
window["sap-ui-config"].async = "true";
window["sap-ui-config"].libs = "sap.ui.rta, sap.ui.dt, sap.m, sap.ui.layout";
window["sap-ui-config"].resourceroots = {
	"rta.performance": "./",
	"dt.performance": "../../../../../sap/ui/dt/internal/performance/",
	"test-resources": "../../../../../../test-resources"
};
window["sap-ui-config"].flexibilityServices = '[{"connector": "SessionStorageConnector"}]';

document.write('<script src="' + __sPathPrefix + '/resources/sap-ui-core.js"><' + '/script>');