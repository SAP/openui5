/*!
 * ${copyright}
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/integration/opaTestWithV4Server",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], async function(
	Opa5,
	opaTestWithV4Server,
	TestLibrary
) {
	"use strict";

	Opa5.extendConfig({
		autoWait: true,
		timeout: 45,
		appParams: {
			"sap-ui-animation": false,
			"sap-ui-xx-mdcTableP13n": "Table"
		}
	});

	const {promise, resolve} = Promise.withResolvers();
	sap.ui.require([
		"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/" + QUnit.urlParams.test
	], function(fnOPaTestModule) {
		resolve(fnOPaTestModule);
	});
	const fnOPaTestModule = await promise;
	fnOPaTestModule(await opaTestWithV4Server);
	QUnit.start();
});
