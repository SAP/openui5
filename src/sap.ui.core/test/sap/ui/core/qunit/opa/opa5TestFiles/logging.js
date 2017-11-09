sap.ui.define([
	"jquery.sap.global",
	"unitTests/utils/loggerInterceptor"
], function ($, loggerInterceptor) {
	"use strict";

	// Opa5 needs to be unloaded because we want to intercept the logger
	jQuery.sap.unloadResources("sap/ui/test/Opa5.js", false, true, true);
	// Opa has a config inside remembering state
	jQuery.sap.unloadResources("sap/ui/test/Opa.js", false, true, true);
	// all modules that save Opa5 inside their closure and modify it need to be unlaoded too!
	jQuery.sap.unloadResources("sap/ui/test/opaQunit.js", false, true, true);

	var oLogger = loggerInterceptor.loadAndIntercept("sap.ui.test.Opa5")[2];
	var Opa5 = sap.ui.test.Opa5;
	var Opa = sap.ui.test.Opa;

	QUnit.module("Logging", {
		beforeEach: function () {
			var sView = [
				'<core:View xmlns:core="sap.ui.core" xmlns="sap.ui.commons">',
				'<Button id="foo">',
				'</Button>',
				'<Button id="bar">',
				'</Button>',
				'<Button id="baz">',
				'</Button>',
				'<Image id="boo"></Image>',
				'</core:View>'
			].join('');

			this.oView = sap.ui.xmlview({id: "myViewWithAb", viewContent : sView });
			this.oView.setViewName("bar");

			this.oView.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			var that = this;
			this.waitForStub = sinon.stub(Opa.prototype, "waitFor", function (oOptions) {
				that.check = function () {
					oOptions.check.apply(this, oOptions);
				}.bind(this);
			});

			this.debugSpy = sinon.spy(oLogger, "debug");
		},
		afterEach: function () {
			this.waitForStub.restore();
			this.debugSpy.restore();
			this.oView.destroy();
		}
	});

	QUnit.test("Should log if a control is not found inside a view", function(assert) {
		// Arrange
		new Opa5().waitFor({
			viewName: "bar",
			id: "notExistingId"
		});

		// Act
		this.check();

		// Assert
		sinon.assert.calledWith(this.debugSpy, "Found no control with ID 'notExistingId' in view 'bar'");
	});

	QUnit.test("Should log if a view is not found", function(assert) {
		// Arrange
		new Opa5().waitFor({
			viewName: "notExistingView"
		});

		// Act
		this.check();

		// Assert
		sinon.assert.calledWith(this.debugSpy, "Found no view with the name: 'notExistingView'");
	});
});
