/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	'sap/ui/dt/test/report/QUnit',
	'sap/ui/dt/test/ElementEnablementTest'
], function(createAndAppendDiv, QUnitReport, ElementEnablementTest) {
	createAndAppendDiv("content");

	var oElementEnablementTest = new ElementEnablementTest({
		type: "sap.m.CustomTile",
		// timeout is needed because after control is rendered, style computation takes time
		timeout : 300
	});
	oElementEnablementTest.run().then(function(oData) {
		var oReport = new QUnitReport({
			data: oData
		});
	});

});