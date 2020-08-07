/*!
 * ${copyright}
 */
/*
 * This is the OData V4 configuration file for BeforePush.js
 *
 * You can find more information about how to configure the BeforePush test in the main test runner
 * file (BeforePush.js). Be aware this config file must be loaded first!
 */
(function () {
	"use strict";

	window.BeforePush = {
		tests : {
			'qunit/internal/AnnotationParser.qunit.html?hidepassed&coverage' : 'full',
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true' : 'full',
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true&module=sap.ui.model.odata.v4.ODataModel.integration' : 'integration',
			'demokit/sample/odata/v4/DataAggregation/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/FlexibleColumnLayout/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/LateProperties/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/LateProperties/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/ListBinding/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/ListBindingTemplate/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/Products/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/SalesOrders/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/SalesOrdersRTATest/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/SalesOrdersTemplate/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/odata/v4/ServerDrivenPaging/Opa.qunit.html' : 'both',
			'demokit/sample/odata/v4/ServerDrivenPaging/Opa.qunit.html?realOData=true' : 'both',
			'demokit/sample/odata/v4/Sticky/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/scenario/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?supportAssistant=true' : 'both',
			'demokit/sample/ViewTemplate/types/Opa.qunit.html?realOData=true' : 'both'
		}
	};
}());