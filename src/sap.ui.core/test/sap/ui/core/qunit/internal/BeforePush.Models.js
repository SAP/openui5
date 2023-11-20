/*!
 * ${copyright}
 */
/*
 * This is the UI5 Core Models configuration file for BeforePush.js
 *
 * You can find more information about how to configure the BeforePush test in the main test runner
 * file (BeforePush.js).
 */
sap.ui.define([
	"sap/ui/core/qunit/internal/testsuite.models.qunit"
 ],function (oTestSuite) {
	"use strict";

	var sSuite = "Test.qunit.html"
			+ "?testsuite=test-resources/sap/ui/core/qunit/internal/testsuite.models.qunit&test=",

		mTests = {
			'internal/samples/odata/twoFields/Opa.qunit.html' : 'both',
			'internal/samples/odata/v2/SalesOrders/Opa.qunit.html' : 'both',
			'internal/samples/odata/v2/Products/Opa.qunit.html' : 'both',
			'../../../sap/m/demokit/cart/webapp/test/integration/opaTestsComponent.qunit.html' : 'both',
			'../../../sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinComponent.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/scenario/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both',
			'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'both'
		};

	Object.keys(oTestSuite.tests).forEach(function (sTest) {
		mTests[sSuite + sTest] = "both";
	});

	return {tests : mTests};
});
