/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/dt/test/report/QUnit",
	"sap/ui/dt/test/ElementEnablementTest"
], function(createAndAppendDiv, QUnitReport, ElementEnablementTest) {
	createAndAppendDiv("content");


	var oElementEnablementTest = new ElementEnablementTest({
		type: "sap.m.SplitContainer",
		timeout : 300
	});
	return oElementEnablementTest.run().then(function(oData) {
		var oReport = new QUnitReport({
			data: oData
		});
	});

});