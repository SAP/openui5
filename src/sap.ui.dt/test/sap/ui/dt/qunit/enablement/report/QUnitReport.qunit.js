/*global QUnit*/

sap.ui.define([
	"sap/ui/dt/enablement/report/QUnitReport",
	"sap/ui/thirdparty/sinon-4",
	"sap/m/Button" // Used implicitly by ElementEnablementTest
],
function (
	ReportQUnit,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.dt.test.report.QUnit", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when a Test Report is created with mock data", function (assert) {
			assert.expect(10);
			var oModuleStub = sandbox.stub(QUnit, "module");
			var oTestStub = sandbox.stub(QUnit, "test");

			var oData = {
				name: "Element Enablement Test",
				result: true,
				children: [{
					name: "sap.m.Button",
					message: "Given that a DesignTime is created for sap.m.Button",
					result: true,
					children: [{
						name: "Aggregations",
						message: "message",
						result: true,
						children: [{
							name: "tooltip",
							message: "Aggregation ignored",
							result: true,
							children: []
						}, {
							name: "customData",
							message: "Aggregation ignored",
							result: true,
							children: []
						}, {
							name: "layoutData",
							message: "Aggregation ignored",
							result: true,
							children: []
						}, {
							name: "withChildren",
							message: "withChildren ignored",
							result: true,
							children: [{
								result: true,
								message: "foo"
							}, {
								result: true,
								message: "bar"
							}]
						}]
					}]
				}]
			};
			var oQUnit = new ReportQUnit({
				data: oData
			});
			assert.ok(oQUnit, "the QUnit instance is created");
			assert.equal(oModuleStub.callCount, 1, "one module was created");
			assert.equal(oTestStub.callCount, 1, "one test was created");
			assert.equal(oModuleStub.firstCall.args[0], "Given that a DesignTime is created for sap.m.Button", "the module title is correct");
			assert.equal(oTestStub.firstCall.args[0], "Aggregations: message", "the test title is correct");

			// call the assertions that would run in a separate test
			oTestStub.firstCall.args[1](assert);
			oQUnit.destroy();
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});