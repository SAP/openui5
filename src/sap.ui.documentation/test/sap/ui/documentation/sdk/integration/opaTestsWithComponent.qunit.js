// Note: the HTML page 'opaTestsWithComponent.qunit.html' loads this module via data-sap-ui-on-init

// we want to be able to load our tests asynchronously - pause QUnit until we loaded everything
QUnit.config.autostart = false;
// Demo Kit in static navigation mode
window['sap-ui-documentation-static'] = true;
//We preset the path to api-index.json file to be the local mock folder
window['sap-ui-documentation-config'] = {
	apiInfoRootURL: 'test-resources/sap/ui/documentation/sdk/integration/mock/docs/api/api-index.json'
};

"use strict";

sap.ui.define([
	"sap/ui/documentation/sdk/test/configureOpa",
	"sap/ui/documentation/sdk/test/AllJourneys",
	"sap/ui/documentation/sdk/controller/util/APIInfo",

], function (configureOpa, AllJourneys, APIInfo) {
	"use strict";
	// configuration has been applied and the tests in the journeys have been loaded - start QUnit

	APIInfo._setRoot('test-resources/sap/ui/documentation/sdk/integration/mock');
	QUnit.start();
});