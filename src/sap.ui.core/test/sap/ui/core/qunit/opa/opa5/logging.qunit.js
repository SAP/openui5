/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/test/Opa5",
	"sap/ui/test/Opa",
	"sap/ui/test/_LogCollector",
	"../utils/sinon",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (XMLView, Opa5, Opa, _LogCollector, sinonUtils, nextUIUpdate) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("Logging", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			var sView = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">',
				'<Button id="foo">',
				'</Button>',
				'<Button id="bar">',
				'</Button>',
				'<Button id="baz">',
				'</Button>',
				'<Image id="boo"></Image>',
				'</mvc:View>'
			].join('');

			return XMLView.create({
				id: "myViewWithAb",
				definition: sView
			}).then(function(oView) {
				this.oView = oView;
				this.oView.setViewName("bar");

				this.oView.placeAt("qunit-fixture");
				var that = this;
				this.waitForStub = sinonUtils.createStub(Opa.prototype, "waitFor", function (oOptions) {
					that.check = function () {
						oOptions.check.apply(this, oOptions);
					}.bind(this);
				});
				return nextUIUpdate();
			}.bind(this));
		},
		afterEach: function () {
			this.waitForStub.restore();
			this.oView.destroy();
		}
	});

	QUnit.test("Should log if a control is not found inside a view", function(assert) {
		new Opa5().waitFor({
			viewName: "bar",
			id: "notExistingId"
		});

		this.check();

		assert.ok(oLogCollector.getAndClearLog().match("Found no control with ID 'notExistingId' in view 'bar'"));
	});

	QUnit.test("Should log if a view is not found", function(assert) {
		new Opa5().waitFor({
			viewName: "notExistingView"
		});

		this.check();

		assert.ok(oLogCollector.getAndClearLog().match("Found 0 views with viewName 'notExistingView'"));
	});

});
