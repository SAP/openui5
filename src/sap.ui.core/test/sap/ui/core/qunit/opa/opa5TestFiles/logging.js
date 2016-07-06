(function () {

	jQuery.sap.unloadResources("sap/ui/test/Opa5.js", false, true, true);
	// Opa has a config inside remembering state
	jQuery.sap.unloadResources("sap/ui/test/Opa.js", false, true, true);
	// all modules that save Opa5 inside their closure and modify it need to be unlaoded too!
	jQuery.sap.unloadResources("sap/ui/test/opaQunit.js", false, true, true);
	var oLogger;
	var fnOriginalGetLogger = jQuery.sap.log.getLogger;
	// intercept the logger created in the Opa closure (shared between all OPA's)
	var fnGetLoggerStub = sinon.stub(jQuery.sap.log, "getLogger", function () {
		oLogger = fnOriginalGetLogger.apply(this, arguments);
		return oLogger;
	});
	jQuery.sap.require("sap/ui/test/Opa5");
	var Opa = sap.ui.test.Opa;
	fnGetLoggerStub.restore();

	sap.ui.define(['jquery.sap.global', 'sap/ui/test/Opa', 'sap/ui/test/Opa5'], function ($, Opa, Opa5) {
		"use strict";
		var sLogPrefix = "sap.ui.test.Opa5";

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

		QUnit.test("Should log if a control is not found inside a view", function() {
			// Arrange
			new Opa5().waitFor({
				viewName: "bar",
				id: "notExistingId"
			});

			// Act
			this.check();

			// Assert
			sinon.assert.calledWith(this.debugSpy, "Found no control with the id: 'notExistingId' in the view: 'bar'");
		});

		QUnit.test("Should log if a view is not found", function() {
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
})();
