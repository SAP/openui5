/*!
 * ${copyright}
 */
/*
 * This is the UI5 Core Models configuration file for BeforePush.js
 *
 * You can find more information about how to configure the BeforePush test in the main test runner
 * file (BeforePush.js). Be aware this config file must be loaded first!
 */
(function () {
	"use strict";

	window.BeforePush = {
		tests : {
			'internal/samples/odata/v2/SalesOrders/Opa.qunit.html' : 'both',
			// '../../../sap/m/demokit/cart/webapp/test/integration/opaTestsComponent.qunit.html' : 'both',
			'demokit/sample/ViewTemplate/scenario/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both',
			'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'both',
			'../qunit/testrunner.html?testpage=%2Ftest-resources%2Fsap%2Fui%2Fcore%2Fqunit%2Finternal%2Ftestsuite.models.qunit.html&autostart=true' : "both"
		}
	};
}());