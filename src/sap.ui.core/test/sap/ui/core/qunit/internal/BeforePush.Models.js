/*!
 * ${copyright}
 */
/*
 * This is the UI5 Core Models configuration file for BeforePush.js
 *
 * You can find more information about how to configure the BeforePush test in the main test runner
 * file (BeforePush.js).
 */
sap.ui.define(function () {
	"use strict";

	var sPathName = window.location.pathname,
		mTests = {
			'internal/samples/odata/v2/SalesOrders/Opa.qunit.html' : 'both',
			'../../../sap/m/demokit/cart/webapp/test/integration/opaTestsComponent.qunit.html' : 'both',
			'../../../sap/m/demokit/cart/webapp/test/integration/opaTestsGherkinComponent.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/scenario/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both',
			'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'both'
		},
		sTestSuite = "../qunit/testrunner.html?testpage="
			// enable both URLs with /testsuite/ (maven/grunt) and without (npm)
			+ encodeURIComponent(sPathName.slice(0, sPathName.indexOf("/test-resources/"))
				+ "/test-resources/sap/ui/core/qunit/internal/testsuite.models.qunit.html")
			+ "&autostart=true";

	mTests[sTestSuite] = "both";

	return mTests;
});