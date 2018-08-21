/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/test/ElementEnablementTest",
	"sap/ui/dt/test/report/QUnit",
	"sap/m/Button" // Used implicitly by ElementEnablementTest
],
function (
	ElementEnablementTest,
	ReportQUnit
) {
	"use strict";

	var iQUnitTests = 0;

	QUnit.log(function() {
		iQUnitTests++;
	});

	var oElementEnablementTest = new ElementEnablementTest({
		type : "sap.m.Button"
	});

	oElementEnablementTest.run().then(function(oResult) {
		var oQUnit = new ReportQUnit({
			data: oResult
		});

		QUnit.module("Given that a sap.m.Button is tested");

		QUnit.test("when the result is returned and displayed with the QUnit report, then", function (assert) {
			assert.ok(oQUnit, "the QUnit instance is created");
			assert.ok(iQUnitTests > 4, "and the QUnit tests were running");
			oQUnit.destroy();
			oElementEnablementTest.destroy();
		});

	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});